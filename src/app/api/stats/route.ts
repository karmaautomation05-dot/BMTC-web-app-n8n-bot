import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [todayAppointments, totals] = await Promise.all([
    prisma.appointment.count({
      where: {
        timestamp: { gte: startOfDay, lt: endOfDay },
      },
    }),
    prisma.totals.findFirst(),
  ]);

  return NextResponse.json({
    todayAppointments,
    totalAppointments: totals?.totalAppointments ?? 0,
    totalPatient: totals?.totalPatient ?? 0,
    totalRevenue: totals?.totalRevenue ?? 0,
  });
}
