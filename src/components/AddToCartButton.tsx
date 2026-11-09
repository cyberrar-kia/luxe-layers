"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";

export function AddToCartButton({
  productId,
  name,
  unitPriceKobo,
  image,
}: {
  productId: string;
  name: string;
  unitPriceKobo: number;
  image: string | null;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className="btn w-full"
      onClick={() => {
        add({ productId, name, unitPriceKobo, image }, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
