"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, IndianRupee, Clock, ArrowLeft, Stethoscope, Hash } from "lucide-react";
import { fmt, fmtDate } from "@/lib/utils";
import { useDoctors, useDoctorAppointments, useUpdateDoctor } from "@/hooks/use-api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import type { DoctorAppointment } from "@/lib/api";

function formatRupees(paise: number) {
  return `₹${paise.toLocaleString("en-IN")}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-mono text-xs text-right break-all max-w-[60%]">{value ?? "—"}</span>
    </div>
  );
}

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const doctorId = parseInt(id);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<DoctorAppointment | null>(null);

  const { data: doctorsData } = useDoctors();
  const doctor = doctorsData?.data?.find((d) => d.id === doctorId);

  const { data: aptData, isLoading } = useDoctorAppointments(doctorId, {
    limit: "50",
    page: String(page),
  });
  const appointments = aptData?.data ?? [];
  const totalPages = aptData?.pagination?.totalPages ?? 1;

  const updateDoctor = useUpdateDoctor();

  const notAvailDate = doctor?.notAvailableDate
    ? new Date(doctor.notAvailableDate).toISOString().split("T")[0]
    : "";

  const handleDateChange = (val: string) => {
    updateDoctor.mutate({ id: doctorId, data: { notAvailableDate: val || null } });
  };

  if (!doctor) return null;

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/doctors"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Doctors
      </Link>

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Stethoscope className="size-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">{doctor.name.replace("Dr. ", "")}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1">
                <Hash className="size-3.5" />
                {doctor._count.appointments} total appointments
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {doctor.todayAppointments} today
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Not Available Date:</span>
          <input
            type="date"
            value={notAvailDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          />
          {notAvailDate && (
            <button
              onClick={() => handleDateChange("")}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold tracking-tight">Appointments</h2>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Slot</th>
              <th className="px-4 py-3 font-medium">Fee</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">Loading...</td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No appointments found</td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium">{a.patientName}</td>
                  <td className="hidden md:table-cell px-4 py-3 font-mono text-xs">{a.phone === "-" ? "—" : a.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{a.timeSlot}</td>
                  <td className="px-4 py-3 font-medium">{formatRupees(a.fees)}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-muted-foreground text-xs max-w-[140px] truncate">
                    {a.location}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    <span className="hidden md:inline">{fmtDate(a.timestamp, { day: "2-digit", month: "short" })} </span>
                    <span>{fmt(a.timestamp, { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <DialogContent className="sm:max-w-sm">
            <DialogTitle>Appointment Details</DialogTitle>
            <div>
              <DetailRow label="Patient" value={selected.patientName} />
              <DetailRow label="Phone" value={selected.phone === "-" ? "—" : selected.phone} />
              <DetailRow label="Time Slot" value={selected.timeSlot} />
              <DetailRow label="Fee" value={formatRupees(selected.fees)} />
              <DetailRow label="Location" value={selected.location} />
              <DetailRow label="Date" value={fmt(selected.timestamp)} />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
