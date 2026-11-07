import "server-only";
import { auth, authDb } from "@/lib/auth";

/**
 * MongoDB 'user' collection is the ONLY authorization source.
 * Better Auth session establishes identity, not its (possibly cached) role.
 * Atlas role updates take effect on the user's very next request.
 */
export async function getAccess(headers) {
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id || typeof session.user.email !== "string") {
    return { session: null, role: null };
  }
  const email = session.user.email.toLowerCase();
  const currentUser = await authDb.collection("user").findOne(
    { email },
    { projection: { role: 1 } },
  );
  return {
    session,
    role: currentUser?.role === "admin" ? "admin" : "user",
  };
}
