import { queryOne, query } from "./db";

export interface DeliveryFee {
  location: string;
  feeKobo: number;
}

export interface StoreSettings {
  business_name: string;
  delivery_fees: DeliveryFee[];
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const row = await queryOne<{ business_name: string; delivery_fees: DeliveryFee[] }>(
    "SELECT business_name, delivery_fees FROM store_settings",
  );
  return row ?? { business_name: "Luxe Layers", delivery_fees: [] };
}

export async function setDeliveryFees(fees: DeliveryFee[]): Promise<void> {
  await query("UPDATE store_settings SET delivery_fees = $1, updated_at = now()", [JSON.stringify(fees)]);
}
