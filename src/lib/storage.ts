// Product image uploads — Supabase Storage, same project as the DB but its
// own public bucket (luxe-layers-products) with a scoped RLS policy (public
// read, insert-only, no delete/update) so the anon key used here can never
// do more than drop a new file in. No service-role key needed or used.
import { randomUUID } from "node:crypto";
import { env } from "./env";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const BUCKET = "luxe-layers-products";

export class UploadError extends Error {}

export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) throw new UploadError(`${file.name}: only JPEG, PNG, WEBP or GIF images are allowed`);
  if (file.size > MAX_BYTES) throw new UploadError(`${file.name}: image is too large (max 8MB)`);

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${randomUUID()}.${ext}`;
  const e = env();

  const res = await fetch(`${e.SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: e.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${e.SUPABASE_ANON_KEY}`,
      "Content-Type": file.type,
    },
    body: await file.arrayBuffer(),
  });
  if (!res.ok) throw new UploadError(`Upload failed for ${file.name} (${res.status})`);

  return `${e.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}
