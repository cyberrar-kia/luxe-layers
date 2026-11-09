import { query, queryOne } from "./db";

export interface Product {
  id: string;
  name: string;
  description: string;
  price_kobo: number;
  images: string[];
  stock: number | null;
  is_active: boolean;
  created_at: string;
}

export async function listActiveProducts(): Promise<Product[]> {
  return query<Product>("SELECT * FROM products WHERE is_active ORDER BY created_at DESC");
}

export async function listAllProducts(): Promise<Product[]> {
  return query<Product>("SELECT * FROM products ORDER BY created_at DESC");
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return queryOne<Product>("SELECT * FROM products WHERE id = $1", [id]);
}

export async function createProduct(input: {
  name: string;
  description: string;
  priceKobo: number;
  images: string[];
  stock: number | null;
}): Promise<Product> {
  const row = await queryOne<Product>(
    `INSERT INTO products (name, description, price_kobo, images, stock)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [input.name.trim(), input.description.trim(), input.priceKobo, input.images, input.stock],
  );
  return row!;
}

export async function setProductActive(id: string, isActive: boolean): Promise<void> {
  await query("UPDATE products SET is_active = $2 WHERE id = $1", [id, isActive]);
}
