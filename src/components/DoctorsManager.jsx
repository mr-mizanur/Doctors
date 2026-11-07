'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaStethoscope, FaPhone, FaUser, FaHospital, FaEnvelope, FaTrash } from 'react-icons/fa';

export default function DoctorsManager() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    name: '', 
    specialty: 'Cardiologist', 
    hospital: '', 
    phone: '', 
    email: '' 
  });

  const specialties = [
    'Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedic Surgeon', 'Dermatologist', 'General Physician'
  ];

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/doctors');
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.hospital) return;

    const res = await fetch('http://localhost:5000/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ name: '', specialty: 'Cardiologist', hospital: '', phone: '', email: '' });
      fetchDoctors();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    await fetch(`http://localhost:5000/api/doctors/${id}`, { method: 'DELETE' });
    fetchDoctors();
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
        <FaStethoscope className="text-cyan-600" /> Doctor Management
      </h2>

      {/* Form */}
      <form onSubmit={handleAddDoctor} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Doctor Name</label>
          <input
            type="text"
            placeholder="Dr. John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Specialty</label>
          <select
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          >
            {specialties.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Hospital</label>
          <input
            type="text"
            placeholder="City General Hospital"
            value={formData.hospital}
            onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Phone</label>
          <input
            type="text"
            placeholder="+8801700000000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email</label>
          <input
            type="email"
            placeholder="doctor@hospital.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-end">
          <button type="submit" className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl shadow transition flex items-center justify-center gap-2">
            <FaPlus /> Add Doctor
          </button>
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
                <th className="py-4 px-5">Specialty</th>
                <th className="py-4 px-5">Hospital</th>
                <th className="py-4 px-5">Contact</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400">No doctors added.</td></tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-5 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold"><FaUser /></span>
                      {doc.name}
                    </td>
                    <td className="py-4 px-5"><span className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full text-xs font-bold">{doc.specialty}</span></td>
                    <td className="py-4 px-5 flex items-center gap-2 pt-6"><FaHospital className="text-slate-400" /> {doc.hospital}</td>
                    <td className="py-4 px-5 text-xs text-slate-600">
                      <div><FaPhone className="inline mr-1" /> {doc.phone || 'N/A'}</div>
                      <div className="mt-1"><FaEnvelope className="inline mr-1" /> {doc.email || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button onClick={() => handleDelete(doc._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition">
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