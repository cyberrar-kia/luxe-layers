"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/lib/money";

export default function CartPage() {
  const { lines, setQuantity, remove, totalKobo } = useCart();

  if (lines.length === 0) {
    return (
      <div className="card mt-10 text-center">
        <p className="font-semibold text-stone-800">Your cart is empty.</p>
        <Link href="/" className="btn mt-4 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-lg font-extrabold text-stone-900">Your cart</h1>
      <div className="card divide-y divide-stone-100 p-0">
        {lines.map((l) => (
          <div key={l.productId} className="flex items-center gap-3 p-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900">{l.name}</p>
              <p className="text-sm text-stone-500">{formatNaira(l.unitPriceKobo)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={l.quantity}
              onChange={(e) => setQuantity(l.productId, Math.max(1, Number(e.target.value) || 1))}
              className="input w-16 text-center"
            />
            <button type="button" onClick={() => remove(l.productId)} className="text-xs font-semibold text-stone-400 hover:text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="card flex items-center justify-between">
        <span className="font-semibold text-stone-700">Subtotal</span>
        <span className="text-lg font-bold text-midnight">{formatNaira(totalKobo)}</span>
      </div>
      <Link href="/checkout" className="btn w-full">
        Checkout
      </Link>
    </div>
  );
}
