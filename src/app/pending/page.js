import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/permissions";
import PendingAccess from "@/components/PendingAccess";

export const metadata = { title: "Access Pending | Doctors Tracker" };

export default async function PendingPage() {
  const { session, role } = await getAccess(await headers());
  if (!session?.user) redirect("/");
  if (role === "admin") redirect("/dashboard");
  return <PendingAccess name={session.user.name || "User"} email={session.user.email} />;
}
