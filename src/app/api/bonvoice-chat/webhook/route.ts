import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const changes = body?.entry?.[0]?.changes?.[0]?.value;
    if (!changes) return NextResponse.json({ ok: true });

    const messages = changes.messages ?? [];
    const statuses = changes.statuses ?? [];

    let inbound = 0;
    let outbound = 0;
    let sent = 0;
    let delivered = 0;
    let read = 0;

    if (messages.length) inbound = messages.length;

    for (const s of statuses) {
      const st = s.status;
      if (st === "sent") { outbound++; sent++; }
      else if (st === "delivered") delivered++;
      else if (st === "read") read++;
    }

    await prisma.messageStats.upsert({
      where: { id: 1 },
      update: {
        inbound: { increment: inbound },
        outbound: { increment: outbound },
        sent: { increment: sent },
        delivered: { increment: delivered },
        read: { increment: read },
      },
      create: {
        id: 1,
        inbound,
        outbound,
        sent,
        delivered,
        read,
      },
    });

    await prisma.chatWebhook.create({
      data: { rawPayload: body },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === "development"
          ? (error instanceof Error ? error.stack : undefined)
          : undefined,
      },
      { status: 500 },
    );
  }
}
