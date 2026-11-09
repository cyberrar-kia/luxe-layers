"use client";

import { useActionState } from "react";
import { addProductAction } from "../actions";

export function AddProductForm() {
  const [error, formAction, pending] = useActionState(addProductAction, null);

  return (
    <form action={formAction} className="space-y-3">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <div>
        <label className="label" htmlFor="name">
          Product name
        </label>
        <input id="name" name="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea id="description" name="description" rows={2} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="priceNaira">
            Price (₦)
          </label>
          <input id="priceNaira" name="priceNaira" type="number" min={0} step="0.01" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="stock">
            Stock (optional)
          </label>
          <input id="stock" name="stock" type="number" min={0} className="input" placeholder="Leave blank for unlimited" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="images">
          Photos
        </label>
        <input id="images" name="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple required className="input" />
        <p className="mt-1 text-xs text-stone-500">Images only (JPEG, PNG, WEBP or GIF, up to 8MB each) — no video, to keep the store fast to load.</p>
      </div>
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Adding…" : "Add product"}
      </button>
    </form>
  );
}
