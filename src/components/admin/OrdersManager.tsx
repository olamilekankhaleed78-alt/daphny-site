"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOrder, updateOrderStatus } from "@/app/actions";
import {
  ORDER_STATUSES,
  formatDateTime,
  formatNairaPrice,
  sanitizePhoneForWhatsApp,
} from "@/lib/helpers";
import type { OrderRecord } from "@/lib/types";
import {
  IconChevron,
  IconReceipt,
  IconTrash,
  IconWhatsApp,
} from "@/components/icons";
import { Panel, inputClass } from "./ui";

const STATUS_TONES: Record<string, string> = {
  pending: "bg-gold-light text-[#8a6412]",
  confirmed: "bg-forest-light text-forest",
  cooking: "bg-clay-light text-clay",
  dispatched: "bg-[#dff5e6] text-[#128C4B]",
  completed: "bg-charcoal text-ivory",
  cancelled: "bg-charcoal/10 text-bone",
};

interface OrdersManagerProps {
  orders: OrderRecord[];
  businessPhone: string;
  onNotify: (message: string, tone?: "ok" | "error") => void;
}

export default function OrdersManager({ orders, businessPhone, onNotify }: OrdersManagerProps) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const visible = orders.filter((o) => statusFilter === "all" || o.status === statusFilter);

  const changeStatus = useCallback(
    async (order: OrderRecord, status: string) => {
      setBusy(true);
      const result = await updateOrderStatus(order.id, status);
      setBusy(false);
      onNotify(
        result.ok ? `${order.reference} → ${status}.` : "Could not update the order.",
        result.ok ? "ok" : "error"
      );
      router.refresh();
    },
    [onNotify, router]
  );

  const remove = useCallback(
    async (order: OrderRecord) => {
      if (!window.confirm(`Delete order ${order.reference}?`)) return;
      setBusy(true);
      const result = await deleteOrder(order.id);
      setBusy(false);
      onNotify(result.ok ? "Order deleted." : "Could not delete the order.", result.ok ? "ok" : "error");
      router.refresh();
    },
    [onNotify, router]
  );

  const reWhatsApp = useCallback(
    (order: OrderRecord) => {
      const clean = sanitizePhoneForWhatsApp(businessPhone);
      if (!clean) {
        onNotify("No valid restaurant number configured.", "error");
        return;
      }
      const lines = order.items
        .map((i) => `• ${i.title} x ${i.quantity} — ${formatNairaPrice(i.price * i.quantity)}`)
        .join("\n");
      const message =
        `🇳🇬 *DAPHNY DODO CUISINE - KITCHEN RESEND*\n` +
        `*ORDER REF:* ${order.reference}\n` +
        `• Name: ${order.customerName}\n` +
        `• Phone: ${order.phone}\n` +
        `• Zone: ${order.zone}\n` +
        `• Address: ${order.address}\n\n` +
        `${lines}\n\n` +
        `Delivery fee: ${formatNairaPrice(order.deliveryFee)}\n` +
        `*GRAND TOTAL:* ${formatNairaPrice(order.total)}`;
      window.open(
        `https://wa.me/${clean}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );
    },
    [businessPhone, onNotify]
  );

  return (
    <Panel
      title="Order log"
      subtitle={`${orders.length} recorded · every web order is written here before WhatsApp opens`}
      action={
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClass} max-w-[13rem]`}
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      }
    >
      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <IconReceipt className="mx-auto mb-3 h-8 w-8 text-charcoal/15" />
          <p className="font-serif text-lg font-bold text-charcoal">No orders yet.</p>
          <p className="mt-1 font-sans text-sm text-bone">
            Add a few dishes on the storefront and run a checkout — the order lands here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-charcoal/8">
          {visible.map((order) => {
            const open = openId === order.id;
            return (
              <li key={order.id} className="py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : order.id)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <IconChevron
                      className={`h-4 w-4 flex-shrink-0 text-bone transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-sm font-bold text-charcoal">
                          {order.reference}
                        </span>
                        <span
                          className={`rounded-sm px-2 py-0.5 font-sans text-[9px] font-bold tracking-[0.12em] uppercase ${
                            STATUS_TONES[order.status] ?? STATUS_TONES.pending
                          }`}
                        >
                          {order.status}
                        </span>
                        {order.waDispatched && (
                          <span className="inline-flex items-center gap-1 rounded-sm bg-[#dff5e6] px-2 py-0.5 font-sans text-[9px] font-bold tracking-[0.12em] text-[#128C4B] uppercase">
                            <IconWhatsApp className="h-3 w-3" />
                            WA sent
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block truncate font-sans text-xs text-bone">
                        {order.customerName} · {order.zone} · {formatDateTime(order.createdAt)}
                      </span>
                    </span>
                  </button>

                  <span className="font-sans text-base font-extrabold text-forest tabular-nums">
                    {formatNairaPrice(order.total)}
                  </span>

                  <select
                    value={order.status}
                    disabled={busy}
                    onChange={(e) => changeStatus(order, e.target.value)}
                    aria-label={`Status for ${order.reference}`}
                    className={`${inputClass} w-auto py-1.5 text-xs`}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => reWhatsApp(order)}
                    aria-label={`Resend ${order.reference} on WhatsApp`}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-bone transition-colors hover:bg-[#dff5e6] hover:text-[#128C4B]"
                  >
                    <IconWhatsApp className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(order)}
                    disabled={busy}
                    aria-label={`Delete ${order.reference}`}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-bone transition-colors hover:bg-clay-light hover:text-clay disabled:opacity-40"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>

                {open && (
                  <div className="animate-fade-in mt-4 grid gap-4 rounded-card border border-charcoal/10 bg-canvas p-4 lg:grid-cols-2">
                    <div>
                      <p className="mb-2 font-sans text-[10px] font-bold tracking-[0.16em] text-bone uppercase">
                        Bill of materials
                      </p>
                      <ul className="space-y-1.5">
                        {order.items.map((line, i) => (
                          <li
                            key={`${line.title}-${i}`}
                            className="flex items-baseline justify-between gap-3 font-sans text-sm"
                          >
                            <span className="text-charcoal/80">
                              {line.title}{" "}
                              <span className="text-bone">×{line.quantity}</span>
                            </span>
                            <span className="font-semibold text-charcoal tabular-nums">
                              {formatNairaPrice(line.price * line.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 space-y-1 border-t border-charcoal/10 pt-3 font-sans text-xs text-bone">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="tabular-nums">{formatNairaPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery</span>
                          <span className="tabular-nums">
                            {order.deliveryFee === 0 ? "FREE" : formatNairaPrice(order.deliveryFee)}
                          </span>
                        </div>
                        <div className="flex justify-between font-sans text-sm font-bold text-charcoal">
                          <span>Total</span>
                          <span className="tabular-nums">{formatNairaPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 font-sans text-[10px] font-bold tracking-[0.16em] text-bone uppercase">
                        Dispatch details
                      </p>
                      <dl className="space-y-2 font-sans text-sm">
                        <div>
                          <dt className="text-[11px] text-bone">Name</dt>
                          <dd className="text-charcoal">{order.customerName}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-bone">Phone</dt>
                          <dd>
                            <a
                              href={`tel:${order.phone}`}
                              className="text-forest underline-offset-2 hover:underline"
                            >
                              {order.phone}
                            </a>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-bone">Zone</dt>
                          <dd className="text-charcoal">{order.zone}</dd>
                        </div>
                        <div>
                          <dt className="text-[11px] text-bone">Address</dt>
                          <dd className="text-charcoal">{order.address}</dd>
                        </div>
                        {order.note && (
                          <div>
                            <dt className="text-[11px] text-bone">Kitchen note</dt>
                            <dd className="rounded-sm bg-gold-light px-2 py-1.5 text-charcoal italic">
                              {order.note}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="py-10 text-center font-sans text-sm text-bone">
              No orders with that status.
            </li>
          )}
        </ul>
      )}
    </Panel>
  );
}
