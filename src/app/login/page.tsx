"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-4 text-center text-lg font-extrabold text-stone-900">Luxe Layers — Admin</h1>
      <form action={formAction} className="card space-y-4">
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" required autoFocus className="input" />
        </div>
        <button type="submit" disabled={pending} className="btn w-full">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
