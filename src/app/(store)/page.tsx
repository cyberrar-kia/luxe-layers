import Link from "next/link";
import Image from "next/image";
import { listActiveProducts } from "@/lib/products";
import { getStoreSettings } from "@/lib/store-settings";
import { formatNaira } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Hero } from "@/components/Hero";

// Product list changes whenever she adds/hides something — never prerender
// a stale snapshot at build time.
export const dynamic = "force-dynamic";

export default async function StoreHomePage() {
  const [products, settings] = await Promise.all([listActiveProducts(), getStoreSettings()]);

  return (
    <>
      <Hero businessName={settings.business_name} tagline={settings.tagline} />

      <div id="products" className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-xl font-extrabold tracking-tight text-stone-900">Trending now</h2>

        {products.length === 0 ? (
          <div className="card text-center text-stone-600">
            <p className="font-semibold text-stone-800">No products yet.</p>
            <p className="mt-1 text-sm">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((p) => {
              const image = p.images[0] ?? null;
              const soldOut = p.stock !== null && p.stock <= 0;
              return (
                <div key={p.id} className="card group flex flex-col gap-2 p-3 transition hover:-translate-y-1 hover:shadow-pop">
                  <Link href={`/p/${p.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
                      {image ? (
                        <Image
                          src={image}
                          alt={p.name}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-stone-400">No image</div>
                      )}
                      {soldOut && (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-900/50 text-sm font-bold text-white">
                          Sold out
                        </div>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-stone-900">{p.name}</p>
                    <p className="text-sm font-bold text-midnight">{formatNaira(p.price_kobo)}</p>
                  </Link>
                  {!soldOut && <AddToCartButton productId={p.id} name={p.name} unitPriceKobo={p.price_kobo} image={image} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
