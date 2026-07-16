import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [todayAppointments, totals] = await Promise.all([
      prisma.appointment.count({
        where: { timestamp: { gte: startOfDay, lt: endOfDay } },
      }),
      prisma.totals.findFirst(),
    ]);

    return NextResponse.json({
      todayAppointments,
      totalAppointments: totals?.totalAppointments ?? 0,
      totalPatient: totals?.totalPatient ?? 0,
      totalRevenue: totals?.totalRevenue ?? 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
