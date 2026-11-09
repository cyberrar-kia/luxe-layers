"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatNaira } from "@/lib/money";
import type { DeliveryFee } from "@/lib/store-settings";

export function CheckoutForm({ deliveryFees }: { deliveryFees: DeliveryFee[] }) {
  const { lines, totalKobo, clear } = useCart();
  const router = useRouter();
  const [location, setLocation] = useState(deliveryFees[0]?.location ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFeeKobo = deliveryFees.find((f) => f.location === location)?.feeKobo ?? 0;
  const grandTotalKobo = totalKobo + deliveryFeeKobo;

  if (lines.length === 0) {
    return <p className="text-sm text-stone-500">Your cart is empty.</p>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          customerPhone: form.get("customerPhone"),
          customerEmail: form.get("customerEmail"),
          deliveryLocation: location,
          deliveryAddress: form.get("deliveryAddress"),
          lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong");
      clear();
      router.push(body.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <div>
        <label className="label" htmlFor="customerName">
          Full name
        </label>
        <input id="customerName" name="customerName" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="customerPhone">
          Phone number
        </label>
        <input id="customerPhone" name="customerPhone" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="customerEmail">
          Email (optional)
        </label>
        <input id="customerEmail" name="customerEmail" type="email" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="deliveryLocation">
          Delivery location
        </label>
        <select id="deliveryLocation" className="input" value={location} onChange={(e) => setLocation(e.target.value)} required>
          {deliveryFees.length === 0 && <option value="">No delivery locations set up yet</option>}
          {deliveryFees.map((f) => (
            <option key={f.location} value={f.location}>
              {f.location} — {formatNaira(f.feeKobo)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="deliveryAddress">
          Delivery address
        </label>
        <textarea id="deliveryAddress" name="deliveryAddress" required rows={2} className="input" />
      </div>
      <div className="space-y-1 border-t border-stone-100 pt-3 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span>{formatNaira(totalKobo)}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Delivery</span>
          <span>{formatNaira(deliveryFeeKobo)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-midnight">
          <span>Total</span>
          <span>{formatNaira(grandTotalKobo)}</span>
        </div>
      </div>
      <button type="submit" disabled={submitting || deliveryFees.length === 0} className="btn w-full">
        {submitting ? "Starting payment…" : "Pay now"}
      </button>
    </form>
  );
}
