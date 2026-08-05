import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

function parseInteractive(metadata: unknown): Prisma.InputJsonValue | undefined {
  if (!metadata) return undefined;
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata) as Prisma.InputJsonValue;
    } catch {
      return undefined;
    }
  }
  return metadata as Prisma.InputJsonValue;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const items = Array.isArray(body) ? body : [body];
    const saved = [];

    for (const item of items) {
      const { wamid, phone_number, sender, message_type, content, interactive_metadata, media_id, mime_type, status, timestamp } = item;

      if (!wamid) {
        return NextResponse.json({ error: "wamid is required" }, { status: 400 });
      }

      const record = await prisma.messageHistory.upsert({
        where: { wamid },
        update: {
          phoneNumber: phone_number,
          sender,
          messageType: message_type,
          content,
          interactiveMetadata: parseInteractive(interactive_metadata),
          mediaId: media_id || null,
          mimeType: mime_type || null,
          status: status || "Sent",
          timestamp,
        },
        create: {
          wamid,
          phoneNumber: phone_number || "",
          sender: sender || "",
          messageType: message_type || "UNKNOWN",
          content: content ?? null,
          interactiveMetadata: parseInteractive(interactive_metadata),
          mediaId: media_id || null,
          mimeType: mime_type || null,
          status: status || "Sent",
          timestamp: timestamp || "",
        },
      });

      saved.push(record.id);
    }

    return NextResponse.json({ ok: true, saved });
  } catch (err) {
    console.error("Message history error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0"));

    const where = phone ? { phoneNumber: phone } : {};

    const [data, total] = await Promise.all([
      prisma.messageHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.messageHistory.count({ where }),
    ]);

    return NextResponse.json({
      data,
      pagination: { limit, offset, total },
    });
  } catch (err) {
    console.error("Message history GET error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
