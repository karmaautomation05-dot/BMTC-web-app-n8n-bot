"use client";

import { CalendarDays, ClipboardList, Users, IndianRupee } from "lucide-react";
import { useStats } from "@/hooks/use-api";
import { DoctorCard } from "@/components/doctor-card";
import { StatCard } from "@/components/stat-card";

const doctors = [
  "Dr. Gaurav Bhargava",
  "Dr. Priyanka Bhargava",
  "Dr. R R Bhargava",
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats();

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
          value={isLoading ? "..." : (stats?.todayAppointments ?? 0)}
          icon={<CalendarDays className="size-6" />}
          color="blue"
        />
        <StatCard
          title="Total Appointments"
          value={isLoading ? "..." : (stats?.totalAppointments ?? 0)}
          icon={<ClipboardList className="size-6" />}
          color="emerald"
        />
        <StatCard
          title="Total Patients"
          value={isLoading ? "..." : (stats?.totalPatient ?? 0)}
          icon={<Users className="size-6" />}
          color="violet"
        />
        <StatCard
          title="Total Revenue"
          value={isLoading ? "..." : `₹${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          icon={<IndianRupee className="size-6" />}
          color="rose"
        />
      </div>
    </div>
  );
}
