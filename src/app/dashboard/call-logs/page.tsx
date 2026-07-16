"use client";

import { Phone, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { useCallLogs } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

function dirClass(d: string | null) {
  return d?.toLowerCase() ?? "";
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CallLogsPage() {
  const { data, isLoading, error } = useCallLogs();
  const calls = data?.data ?? [];

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
                  <tr key={call.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
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
                        <span className={cn(
                          "size-1.5 rounded-full",
                          dirClass(call.status) === "completed" ? "bg-emerald-500" :
                          dirClass(call.status) === "missed" ? "bg-red-500" :
                          dirClass(call.status) === "ongoing" ? "bg-amber-500" :
                          "bg-muted-foreground"
                        )} />
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
    </div>
  );
}
