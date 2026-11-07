"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  FiActivity, FiArrowRight, FiBarChart2, FiEye, FiEyeOff,
  FiHeart, FiLock, FiMail, FiShield, FiUser, FiUsers
} from "react-icons/fi";

export default function AuthPanel({ mode = "login" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const email = form.email.trim().toLowerCase();
      const response = isRegister
        ? await authClient.signUp.email({ name: form.name.trim(), email, password: form.password })
        : await authClient.signIn.email({ email, password: form.password });
      if (response.error) {
        const serverFailure = Number(response.error.status) >= 500;
        throw new Error(
          serverFailure
            ? "Authentication service cannot connect to its database. Check the frontend MongoDB configuration and server terminal."
            : response.error.message || "Authentication failed."
        );
      }
      // Both routes independently consult the current role stored in MongoDB.
      router.replace(isRegister ? "/pending" : "/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.04fr_1fr]">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#0b1e35] px-12 py-12 text-white lg:flex xl:px-20 xl:py-16">
        <div aria-hidden="true" className="absolute -right-36 -top-24 h-[550px] w-[550px] rounded-full bg-teal-400/15 blur-3xl"/>
        <div aria-hidden="true" className="absolute -bottom-32 -left-40 h-[500px] w-[500px] rounded-full bg-blue-400/15 blur-3xl"/>
        <Link href="/" className="relative flex w-fit items-center gap-3 text-xl font-extrabold tracking-tight">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500 shadow-xl shadow-teal-800/30"><FiActivity size={24}/></span>
          Doctors Tracker
        </Link>
        <div className="relative max-w-xl">
          <p className="mb-6 text-xs font-bold uppercase tracking-[.3em] text-teal-300">Medical administration simplified</p>
          <h2 className="text-[clamp(40px,4.1vw,66px)] font-extrabold leading-[1.11] tracking-tight">
            Organized care.<br/><span className="text-teal-300">Smarter insights.</span>
          </h2>
          <p className="mt-7 max-w-[430px] text-[15px] leading-8 text-slate-300">
            A secure, beautifully designed workspace for your medical team,
            patient records, and meaningful healthcare analytics.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-3">
            {[
              [FiUsers, "Doctors"],
              [FiHeart, "Patients"],
              [FiBarChart2, "Analytics"],
            ].map(([Icon, label]) => (
              <div key={label} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[.06] p-5 backdrop-blur-xl">
                <Icon size={24} className="text-teal-300"/>
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative flex items-center gap-2 text-xs text-slate-400">
          <FiShield className="text-teal-400"/> Secure, role-based administration
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 xl:px-20">
        <div className="w-full max-w-[440px]">
          <Link href="/" className="mb-12 flex w-fit items-center gap-2 text-lg font-extrabold tracking-tight lg:hidden">
            <span className="rounded-xl bg-teal-600 p-2 text-white"><FiActivity size={21}/></span>
            Doctors Tracker
          </Link>
          <p className="mb-3 text-sm font-bold text-teal-700">{isRegister ? "Start your journey" : "Welcome back"}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {isRegister ? "Create your account" : "Sign in to your account"}
          </h1>
          <p className="mt-4 mb-9 text-sm leading-6 text-slate-500">
            {isRegister
              ? "New accounts have a user role. An administrator can approve dashboard access in MongoDB."
              : "Enter your details to continue to your secure Doctors Tracker workspace."}
          </p>
          {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={submit} className="space-y-5">
            {isRegister && (
              <label className="block">
                <span className="form-label">Full name</span>
                <span className="relative block">
                  <FiUser className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                  <input required maxLength={100} autoComplete="name" className="form-input !h-12 !pl-12" placeholder="Your full name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })}/>
                </span>
              </label>
            )}
            <label className="block">
              <span className="form-label">Email address</span>
              <span className="relative block">
                <FiMail className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                <input required type="email" autoComplete="email" className="form-input !h-12 !pl-12" placeholder="you@example.com" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })}/>
              </span>
            </label>
            <label className="block">
              <span className="form-label">Password</span>
              <span className="relative block">
                <FiLock className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                <input required minLength={8} type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} className="form-input !h-12 !pl-12 !pr-12" placeholder={isRegister ? "At least 8 characters" : "Enter your password"} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })}/>
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1.5 rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18}/> : <FiEye size={18}/>}
                </button>
              </span>
            </label>
            <button type="submit" disabled={loading} className="btn-primary !mt-7 !min-h-12 w-full">
              {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
              {!loading && <FiArrowRight size={18}/>}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-600">
            {isRegister ? "Already have an account?" : "New to Doctors Tracker?"}{" "}
            <Link href={isRegister ? "/" : "/register"} className="font-bold text-teal-700 hover:underline">
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="mt-12 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            <FiShield/> Your personal account is protected by Better Auth.
          </p>
        </div>
      </section>
    </main>
  );
}
