"use server";

import { timingSafeEqual } from "node:crypto";
import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createAdminSession } from "@/lib/session";

function sameUsername(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function loginAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const usernameOk = sameUsername(username, env().ADMIN_USERNAME);
  const passwordOk = await compare(password, env().ADMIN_PASSWORD_HASH);
  if (!usernameOk || !passwordOk) return "Wrong username or password";
  await createAdminSession();
  redirect("/dashboard");
}
