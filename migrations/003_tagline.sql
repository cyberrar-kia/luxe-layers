-- The hero subheading on the storefront home page — admin-editable, see
-- store-settings.ts and the Store details card in dashboard Overview.
ALTER TABLE store_settings ADD COLUMN tagline TEXT NOT NULL DEFAULT 'Shop the latest, delivered fast.';
