// Stands in for Monnify's hosted checkout while she's still creating her
// Monnify account (see monnifyMockMode in env.ts) — lets the whole order
// flow be built and tested end-to-end before real payment keys exist.
// Swapped out automatically the moment MONNIFY_* env vars are set; nothing
// links to this page once mock mode is off.
import { getOrderByReference, markOrderPaid } from "@/lib/orders";
import { formatNaira } from "@/lib/money";
import { redirect } from "next/navigation";

export default async function MockPayPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference } = await searchParams;
  const order = reference ? await getOrderByReference(reference) : undefined;
  if (!order) {
    return <p className="mx-auto mt-10 max-w-sm text-center text-stone-600">Order not found.</p>;
  }

  async function pay() {
    "use server";
    await markOrderPaid(order!.reference);
    redirect(`/pay/callback?reference=${order!.reference}`);
  }

  return (
    <div className="mx-auto mt-10 max-w-sm space-y-4 text-center">
      <p className="pill bg-amber-100 text-amber-800">Test mode — Monnify not connected yet</p>
      <h1 className="text-lg font-extrabold text-stone-900">Pay {formatNaira(order.total_kobo)}</h1>
      <p className="text-sm text-stone-500">This stands in for the real Monnify checkout until her account is ready.</p>
      <form action={pay}>
        <button type="submit" className="btn w-full">
          Simulate successful payment
        </button>
      </form>
    </div>
  );
}
