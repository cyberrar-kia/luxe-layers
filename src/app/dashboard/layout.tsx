import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/session";

const TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Add product" },
  { href: "/dashboard/orders", label: "Orders" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminLoggedIn())) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-stone-900">Luxe Layers — Admin</h1>
        <form action="/logout" method="post">
          <button type="submit" className="btn-secondary text-xs">
            Log out
          </button>
        </form>
      </div>
      <nav className="mb-6 flex gap-2 border-b border-stone-200">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="px-3 py-2 text-sm font-semibold text-stone-600 hover:text-midnight">
            {t.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
