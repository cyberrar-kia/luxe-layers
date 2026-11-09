import { listOrders } from "@/lib/orders";
import { getStoreSettings } from "@/lib/store-settings";
import { formatNaira } from "@/lib/money";
import { saveDeliveryFeesAction, savePixelIdsAction } from "./actions";

export default async function DashboardOverviewPage() {
  const [orders, settings] = await Promise.all([listOrders(), getStoreSettings()]);
  const paidOrders = orders.filter((o) => o.status === "paid");
  const revenueKobo = paidOrders.reduce((sum, o) => sum + o.total_kobo, 0);
  const fees = settings.delivery_fees.length > 0 ? settings.delivery_fees : [{ location: "", feeKobo: 0 }];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs font-semibold uppercase text-stone-500">Orders</p>
          <p className="mt-1 text-2xl font-extrabold text-stone-900">{orders.length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase text-stone-500">Paid orders</p>
          <p className="mt-1 text-2xl font-extrabold text-stone-900">{paidOrders.length}</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase text-stone-500">Revenue</p>
          <p className="mt-1 text-2xl font-extrabold text-midnight">{formatNaira(revenueKobo)}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-1 text-sm font-extrabold text-stone-900">Delivery fees by location</h2>
        <p className="mb-4 text-xs text-stone-500">Shown to customers at checkout. Leave a row blank to remove it.</p>
        <form action={saveDeliveryFeesAction} className="space-y-3">
          <div id="fee-rows" className="space-y-2">
            {fees.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input name="location" defaultValue={f.location} placeholder="Location (e.g. Lagos)" className="input" />
                <input
                  name="feeNaira"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={f.feeKobo ? f.feeKobo / 100 : ""}
                  placeholder="Fee (₦)"
                  className="input w-32"
                />
              </div>
            ))}
          </div>
          <AddRowScript />
          <div className="flex gap-2">
            <button type="button" id="add-fee-row" className="btn-secondary text-sm">
              + Add location
            </button>
            <button type="submit" className="btn text-sm">
              Save
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="mb-1 text-sm font-extrabold text-stone-900">Ad pixels</h2>
        <p className="mb-4 text-xs text-stone-500">
          Tracks page views site-wide and a Purchase event when an order is confirmed paid. Leave blank to turn one off.
        </p>
        <form action={savePixelIdsAction} className="space-y-3">
          <div>
            <label className="label" htmlFor="metaPixelId">
              Meta Pixel ID
            </label>
            <input id="metaPixelId" name="metaPixelId" defaultValue={settings.meta_pixel_id ?? ""} placeholder="e.g. 1234567890123456" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="snapPixelId">
              Snapchat Pixel ID
            </label>
            <input id="snapPixelId" name="snapPixelId" defaultValue={settings.snap_pixel_id ?? ""} placeholder="e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890" className="input" />
          </div>
          <button type="submit" className="btn text-sm">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

// Tiny bit of vanilla JS to add a blank row client-side — not worth a
// separate client component for one button.
function AddRowScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('add-fee-row')?.addEventListener('click', () => {
            const rows = document.getElementById('fee-rows');
            const row = document.createElement('div');
            row.className = 'flex gap-2';
            row.innerHTML = '<input name="location" placeholder="Location (e.g. Lagos)" class="input" />' +
              '<input name="feeNaira" type="number" min="0" step="0.01" placeholder="Fee (₦)" class="input w-32" />';
            rows?.appendChild(row);
          });
        `,
      }}
    />
  );
}
