import { queryOne, query } from "./db";

export interface DeliveryFee {
  location: string;
  feeKobo: number;
}

export interface StoreSettings {
  business_name: string;
  delivery_fees: DeliveryFee[];
  meta_pixel_id: string | null;
  snap_pixel_id: string | null;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const row = await queryOne<StoreSettings>(
    "SELECT business_name, delivery_fees, meta_pixel_id, snap_pixel_id FROM store_settings",
  );
  return row ?? { business_name: "Luxe Layers", delivery_fees: [], meta_pixel_id: null, snap_pixel_id: null };
}

export async function setDeliveryFees(fees: DeliveryFee[]): Promise<void> {
  await query("UPDATE store_settings SET delivery_fees = $1, updated_at = now()", [JSON.stringify(fees)]);
}

export async function setPixelIds(ids: { metaPixelId: string | null; snapPixelId: string | null }): Promise<void> {
  await query("UPDATE store_settings SET meta_pixel_id = $1, snap_pixel_id = $2, updated_at = now()", [
    ids.metaPixelId,
    ids.snapPixelId,
  ]);
}
