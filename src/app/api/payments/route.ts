import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

const RZP_API = "https://api.razorpay.com/v1/payments";

async function rzpFetch(params: Record<string, string>) {
  const key = process.env.RAZORPAY_KEY_ID!;
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const auth = btoa(`${key}:${secret}`);

  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${RZP_API}?${qs}`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay ${res.status}: ${err}`);
  }

  return res.json();
}

export async function GET(req: NextRequest) {
  const authError = verifyAuth(req);
  if (authError) return authError;

  try {
    let allPayments: any[] = [];
    let skip = 0;

    while (true) {
      const batch = await rzpFetch({ count: "100", skip: String(skip) });
      const items: any[] = batch.items ?? [];
      allPayments.push(...items);
      if (items.length < 100) break;
      skip += 100;
    }

    let totalAmount = 0;
    for (const p of allPayments) {
      if (p.status === "captured") totalAmount += p.amount;
    }

    return NextResponse.json({
      items: allPayments,
      count: allPayments.length,
      totalAmount,
    });
  } catch (err) {
    console.error("Payments error:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
