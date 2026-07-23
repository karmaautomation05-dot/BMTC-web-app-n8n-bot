import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { lastVisit: "desc" },
        include: { _count: { select: { appointments: true } } },
      }),
      prisma.patient.count({ where: where as any }),
    ]);

    return NextResponse.json({
      data: patients,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Patients error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
