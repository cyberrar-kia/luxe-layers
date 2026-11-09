"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createAdminSession } from "@/lib/session";

export async function loginAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const password = String(formData.get("password") || "");
  const ok = await compare(password, env().ADMIN_PASSWORD_HASH);
  if (!ok) return "Wrong password";
  await createAdminSession();
  redirect("/dashboard");
}
