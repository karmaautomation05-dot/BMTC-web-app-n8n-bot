import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

function parseTimeSlotStart(slot: string): { hour: number; minute: number } | null {
  const m = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return { hour: h, minute: min };
}

const IST_MS = 5.5 * 60 * 60 * 1000;

function isUpcoming(timestamp: Date, timeSlot: string): boolean {
  const nowMs = Date.now();
  const istDate = new Date(nowMs + IST_MS);
  const y = istDate.getUTCFullYear();
  const m = istDate.getUTCMonth();
  const d = istDate.getUTCDate();
  const todayStartMs = Date.UTC(y, m, d) - IST_MS;
  const tomorrowStartMs = todayStartMs + 24 * 60 * 60 * 1000;

  const tsMs = timestamp.getTime();
  if (tsMs < todayStartMs || tsMs >= tomorrowStartMs) return false;

  const slot = parseTimeSlotStart(timeSlot);
  if (!slot) return false;

  const slotMs = todayStartMs + slot.hour * 3600000 + slot.minute * 60000;
  return slotMs > nowMs;
}

export async function GET(req: NextRequest) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));
    const skip = (page - 1) * limit;
    const filter = searchParams.get("filter") || "upcoming";
    const search = searchParams.get("search") || "";

    const istDate = new Date(Date.now() + IST_MS);
    const todayStart = new Date(Date.UTC(istDate.getUTCFullYear(), istDate.getUTCMonth(), istDate.getUTCDate()) - IST_MS);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const where: Record<string, unknown> = {};
    const and: Record<string, unknown>[] = [];

    if (filter === "today") {
      and.push({ timestamp: { gte: todayStart, lt: tomorrowStart } });
    } else if (filter === "upcoming") {
      and.push({ timestamp: { gte: todayStart, lt: tomorrowStart } });
    } else if (filter && /^\d{4}-\d{2}-\d{2}$/.test(filter)) {
      const dayStart = new Date(filter + "T00:00:00+05:30");
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      and.push({ timestamp: { gte: dayStart, lt: dayEnd } });
    }

    if (search) {
      and.push({
        OR: [
          { patientName: { contains: search, mode: "insensitive" } },
          { appointmentId: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (and.length) where.AND = and;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: { doctor: true, patient: true },
      }),
      prisma.appointment.count({ where: where as any }),
    ]);

    let data = appointments;
    if (filter === "upcoming") {
      data = appointments.filter((a) => isUpcoming(a.timestamp, a.timeSlot));
    }

    return NextResponse.json({
      data,
      pagination: { page, limit, total: filter === "upcoming" ? data.length : total, totalPages: filter === "upcoming" ? 1 : Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Appointments error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // const authError = verifyAuth(req);
  // if (authError) return authError;

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
