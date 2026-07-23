import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function PATCH(
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

    const body = await req.json();
    const notAvailableDate = body.notAvailableDate
      ? new Date(body.notAvailableDate)
      : null;

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { notAvailableDate },
    });

    return NextResponse.json({
      data: { ...doctor, notAvailableDate: doctor.notAvailableDate?.toISOString() ?? null },
    });
  } catch (err) {
    console.error("Doctor update error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
