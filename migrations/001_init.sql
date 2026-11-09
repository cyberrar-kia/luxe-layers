-- Luxe Layers: single-merchant store. Everything here lives in the
-- "luxe_layers" schema (search_path set in db.ts/migrate.ts) so it stays
-- fully isolated from Selmo's own "selmo" schema in the same project.

-- One row, holds the store's own settings: delivery fees per location and
-- (once she's onboarded) her Monnify credentials. A single-merchant app
-- doesn't need a merchants table — just one settings row.
CREATE TABLE store_settings (
  id                 BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  business_name      TEXT NOT NULL DEFAULT 'Luxe Layers',
  -- [{ "location": "Lagos", "feeKobo": 150000 }, ...] — admin-editable list,
  -- matched against the location the customer picks at checkout.
  delivery_fees      JSONB NOT NULL DEFAULT '[]'::jsonb,
  monnify_api_key        TEXT,
  monnify_secret_key     TEXT,
  monnify_contract_code  TEXT,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO store_settings (id) VALUES (true);

CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_kobo  BIGINT NOT NULL CHECK (price_kobo > 0),
  -- Image URLs only — no video, to keep the storefront light.
  images      TEXT[] NOT NULL DEFAULT '{}',
  stock       INTEGER CHECK (stock IS NULL OR stock >= 0), -- NULL = unlimited
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_active_idx ON products(is_active, created_at DESC);

CREATE TABLE orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference          TEXT UNIQUE NOT NULL,
  customer_name      TEXT NOT NULL,
  customer_phone     TEXT NOT NULL,
  customer_email     TEXT,
  delivery_location  TEXT NOT NULL,
  delivery_address   TEXT NOT NULL,
  delivery_fee_kobo  BIGINT NOT NULL DEFAULT 0,
  -- [{ "productId", "name", "unitPriceKobo", "quantity" }, ...] — snapshotted
  -- at order time so a later price/name edit never rewrites history.
  items              JSONB NOT NULL,
  subtotal_kobo      BIGINT NOT NULL,
  total_kobo         BIGINT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  paid_at            TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_created_idx ON orders(created_at DESC);
