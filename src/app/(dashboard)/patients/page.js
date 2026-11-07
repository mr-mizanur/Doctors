import PatientsManager from "@/components/PatientsManager";
export const metadata = { title: "Patients | Doctors Tracker" };
export default async function PatientsPage({ searchParams }) {
  const params = await searchParams;
  const doctorId = typeof params?.doctorId === "string" ? params.doctorId : "";
  return <PatientsManager initialDoctorId={doctorId}/>;
}
