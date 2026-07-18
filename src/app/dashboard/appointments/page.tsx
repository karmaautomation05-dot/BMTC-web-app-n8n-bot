"use client";

import { useState, useCallback } from "react";
import { IndianRupee, ClipboardList, Clock, User, Phone, MapPin, Stethoscope, Search, CalendarDays, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/hooks/use-api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Appointment } from "@/lib/api";

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

const FILTERS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Today", value: "today" },
  { label: "All", value: "all" },
] as const;

export default function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [datePicker, setDatePicker] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const params: Record<string, string> = { limit: "15", page: String(page), filter };
  if (search) params.search = search;
  if (filter === "all" && datePicker) params.filter = datePicker;

  const { data, isLoading } = useAppointments(params);
  const appointments = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const handleFilterChange = useCallback((f: string) => {
    setFilter(f);
    setPage(1);
    if (f !== "all") setDatePicker("");
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border p-1 bg-muted/30">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filter === "all" && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="size-4 text-muted-foreground" />
            <input
              type="date"
              value={datePicker}
              onChange={(e) => { setDatePicker(e.target.value); setPage(1); }}
              className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            />
          </div>
        )}

        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-8 w-48 rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Doctor</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">Slot</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Fee</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Loading...</td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No appointments found</td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[120px] truncate" title={a.appointmentId}>
                    {a.appointmentId}
                  </td>
                  <td className="px-4 py-3 font-medium">{a.patientName}</td>
                  <td className="px-4 py-3 text-sm">{a.doctor.name.replace("Dr. ", "")}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-muted-foreground text-xs">{a.timeSlot}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-muted-foreground text-xs max-w-[140px] truncate" title={a.location}>
                    {a.location}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatRupees(a.fees)}</td>
                  <td className="hidden md:table-cell px-4 py-3 font-mono text-xs">{a.phone === "-" ? "—" : a.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {(() => {
                      const d = new Date(a.timestamp);
                      const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                      const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
                      return <><span className="hidden md:inline">{date} </span><span>{time}</span></>;
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && filter !== "upcoming" && (
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
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Appointment Details</DialogTitle>
            <div>
              <DetailRow label="Appointment ID" value={selected.appointmentId} />
              <DetailRow label="Patient Name" value={selected.patientName} />
              <DetailRow label="Doctor" value={selected.doctor.name} />
              <DetailRow label="Time Slot" value={selected.timeSlot} />
              <DetailRow label="Location" value={selected.location} />
              <DetailRow label="Fees" value={formatRupees(selected.fees)} />
              <DetailRow label="Phone" value={selected.phone === "-" ? "—" : selected.phone} />
              <DetailRow label="Date & Time" value={new Date(selected.timestamp).toLocaleString("en-IN")} />
              <DetailRow label="Razorpay Txn ID" value={selected.rzpTxnId} />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
