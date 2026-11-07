"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FiActivity, FiGrid, FiUsers, FiUser, FiLogOut, FiMenu, FiX, FiShield } from "react-icons/fi";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/doctors", label: "Doctors", icon: FiUsers },
  { href: "/patients", label: "Patients", icon: FiUser },
];

export default function AppShell({ children, user }) {
  const current = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await authClient.signOut();
    router.replace("/");
    router.refresh();
  }
  return (
    <div className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <div className="lg:hidden sticky top-0 z-40 flex h-16 items-center justify-between bg-white/95 border-b border-slate-200 px-5 backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-slate-900">
          <span className="rounded-xl bg-teal-600 p-2 text-white"><FiActivity size={20}/></span> Doctors Tracker
        </Link>
        <button aria-label="Toggle navigation" className="rounded-lg p-2 text-slate-700" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <FiX size={22}/> : <FiMenu size={22}/>}</button>
      </div>
      {menuOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setMenuOpen(false)}/>}
      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[264px] flex-col bg-[#0b1e35] px-5 py-7 text-white transition-transform duration-200 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Link href="/dashboard" className="mb-12 flex items-center gap-3 px-2" onClick={() => setMenuOpen(false)}>
          <span className="rounded-xl bg-teal-500 p-2.5 text-white shadow-lg shadow-teal-900/20"><FiActivity size={23}/></span>
          <span className="text-lg font-bold leading-tight">Doctors<span className="block font-medium text-teal-300">Tracker</span></span>
        </Link>
        <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
        <nav aria-label="Dashboard navigation" className="space-y-1.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = current === href;
            return <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-teal-500/15 text-teal-200 ring-1 ring-teal-400/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={19}/>{label}
            </Link>;
          })}
        </nav>
        <div className="mt-auto space-y-4">
          <div className="flex gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-300">
            <FiShield size={17} className="mt-0.5 shrink-0 text-teal-400"/>
            <span>Secure administration area<br/>Protected by Better Auth</span>
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="truncate px-2 text-sm font-semibold">{user.name}</p>
            <p className="truncate px-2 pt-0.5 text-xs text-slate-400">{user.email}</p>
            <button disabled={loggingOut} onClick={logout} className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-60"><FiLogOut/> {loggingOut ? "Signing out..." : "Sign out"}</button>
          </div>
        </div>
      </aside>
      <main className="lg:ml-[264px] min-h-screen">
        <div className="mx-auto max-w-[1550px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10 xl:py-10">{children}</div>
      </main>
    </div>
  );
}
