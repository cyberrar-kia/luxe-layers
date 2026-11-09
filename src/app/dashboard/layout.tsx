import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/session";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminLoggedIn())) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <h1 className="text-lg font-extrabold text-stone-900">Luxe Layers — Admin</h1>
          <form action="/logout" method="post">
            <button type="submit" className="btn-secondary text-xs">
              Log out
            </button>
          </form>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
