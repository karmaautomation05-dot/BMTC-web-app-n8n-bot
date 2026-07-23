"use client";

import Link from "next/link";
import { Stethoscope, Calendar, Hash } from "lucide-react";
import { useDoctors } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

const colors = [
  { from: "from-blue-500", to: "to-blue-600" },
  { from: "from-emerald-500", to: "to-emerald-600" },
  { from: "from-violet-500", to: "to-violet-600" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.startsWith("Dr") === false)
    .map((w) => w[0])
    .join("");
}

export default function DoctorsPage() {
  const { data, isLoading } = useDoctors();
  const doctors = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Doctors</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc, i) => {
            const color = colors[i % colors.length];
            const isUnavailable = doc.notAvailableDate
              ? new Date(doc.notAvailableDate).toDateString() === new Date().toDateString()
              : false;
            return (
              <Link
                key={doc.id}
                href={`/dashboard/doctors/${doc.id}`}
                className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white text-sm font-bold shadow-sm",
                      color.from,
                      color.to,
                    )}
                  >
                    {initials(doc.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{doc.name.replace("Dr. ", "")}</p>
                    <p className={cn("text-xs", isUnavailable ? "text-red-500" : "text-emerald-500")}>
                      {isUnavailable ? "Not Available" : "Available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {doc.todayAppointments} today
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="size-3.5" />
                    {doc._count.appointments} total
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
