"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLock, FiLogOut } from "react-icons/fi";
import { authClient } from "@/lib/auth-client";
export default function NotAuthorizedPage() {
 const router=useRouter();
 return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5"><div className="card-panel max-w-md p-10 text-center"><FiLock size={36} className="mx-auto mb-5 text-amber-600"/><h1 className="text-2xl font-bold">Administrator access required</h1><p className="mt-3 text-sm text-slate-500">This account is not in the administrator allowlist. Contact the application owner.</p><button className="btn-primary mt-6" onClick={async()=>{await authClient.signOut();router.replace("/");router.refresh()}}><FiLogOut/> Sign out</button><div className="mt-6"><Link href="/" className="text-sm text-teal-700 underline">Back to sign in</Link></div></div></main>;
}
