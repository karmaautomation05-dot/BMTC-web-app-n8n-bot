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
    const patientId = parseInt(id);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { timestamp: "desc" },
      include: { doctor: true },
    });

    return NextResponse.json({ data: appointments });
  } catch (err) {
    console.error("Patient appointments error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
