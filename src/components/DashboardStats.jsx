'use client';

import React, { useEffect, useState } from 'react';
import { FaUserMd, FaHospitalUser } from 'react-icons/fa';

export default function DashboardStats() {
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-2xl"></div>
        <div className="h-32 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Total Doctors Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Doctors</p>
          <h3 className="text-4xl font-extrabold text-slate-800 mt-2">{stats.totalDoctors}</h3>
        </div>
        <div className="w-14 h-14 bg-cyan-50 border border-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 text-2xl shadow-inner">
          <FaUserMd />
        </div>
      </div>

      {/* Total Patients Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Patients</p>
          <h3 className="text-4xl font-extrabold text-slate-800 mt-2">{stats.totalPatients}</h3>
        </div>
        <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl shadow-inner">
          <FaHospitalUser />
        </div>
      </div>
    </div>
  );
}