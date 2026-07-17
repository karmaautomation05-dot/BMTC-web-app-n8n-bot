import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { doctorName, timeSlot, location, patientName, fee, appointmentId, timestamp, phone, rzpTxnId } = body;

    if (!doctorName || !timeSlot || !location || !patientName || fee == null || !timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: doctorName, timeSlot, location, patientName, fee, timestamp" },
        { status: 400 },
      );
    }

    const doctor = await prisma.doctor.findFirst({
      where: { name: { contains: doctorName, mode: "insensitive" } },
    });

    if (!doctor) {
      return NextResponse.json({ error: `Doctor not found: ${doctorName}` }, { status: 404 });
    }

    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      return NextResponse.json({ error: `Invalid timestamp: ${timestamp}` }, { status: 400 });
    }

    const contact = phone || "-";

    const patient = await prisma.patient.upsert({
      where: { phone: contact },
      update: { name: patientName, lastVisit: ts },
      create: { name: patientName, phone: contact, firstVisit: ts, lastVisit: ts },
    });

    const data: Record<string, unknown> = {
      appointmentId: appointmentId || `MANUAL-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      doctorId: doctor.id,
      patientId: patient.id,
      patientName,
      location,
      timestamp: ts,
      timeSlot,
      phone: contact,
      fees: Number(fee),
    };

    if (rzpTxnId) data.rzpTxnId = rzpTxnId;

    const appointment = await prisma.appointment.create({ data: data as any });

    return NextResponse.json({ success: true, data: appointment });
  } catch (err) {
    console.error("Appointment create error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
