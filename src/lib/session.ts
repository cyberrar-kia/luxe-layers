// Single-admin auth — no users table needed, just a password hash in env
// (ADMIN_PASSWORD_HASH) and a signed, httpOnly cookie proving a successful
// login. The cookie value is "<expiresAt>.<hmac>" — a plain timestamp
// signed with SESSION_SECRET, so it can't be forged or extended without
// the secret, and a copied cookie stops working once it expires.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "./env";

const COOKIE_NAME = "luxe_admin_session";
const SESSION_DAYS = 30;

function sign(payload: string): string {
  return createHmac("sha256", env().SESSION_SECRET).update(payload).digest("hex");
}

function makeToken(): string {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): boolean {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (expected.length !== sig.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  return Number(payload) > Date.now();
}

export async function createAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return !!token && verifyToken(token);
}
