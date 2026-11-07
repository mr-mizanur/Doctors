"use client";

import { useDeferredValue, useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUsers, FiX, FiActivity, FiCalendar, FiPhone, FiMail, FiHome } from "react-icons/fi";
import { api, queryString } from "@/lib/api";
import Pagination from "@/components/Pagination";

const specialties = ["Cardiologist", "Neurologist", "Pediatrician", "Orthopedic Surgeon", "Dermatologist", "General Physician", "Gynecologist", "Dentist", "Psychiatrist", "Other"];
const emptyForm = { name: "", specialty: "General Physician", hospital: "", phone: "", email: "" };
const dateText = (s) => s ? new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function DoctorsManager() {
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, total: 0 });
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [specialty, setSpecialty] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const query = queryString({ search: deferred, specialty, dateFrom, dateTo, page, limit: 5 });
    api("doctors?" + query, { signal: controller.signal }).then((result) => {
      setRecords(result.items || []);
      setMeta(result.pagination || { page, pages: 0, total: 0 });
    }).catch((err) => {
      if (err.name !== "AbortError") setError(err.message);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [deferred, specialty, dateFrom, dateTo, page, revision]);

  function openNew() { setEditing(null); setForm(emptyForm); setFormOpen(true); setError(""); }
  function openEdit(record) {
    setEditing(record._id);
    setForm({ name: record.name || "", specialty: record.specialty || "General Physician", hospital: record.hospital || "", phone: record.phone || "", email: record.email || "" });
    setFormOpen(true); setError("");
    window.scrollTo({top: 0, behavior: "smooth"});
  }
  async function save(e) {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      await api(editing ? "doctors/" + editing : "doctors", { method: editing ? "PUT" : "POST", body: JSON.stringify(form) });
      setNotice(editing ? "Doctor information updated." : "New doctor has been added.");
      setFormOpen(false); setEditing(null); setForm(emptyForm);
      setPage(1); setRevision(n => n + 1);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function remove(record) {
    if (!window.confirm("Delete " + record.name + "? Doctors with patients cannot be deleted.")) return;
    setError(""); setNotice("");
    try {
      await api("doctors/" + record._id, { method: "DELETE" });
      setNotice("Doctor deleted successfully.");
      if (records.length === 1 && page > 1) setPage(page - 1);
      setRevision(n => n + 1);
    } catch (err) { setError(err.message); }
  }

  return <section>
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div><p className="mb-1 text-sm font-semibold text-cyan-700">Directory</p><h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Doctors</h1><p className="mt-2 text-sm text-slate-500">Maintain your medical team and manage their patients.</p></div>
      <button className="btn-primary bg-cyan-600 hover:bg-cyan-700" onClick={() => formOpen ? setFormOpen(false) : openNew()}>{formOpen ? <FiX/> : <FiPlus/>}{formOpen ? "Close form" : "Add doctor"}</button>
    </div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="mb-5 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">{notice}</div>}
    
    {formOpen && <div className="card-panel mb-7 p-5 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-cyan-50 p-3 text-cyan-700"><FiActivity size={20}/></span><div><h2 className="text-lg font-bold text-slate-900">{editing ? "Edit doctor" : "New doctor"}</h2><p className="text-xs text-slate-500">Please provide accurate contact and hospital details.</p></div></div>
      <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Doctor name","name","text","Dr. Abdul Rahman"],
          ["Hospital","hospital","text","City General Hospital"],
          ["Phone number","phone","tel","+8801020100221"],
          ["Email address","email","email","abdurrahman@gmail.com"],
        ].map(([label,name,type,placeholder])=><label key={name}><span className="form-label text-xs font-bold uppercase text-slate-700">{label}</span><input className="form-input mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm" type={type} placeholder={placeholder} maxLength={name === "hospital" ? 150 : 160} required={name === "name" || name === "hospital"} value={form[name]} onChange={e=>setForm(v=>({...v,[name]:e.target.value}))}/></label>)}
        <label><span className="form-label text-xs font-bold uppercase text-slate-700">Specialization</span><select value={form.specialty} className="form-input mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white" onChange={e=>setForm(v=>({...v,specialty:e.target.value}))}>{[...new Set([...specialties, form.specialty])].map(s=><option key={s} value={s}>{s}</option>)}</select></label>
        <div className="flex items-end gap-3"><button type="submit" disabled={saving} className="btn-primary flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">{saving ? "Saving..." : editing ? "Save changes" : "Create doctor"}</button><button type="button" className="btn-quiet px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={()=>setFormOpen(false)}>Cancel</button></div>
      </form>
    </div>}

    <div className="card-panel overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_180px_165px_165px]">
        <label className="relative block"><FiSearch className="absolute left-3.5 top-3.5 text-slate-400"/><input aria-label="Search doctors" className="form-input w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm" placeholder="Search by name or hospital..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label>
        <select aria-label="Filter by specialization" value={specialty} onChange={e=>{setSpecialty(e.target.value);setPage(1);}} className="form-input w-full px-4 py-2 rounded-xl border border-slate-300 text-sm bg-white"><option value="All">All specialties</option>{specialties.map(x=><option value={x} key={x}>{x}</option>)}</select>
        <label className="relative"><span className="sr-only">Date from</span><input aria-label="Created from" type="date" value={dateFrom} max={dateTo || undefined} onChange={e=>{setDateFrom(e.target.value);setPage(1);}} className="form-input w-full px-4 py-2 rounded-xl border border-slate-300 text-sm bg-white"/></label>
        <label><span className="sr-only">Date to</span><input aria-label="Created until" type="date" min={dateFrom || undefined} value={dateTo} onChange={e=>{setDateTo(e.target.value);setPage(1);}} className="form-input w-full px-4 py-2 rounded-xl border border-slate-300 text-sm bg-white"/></label>
      </div>

      <div className="overflow-x-auto">
        {/* ডেস্কটপ ভিউ */}
        <table className="w-full min-w-[820px] text-left text-sm hidden md:table">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr><th className="px-6 py-4">Doctor</th><th className="px-6 py-4">Hospital</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Patients</th><th className="px-6 py-4">Added</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={6} className="px-6 py-14 text-center text-slate-500">Loading doctors...</td></tr> :
              records.length === 0 ? <tr><td colSpan={6} className="px-6 py-16 text-center"><FiActivity className="mx-auto mb-3 text-slate-300" size={28}/><strong className="text-slate-700">No doctors found</strong><p className="mt-1 text-xs text-slate-500">Add a doctor or adjust your filters.</p></td></tr> :
              records.map(record => <tr key={record._id} className="hover:bg-slate-50/80">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 font-bold text-cyan-700">{(record.name || "D").replace(/^Dr\.\s*/i,"").charAt(0).toUpperCase()}</span><div><p className="font-bold text-slate-900">{record.name}</p><p className="mt-1 text-xs text-cyan-700 font-semibold">{record.specialty}</p></div></div></td>
                <td className="px-6 py-4 text-slate-600">{record.hospital}</td>
                <td className="px-6 py-4 text-xs text-slate-600"><div>{record.phone || "—"}</div><div className="mt-1">{record.email || "—"}</div></td>
                <td className="px-6 py-4"><span className="rounded-full bg-cyan-50 border border-cyan-100 px-3 py-1 text-xs font-bold text-cyan-700">{record.patientCount || 0}</span></td>
                <td className="px-6 py-4 text-xs text-slate-500"><FiCalendar className="mr-1 inline"/>{dateText(record.createdAt)}</td>
                <td className="px-6 py-4"><div className="flex items-center justify-end gap-2"><Link title="View patients" aria-label={"Patients of " + record.name} href={"/patients?doctorId=" + record._id} className="rounded-lg bg-cyan-50 p-2.5 text-cyan-700 hover:bg-cyan-100"><FiUsers/></Link><button title="Edit doctor" aria-label={"Edit " + record.name} onClick={()=>openEdit(record)} className="rounded-lg bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200"><FiEdit2/></button><button title="Delete doctor" aria-label={"Delete " + record.name} onClick={()=>remove(record)} className="rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-100"><FiTrash2/></button></div></td>
              </tr>)}
          </tbody>
        </table>

        {/* মোবাইল ডিভাইস রেসপন্সিভ ভিউ */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <p className="px-6 py-10 text-center text-slate-500 text-sm">Loading doctors...</p>
          ) : records.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FiActivity className="mx-auto mb-3 text-slate-300" size={28}/>
              <strong className="text-slate-700">No doctors found</strong>
              <p className="mt-1 text-xs text-slate-500">Add a doctor or adjust your filters.</p>
            </div>
          ) : (
            records.map(record => (
              <div key={record._id} className="p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 font-bold text-cyan-700">{(record.name || "D").replace(/^Dr\.\s*/i,"").charAt(0).toUpperCase()}</span>
                    <div>
                      <h4 className="font-bold text-slate-900">{record.name}</h4>
                      <p className="text-xs text-cyan-700 font-semibold">{record.specialty}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Link href={"/patients?doctorId=" + record._id} className="p-2 bg-cyan-50 rounded-lg text-cyan-700"><FiUsers size={15}/></Link>
                    <button onClick={()=>openEdit(record)} className="p-2 bg-slate-100 rounded-lg text-slate-700"><FiEdit2 size={15}/></button>
                    <button onClick={()=>remove(record)} className="p-2 bg-red-50 rounded-lg text-red-600"><FiTrash2 size={15}/></button>
                  </div>
                </div>
                
                <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5"><FiHome className="text-slate-400"/> {record.hospital}</div>
                  {record.phone && <div className="flex items-center gap-1.5"><FiPhone className="text-slate-400"/> {record.phone}</div>}
                  {record.email && <div className="flex items-center gap-1.5"><FiMail className="text-slate-400"/> {record.email}</div>}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="rounded-full bg-cyan-50 border border-cyan-100 px-2.5 py-0.5 text-xs font-bold text-cyan-700">Patients: {record.patientCount || 0}</span>
                  <span><FiCalendar className="mr-1 inline"/>{dateText(record.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Pagination {...meta} onPageChange={setPage}/>
    </div>
  </section>;
}