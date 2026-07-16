"use client";

import { useState } from "react";
import { Phone, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { useCallLogs } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CallLog } from "@/lib/api";

function dirClass(d: string | null) {
  return d?.toLowerCase() ?? "";
}

function statusColor(s: string | null) {
  const map: Record<string, string> = {
    answered: "bg-emerald-500",
    completed: "bg-emerald-500",
    connected: "bg-emerald-500",
    missed: "bg-red-500",
    "no answer": "bg-red-500",
    failed: "bg-red-500",
    busy: "bg-red-500",
    ongoing: "bg-amber-500",
    ringing: "bg-amber-500",
    progress: "bg-amber-500",
    inbound: "bg-blue-500",
    outbound: "bg-blue-500",
  };
  return map[dirClass(s)] ?? "bg-muted-foreground";
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-mono text-xs text-right break-all max-w-[60%]">{value ?? "—"}</span>
    </div>
  );
}

export default function CallLogsPage() {
  const { data, isLoading, error } = useCallLogs();
  const calls = data?.data ?? [];
  const [selected, setSelected] = useState<CallLog | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Call Logs</h1>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          Failed to load: {(error as Error).message}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Direction</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">To</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Call ID</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : calls.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No call logs found
                </td>
              </tr>
            ) : (
              calls.map((call) => {
                const d = dirClass(call.direction);
                const DirIcon = d === "inbound" ? PhoneIncoming :
                                d === "outbound" ? PhoneOutgoing : Phone;
                return (
                  <tr
                    key={call.id}
                    onClick={() => setSelected(call)}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <DirIcon className={cn("size-4", d === "inbound" ? "text-emerald-600" : d === "outbound" ? "text-blue-600" : "text-muted-foreground")} />
                        <span className="capitalize">{call.direction ?? "—"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{call.sourceNumber ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{call.destinationNumber ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3.5" />
                        {formatDuration(call.duration)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 capitalize">
                        <span className={cn("size-1.5 rounded-full", statusColor(call.status))} />
                        {call.status ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {call.startTime
                        ? new Date(call.startTime).toLocaleString("en-IN", {
                            day: "2-digit", month: "2-digit",
                            hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[120px] truncate" title={call.callID}>
                      {call.callID}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Call Details</DialogTitle>
            <div className="divide-y divide-border/50">
              <DetailRow label="Call ID" value={selected.callID} />
              <DetailRow label="Direction" value={<span className="capitalize">{selected.direction}</span>} />
              <DetailRow label="Call Type" value={selected.callType} />
              <DetailRow label="Source Number" value={selected.sourceNumber} />
              <DetailRow label="Destination Number" value={selected.destinationNumber} />
              <DetailRow label="Display Number" value={selected.displayNumber} />
              <DetailRow label="Status" value={<span className="capitalize">{selected.status}</span>} />
              <DetailRow label="Agent Status" value={selected.agentStatus} />
              <DetailRow label="Duration" value={formatDuration(selected.duration)} />
              <DetailRow label="Start Time" value={selected.startTime ? new Date(selected.startTime).toLocaleString("en-IN") : "—"} />
              <DetailRow label="End Time" value={selected.endTime ? new Date(selected.endTime).toLocaleString("en-IN") : "—"} />
              <DetailRow label="Account ID" value={selected.accountID} />
              <DetailRow label="Event ID" value={selected.eventID} />
              <DetailRow label="Data Source" value={selected.dataSource} />
              <DetailRow label="DTMF" value={selected.dtmf} />
              <DetailRow label="Resource URL" value={selected.resourceURL ? (
                <a href={selected.resourceURL} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Listen
                </a>
              ) : "—"} />
              <DetailRow label="Callback Params" value={selected.callBackParams ? JSON.stringify(selected.callBackParams) : "—"} />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
