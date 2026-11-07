"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FiClock, FiRefreshCw, FiLogOut, FiShield } from "react-icons/fi";

export default function PendingAccess({ name, email }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await authClient.signOut();
      router.replace("/");
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5 text-slate-900">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl sm:p-10">
        
        {/* কাস্টম লোগো (/doctors.png) */}
        <div className="mb-7 flex items-center justify-center gap-3 text-xl font-extrabold text-slate-900">
          <div className="h-11 w-11 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm flex items-center justify-center">
            <img src="/doctors.png" alt="Doctors Tracker Logo" className="h-full w-full rounded-lg object-cover" />
          </div>
          Doctors 
        </div>

        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-amber-50 text-amber-700 border border-amber-100">
          <FiClock size={36}/>
        </div>

        <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800">
          Account awaiting approval
        </span>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">Access pending</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Welcome, {name}. Your account has been created with the <strong>user</strong> role.
          Only an administrator can approve access to the management dashboard.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider block">Signed in as</span>
          <p className="mt-1 break-all font-bold text-slate-900">{email}</p>
        </div>

        <form action="/dashboard" method="GET" className="mt-7">
          <button type="submit" className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-cyan-600/20 transition flex items-center justify-center gap-2">
            <FiRefreshCw/> Check my access
          </button>
        </form>

        <button type="button" disabled={busy} onClick={signOut} className="mt-3 w-full py-3 px-4 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
          <FiLogOut/> {busy ? "Signing out..." : "Sign out"}
        </button>

        
      </section>
    </main>
  );
}