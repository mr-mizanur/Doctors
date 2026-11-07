'use client';

import React, { useState, useEffect } from 'react';
import { FaHospitalUser, FaUserInjured, FaPlus, FaTrash } from 'react-icons/fa';

export default function PatientsManager() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', age: '', condition: 'Diabetes Checkup' });

  const conditions = ['Diabetes Checkup', 'Hypertension & BP', 'Fever & Cold', 'Cardiac Evaluation', 'Orthopedic Checkup', 'Skin Allergy'];

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/patients');
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.age) return;

    const res = await fetch('http://localhost:5000/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ name: '', age: '', condition: 'Diabetes Checkup' });
      fetchPatients();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this patient?")) return;
    await fetch(`http://localhost:5000/api/patients/${id}`, { method: 'DELETE' });
    fetchPatients();
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <FaHospitalUser className="text-blue-600" /> Patient Management
      </h2>

      {/* Form */}
      <form onSubmit={handleAddPatient} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Patient Name</label>
          <input
            type="text"
            placeholder="Jane Smith"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Age</label>
          <input
            type="number"
            placeholder="35"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Disease / Reason</label>
          <div className="flex gap-2">
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {conditions.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition flex items-center gap-1 shrink-0">
              <FaPlus /> Add
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      {loading ? (
        <p className="text-center py-4 text-slate-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
              <tr>
                <th className="py-4 px-5">Name</th>
                <th className="py-4 px-5">Age</th>
                <th className="py-4 px-5">Condition</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center text-slate-400">No patients recorded.</td></tr>
              ) : (
                patients.map((pat) => (
                  <tr key={pat._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-5 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold"><FaUserInjured /></span>
                      {pat.name}
                    </td>
                    <td className="py-4 px-5 font-medium">{pat.age} yrs</td>
                    <td className="py-4 px-5"><span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">{pat.condition}</span></td>
                    <td className="py-4 px-5 text-center">
                      <button onClick={() => handleDelete(pat._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}