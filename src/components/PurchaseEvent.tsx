"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    snaptr?: (...args: unknown[]) => void;
  }
}

/** Fires the one conversion event this app tracks — a confirmed order,
 * from /pay/callback. No-ops quietly if a pixel isn't configured (its base
 * script in Pixels.tsx never loaded, so window.fbq/snaptr are undefined). */
export function PurchaseEvent({ valueNaira, orderReference }: { valueNaira: number; orderReference: string }) {
  useEffect(() => {
    window.fbq?.("track", "Purchase", { value: valueNaira, currency: "NGN", content_ids: [orderReference] });
    window.snaptr?.("track", "PURCHASE", { price: valueNaira, currency: "NGN", transaction_id: orderReference });
  }, [valueNaira, orderReference]);

  return null;
}
