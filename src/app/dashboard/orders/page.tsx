import { listOrders } from "@/lib/orders";
import { formatNaira } from "@/lib/money";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-lime-soft text-teal-900",
  failed: "bg-red-100 text-red-700",
};

export default async function OrdersPage() {
  const orders = await listOrders();

  if (orders.length === 0) {
    return <p className="card text-sm text-stone-500">No orders yet.</p>;
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 text-left text-xs uppercase text-stone-500">
            <th className="p-3">Ref</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Location</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="p-3 font-mono text-xs text-stone-500">{o.reference}</td>
              <td className="p-3">
                <p className="font-semibold text-stone-900">{o.customer_name}</p>
                <p className="text-xs text-stone-500">{o.customer_phone}</p>
              </td>
              <td className="p-3 text-stone-600">{o.delivery_location}</td>
              <td className="p-3 font-semibold text-stone-900">{formatNaira(o.total_kobo)}</td>
              <td className="p-3">
                <span className={`pill ${STATUS_STYLE[o.status]}`}>{o.status}</span>
              </td>
              <td className="p-3 text-xs text-stone-500">{new Date(o.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
