"use client";

import { useState } from "react";
import { Phone, MessageCircle, PhoneIncoming, PhoneOutgoing, PhoneMissed, CheckCheck, Eye, Clock, MessagesSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallLogs, useChatStats } from "@/hooks/use-api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChatHistory } from "@/components/chat-history";
import type { CallLog, ChatStatsRange, DailyStat } from "@/lib/api";

const tabs = [
  { label: "Call", icon: Phone, value: "call" as const },
  { label: "Chat", icon: MessageCircle, value: "chat" as const },
  { label: "Chat History", icon: MessagesSquare, value: "history" as const },
];

const callCards = [
  { label: "Total", key: "total" as const, icon: Phone, color: "text-blue-500" },
  { label: "Inbound", key: "inbound" as const, icon: PhoneIncoming, color: "text-emerald-500" },
  { label: "Outbound", key: "outbound" as const, icon: PhoneOutgoing, color: "text-blue-600" },
  { label: "Answered", key: "answered" as const, icon: Phone, color: "text-emerald-500" },
  { label: "Missed", key: "missed" as const, icon: PhoneMissed, color: "text-red-500" },
];

const chatCards = [
  { label: "Total", key: "total" as const, icon: MessagesSquare, color: "text-emerald-500" },
  { label: "Inbound", key: "inbound" as const, icon: MessageCircle, color: "text-blue-500" },
  { label: "Sent", key: "sent" as const, icon: Send, color: "text-orange-500" },
  { label: "Delivered", key: "delivered" as const, icon: CheckCheck, color: "text-purple-500" },
  { label: "Read", key: "read" as const, icon: Eye, color: "text-cyan-500" },
];

function StatGroup({ title, range, loading }: { title: string; range?: ChatStatsRange; loading: boolean }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {chatCards.map((card) => {
          const Icon = card.icon;
          const val = (range?.[card.key] as number) ?? 0;
          return (
            <div key={card.key} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className={cn("size-4", card.color)} />
                {card.label}
              </div>
              <span className="text-2xl font-bold tabular-nums">
                {loading ? "—" : val.toLocaleString("en-IN")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DailyChart({ daily, className }: { daily: DailyStat[]; className?: string }) {
  const max = Math.max(1, ...daily.map((d) => Math.max(d.inbound, d.outbound)));
  const W = 920;
  const H = 220;
  const padL = 30;
  const padB = 24;
  const padT = 12;
  const padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const groupW = chartW / Math.max(1, daily.length);
  const barW = Math.min(10, groupW / 3);
  const gridLines = 4;
  const y = (v: number) => padT + chartH - (v / max) * chartH;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-3 flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2.5 rounded-sm bg-emerald-500" />
          Inbound
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2.5 rounded-sm bg-blue-500" />
          Outbound
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
        >
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const v = (max / gridLines) * i;
          const gy = y(v);
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={gy} y2={gy} stroke="currentColor" strokeOpacity="0.1" />
              <text x={padL - 6} y={gy + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">
                {Math.round(v)}
              </text>
            </g>
          );
        })}
        {daily.map((d, i) => {
          const cx = padL + i * groupW + groupW / 2;
          const hIn = (d.inbound / max) * chartH;
          const hOut = (d.outbound / max) * chartH;
          const showLabel = i % 5 === 0 || i === daily.length - 1;
          return (
            <g key={d.date}>
              <rect x={cx - barW - 1.5} y={y(d.inbound)} width={barW} height={Math.max(hIn, 1.5)} rx={2} className="fill-emerald-500/80">
                <title>{`${d.date} · Inbound ${d.inbound}`}</title>
              </rect>
              <rect x={cx + 1.5} y={y(d.outbound)} width={barW} height={Math.max(hOut, 1.5)} rx={2} className="fill-blue-500/80">
                <title>{`${d.date} · Outbound ${d.outbound}`}</title>
              </rect>
              {showLabel && (
                <text x={cx} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                  {Number(d.date.slice(8))}
                </text>
              )}
            </g>
          );
        })}
        </svg>
      </div>
    </div>
  );
}

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
    noanswer: "bg-red-500",
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

export default function StatsPage() {
  const [tab, setTab] = useState<"call" | "chat" | "history">("call");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CallLog | null>(null);

  const { data: callData, isLoading: callLoading } = useCallLogs({ limit: "15", page: String(page) });
  const { data: chatData, isLoading: chatLoading } = useChatStats();

  const cs = callData?.stats;
  const calls = callData?.data ?? [];
  const totalPages = callData?.pagination?.totalPages ?? 1;
  const chs = chatData;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>

      <div className="flex gap-1 rounded-xl border p-1 w-fit bg-muted/30">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => { setTab(t.value); setPage(1); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                tab === t.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "call" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {callLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-xl border bg-card p-4 flex flex-col gap-2 animate-pulse">
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-7 w-20 bg-muted rounded" />
                  </div>
                ))
              : callCards.map((card) => {
                  const Icon = card.icon;
                  const val = (cs?.[card.key] as number) ?? 0;
                  return (
                    <div key={card.key} className="rounded-xl border bg-card p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className={cn("size-4", card.color)} />
                        {card.label}
                      </div>
                      <span className="text-2xl font-bold tabular-nums">{val.toLocaleString("en-IN")}</span>
                    </div>
                  );
                })}
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Direction</th>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">To</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">Time</th>
                  <th className="hidden md:table-cell px-4 py-3 font-medium">Call ID</th>
                </tr>
              </thead>
              <tbody>
                {callLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : calls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No call logs found</td>
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
                        <td className="hidden md:table-cell px-4 py-3 text-muted-foreground text-xs">
                          {call.startTime
                            ? new Date(call.startTime).toLocaleString("en-IN", {
                                day: "2-digit", month: "2-digit",
                                hour: "2-digit", minute: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 font-mono text-xs text-muted-foreground max-w-[120px] truncate" title={call.callID}>
                          {call.callID}
                        </td>
                      </tr>
                    );
                  })
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
                    <a href={selected.resourceURL} target="_blank" rel="noopener noreferrer" className="text-primary underline">Listen</a>
                  ) : "—"} />
                  <DetailRow label="Callback Params" value={selected.callBackParams ? JSON.stringify(selected.callBackParams) : "—"} />
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>
      )}

      {tab === "chat" && (
        <div className="space-y-4">
          <div className="space-y-4">
            <StatGroup title="Today" range={chs?.today} loading={chatLoading} />
            <StatGroup title="Last 30 days" range={chs?.last30} loading={chatLoading} />
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Daily messages · last 30 days</h2>
            {chatLoading ? (
              <div className="h-64 animate-pulse rounded-lg bg-muted sm:h-80 lg:h-[26rem]" />
            ) : (
              <DailyChart daily={chs?.daily ?? []} className="h-64 sm:h-80 lg:h-[26rem]" />
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <ChatHistory className="h-[calc(100dvh-12rem)] min-h-[30rem]" />
      )}
    </div>
  );
}
