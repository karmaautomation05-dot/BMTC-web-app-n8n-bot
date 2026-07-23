import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const doctorId = parseInt(id);
    if (isNaN(doctorId)) {
      return NextResponse.json({ error: "Invalid doctor ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: { doctorId },
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: { patient: true },
      }),
      prisma.appointment.count({ where: { doctorId } }),
    ]);

    return NextResponse.json({
      data: appointments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Doctor appointments error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
