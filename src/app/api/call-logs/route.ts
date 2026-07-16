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

    const [calls, total] = await Promise.all([
      prisma.callLog.findMany({
        skip,
        take: limit,
        orderBy: { startTime: "desc" },
      }),
      prisma.callLog.count(),
    ]);

    return NextResponse.json({
      data: calls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Call logs error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
