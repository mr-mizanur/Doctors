"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FiActivity, FiClock, FiRefreshCw, FiLogOut, FiShield } from "react-icons/fi";

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

  function checkAccess() {
    // Full navigation forces a fresh server-side session/role check.
    // If role has changed to admin, the protected layout now permits entry.
    window.location.assign("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8fb] p-5 text-slate-900">
      <section className="card-panel w-full max-w-lg p-7 text-center sm:p-10">
        <div className="mb-7 flex items-center justify-center gap-3 text-lg font-extrabold">
          <span className="rounded-xl bg-teal-600 p-2.5 text-white"><FiActivity size={22}/></span>
          Doctors Tracker
        </div>
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-amber-50 text-amber-700">
          <FiClock size={36}/>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800">
          Account awaiting approval
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">Access pending</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Welcome, {name}. Your account has been created with the <strong>user</strong> role.
          Only an administrator can approve access to the management dashboard.
        </p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <span className="font-semibold text-slate-600">Signed in as</span>
          <p className="mt-1 break-all font-bold">{email}</p>
        </div>
        <button type="button" onClick={checkAccess} className="btn-primary mt-7 w-full">
          <FiRefreshCw/> Check my access
        </button>
        <button type="button" disabled={busy} onClick={signOut} className="btn-quiet mt-3 w-full">
          <FiLogOut/> {busy ? "Signing out..." : "Sign out"}
        </button>
        <p className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
          <FiShield/> Your account is secure; permissions are checked on the server.
        </p>
      </section>
    </main>
  );
}
