import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = req.headers.get("x-webhook-secret");

    if (
      !webhookSecret ||
      webhookSecret !== process.env.BONVOICE_WEBHOOK_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    // callID is mandatory
    if (!body.callID) {
      return NextResponse.json(
        {
          success: false,
          message: "callID is required",
        },
        {
          status: 400,
        }
      );
    }

    const startTime = body.StartTime
      ? new Date(body.StartTime)
      : null;

    const endTime = body.EndTime
      ? new Date(body.EndTime)
      : null;

    let duration: number | null = null;

    if (startTime && endTime) {
      duration = Math.max(
        0,
        Math.floor(
          (endTime.getTime() - startTime.getTime()) / 1000
        )
      );
    }

    const call = await prisma.callLog.upsert({
      where: {
        callID: body.callID,
      },

      update: {
        sourceNumber: body.SourceNumber ?? null,
        destinationNumber: body.DestinationNumber ?? null,
        displayNumber: body.DisplayNumber ?? null,

        direction: body.Direction ?? null,
        callType: body.callType ?? null,
        leg: body.Leg ?? null,

        status: body.Status ?? null,
        agentStatus: body.AgentStatus ?? null,

        startTime,
        endTime,
        duration,

        accountID: body.AccountID ?? null,
        eventID: body.eventID ?? null,

        resourceURL: body.ResourceURL ?? null,
        dtmf: body.DTMF ?? null,

        callBackParentID:
          body.callBackParentID != null
            ? String(body.callBackParentID)
            : null,

        callBackParams: body.callBackParams ?? undefined,

        dataSource: body.DataSource ?? "Bonvoice",

        rawPayload: body,
      },

      create: {
        callID: body.callID,

        sourceNumber: body.SourceNumber ?? null,
        destinationNumber: body.DestinationNumber ?? null,
        displayNumber: body.DisplayNumber ?? null,

        direction: body.Direction ?? null,
        callType: body.callType ?? null,
        leg: body.Leg ?? null,

        status: body.Status ?? null,
        agentStatus: body.AgentStatus ?? null,

        startTime,
        endTime,
        duration,

        accountID: body.AccountID ?? null,
        eventID: body.eventID ?? null,

        resourceURL: body.ResourceURL ?? null,
        dtmf: body.DTMF ?? null,

        callBackParentID:
          body.callBackParentID != null
            ? String(body.callBackParentID)
            : null,

        callBackParams: body.callBackParams,

        dataSource: body.DataSource ?? "Bonvoice",

        rawPayload: body,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook received.",
      data: {
        id: call.id,
        callID: call.callID,
      },
    });
  } catch (error) {
    console.error("Bonvoice Webhook:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}





// x-webhook-secret: bv_live_2e4d7b8f4a5c91d2c8e4f7a91b63d4e6f1c2b8a9d7e5f3a6b4c9d8e1f2a3b4c5
// curl --location https://yourdomain.com/api/bonvoice/webhook \
// --header "Content-Type: application/json" \
// --header "x-webhook-secret: bv_live_2e4d7b8f4a5c91d2c8e4f7a91b63d4e6f1c2b8a9d7e5f3a6b4c9d8e1f2a3b4c5" \
// --data '{ ... }'