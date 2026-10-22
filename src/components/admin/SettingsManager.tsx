"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSiteSettings } from "@/app/actions";
import { DELIVERY_ZONES, formatNairaPrice } from "@/lib/helpers";
import type { SiteSettings } from "@/lib/types";
import { IconSave } from "@/components/icons";
import ImageUploadButton from "./ImageUploadButton";
import { Button, Field, Panel, inputClass } from "./ui";

interface SettingsManagerProps {
  settings: SiteSettings;
  onNotify: (message: string, tone?: "ok" | "error") => void;
}

interface Group {
  heading: string;
  blurb: string;
  fields: {
    key: keyof SiteSettings;
    label: string;
    type?: "text" | "textarea" | "number";
    hint?: string;
    span?: 1 | 2 | 3;
  }[];
}

const GROUPS: Group[] = [
  {
    heading: "Identity",
    blurb: "Name, address and the number WhatsApp dispatches to.",
    fields: [
      { key: "business_name", label: "Business name", span: 2 },
      {
        key: "phone_number",
        label: "WhatsApp / call number",
        hint: "Used by wa.me dispatch",
        span: 1,
      },
      { key: "email", label: "Email", span: 1 },
      { key: "address", label: "Kitchen address", span: 2 },
      { key: "opening_hours", label: "Opening hours", span: 2 },
      { key: "kitchen_close", label: "Last order", hint: "e.g. 9:30 PM", span: 1 },
    ],
  },
  {
    heading: "Hero & announcement",
    blurb: "The first screen every visitor reads.",
    fields: [
      { key: "hero_eyebrow", label: "Eyebrow line", span: 3 },
      { key: "hero_title", label: "Headline", span: 3 },
      { key: "hero_subtitle", label: "Sub-headline", type: "textarea", span: 3 },
      { key: "announcement", label: "Ticker announcement", type: "textarea", span: 2 },
      { key: "hero_image_url", label: "Hero image URL", span: 1 },
    ],
  },
  {
    heading: "Story",
    blurb: "The sticky two-column narrative section.",
    fields: [
      { key: "about_title", label: "Story headline", span: 2 },
      { key: "chef_name", label: "Head cook", span: 1 },
      { key: "about_body", label: "Story body", type: "textarea", span: 3 },
      { key: "chef_quote", label: "Pull quote", type: "textarea", span: 2 },
      { key: "chef_image_url", label: "Chef image URL", span: 1 },
      { key: "kitchen_image_url", label: "Kitchen image URL", span: 1 },
      { key: "market_image_url", label: "Market image URL", span: 1 },
      { key: "delivery_eta", label: "Dispatch ETA", span: 1 },
    ],
  },
  {
    heading: "Order rules",
    blurb: "Thresholds that the checkout modal enforces.",
    fields: [
      {
        key: "min_order",
        label: "Minimum order (₦)",
        type: "number",
        hint: "0 disables",
        span: 1,
      },
      {
        key: "free_delivery_threshold",
        label: "Free delivery above (₦)",
        type: "number",
        hint: "0 disables",
        span: 1,
      },
      { key: "payment_info", label: "Payment instructions", type: "textarea", span: 3 },
    ],
  },
  {
    heading: "Social & legacy",
    blurb: "nextorder_url is retained for reference only — the storefront no longer redirects.",
    fields: [
      { key: "instagram_url", label: "Instagram URL", span: 1 },
      { key: "facebook_url", label: "Facebook URL", span: 1 },
      {
        key: "nextorder_url",
        label: "nextorder_url (deprecated)",
        hint: "Leave blank",
        span: 1,
      },
    ],
  },
];

export default function SettingsManager({ settings, onNotify }: SettingsManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [fees, setFees] = useState<Record<string, number>>(() => {
    try {
      const parsed = JSON.parse(settings.delivery_fees || "{}") as Record<string, unknown>;
      const out: Record<string, number> = {};
      for (const zone of DELIVERY_ZONES) {
        const v = Number(parsed[zone] ?? 0);
        out[zone] = Number.isFinite(v) && v >= 0 ? v : 0;
      }
      return out;
    } catch {
      return Object.fromEntries(DELIVERY_ZONES.map((z) => [z, 0])) as Record<string, number>;
    }
  });
  const [busy, setBusy] = useState(false);

  const dirty = useMemo(() => {
    const feeChanged = JSON.stringify(fees) !== (() => {
      try {
        return JSON.stringify(JSON.parse(settings.delivery_fees || "{}"));
      } catch {
        return "{}";
      }
    })();
    const fieldChanged = GROUPS.some((g) =>
      g.fields.some((f) => String(form[f.key] ?? "") !== String(settings[f.key] ?? ""))
    );
    return feeChanged || fieldChanged;
  }, [form, fees, settings]);

  const update = useCallback((key: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    setBusy(true);
    const patch: Partial<SiteSettings> = { ...form, delivery_fees: JSON.stringify(fees) };
    const result = await saveSiteSettings(patch);
    setBusy(false);
    if (!result.ok) {
      onNotify(result.error ?? "Could not save settings.", "error");
      return;
    }
    onNotify("Storefront settings saved.");
    router.refresh();
  }, [form, fees, onNotify, router]);

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <Panel key={group.heading} title={group.heading} subtitle={group.blurb}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.fields.map((field) => {
              const spanClass =
                field.span === 3
                  ? "sm:col-span-2 lg:col-span-3"
                  : field.span === 2
                    ? "sm:col-span-2"
                    : "";
              return (
                <Field key={field.key} label={field.label} hint={field.hint} className={spanClass}>
                  {field.type === "textarea" ? (
                    <textarea
                      value={String(form[field.key] ?? "")}
                      onChange={(e) => update(field.key, e.target.value)}
                      className={`${inputClass} min-h-[92px] resize-y leading-relaxed`}
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      min={field.type === "number" ? 0 : undefined}
                      value={String(form[field.key] ?? "")}
                      onChange={(e) => update(field.key, e.target.value)}
                      className={inputClass}
                    />
                  )}
                  {field.key.endsWith("_image_url") && (
                    <ImageUploadButton onUploaded={(url) => update(field.key, url)} />
                  )}
                </Field>
              );
            })}
          </div>
        </Panel>
      ))}

      <Panel
        title="Delivery fees by zone"
        subtitle="The checkout modal prices the rider the moment a zone is selected."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DELIVERY_ZONES.map((zone) => (
            <label key={zone} className="block rounded-card border border-charcoal/10 bg-canvas p-3">
              <span className="block font-sans text-[11px] font-bold tracking-[0.1em] text-charcoal uppercase">
                {zone}
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={fees[zone] ?? 0}
                onChange={(e) =>
                  setFees((prev) => ({
                    ...prev,
                    [zone]: Math.max(0, parseInt(e.target.value, 10) || 0),
                  }))
                }
                className={`${inputClass} mt-2 bg-white`}
              />
              <span className="mt-1.5 block font-sans text-[11px] text-bone tabular-nums">
                {formatNairaPrice(fees[zone] ?? 0)}
              </span>
            </label>
          ))}
        </div>
      </Panel>

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-card border border-charcoal/12 bg-charcoal px-5 py-4 shadow-[0_18px_40px_-20px_rgba(26,23,20,0.8)]">
        <p className="font-sans text-xs text-ivory/65">
          {dirty
            ? "You have unsaved changes on the live storefront."
            : "Everything is in sync with the storefront."}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setForm(settings)} disabled={busy || !dirty}>
            Revert
          </Button>
          <Button
            onClick={save}
            disabled={busy || !dirty}
            className="bg-gold text-charcoal hover:bg-gold/85"
          >
            <IconSave className="h-4 w-4" />
            {busy ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
