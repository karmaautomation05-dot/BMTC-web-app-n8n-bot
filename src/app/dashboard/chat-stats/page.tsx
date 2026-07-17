"use client";

import { MessageCircle, Send, ArrowUpRight, CheckCheck, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStats } from "@/hooks/use-api";

const cards = [
  { label: "Inbound", key: "inbound" as const, icon: MessageCircle, color: "text-blue-500" },
  { label: "Outbound", key: "outbound" as const, icon: Send, color: "text-orange-500" },
  { label: "Sent", key: "sent" as const, icon: ArrowUpRight, color: "text-emerald-500" },
  { label: "Delivered", key: "delivered" as const, icon: CheckCheck, color: "text-purple-500" },
  { label: "Read", key: "read" as const, icon: Eye, color: "text-cyan-500" },
];

export default function ChatStatsPage() {
  const { data, isLoading, error } = useChatStats();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Chat Stats</h1>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {cards.map((card) => {
            const val = data?.[card.key] ?? 0;
            return (
              <div
                key={card.key}
                className="rounded-xl border bg-card p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <card.icon className={cn("size-4", card.color)} />
                  {card.label}
                </div>
                <span className="text-2xl font-bold tabular-nums">
                  {val.toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
