import type { Metadata } from "next";
import {
  getDashboardStats,
  getMenuItems,
  getSiteSettings,
  listOrders,
} from "../actions";
import { requireAdminPage } from "@/lib/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kitchen Console — Daphny Dodo Cuisine",
  description:
    "Manage the menu board, review the WhatsApp order log and edit every string on the storefront.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await requireAdminPage();
  const [settings, items, orders, stats] = await Promise.all([
    getSiteSettings(),
    getMenuItems(),
    listOrders(),
    getDashboardStats(),
  ]);

  return (
    <AdminDashboard settings={settings} items={items} orders={orders} stats={stats} />
  );
}
