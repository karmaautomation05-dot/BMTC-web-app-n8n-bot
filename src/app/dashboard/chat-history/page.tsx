"use client";

import { useEffect, useState } from "react";
import { Search, MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryMessage {
  id: string;
  wamid: string;
  phoneNumber: string;
  sender: string;
  messageType: string;
  content: string | null;
  interactiveMetadata: Record<string, unknown> | null;
  mediaId: string | null;
  mimeType: string | null;
  status: string;
  timestamp: string;
  createdAt: string;
}

function formatTime(ts: string) {
  const ms = Number(ts);
  const date = Number.isFinite(ms) && ms > 1_000_000_000_000 ? new Date(ms) : new Date(Number(ts) * 1000);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function Bubble({ msg }: { msg: HistoryMessage }) {
  const outgoing = msg.sender.toLowerCase() !== "user";
  const isMeta =
    msg.messageType === "interactive" ||
    msg.messageType === "button" ||
    (msg.messageType === "text" && msg.interactiveMetadata != null);

  return (
    <div className={cn("flex flex-col max-w-[85%] sm:max-w-[70%]", outgoing ? "self-end items-end" : "self-start items-start")}>
      <span className="text-[11px] text-muted-foreground mb-1">{outgoing ? "Bot" : msg.sender}</span>
      <div
        className={cn(
          "rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words",
          outgoing
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {isMeta ? (
          <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-full overflow-x-auto">
            {JSON.stringify(msg.interactiveMetadata ?? {}, null, 2)}
          </pre>
        ) : msg.messageType === "image" || msg.messageType === "video" || msg.messageType === "audio" || msg.messageType === "document" ? (
          <div className="space-y-1">
            <span className="capitalize">[{msg.messageType}]</span>
            {msg.mimeType && <div className="font-mono text-[11px] opacity-80">{msg.mimeType}</div>}
            {msg.content && <div>{msg.content}</div>}
          </div>
        ) : (
          msg.content || `(${msg.messageType})`
        )}
      </div>
      <span className={cn("text-[11px] text-muted-foreground mt-1", outgoing && "text-right")}>
        {formatTime(msg.timestamp)}
        {outgoing && msg.status && <span className="ml-1.5 opacity-80">{msg.status}</span>}
      </span>
    </div>
  );
}

export default function ChatHistoryPage() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [data, setData] = useState<HistoryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submitted) return;
    const ctrl = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(`/api/message-history?phone=${encodeURIComponent(submitted)}&limit=100&order=asc`, {
      signal: ctrl.signal,
    })
      .then((res) => (res.ok ? res.json() : res.json().then((j) => Promise.reject(new Error(j.error || "Request failed")))))
      .then((json) => setData(json.data ?? []))
      .catch((err) => {
        if (err.name !== "AbortError") setError((err as Error).message);
      })
      .finally(() => setIsLoading(false));

    return () => ctrl.abort();
  }, [submitted]);

  const load = (e: React.FormEvent) => {
    e.preventDefault();
    const p = phone.trim();
    if (p) setSubmitted(p);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Chat History</h1>

      <form onSubmit={load} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            inputMode="tel"
            placeholder="Enter phone number..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex shrink-0 h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
          disabled={isLoading || !phone.trim()}
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
          Load
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {submitted && (
        <div className="rounded-xl border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-medium">
              Conversation with <span className="font-mono">{submitted}</span>
            </span>
            <span className="text-xs text-muted-foreground">{data.length} message{data.length === 1 ? "" : "s"}</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading...
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No messages found for this number
            </div>
          ) : (
            <div className="flex flex-col gap-3 p-4 max-h-[65vh] overflow-y-auto">
              {data.map((m) => (
                <Bubble key={m.id} msg={m} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
