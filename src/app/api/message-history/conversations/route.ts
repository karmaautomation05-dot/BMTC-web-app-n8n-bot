import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.messageHistory.groupBy({
      by: ["phoneNumber"],
      _max: { timestamp: true },
    });

    const latest = await Promise.all(
      groups.map((g) =>
        prisma.messageHistory.findFirst({
          where: { phoneNumber: g.phoneNumber },
          orderBy: { timestamp: "desc" },
          take: 1,
        })
      )
    );

    const data = latest
      .filter((m): m is NonNullable<typeof m> => m != null)
      .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Conversations GET error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
