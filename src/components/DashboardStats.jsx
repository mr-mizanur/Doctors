"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiActivity, FiUsers, FiTrendingUp, FiRefreshCw, FiArrowUpRight } from "react-icons/fi";
import { api } from "@/lib/api";

function StatCard({ label, value, help, Icon, color }) {
  return <article className="card-panel flex items-start justify-between gap-3 p-6">
    <div><p className="text-sm font-semibold text-slate-500">{label}</p><strong className="mt-3 block text-4xl font-extrabold tracking-tight text-slate-900">{value.toLocaleString()}</strong><p className="mt-3 text-xs text-slate-400">{help}</p></div>
    <span className={"rounded-2xl p-3 " + color}><Icon size={25}/></span>
  </article>;
}

export default function DashboardStats() {
  const [stats,setStats] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [reload,setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);setError("");
    api("stats", {signal:controller.signal})
      .then(setStats)
      .catch(err=>{if(err.name !== "AbortError") setError(err.message)})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return () => controller.abort();
  },[reload]);
  const days = useMemo(() => stats?.dailyPatients || [],[stats]);
  const doctors = stats?.patientsPerDoctor || [];
  const maxDaily = Math.max(1,...days.map(d=>d.count));
  const maxDoctor = Math.max(1,...doctors.map(d=>d.count));
  const recent = days.reduce((sum,d)=>sum+d.count,0);
  const points = days.map((d,i)=>[24 + (i*612)/Math.max(days.length-1,1), 162-(d.count/maxDaily)*123]);
  const line=points.map(p=>p.join(",")).join(" ");
  const area=points.length ? "24,162 "+line+" 636,162" : "";
  if(loading) return <div className="grid animate-pulse gap-6 md:grid-cols-3">{[1,2,3].map(i=><div key={i} className="h-44 rounded-2xl bg-slate-200"/>)}</div>;
  if(error) return <div className="card-panel p-8"><h2 className="text-lg font-bold text-red-700">Unable to load dashboard</h2><p className="mt-2 text-sm text-slate-600" role="alert">{error}</p><button className="btn-primary mt-5" onClick={()=>setReload(n=>n+1)}><FiRefreshCw/> Retry</button></div>;
  if(!stats) return null;
  return <div className="space-y-7">
    <section className="grid gap-5 md:grid-cols-3">
      <StatCard label="Total Doctors" value={stats.totalDoctors||0} help="Registered medical professionals" Icon={FiActivity} color="bg-teal-50 text-teal-700"/>
      <StatCard label="Total Patients" value={stats.totalPatients||0} help="Patients managed by the team" Icon={FiUsers} color="bg-indigo-50 text-indigo-700"/>
      <StatCard label="Added in 14 Days" value={recent} help="Recent patient registrations (UTC)" Icon={FiTrendingUp} color="bg-amber-50 text-amber-700"/>
    </section>
    {stats.analyticsWarnings?.length>0 && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{stats.analyticsWarnings.join(". ")}</p>}
    <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="card-panel p-6 sm:p-7">
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Patient trends</p><h2 className="mt-1 text-xl font-extrabold">New patient activity</h2><p className="mt-1 text-xs text-slate-500">Daily patient additions over 14 days</p></div>
        <svg role="img" aria-label="Chart of patients added by day" viewBox="0 0 660 190" className="h-auto w-full">
          <defs><linearGradient id="dailyGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#14b8a6" stopOpacity=".3"/><stop offset="1" stopColor="#14b8a6" stopOpacity="0"/></linearGradient></defs>
          {[40,80,120,162].map(y=><line key={y} x1="24" x2="636" y1={y} y2={y} stroke="#e3edf0" strokeDasharray="6 7"/>)}
          {points.length>0 && <><polygon points={area} fill="url(#dailyGradient)"/><polyline points={line} fill="none" stroke="#0d9488" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>{points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#0d9488" strokeWidth="2"/>)}</>}
        </svg>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>{days[0]?.date || ""}</span><span>{days[Math.floor(days.length/2)]?.date||""}</span><span>{days.at(-1)?.date||""}</span></div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5"><span className="text-xs text-slate-500">Recent registrations</span><strong className="text-lg text-teal-700">{recent} patients</strong></div>
      </div>
      <div className="card-panel p-6 sm:p-7">
        <div className="mb-7"><p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Doctor workload</p><h2 className="mt-1 text-xl font-extrabold">Patients per doctor</h2><p className="mt-1 text-xs text-slate-500">Top eight by patient count</p></div>
        {!doctors.length ? <div className="flex min-h-48 flex-col items-center justify-center text-center text-sm text-slate-500"><FiUsers className="mb-3 text-slate-300" size={28}/>No linked patients yet</div> : <div className="space-y-5">
          {doctors.map(d=><div key={String(d.doctorId)}><div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="max-w-[80%] truncate font-semibold text-slate-700">{d.name}</span><strong>{d.count}</strong></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400" style={{width:Math.max(1,d.count/maxDoctor*100)+"%"}}/></div></div>)}
        </div>}
        {(stats.unassignedPatients||0)>0 && <p className="mt-6 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{stats.unassignedPatients} legacy patient records need an assigned doctor.</p>}
      </div>
    </section>
    <section className="grid gap-4 sm:grid-cols-2">
      {[["/doctors","Manage doctors","Update your directory and add new doctors"],["/patients","Manage patients","Review, filter and update patient records"]].map(([href,title,subtitle])=><Link key={href} href={href} className="card-panel group flex items-center justify-between gap-4 p-6 transition hover:border-teal-200"><div><p className="font-bold">{title}</p><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div><FiArrowUpRight size={23} className="text-teal-700"/></Link>)}
    </section>
  </div>;
}
