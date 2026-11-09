import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { formatNaira } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product || !product.is_active) notFound();

  const soldOut = product.stock !== null && product.stock <= 0;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-2">
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">No image</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1).map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
                <Image src={src} alt={product.name} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-xl font-extrabold text-stone-900">{product.name}</h1>
        <p className="mt-1 text-lg font-bold text-midnight">{formatNaira(product.price_kobo)}</p>
        {product.description && <p className="mt-4 whitespace-pre-wrap text-sm text-stone-600">{product.description}</p>}
        <div className="mt-6">
          {soldOut ? (
            <p className="text-sm font-semibold text-stone-500">Sold out</p>
          ) : (
            <AddToCartButton productId={product.id} name={product.name} unitPriceKobo={product.price_kobo} image={product.images[0] ?? null} />
          )}
        </div>
      </div>
    </div>
  );
}
