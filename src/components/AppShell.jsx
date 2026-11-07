"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FiGrid, FiUsers, FiUser, FiLogOut, FiMenu, FiX, FiShield } from "react-icons/fi";
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="lg:hidden sticky top-0 z-40 flex h-16 items-center justify-between bg-white/95 border-b border-slate-200 px-5 backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-extrabold text-slate-900">
          <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1 shadow-sm flex items-center justify-center overflow-hidden">
            <img src="/doctors.png" alt="Logo" className="w-full h-full rounded-lg object-cover" />
          </div>
          Doctors
        </Link>
        <button aria-label="Toggle navigation" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={22}/> : <FiMenu size={22}/>}
        </button>
      </div>

      {menuOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setMenuOpen(false)}/>}

      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[264px] flex-col bg-white border-r border-slate-200 px-5 py-7 text-slate-900 transition-transform duration-200 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <Link href="/dashboard" className="mb-10 flex items-center gap-3 px-2" onClick={() => setMenuOpen(false)}>
          <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm flex items-center justify-center overflow-hidden">
            <img src="/doctors.png" alt="Doctors Tracker Logo" className="w-full h-full rounded-lg object-cover" />
          </div>
          <span className="text-lg font-bold leading-tight text-slate-900">
            Doctors
          </span>
        </Link>

        <p className="px-3 mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Menus</p>
        
        <nav aria-label="Dashboard navigation" className="space-y-1.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = current === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active 
                    ? "bg-cyan-50 text-cyan-700 font-bold border border-cyan-100 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={19} className={active ? "text-cyan-600" : "text-slate-400"}/>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
        
          
          <div className="border-t border-slate-200 pt-4">
            <p className="truncate px-2 text-sm font-bold text-slate-900">{user?.name || "Admin User"}</p>
            <p className="truncate px-2 pt-0.5 text-xs text-slate-500">{user?.email || "admin@doctortracker.com"}</p>
            <button
              disabled={loggingOut}
              onClick={logout}
              className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-60"
            >
              <FiLogOut/> {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-[264px] min-h-screen">
        <div className="mx-auto max-w-[1550px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10 xl:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}