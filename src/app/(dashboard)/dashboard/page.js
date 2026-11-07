import DashboardStats from '@/components/DashboardStats';
import DoctorsManager from '@/components/DoctorsManager';
import PatientsManager from '@/components/PatientsManager';

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-100 min-h-screen text-slate-900">
      <div className="border-b border-slate-300 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage doctors, track patients, and view system analytics.
        </p>
      </div>

      <DashboardStats />
      <DoctorsManager />
      <PatientsManager />
    </div>
  );
}