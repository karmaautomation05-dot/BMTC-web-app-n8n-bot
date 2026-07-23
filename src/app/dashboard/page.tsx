"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, Users, Stethoscope } from "lucide-react";
import { useStats, useDoctors } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

const doctorGradients = [
  { from: "from-blue-500", to: "to-blue-600", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { from: "from-emerald-500", to: "to-emerald-600", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { from: "from-violet-500", to: "to-violet-600", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter((w) => !w.startsWith("Dr"))
    .map((w) => w[0])
    .join("");
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const statCards = [
  { label: "Today's Appointments", key: "todayAppointments" as const, icon: CalendarDays, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { label: "Total Appointments", key: "totalAppointments" as const, icon: ClipboardList, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { label: "Total Patients", key: "totalPatient" as const, icon: Users, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats();
  const { data: doctorsData } = useDoctors();
  const doctors = doctorsData?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{getGreeting()}</h1>
        <p className="text-sm text-muted-foreground mt-1">{formatDate()}</p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Consultants</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {doctors.map((doc, i) => {
            const g = doctorGradients[i];
            const isUnavailable = doc.notAvailableDate
              ? new Date(doc.notAvailableDate).toDateString() === new Date().toDateString()
              : false;
            return (
              <Link
                key={doc.id}
                href={`/dashboard/doctors/${doc.id}`}
                className="rounded-xl border bg-card p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold shadow-sm", g.from, g.to)}>
                  {getInitials(doc.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{doc.name.replace("Dr. ", "")}</p>
                  <span className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium", isUnavailable ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : g.badge)}>
                    {isUnavailable ? "Not Available" : "Available"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            const val = (stats?.[card.key] as number) ?? 0;
            return (
              <div
                key={card.key}
                className={cn("rounded-xl border p-5 flex items-center gap-4 transition-shadow hover:shadow-sm", card.bg)}
              >
                <div className={cn("flex size-11 items-center justify-center rounded-lg bg-background shadow-xs", card.color)}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  {isLoading ? (
                    <div className="h-6 w-16 bg-muted rounded mt-1 animate-pulse" />
                  ) : (
                    <p className="text-xl font-bold tabular-nums">{val.toLocaleString("en-IN")}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
