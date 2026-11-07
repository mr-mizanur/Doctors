import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session?.user) redirect("/");
  // Missing/unknown roles (including pre-existing accounts) have no admin privileges.
  if (session.user.role !== "admin") redirect("/pending");
  return <AppShell user={{ name: session.user.name || "Administrator", email: session.user.email }}>{children}</AppShell>;
}
