import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const webhook = await prisma.chatWebhook.create({
      data: {
        payload,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully.",
      id: webhook.id,
    });
  }  catch (error) {
  console.error(error);

  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === "development"
        ? (error instanceof Error ? error.stack : undefined)
        : undefined,
    },
    { status: 500 }
  );
}
}