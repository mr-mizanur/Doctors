import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session?.user) redirect("/");
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  if (admins.length && !admins.includes(session.user.email.toLowerCase())) redirect("/not-authorized");
  return <AppShell user={{ name: session.user.name || "Administrator", email: session.user.email }}>{children}</AppShell>;
}
