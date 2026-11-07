import DashboardStats from "@/components/DashboardStats";

export const metadata = { title: "Dashboard | Doctors Tracker" };
export default function DashboardPage() {
  return (
    <section>
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold text-teal-700">Overview</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">A real-time overview of your doctors, patients, and care activity.</p>
      </div>
      <DashboardStats/>
    </section>
  );
}
