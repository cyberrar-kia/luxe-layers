import { randomUUID } from "node:crypto";
import { query, queryOne, tx } from "./db";
import { getStoreSettings } from "./store-settings";

export interface OrderItem {
  productId: string;
  name: string;
  unitPriceKobo: number;
  quantity: number;
}

export interface Order {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_location: string;
  delivery_address: string;
  delivery_fee_kobo: number;
  items: OrderItem[];
  subtotal_kobo: number;
  total_kobo: number;
  status: "pending" | "paid" | "failed";
  paid_at: string | null;
  created_at: string;
}

export class OrderError extends Error {}

function newReference(): string {
  return `LL-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

/** Creates a pending order, re-pricing every line against the live product
 * rows (never trusting a price the client sent) and re-checking stock. */
export async function createOrder(input: {
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deliveryLocation: string;
  deliveryAddress: string;
  lines: { productId: string; quantity: number }[];
}): Promise<Order> {
  if (input.lines.length === 0) throw new OrderError("Your cart is empty");

  return tx(async (client) => {
    const items: OrderItem[] = [];
    let subtotalKobo = 0;
    for (const line of input.lines) {
      const product = await queryOne<{ id: string; name: string; price_kobo: number; stock: number | null; is_active: boolean }>(
        "SELECT id, name, price_kobo, stock, is_active FROM products WHERE id = $1 FOR UPDATE",
        [line.productId],
        client,
      );
      if (!product || !product.is_active) throw new OrderError(`${product?.name ?? "An item"} is no longer available`);
      if (!Number.isInteger(line.quantity) || line.quantity < 1) throw new OrderError("Invalid quantity");
      if (product.stock !== null && product.stock < line.quantity) {
        throw new OrderError(`Only ${Math.max(product.stock, 0)} of ${product.name} left`);
      }
      items.push({ productId: product.id, name: product.name, unitPriceKobo: product.price_kobo, quantity: line.quantity });
      subtotalKobo += product.price_kobo * line.quantity;
      if (product.stock !== null) {
        await query("UPDATE products SET stock = stock - $2 WHERE id = $1", [product.id, line.quantity], client);
      }
    }

    const settings = await getStoreSettings();
    const match = settings.delivery_fees.find((f) => f.location === input.deliveryLocation);
    if (!match) throw new OrderError("Pick a valid delivery location");
    const deliveryFeeKobo = match.feeKobo;
    const totalKobo = subtotalKobo + deliveryFeeKobo;

    const row = await queryOne<Order>(
      `INSERT INTO orders (reference, customer_name, customer_phone, customer_email, delivery_location,
                            delivery_address, delivery_fee_kobo, items, subtotal_kobo, total_kobo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        newReference(),
        input.customerName.trim(),
        input.customerPhone.trim(),
        input.customerEmail?.trim() || null,
        input.deliveryLocation,
        input.deliveryAddress.trim(),
        deliveryFeeKobo,
        JSON.stringify(items),
        subtotalKobo,
        totalKobo,
      ],
      client,
    );
    return row!;
  });
}

export async function getOrderByReference(reference: string): Promise<Order | undefined> {
  return queryOne<Order>("SELECT * FROM orders WHERE reference = $1", [reference]);
}

export async function markOrderPaid(reference: string): Promise<void> {
  await query("UPDATE orders SET status = 'paid', paid_at = now() WHERE reference = $1 AND status = 'pending'", [reference]);
}

export async function listOrders(): Promise<Order[]> {
  return query<Order>("SELECT * FROM orders ORDER BY created_at DESC LIMIT 200");
}
