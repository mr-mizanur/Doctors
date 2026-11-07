import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/permissions";
import AppShell from "@/components/AppShell";


export default async function AdminLayout({ children }) {
  // Never use a role from the session object for permission checks.
  const { session, role } = await getAccess(await headers());
  if (!session?.user) redirect("/");
  if (role !== "admin") redirect("/pending");
  return <AppShell user={{ name: session.user.name || "Administrator", email: session.user.email }}>{children}</AppShell>;
}
