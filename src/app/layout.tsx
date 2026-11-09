import type { Metadata } from "next";
import "./globals.css";
import { Pixels } from "@/components/Pixels";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Luxe Layers",
  description: "Shop the latest from Luxe Layers.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
  return (
    <html lang="en">
      <body>
        {children}
        <Pixels metaPixelId={settings.meta_pixel_id} snapPixelId={settings.snap_pixel_id} />
      </body>
    </html>
  );
}
