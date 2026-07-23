import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const doctors = await prisma.doctor.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { appointments: true } },
      },
    });

    const todayCounts = await prisma.appointment.groupBy({
      by: ["doctorId"],
      where: { timestamp: { gte: todayStart, lt: tomorrowStart } },
      _count: { id: true },
    });

    const data = doctors.map((d) => ({
      ...d,
      notAvailableDate: d.notAvailableDate?.toISOString() ?? null,
      todayAppointments: todayCounts.find((t) => t.doctorId === d.id)?._count.id ?? 0,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Doctors error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
