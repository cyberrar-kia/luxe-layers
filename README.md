# Luxe Layers

Standalone single-merchant storefront — built as an interim store for Luxe
Layers while her Monnify account is still being set up, ahead of a full
migration onto Selmo once Selmo's own Paystack integration is approved for
her. Images only (no video), per-location delivery fees, admin
login/dashboard with Overview, Add product and Orders.

Deliberately kept separate from the Selmo codebase/infra, so none of this
Monnify-specific code ever touches Selmo's real payment path. It does share
one piece of infrastructure: its database lives in its own `luxe_layers`
schema inside Selmo's existing Supabase project, under its own dedicated,
narrowly-scoped Postgres role (`luxe_layers_app`) — not Selmo's own schema
or role.

## Payments

Monnify integration (`src/lib/monnify.ts`) runs in **mock mode** until the
three `MONNIFY_*` env vars below are set — checkout then redirects to a
`/pay/mock` page that simulates a successful payment, so the whole
storefront → checkout → order flow can be built and tested before she has
real Monnify credentials. Once she has them, just set the env vars — no
code change needed.

## Environment variables

Use Supabase's connection pooler (Supavisor), not the direct `db.<ref>.supabase.co`
host — the direct host only resolves to an IPv6 address, which Vercel's build/
runtime network can't reach (`ENETUNREACH`). The pooler username is
`<role>.<project-ref>`, not just the role name.


```
DATABASE_URL=postgresql://luxe_layers_app.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
SESSION_SECRET=<random>
ADMIN_PASSWORD_HASH=<bcrypt hash — see scripts/hash-password.ts>
APP_URL=https://<deployed-domain>
MONNIFY_API_KEY=
MONNIFY_SECRET_KEY=
MONNIFY_CONTRACT_CODE=
MONNIFY_BASE_URL=https://sandbox.monnify.com   # https://api.monnify.com once live
```

## Admin

Single admin account, no sign-up flow — the password is set once via
`ADMIN_PASSWORD_HASH`. Log in at `/login`, dashboard at `/dashboard`.
