import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";
import { verifyMonnifyWebhookSignature } from "@/lib/monnify";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("monnify-signature");
  if (!verifyMonnifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as { eventData?: { paymentReference?: string; paymentStatus?: string } };
  const reference = payload.eventData?.paymentReference;
  if (reference && payload.eventData?.paymentStatus === "PAID") {
    await markOrderPaid(reference);
  }
  return NextResponse.json({ ok: true });
}
