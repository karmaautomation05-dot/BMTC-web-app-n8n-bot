import { CalendarDays, ClipboardList, Users, IndianRupee } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DoctorCard } from "@/components/doctor-card";
import { StatCard } from "@/components/stat-card";

export const dynamic = "force-dynamic";

const doctors = [
  "Dr. Gaurav Bhargava",
  "Dr. Priyanka Bhargava",
  "Dr. R R Bhargava",
];

export default async function DashboardPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [todayAppointments, totals] = await Promise.all([
    prisma.appointment.count({
      where: { timestamp: { gte: startOfDay, lt: endOfDay } },
    }),
    prisma.totals.findFirst(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-3 items-start">
        {doctors.map((name, i) => (
          <DoctorCard key={name} name={name} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments}
          icon={<CalendarDays className="size-6" />}
          color="blue"
        />
        <StatCard
          title="Total Appointments"
          value={totals?.totalAppointments ?? 0}
          icon={<ClipboardList className="size-6" />}
          color="emerald"
        />
        <StatCard
          title="Total Patients"
          value={totals?.totalPatient ?? 0}
          icon={<Users className="size-6" />}
          color="violet"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(totals?.totalRevenue ?? 0).toLocaleString()}`}
          icon={<IndianRupee className="size-6" />}
          color="rose"
        />
      </div>
    </div>
  );
}
