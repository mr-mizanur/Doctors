"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiUser, FiCalendar } from "react-icons/fi";
import Link from "next/link";
import { api, queryString } from "@/lib/api";
import Pagination from "@/components/Pagination";

const conditions = ["Diabetes Checkup", "Hypertension & BP", "Fever & Cold", "Cardiac Evaluation", "Orthopedic Checkup", "Skin Allergy", "General Checkup", "Other"];
const blank = { name: "", age: "", condition: "General Checkup", doctorId: "" };
const prettyDate = (date) => date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function PatientsManager({ initialDoctorId = "" }) {
  const [patients, setPatients] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState("");
  const deferredDoctors = useDeferredValue(doctorSearch);
  const [doctorError, setDoctorError] = useState("");
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [condition, setCondition] = useState("All");
  const [doctorId, setDoctorId] = useState(initialDoctorId);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({...blank, doctorId: initialDoctorId});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api("doctors?" + queryString({ search: deferredDoctors, page: 1, limit: 50 }), { signal: controller.signal })
      .then(result => setDoctors(result.items || []))
      .catch(err => { if (err.name !== "AbortError") setDoctorError(err.message); });
    return () => controller.abort();
  }, [deferredDoctors, revision]);

  // A deep link should still show the selected doctor when outside the first 50.
  useEffect(() => {
    if (!initialDoctorId || !/^[a-fA-F0-9]{24}$/.test(initialDoctorId)) return;
    api("doctors/" + initialDoctorId).then(d => {
      setDoctors(current => current.some(x => x._id === d._id) ? current : [d, ...current]);
    }).catch(() => {});
  }, [initialDoctorId]);

  useEffect(() => {
    const controller = new AbortController();
    api("patients?" + queryString({ search: deferred, condition, doctorId, dateFrom, dateTo, page, limit: 10 }), { signal: controller.signal })
      .then(result => { setPatients(result.items || []); setMeta(result.pagination || { page, pages: 0, total: 0 }); })
      .catch(err => { if (err.name !== "AbortError") setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [deferred, condition, doctorId, dateFrom, dateTo, page, revision]);

  function openNew() { setForm({...blank, doctorId: doctorId || initialDoctorId}); setEditing(null); setFormOpen(true); setError(""); }
  function openEdit(item) {
    setForm({ name: item.name || "", age: String(item.age ?? ""), condition: item.condition || "General Checkup", doctorId: item.doctorId || "" });
    if (item.doctor && !doctors.some(d => d._id === item.doctor._id))
      setDoctors(old => [item.doctor, ...old]);
    setEditing(item._id); setFormOpen(true); setError(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function save(e) {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      await api(editing ? "patients/" + editing : "patients", { method: editing ? "PUT" : "POST", body: JSON.stringify({...form, age: Number(form.age)}) });
      setNotice(editing ? "Patient details updated." : "Patient added successfully.");
      setFormOpen(false); setEditing(null); setPage(1); setRevision(n=>n+1);
    } catch(err) {setError(err.message);}
    finally {setSaving(false);}
  }
  async function remove(item) {
    if (!window.confirm("Permanently delete patient " + item.name + "?")) return;
    setError("");setNotice("");
    try { await api("patients/" + item._id, {method:"DELETE"}); setNotice("Patient record deleted."); if (patients.length === 1 && page > 1) setPage(page-1); setRevision(n=>n+1); }
    catch(err){setError(err.message);}
  }

  const optionDoctors = [...new Map(doctors.map(d=>[d._id,d])).values()];
  return <section>
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div><p className="mb-1 text-sm font-semibold text-teal-700">Records</p><h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Patients</h1><p className="mt-2 text-sm text-slate-500">Manage patient records, conditions, and assigned doctors.</p></div>
      <button className="btn-primary" onClick={() => formOpen ? setFormOpen(false) : openNew()}>{formOpen ? <FiX/> : <FiPlus/>}{formOpen ? "Close form" : "Add patient"}</button>
    </div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="mb-5 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">{notice}</div>}
    {doctorError && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Doctor directory: {doctorError}</div>}
    {formOpen && <div className="card-panel mb-7 p-5 sm:p-7">
      <div className="mb-5"><h2 className="text-lg font-bold">{editing ? "Edit patient" : "New patient"}</h2><p className="mt-1 text-xs text-slate-500">Select a doctor to associate this patient with.</p></div>
      <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label><span className="form-label">Patient full name</span><input className="form-input" required maxLength={120} value={form.name} placeholder="Patient name" onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label><span className="form-label">Age</span><input className="form-input" type="number" min={0} max={120} required value={form.age} placeholder="35" onChange={e=>setForm({...form,age:e.target.value})}/></label>
        <label><span className="form-label">Condition</span><select className="form-input" value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})}>{[...new Set([...conditions, form.condition])].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
        <label><span className="form-label">Assigned doctor</span><select className="form-input" value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})} required><option value="">Select a doctor</option>{optionDoctors.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}</select></label>
        <div className="sm:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-3"><label className="max-w-sm flex-1"><span className="form-label">Find a doctor (name prefix)</span><input className="form-input" value={doctorSearch} placeholder="Search doctor names..." onChange={e=>setDoctorSearch(e.target.value)}/></label><button disabled={saving} className="btn-primary self-end" type="submit">{saving ? "Saving..." : editing ? "Save changes" : "Create patient"}</button><button type="button" className="btn-quiet self-end" onClick={()=>setFormOpen(false)}>Cancel</button></div>
      </form>
      {optionDoctors.length === 0 && <p className="mt-4 text-xs text-amber-700">No doctors found. <Link className="font-bold underline" href="/doctors">Add a doctor first.</Link></p>}
    </div>}
    <div className="card-panel overflow-hidden">
      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 sm:grid-cols-2 xl:grid-cols-[minmax(190px,1fr)_160px_190px_140px_140px]">
        <label className="relative"><FiSearch className="absolute left-3 top-3.5 text-slate-400"/><input aria-label="Search patients" className="form-input pl-10" placeholder="Search patients..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label>
        <select aria-label="Filter by condition" className="form-input" value={condition} onChange={e=>{setCondition(e.target.value);setPage(1);}}><option value="All">All conditions</option>{conditions.map(c=><option key={c}>{c}</option>)}</select>
        <select aria-label="Filter by doctor" className="form-input" value={doctorId} onChange={e=>{setDoctorId(e.target.value);setPage(1);}}><option value="">All doctors</option>{optionDoctors.map(d=><option value={d._id} key={d._id}>{d.name}</option>)}</select>
        <input aria-label="Created from" className="form-input" type="date" value={dateFrom} max={dateTo || undefined} onChange={e=>{setDateFrom(e.target.value);setPage(1);}}/>
        <input aria-label="Created until" className="form-input" type="date" value={dateTo} min={dateFrom || undefined} onChange={e=>{setDateTo(e.target.value);setPage(1);}}/>
      </div>
      {initialDoctorId && <div className="border-b border-teal-100 bg-teal-50 px-5 py-3 text-xs text-teal-800">Viewing patients for a selected doctor. <Link className="font-bold underline" href="/patients">Show all patients</Link></div>}
      <div className="overflow-x-auto"><table className="w-full min-w-[770px] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4">Patient</th><th className="px-6 py-4">Age</th><th className="px-6 py-4">Condition</th><th className="px-6 py-4">Doctor</th><th className="px-6 py-4">Added</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="px-6 py-14 text-center text-slate-500">Loading patients...</td></tr> :
          patients.length === 0 ? <tr><td colSpan={6} className="px-6 py-16 text-center"><FiUser size={27} className="mx-auto mb-3 text-slate-300"/><strong>No patients found</strong><p className="mt-1 text-xs text-slate-500">Add a record or update your search filters.</p></td></tr> :
          patients.map(p => <tr className="hover:bg-slate-50/80" key={p._id}>
            <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 font-bold text-indigo-700">{(p.name || "P").charAt(0).toUpperCase()}</span><span className="font-bold text-slate-900">{p.name}</span></div></td>
            <td className="px-6 py-4 text-slate-600">{p.age} years</td>
            <td className="px-6 py-4"><span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{p.condition}</span></td>
            <td className="px-6 py-4 text-slate-600">{p.doctor?.name || optionDoctors.find(x=>x._id === p.doctorId)?.name || "Unassigned (legacy record)"}</td>
            <td className="px-6 py-4 text-xs text-slate-500"><FiCalendar className="mr-1 inline"/>{prettyDate(p.createdAt)}</td>
            <td className="px-6 py-4"><div className="flex justify-end gap-2"><button title="Edit patient" aria-label={"Edit " + p.name} onClick={()=>openEdit(p)} className="rounded-lg bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200"><FiEdit2/></button><button title="Delete patient" aria-label={"Delete " + p.name} onClick={()=>remove(p)} className="rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-100"><FiTrash2/></button></div></td>
          </tr>)}</tbody>
      </table></div>
      <Pagination {...meta} onPageChange={setPage}/>
    </div>
  </section>;
}
