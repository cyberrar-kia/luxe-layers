import Link from "next/link";
import { getOrderByReference } from "@/lib/orders";
import { formatNaira } from "@/lib/money";
import { PurchaseEvent } from "@/components/PurchaseEvent";

export default async function PayCallbackPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) {
  const { reference } = await searchParams;
  const order = reference ? await getOrderByReference(reference) : undefined;

  if (!order) {
    return <p className="mx-auto mt-10 max-w-sm text-center text-stone-600">Order not found.</p>;
  }

  return (
    <div className="mx-auto mt-10 max-w-sm space-y-3 text-center">
      {order.status === "paid" ? (
        <>
          <PurchaseEvent valueNaira={order.total_kobo / 100} orderReference={order.reference} />
          <p className="text-3xl">🎉</p>
          <h1 className="text-lg font-extrabold text-stone-900">Order confirmed</h1>
          <p className="text-sm text-stone-500">
            Ref {order.reference} · {formatNaira(order.total_kobo)}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-lg font-extrabold text-stone-900">Payment pending</h1>
          <p className="text-sm text-stone-500">
            We'll confirm your order (ref {order.reference}) as soon as the payment clears.
          </p>
        </>
      )}
      <Link href="/" className="btn mt-2 inline-flex">
        Continue shopping
      </Link>
    </div>
  );
}
