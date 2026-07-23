"use client";

import { useState } from "react";
import { Search, Clock, IndianRupee } from "lucide-react";
import { fmt, fmtDate } from "@/lib/utils";
import { usePatients, usePatientAppointments } from "@/hooks/use-api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Patient } from "@/lib/api";

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

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);

  const params: Record<string, string> = { limit: "15", page: String(page) };
  if (search) params.search = search;

  const { data, isLoading } = usePatients(params);
  const { data: aptData } = usePatientAppointments(selected?.id ?? null);
  const patients = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const appointments = aptData?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search name or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Visits</th>
              <th className="hidden md:table-cell px-4 py-3 font-medium">First Visit</th>
              <th className="px-4 py-3 font-medium">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">Loading...</td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">No patients found</td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="hidden md:table-cell px-4 py-3 font-mono text-xs">{p.phone}</td>
                  <td className="px-4 py-3">{p._count.appointments}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-muted-foreground text-xs">
                    {fmtDate(p.firstVisit, { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {fmt(p.lastVisit, {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
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
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogTitle>Patient Details</DialogTitle>
            <div className="space-y-1.5">
              <DetailRow label="Name" value={selected.name} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Total Visits" value={selected._count.appointments} />
              <DetailRow label="First Visit" value={fmt(selected.firstVisit)} />
              <DetailRow label="Last Visit" value={fmt(selected.lastVisit)} />

              {appointments.length > 0 && (
                <div className="pt-3">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Appointment History</h3>
                  <div className="space-y-2">
                    {appointments.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-lg border bg-muted/20 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock className="size-3 shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground whitespace-nowrap">
                              {fmtDate(a.timestamp, { day: "2-digit", month: "short" })}
                            </span>
                            <span className="text-muted-foreground">{a.timeSlot}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground truncate">{a.doctor.name.replace("Dr. ", "")}</span>
                          </div>
                          <span className="font-medium shrink-0 flex items-center gap-0.5 ml-2">
                            <IndianRupee className="size-3" />
                            {a.fees.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="font-semibold text-sm mt-1 border-t border-border/40 pt-1">
                          {a.patientName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
