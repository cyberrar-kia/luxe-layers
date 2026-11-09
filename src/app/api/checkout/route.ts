import { NextResponse } from "next/server";
import { createOrder, OrderError } from "@/lib/orders";
import { initMonnifyTransaction } from "@/lib/monnify";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const order = await createOrder({
      customerName: String(body.customerName || ""),
      customerPhone: String(body.customerPhone || ""),
      customerEmail: body.customerEmail ? String(body.customerEmail) : null,
      deliveryLocation: String(body.deliveryLocation || ""),
      deliveryAddress: String(body.deliveryAddress || ""),
      lines: Array.isArray(body.lines) ? body.lines : [],
    });
    const { checkoutUrl } = await initMonnifyTransaction({
      reference: order.reference,
      amountKobo: order.total_kobo,
      customerName: order.customer_name,
      customerEmail: order.customer_email || "customer@luxelayers.ng",
    });
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    if (err instanceof OrderError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("checkout failed:", err);
    return NextResponse.json({ error: "Something went wrong — please try again" }, { status: 500 });
  }
}
