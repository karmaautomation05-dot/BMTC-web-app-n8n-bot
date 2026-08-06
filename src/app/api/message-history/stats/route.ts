import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const DAY_MS = 24 * 60 * 60 * 1000;

function todayStartUtc() {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function dayKey(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

async function computeRange(sinceEpoch: string) {
  const where = { timestamp: { gte: sinceEpoch } } satisfies Prisma.MessageHistoryWhereInput;

  const [total, inbound, read, delivered] = await Promise.all([
    prisma.messageHistory.count({ where }),
    prisma.messageHistory.count({
      where: { ...where, sender: { equals: "user", mode: "insensitive" } },
    }),
    prisma.messageHistory.count({ where: { ...where, status: { equals: "read", mode: "insensitive" } } }),
    prisma.messageHistory.count({ where: { ...where, status: { equals: "delivered", mode: "insensitive" } } }),
  ]);

  const outbound = total - inbound;

  return {
    total,
    inbound,
    outbound,
    // Sent = every bot message; a read/delivered message has already reached "sent"
    sent: outbound,
    // Delivered = messages that reached delivered, which includes read ones
    delivered: delivered + read,
    read,
  };
}

export async function GET(req: NextRequest) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    const now = Date.now();
    const todayStart = todayStartUtc();
    const daysAgo30 = todayStart - 29 * DAY_MS;

    const [today, last30, rows] = await Promise.all([
      computeRange(Math.floor(todayStart / 1000).toString()),
      computeRange(Math.floor(daysAgo30 / 1000).toString()),
      prisma.$queryRaw<{ day: string; inbound: number; outbound: number }[]>`
        SELECT
          to_char(date_trunc('day', to_timestamp(nullif("timestamp", '')::bigint)), 'YYYY-MM-DD') AS day,
          count(*) FILTER (WHERE lower(sender) = 'user')::int AS inbound,
          count(*) FILTER (WHERE lower(sender) <> 'user')::int AS outbound
        FROM "message_history"
        WHERE "timestamp" ~ '^[0-9]+$'
          AND to_timestamp("timestamp"::bigint) >= to_timestamp(${Math.floor(daysAgo30 / 1000)})
        GROUP BY day
        ORDER BY day ASC
      `,
    ]);

    const byDay = new Map(rows.map((r) => [r.day, r]));
    const daily = Array.from({ length: 30 }, (_, i) => {
      const key = dayKey(daysAgo30 + i * DAY_MS);
      const r = byDay.get(key);
      return { date: key, inbound: r?.inbound ?? 0, outbound: r?.outbound ?? 0 };
    });

    return NextResponse.json({ today, last30, daily });
  } catch (err) {
    console.error("Chat stats error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
