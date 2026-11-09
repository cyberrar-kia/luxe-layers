"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartIconLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="btn-secondary relative">
      Cart
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-midnight px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
