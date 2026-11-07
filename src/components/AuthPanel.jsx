"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiShield, FiUser
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
      router.replace(isRegister ? "/pending" : "/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-3xl shadow-xl p-8 sm:p-10">
        
      
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md flex items-center justify-center mb-4 overflow-hidden">
            <img src="/doctors.png" alt="Logo" className="w-full h-full rounded-xl object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRegister ? "Create Account" : "Doctors"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister ? "Register to access Doctors Tracker" : "Enter your credentials to manage records"}
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                <input
                  required
                  maxLength={100}
                  autoComplete="name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={event => setForm({ ...form, name: event.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-3.5 text-slate-400" size={18}/>
              <input
                required
                type="email"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                placeholder="mizanur.codes@gmail.com"
                value={form.email}
                onChange={event => setForm({ ...form, email: event.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-3.5 text-slate-400" size={18}/>
              <input
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition"
                placeholder="••••••••"
                value={form.password}
                onChange={event => setForm({ ...form, password: event.target.value })}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18}/> : <FiEye size={18}/>}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Get Access"}
            {!loading && <FiArrowRight size={18}/>}
          </button>
        </form>

       
        <div className="mt-8 text-center text-sm text-slate-600">
          {isRegister ? "Already have an account?" : "New to Doctors Tracker?"}{" "}
          <Link href={isRegister ? "/" : "/register"} className="font-bold text-cyan-600 hover:underline">
            {isRegister ? "Sign In" : "Create an Account"}
          </Link>
        </div>

       
      </div>
    </main>
  );
}