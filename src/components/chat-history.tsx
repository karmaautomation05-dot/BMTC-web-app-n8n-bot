"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  Search,
  Check,
  CheckCheck,
  MessageCircle,
  List,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface HistoryMessage {
  id: string;
  wamid: string;
  phoneNumber: string;
  sender: string;
  messageType: string;
  content: string | null;
  interactiveMetadata: unknown;
  mediaId: string | null;
  mimeType: string | null;
  status: string;
  timestamp: string;
  createdAt: string;
}

type MetaItem = { id?: string; title?: string };

const CACHE_CONVERSATIONS = "bmtc-chat-conversations";
const CACHE_CONVERSATIONS_AT = "bmtc-chat-conversations-at";
const CACHE_MESSAGES_PREFIX = "bmtc-chat-messages-";

function loadCache(key: string): HistoryMessage[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

function tsToDate(ts: string) {
  const n = Number(ts);
  const ms = Number.isFinite(n) ? (n > 1e12 ? n : n * 1000) : NaN;
  return new Date(ms);
}

function isToday(d: Date) {
  const t = new Date();
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

function isYesterday(d: Date) {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return (
    d.getDate() === y.getDate() &&
    d.getMonth() === y.getMonth() &&
    d.getFullYear() === y.getFullYear()
  );
}

function formatTime(ts: string) {
  const d = tsToDate(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatListTime(ts: string) {
  const d = tsToDate(ts);
  if (Number.isNaN(d.getTime())) return "—";
  if (isToday(d)) return formatTime(ts);
  if (isYesterday(d)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatUpdatedAt(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDayLabel(ts: string) {
  const d = tsToDate(ts);
  if (Number.isNaN(d.getTime())) return "";
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function parseMeta(meta: unknown): MetaItem[] | null {
  if (!meta) return null;
  let v: unknown = meta;
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return null;
    }
  }
  if (Array.isArray(v)) return v as MetaItem[];
  if (v && typeof v === "object") return [v as MetaItem];
  return null;
}

function snippet(msg: HistoryMessage) {
  if (msg.content) return msg.content.replace(/\s+/g, " ").trim();
  return `[${msg.messageType}]`;
}

function hasChanged(prev: HistoryMessage[], next: HistoryMessage[]) {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < prev.length; i++) {
    const a = prev[i];
    const b = next[i];
    if (
      a.id !== b.id ||
      a.timestamp !== b.timestamp ||
      a.status !== b.status ||
      a.content !== b.content
    ) {
      return true;
    }
  }
  return false;
}

function Avatar({ phone }: { phone: string }) {
  const ch = phone.replace(/\D/g, "").slice(-2) || "?";
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-semibold">
      {ch}
    </div>
  );
}

function MessageBubble({ msg }: { msg: HistoryMessage }) {
  const outgoing = msg.sender.toLowerCase() !== "user";
  const meta = parseMeta(msg.interactiveMetadata);
  const buttons =
    msg.messageType === "interactive_button" && meta
      ? meta.filter((m) => m.title)
      : [];
  const listItems =
    msg.messageType === "interactive_list" && meta
      ? meta.filter((m) => m.title)
      : [];
  const [listOpen, setListOpen] = useState(false);

  return (
    <div className={cn("flex flex-col", outgoing ? "items-end" : "items-start")}>
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[75%] rounded-[18px] px-3 py-2 text-[14.5px] leading-snug whitespace-pre-wrap break-words shadow-sm",
          outgoing
            ? "bg-[#264C38] text-white rounded-tr-sm"
            : "bg-white text-[#111b21] rounded-tl-sm dark:bg-[#202c33] dark:text-[#e9edef]",
        )}
      >
        {msg.content && <div>{msg.content}</div>}

        {buttons.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {buttons.map((b) => (
              <div
                key={b.id || b.title}
                className="rounded-lg bg-[#f0f2f5] px-3 py-1.5 text-center text-[13px] font-medium text-[#111b21] shadow-sm dark:bg-[#1f2c33] dark:text-[#e9edef]"
              >
                {b.title}
              </div>
            ))}
          </div>
        )}

        {listItems.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setListOpen(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#f0f2f5] px-3 py-1.5 text-[13px] font-medium text-[#111b21] shadow-sm dark:bg-[#1f2c33] dark:text-[#e9edef]"
            >
              <List className="size-3.5" />
              List
            </button>

            <Dialog open={listOpen} onOpenChange={(o) => setListOpen(o)}>
              <DialogContent className="sm:max-w-sm">
                <DialogTitle>Options</DialogTitle>
                <div className="space-y-2">
                  {listItems.map((b) => (
                    <div
                      key={b.id || b.title}
                      className="rounded-lg border bg-muted/40 px-3 py-2.5 text-[13px] font-medium"
                    >
                      {b.title}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <span
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-[11px]",
            outgoing ? "text-white/75" : "text-[#54656f] opacity-70",
          )}
        >
          {formatTime(msg.timestamp)}
          {outgoing &&
            (msg.status === "read" ? (
              <CheckCheck className="size-3.5 text-[#53bdeb]" />
            ) : msg.status === "delivered" ? (
              <CheckCheck className="size-3.5 opacity-70" />
            ) : msg.status === "sent" ? (
              <Check className="size-3.5 opacity-70" />
            ) : null)}
        </span>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatSkeleton() {
  const rows = [
    { out: false, w: "w-[55%]" },
    { out: true, w: "w-[70%]" },
    { out: false, w: "w-[45%]" },
    { out: true, w: "w-[60%]" },
    { out: false, w: "w-[50%]" },
  ];
  return (
    <div className="flex flex-col gap-2 px-4 py-4">
      {rows.map((r, i) => (
        <div key={i} className={cn("flex", r.out ? "justify-end" : "justify-start")}>
          <div className={cn("h-10 animate-pulse rounded-2xl bg-muted/70", r.w)} />
        </div>
      ))}
    </div>
  );
}

function RefreshIndicator({ refreshing, updatedAt }: { refreshing: boolean; updatedAt: number | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      {refreshing && <Loader2 className="size-3 animate-spin" />}
      Updated {formatUpdatedAt(updatedAt)}
    </span>
  );
}

function useConversations() {
  const [data, setData] = useState<HistoryMessage[]>(() =>
    loadCache(CACHE_CONVERSATIONS),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(() => {
    const raw = Number(localStorage.getItem(CACHE_CONVERSATIONS_AT));
    return Number.isFinite(raw) && raw > 0 ? raw : null;
  });

  useEffect(() => {
    let active = true;
    const load = () => {
      if (active) setRefreshing(true);
      fetch("/api/message-history/conversations")
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Request failed"))))
        .then((j) => {
          if (!active) return;
          const next = j.data ?? [];
          setData((prev) => (hasChanged(prev, next) ? next : prev));
          saveCache(CACHE_CONVERSATIONS, next);
          const now = Date.now();
          localStorage.setItem(CACHE_CONVERSATIONS_AT, String(now));
          setUpdatedAt(now);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setRefreshing(false);
        });
    };
    load();
    const id = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return { conversations: data, refreshing, updatedAt };
}

function ConversationView({ phone, onBack }: { phone: string; onBack?: () => void }) {
  const cacheKey = `${CACHE_MESSAGES_PREFIX}${phone}`;
  const atKey = `${cacheKey}-at`;
  const [msgs, setMsgs] = useState<HistoryMessage[]>(() => loadCache(cacheKey));
  const [loading, setLoading] = useState(msgs.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(() => {
    const raw = Number(localStorage.getItem(atKey));
    return Number.isFinite(raw) && raw > 0 ? raw : null;
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let first = true;
    const load = () => {
      if (active) setRefreshing(true);
      fetch(`/api/message-history?phone=${encodeURIComponent(phone)}&limit=200&order=asc`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Request failed"))))
        .then((j) => {
          if (!active) return;
          const next = j.data ?? [];
          setMsgs((prev) => (hasChanged(prev, next) ? next : prev));
          saveCache(cacheKey, next);
          const now = Date.now();
          localStorage.setItem(atKey, String(now));
          setUpdatedAt(now);
        })
        .catch(() => {})
        .finally(() => {
          if (active) {
            setRefreshing(false);
            if (first) {
              first = false;
              setLoading(false);
            }
          }
        });
    };
    load();
    const id = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [phone, cacheKey, atKey]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back to chats"
            className="-ml-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted lg:hidden"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <Avatar phone={phone} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{phone}</p>
          <p className="text-xs text-muted-foreground">
            {msgs.length} message{msgs.length === 1 ? "" : "s"}
          </p>
        </div>
        <RefreshIndicator refreshing={refreshing} updatedAt={updatedAt} />
      </header>

      <div
        ref={scrollRef}
        className="chat-bg flex-1 overflow-y-auto"
      >
        {loading ? (
          <ChatSkeleton />
        ) : msgs.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No messages found for this number
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 px-4 py-4">
            {msgs.map((m, i) => {
              const day = formatDayLabel(m.timestamp);
              const prevDay = i > 0 ? formatDayLabel(msgs[i - 1].timestamp) : null;
              return (
                <Fragment key={m.id}>
                  {day !== prevDay && (
                    <div className="my-1 flex justify-center">
                      <span className="rounded-lg bg-[#ffffffcc] px-3 py-1 text-[11px] font-medium text-[#54656f] shadow-sm dark:bg-[#0b141acc] dark:text-[#8696a0]">
                        {day}
                      </span>
                    </div>
                  )}
                  <MessageBubble msg={m} />
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export function ChatHistory({ className }: { className?: string }) {
  const { conversations, refreshing, updatedAt } = useConversations();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(
    loadCache(CACHE_CONVERSATIONS).length === 0,
  );

  useEffect(() => {
    if (conversations.length > 0) setLoading(false);
  }, [conversations]);

  const filtered = conversations.filter((c) =>
    c.phoneNumber.includes(search.trim()),
  );

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card lg:flex-row",
        className ?? "h-[calc(100dvh-8rem)] min-h-[30rem] lg:h-[calc(100dvh-7rem)]",
      )}
    >
      {/* Left: conversation list */}
      <aside
        className={cn(
          "flex flex-col border-b lg:h-full lg:w-80 lg:border-b-0 lg:border-r",
          selected ? "hidden lg:flex" : "h-full w-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <span className="font-semibold">Chats</span>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[11px] text-muted-foreground">
              {filtered.length} conversation{filtered.length === 1 ? "" : "s"}
            </span>
            <RefreshIndicator refreshing={refreshing} updatedAt={updatedAt} />
          </div>
        </div>

        <div className="relative shrink-0 px-3 py-2">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <ListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <MessageCircle className="size-6 opacity-50" />
              No conversations
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.phoneNumber}
                onClick={() => setSelected(c.phoneNumber)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                  selected === c.phoneNumber
                    ? "bg-primary/10"
                    : "hover:bg-muted/50",
                )}
              >
                <Avatar phone={c.phoneNumber} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {c.phoneNumber}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatListTime(c.timestamp)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
                    <span className="truncate">{snippet(c)}</span>
                    {c.status === "read" && (
                      <CheckCheck className="size-3.5 shrink-0 text-[#53bdeb]" />
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Right: chat view */}
      <section
        className={cn(
          "min-w-0 flex-col lg:flex lg:h-full lg:flex-1",
          selected ? "flex h-full w-full" : "hidden",
        )}
      >
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <MessageCircle className="size-10 opacity-40" />
            <p className="text-sm">Select a conversation to view chat history</p>
          </div>
        ) : (
          <ConversationView
            key={selected}
            phone={selected}
            onBack={() => setSelected(null)}
          />
        )}
      </section>
    </div>
  );
}
