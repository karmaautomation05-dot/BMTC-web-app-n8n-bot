"use client";

import { CalendarDays, ClipboardList, Users, PhoneIncoming, PhoneOutgoing, Phone, PhoneMissed, MessageCircle, Send, CheckCheck, Eye } from "lucide-react";
import { useStats, useCallLogs, useChatStats } from "@/hooks/use-api";
import { DoctorCard } from "@/components/doctor-card";

const doctors = [
  "Dr. Gaurav Bhargava",
  "Dr. Priyanka Bhargava",
  "Dr. R R Bhargava",
];

const mainCards = [
  { label: "Today's Appointments", key: "todayAppointments" as const, icon: CalendarDays, color: "text-blue-500" },
  { label: "Total Appointments", key: "totalAppointments" as const, icon: ClipboardList, color: "text-emerald-500" },
  { label: "Total Patients", key: "totalPatient" as const, icon: Users, color: "text-violet-500" },
];

const callCards = [
  { label: "Total", key: "total" as const, icon: Phone, color: "text-blue-500" },
  { label: "Inbound", key: "inbound" as const, icon: PhoneIncoming, color: "text-emerald-500" },
  { label: "Outbound", key: "outbound" as const, icon: PhoneOutgoing, color: "text-blue-600" },
  { label: "Answered", key: "answered" as const, icon: Phone, color: "text-emerald-500" },
  { label: "Missed", key: "missed" as const, icon: PhoneMissed, color: "text-red-500" },
];

const chatCards = [
  { label: "Inbound", key: "inbound" as const, icon: MessageCircle, color: "text-blue-500" },
  { label: "Outbound", key: "outbound" as const, icon: Send, color: "text-orange-500" },
  { label: "Sent", key: "sent" as const, icon: Send, color: "text-emerald-500" },
  { label: "Delivered", key: "delivered" as const, icon: CheckCheck, color: "text-purple-500" },
  { label: "Read", key: "read" as const, icon: Eye, color: "text-cyan-500" },
];

function StatGrid({ cards, data, isLoading, cols = "5" }: {
  cards: { label: string; key: string; icon: React.ComponentType<{ className?: string }>; color: string }[];
  data: Record<string, unknown> | null | undefined;
  isLoading: boolean;
  cols?: "3" | "5";
}) {
  const gridCols = cols === "3" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-5";
  if (isLoading) {
    return (
      <div className={`grid ${gridCols} gap-3`}>
        {Array.from({ length: cards.length }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 flex flex-col gap-2 animate-pulse">
            <div className="h-4 w-16 bg-muted rounded" />
            <div className="h-7 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {cards.map((card) => {
        const Icon = card.icon;
        const val = (data?.[card.key] as number) ?? 0;
        return (
          <div key={card.key} className="rounded-xl border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className={cn("size-4 shrink-0", card.color)} />
              <span className="truncate">{card.label}</span>
            </div>
            <span className="text-2xl font-bold tabular-nums">
              {val.toLocaleString("en-IN")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data: stats, isLoading } = useStats();
  const { data: callData, isLoading: callLoading } = useCallLogs({ limit: "1" });
  const { data: chatData, isLoading: chatLoading } = useChatStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-3 items-start">
        {doctors.map((name, i) => (
          <DoctorCard key={name} name={name} index={i} />
        ))}
      </div>

      <StatGrid cards={mainCards} data={stats as unknown as Record<string, unknown> | null} isLoading={isLoading} cols="3" />

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Call Logs</h2>
        <StatGrid cards={callCards} data={callData?.stats as Record<string, unknown> | undefined} isLoading={callLoading} />
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Chat Stats</h2>
        <StatGrid cards={chatCards} data={chatData as unknown as Record<string, unknown> | null} isLoading={chatLoading} />
      </div>
    </div>
  );
}
