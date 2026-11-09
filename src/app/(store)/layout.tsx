import Link from "next/link";
import { CartProvider } from "@/components/CartProvider";
import { CartIconLink } from "@/components/CartIconLink";
import { MarqueeBar } from "@/components/MarqueeBar";
import { getStoreSettings } from "@/lib/store-settings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
  return (
    <CartProvider>
      <MarqueeBar />
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-midnight">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-midnight text-sm font-extrabold text-lime">
              {settings.business_name.charAt(0).toUpperCase()}
            </span>
            {settings.business_name}
          </Link>
          <CartIconLink />
        </div>
      </header>
      <main>{children}</main>
      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-stone-400">
        {settings.business_name} · Powered by Selmo
      </footer>
    </CartProvider>
  );
}
