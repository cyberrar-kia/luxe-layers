-- Meta Pixel and Snapchat Pixel IDs, admin-set in the dashboard — see
-- store-settings.ts and (store)/layout.tsx (base code + PageView) and
-- pay/callback/page.tsx (Purchase event on a confirmed order).
ALTER TABLE store_settings ADD COLUMN meta_pixel_id TEXT;
ALTER TABLE store_settings ADD COLUMN snap_pixel_id TEXT;
