import { getStoreSettings } from "@/lib/store-settings";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-4 text-lg font-extrabold text-stone-900">Checkout</h1>
      <CheckoutForm deliveryFees={settings.delivery_fees} />
    </div>
  );
}
