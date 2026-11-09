import Image from "next/image";
import { listAllProducts, setProductActive } from "@/lib/products";
import { formatNaira } from "@/lib/money";
import { AddProductForm } from "./AddProductForm";
import { revalidatePath } from "next/cache";

async function toggleActiveAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  await setProductActive(id, !isActive);
  revalidatePath("/dashboard/products");
  revalidatePath("/");
}

export default async function ProductsPage() {
  const products = await listAllProducts();

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-4 text-sm font-extrabold text-stone-900">Add a product</h2>
        <AddProductForm />
      </div>

      <div className="card p-0">
        <h2 className="border-b border-stone-100 p-4 text-sm font-extrabold text-stone-900">Your products ({products.length})</h2>
        <div className="divide-y divide-stone-100">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" unoptimized />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-stone-900">{p.name}</p>
                <p className="text-xs text-stone-500">
                  {formatNaira(p.price_kobo)} · {p.stock === null ? "Unlimited stock" : `${p.stock} in stock`}
                </p>
              </div>
              <form action={toggleActiveAction}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="isActive" value={String(p.is_active)} />
                <button type="submit" className="btn-secondary text-xs">
                  {p.is_active ? "Hide" : "Unhide"}
                </button>
              </form>
            </div>
          ))}
          {products.length === 0 && <p className="p-4 text-sm text-stone-500">No products yet.</p>}
        </div>
      </div>
    </div>
  );
}
