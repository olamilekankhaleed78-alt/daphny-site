"use client";

import React, { useCallback, useEffect, useState } from "react";
import { logout } from "@/app/admin/login/actions";
import { formatNairaPrice } from "@/lib/helpers";
import type { MenuItemData, OrderRecord, SiteSettings } from "@/lib/types";
import {
  IconArrowRight,
  IconBasket,
  IconGrid,
  IconLogoMark,
  IconReceipt,
  IconSliders,
} from "@/components/icons";
import MenuManager from "./MenuManager";
import OrdersManager from "./OrdersManager";
import SettingsManager from "./SettingsManager";
import { Toast } from "./ui";

type Tab = "menu" | "orders" | "settings";

export interface DashboardStats {
  menuCount: number;
  availableCount: number;
  orderCount: number;
  revenue: number;
  todayRevenue: number;
  todayCount: number;
  pendingCount: number;
  soldOut: { id: string; title: string }[];
}

interface AdminDashboardProps {
  settings: SiteSettings;
  items: MenuItemData[];
  orders: OrderRecord[];
  stats: DashboardStats;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "menu", label: "Menu board", icon: <IconGrid className="h-4 w-4" /> },
  { id: "orders", label: "Order log", icon: <IconReceipt className="h-4 w-4" /> },
  { id: "settings", label: "Storefront", icon: <IconSliders className="h-4 w-4" /> },
];

export default function AdminDashboard({ settings, items, orders, stats }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("menu");
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "error" } | null>(null);

  const notify = useCallback((message: string, tone: "ok" | "error" = "ok") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const cards = [
    {
      label: "Dishes live",
      value: `${stats.availableCount}/${stats.menuCount}`,
      detail: `${stats.menuCount - stats.availableCount} sold out today`,
      tone: "forest" as const,
    },
    {
      label: "Orders today",
      value: String(stats.todayCount),
      detail: `${stats.pendingCount} awaiting confirmation`,
      tone: "clay" as const,
    },
    {
      label: "Revenue today",
      value: formatNairaPrice(stats.todayRevenue),
      detail: `${formatNairaPrice(stats.revenue)} lifetime`,
      tone: "gold" as const,
    },
    {
      label: "Dispatch number",
      value: settings.phone_number,
      detail: "wa.me target for every web order",
      tone: "dark" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Console header ── */}
      <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-ivory/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-charcoal text-gold">
              <IconLogoMark className="h-6 w-6" />
            </span>
            <div>
              <p className="font-sans text-[10px] font-bold tracking-[0.24em] text-clay uppercase">
                Kitchen console
              </p>
              <h1 className="font-serif text-xl leading-tight font-black text-charcoal">
                {settings.business_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => logout()}
            className="font-sans text-xs font-bold tracking-[0.12em] text-bone uppercase hover:text-charcoal"
          >
            Log out
          </button>
          <a
            href="/"
            className="group inline-flex items-center gap-2 rounded-card bg-forest px-4 py-2.5 font-sans text-xs font-bold tracking-[0.12em] text-white uppercase transition-all duration-300 hover:bg-forest-hover"
          >
            View storefront
            <IconArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6 lg:px-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-3 font-sans text-xs font-bold tracking-[0.1em] uppercase transition-colors ${
                tab === t.id ? "text-forest" : "text-bone hover:text-charcoal"
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === "orders" && stats.pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-clay px-1.5 py-px text-[9px] font-bold text-white tabular-nums">
                  {stats.pendingCount}
                </span>
              )}
              {tab === t.id && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-forest" />
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Stats ── */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <div
              key={card.label}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`animate-pop-in rounded-card border p-5 transition-transform duration-300 hover:-translate-y-1 ${
                card.tone === "dark"
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-charcoal/10 bg-white"
              }`}
            >
              <p
                className={`font-sans text-[10px] font-bold tracking-[0.18em] uppercase ${
                  card.tone === "dark" ? "text-gold" : "text-bone"
                }`}
              >
                {card.label}
              </p>
              <p
                className={`mt-2 font-serif text-2xl leading-none font-black tabular-nums ${
                  card.tone === "dark"
                    ? "text-ivory"
                    : card.tone === "clay"
                      ? "text-clay"
                      : card.tone === "gold"
                        ? "text-[#8a6412]"
                        : "text-forest"
                }`}
              >
                {card.value}
              </p>
              <p
                className={`mt-2 font-sans text-[11px] ${
                  card.tone === "dark" ? "text-ivory/55" : "text-bone"
                }`}
              >
                {card.detail}
              </p>
            </div>
          ))}
        </div>

        {stats.soldOut.length > 0 && tab === "menu" && (
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-card border border-gold/30 bg-gold-light px-4 py-3">
            <span className="font-sans text-[11px] font-bold tracking-[0.14em] text-[#8a6412] uppercase">
              86&apos;d today:
            </span>
            {stats.soldOut.map((d) => (
              <span
                key={d.id}
                className="rounded-sm bg-white px-2 py-1 font-sans text-[11px] font-semibold text-charcoal/75"
              >
                {d.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab body ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div key={tab} className="animate-fade-in">
          {tab === "menu" && <MenuManager items={items} onNotify={notify} />}
          {tab === "orders" && (
            <OrdersManager
              orders={orders}
              businessPhone={settings.phone_number}
              onNotify={notify}
            />
          )}
          {tab === "settings" && <SettingsManager settings={settings} onNotify={notify} />}
        </div>

        {tab === "orders" && orders.length === 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-card border border-charcoal/10 bg-white px-5 py-4">
            <IconBasket className="mt-0.5 h-5 w-5 flex-shrink-0 text-forest" />
            <p className="font-sans text-sm leading-relaxed text-bone">
              Orders are written by <code className="rounded bg-canvas px-1 py-0.5 text-xs text-charcoal">POST /api/orders</code>{" "}
              the instant a customer submits the delivery verification form — before the WhatsApp
              window opens — so the kitchen never loses a basket.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-charcoal/10 bg-ivory">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <p className="font-sans text-xs text-bone">
            © {new Date().getFullYear()} {settings.business_name} · Native cart engine, no
            third-party checkout.
          </p>
          <p className="font-sans text-xs text-bone">{settings.address}</p>
        </div>
      </footer>

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  );
}
