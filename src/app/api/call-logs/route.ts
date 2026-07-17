import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
    const skip = (page - 1) * limit;

    const [calls, total, directionCounts, statusCounts] = await Promise.all([
      prisma.callLog.findMany({
        skip,
        take: limit,
        orderBy: { startTime: "desc" },
      }),
      prisma.callLog.count(),
      prisma.callLog.groupBy({
        by: ["direction"],
        _count: { direction: true },
      }),
      prisma.callLog.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const inbound = directionCounts.find((d) => d.direction?.toLowerCase() === "inbound")?._count.direction ?? 0;
    const outbound = directionCounts.find((d) => d.direction?.toLowerCase() === "outbound")?._count.direction ?? 0;

    const answeredStatuses = ["answered", "completed", "connected"];
    const answered = statusCounts
      .filter((s) => answeredStatuses.includes(s.status?.toLowerCase() ?? ""))
      .reduce((sum, s) => sum + s._count.status, 0);

    const missedStatuses = ["missed", "no answer", "noanswer", "failed", "busy"];
    const missed = statusCounts
      .filter((s) => missedStatuses.includes(s.status?.toLowerCase() ?? ""))
      .reduce((sum, s) => sum + s._count.status, 0);

    return NextResponse.json({
      data: calls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: { inbound, outbound, answered, missed, total },
    });
  } catch (err) {
    console.error("Call logs error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
