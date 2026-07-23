import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

const WEBHOOK_URL = "https://n8n.srv1806268.hstgr.cloud/webhook/dac5d879-38b7-4f2f-8ed0-3254ceb1c5df";

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

    const webhookRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorName: doctor.name,
        notAvailableDate: body.notAvailableDate ?? null,
      }),
    });

    if (!webhookRes.ok) {
      await prisma.doctor.update({
        where: { id: doctorId },
        data: { notAvailableDate: null },
      });
      return NextResponse.json(
        { error: `Webhook failed with status ${webhookRes.status}: ${await webhookRes.text()}` },
        { status: 502 },
      );
    }

    return NextResponse.json({
      data: { ...doctor, notAvailableDate: doctor.notAvailableDate?.toISOString() ?? null },
    });
  } catch (err) {
    console.error("Doctor update error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
