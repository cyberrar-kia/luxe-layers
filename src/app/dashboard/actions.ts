"use server";

import { revalidatePath } from "next/cache";
import { setDeliveryFees, type DeliveryFee } from "@/lib/store-settings";
import { createProduct } from "@/lib/products";

export async function saveDeliveryFeesAction(formData: FormData): Promise<void> {
  const locations = formData.getAll("location") as string[];
  const fees = formData.getAll("feeNaira") as string[];
  const parsed: DeliveryFee[] = [];
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i]?.trim();
    const feeNaira = Number(fees[i]);
    if (!location || !Number.isFinite(feeNaira) || feeNaira < 0) continue;
    parsed.push({ location, feeKobo: Math.round(feeNaira * 100) });
  }
  await setDeliveryFees(parsed);
  revalidatePath("/dashboard");
  revalidatePath("/checkout");
}

export async function addProductAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceNaira = Number(formData.get("priceNaira"));
  const stockRaw = String(formData.get("stock") || "").trim();
  const imagesRaw = String(formData.get("images") || "");
  const images = imagesRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!name) return "Give the product a name";
  if (!Number.isFinite(priceNaira) || priceNaira <= 0) return "Enter a valid price";
  if (images.length === 0) return "Add at least one image URL";

  await createProduct({
    name,
    description,
    priceKobo: Math.round(priceNaira * 100),
    images,
    stock: stockRaw ? Number(stockRaw) : null,
  });
  revalidatePath("/dashboard/products");
  revalidatePath("/");
  return null;
}
