import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";


// Only known resources can be proxied; never forward arbitrary paths.
const permitted = (path, method) => {
  const simple = /^(doctors|patients)$/;
  const withId = /^(doctors|patients)\/[a-fA-F0-9]{24}$/;
  if (path === "stats") return method === "GET";
  if (simple.test(path)) return method === "GET" || method === "POST";
  if (withId.test(path)) return ["GET", "PUT", "DELETE"].includes(method);
  return false;
};

async function handle(request, context) {
  const method = request.method;
  const { path } = await context.params;
  const cleanPath = (path || []).join("/");
  if (!permitted(cleanPath, method))
    return NextResponse.json({ error: "Unsupported API endpoint" }, { status: 404 });

  let session;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch {
    return NextResponse.json({ error: "Authentication is unavailable" }, { status: 503 });
  }
  if (!session?.user?.email)
    return NextResponse.json({ error: "Please sign in to continue" }, { status: 401 });

  // Enforce current database-backed role on every protected REST request.
  if (session.user.role !== "admin")
    return NextResponse.json({ error: "Administrator role required" }, { status: 403 });

  const backend = (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
  const url = backend + "/api/" + cleanPath + request.nextUrl.search;
  try {
    const upstream = await fetch(url, {
      method,
      headers: {
        Cookie: request.headers.get("cookie") || "",
        Accept: "application/json",
        ...(method === "POST" || method === "PUT" ? { "Content-Type": "application/json" } : {}),
      },
      body: method === "POST" || method === "PUT" ? await request.text() : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    const content = await upstream.text();
    return new Response(content, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Backend connection error:", error.message);
    return NextResponse.json(
      { error: "Backend is unavailable. Check BACKEND_URL and start the Express server on port 5000." },
      { status: 502 }
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
