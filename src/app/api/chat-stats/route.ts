import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    const stats = await prisma.messageStats.findFirst({ where: { id: 1 } });
    return NextResponse.json(
      stats ?? { inbound: 0, outbound: 0, sent: 0, delivered: 0, read: 0 },
    );
  } catch (err) {
    console.error("Chat stats error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
