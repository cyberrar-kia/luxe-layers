"use server";

import { revalidatePath } from "next/cache";
import { setDeliveryFees, setPixelIds, type DeliveryFee } from "@/lib/store-settings";
import { createProduct } from "@/lib/products";
import { uploadProductImage, UploadError } from "@/lib/storage";

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
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name) return "Give the product a name";
  if (!Number.isFinite(priceNaira) || priceNaira <= 0) return "Enter a valid price";
  if (files.length === 0) return "Add at least one image";

  let images: string[];
  try {
    images = await Promise.all(files.map(uploadProductImage));
  } catch (err) {
    return err instanceof UploadError ? err.message : "Image upload failed — please try again";
  }

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

export async function savePixelIdsAction(formData: FormData): Promise<void> {
  const metaPixelId = String(formData.get("metaPixelId") || "").trim();
  const snapPixelId = String(formData.get("snapPixelId") || "").trim();
  await setPixelIds({ metaPixelId: metaPixelId || null, snapPixelId: snapPixelId || null });
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
}
