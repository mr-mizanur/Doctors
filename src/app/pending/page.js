import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import PendingAccess from "@/components/PendingAccess";

export const dynamic = "force-dynamic";
export const metadata = { title: "Access Pending | Doctors Tracker" };

export default async function PendingPage() {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  if (!session?.user) redirect("/");
  if (session.user.role === "admin") redirect("/dashboard");
  return <PendingAccess name={session.user.name || "User"} email={session.user.email} />;
}
