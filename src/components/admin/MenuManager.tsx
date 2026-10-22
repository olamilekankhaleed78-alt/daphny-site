"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteMenuItem,
  resetMenuToDefaults,
  saveMenuItem,
  toggleMenuItemAvailability,
} from "@/app/actions";
import { MENU_CATEGORIES, formatNairaPrice, parseTagInput, SPICE_LABELS } from "@/lib/helpers";
import type { MenuItemData, MenuItemDraft } from "@/lib/types";
import { IconAlert, IconCheck, IconEdit, IconPlus, IconSave, IconTrash } from "@/components/icons";
import ImageUploadButton from "./ImageUploadButton";
import { Button, Field, Panel, Toggle, inputClass } from "./ui";

const EMPTY_DRAFT: MenuItemDraft = {
  title: "",
  description: "",
  price: 0,
  category: MENU_CATEGORIES[0],
  tags: [],
  imageUrl: "",
  isAvailable: true,
  isSignature: false,
  spiceLevel: 1,
  prepMinutes: 25,
  sortOrder: 0,
};

interface MenuManagerProps {
  items: MenuItemData[];
  onNotify: (message: string, tone?: "ok" | "error") => void;
}

export default function MenuManager({ items, onNotify }: MenuManagerProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<MenuItemDraft | null>(null);
  const [tagText, setTagText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (draft) setTagText((draft.tags || []).join(", "));
  }, [draft]);

  const visible = items.filter((item) => {
    if (filter !== "All" && item.category !== filter) return false;
    if (query.trim()) {
      const hay = `${item.title} ${item.category} ${(item.tags || []).join(" ")}`.toLowerCase();
      if (!hay.includes(query.trim().toLowerCase())) return false;
    }
    return true;
  });

  const startNew = useCallback(() => {
    const maxSort = items.reduce((max, i) => Math.max(max, i.sortOrder ?? 0), 0);
    setDraft({ ...EMPTY_DRAFT, sortOrder: maxSort + 1 });
    setError(null);
  }, [items]);

  const startEdit = useCallback((item: MenuItemData) => {
    setDraft({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      price: item.price,
      category: item.category,
      tags: item.tags ?? [],
      imageUrl: item.imageUrl ?? "",
      isAvailable: item.isAvailable,
      isSignature: Boolean(item.isSignature),
      spiceLevel: item.spiceLevel ?? 0,
      prepMinutes: item.prepMinutes ?? 25,
      sortOrder: item.sortOrder ?? 0,
    });
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    const payload: MenuItemDraft = { ...draft, tags: parseTagInput(tagText) };
    const result = await saveMenuItem(payload);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save the dish.");
      return;
    }
    setDraft(null);
    onNotify(draft.id ? "Dish updated." : "Dish added to the board.");
    router.refresh();
  }, [draft, tagText, onNotify, router]);

  const handleDelete = useCallback(
    async (item: MenuItemData) => {
      if (!window.confirm(`Remove “${item.title}” from the board?`)) return;
      setBusy(true);
      const result = await deleteMenuItem(item.id);
      setBusy(false);
      onNotify(result.ok ? "Dish removed." : "Could not remove the dish.", result.ok ? "ok" : "error");
      router.refresh();
    },
    [onNotify, router]
  );

  const handleToggle = useCallback(
    async (item: MenuItemData) => {
      const next = !item.isAvailable;
      const result = await toggleMenuItemAvailability(item.id, next);
      if (!result.ok) {
        onNotify("Could not change availability.", "error");
        return;
      }
      onNotify(next ? `${item.title} is back on the board.` : `${item.title} marked sold out.`);
      router.refresh();
    },
    [onNotify, router]
  );

  const handleReset = useCallback(async () => {
    if (!window.confirm("Replace the entire board with the original 33-dish sample menu?")) return;
    setBusy(true);
    const result = await resetMenuToDefaults();
    setBusy(false);
    onNotify(result.ok ? `Board reset to ${result.count} dishes.` : "Reset failed.", result.ok ? "ok" : "error");
    router.refresh();
  }, [onNotify, router]);

  return (
    <div className="space-y-6">
      <Panel
        title="Menu board"
        subtitle={`${items.length} dishes · ${items.filter((i) => i.isAvailable).length} available`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={handleReset} disabled={busy}>
              Reset to sample
            </Button>
            <Button onClick={startNew} disabled={busy || draft !== null}>
              <IconPlus className="h-4 w-4" />
              New dish
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter dishes…"
            className={`${inputClass} max-w-xs`}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`${inputClass} max-w-[15rem]`}
          >
            <option value="All">All categories</option>
            {MENU_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Editor */}
        {draft && (
          <div className="animate-pop-in mb-6 rounded-card border border-forest/25 bg-forest-light/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-charcoal">
                {draft.id ? `Editing — ${draft.id}` : "New dish"}
              </h3>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="font-sans text-xs font-semibold text-bone hover:text-clay"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Dish name" className="sm:col-span-2">
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Smoky Party Jollof Rice"
                />
              </Field>

              <Field label="Price (₦)">
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={draft.price || ""}
                  onChange={(e) => setDraft({ ...draft, price: parseInt(e.target.value, 10) || 0 })}
                  className={inputClass}
                  placeholder="5000"
                />
              </Field>

              <Field label="Category">
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className={inputClass}
                >
                  {MENU_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Prep minutes">
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={draft.prepMinutes}
                  onChange={(e) =>
                    setDraft({ ...draft, prepMinutes: parseInt(e.target.value, 10) || 25 })
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Sort order" hint="lower shows first">
                <input
                  type="number"
                  min={0}
                  value={draft.sortOrder}
                  onChange={(e) => setDraft({ ...draft, sortOrder: parseInt(e.target.value, 10) || 0 })}
                  className={inputClass}
                />
              </Field>

              <Field label="Description" className="sm:col-span-2">
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className={`${inputClass} min-h-[84px] resize-y`}
                  placeholder="What goes in the pot, how it is cooked, how it is served."
                />
              </Field>

              <Field label="Image URL">
                <input
                  value={draft.imageUrl}
                  onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://…"
                />
                <ImageUploadButton onUploaded={(url) => setDraft({ ...draft, imageUrl: url })} />
              </Field>

              <Field label="Tags" hint="comma separated, max 6">
                <input
                  value={tagText}
                  onChange={(e) => setTagText(e.target.value)}
                  className={inputClass}
                  placeholder="Wood fire, Smoky, Best seller"
                />
              </Field>

              <Field label="Heat level" hint={SPICE_LABELS[draft.spiceLevel] ?? ""}>
                <input
                  type="range"
                  min={0}
                  max={4}
                  value={draft.spiceLevel}
                  onChange={(e) => setDraft({ ...draft, spiceLevel: parseInt(e.target.value, 10) })}
                  className="mt-3 w-full accent-[#c2571a]"
                />
              </Field>

              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:gap-8">
                <Toggle
                  checked={draft.isAvailable}
                  onChange={(v) => setDraft({ ...draft, isAvailable: v })}
                />
                <Toggle
                  checked={draft.isSignature}
                  onChange={(v) => setDraft({ ...draft, isSignature: v })}
                  labelOn="Signature"
                  labelOff="Standard"
                />
              </div>
            </div>

            {draft.imageUrl && (
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={draft.imageUrl}
                  alt="Preview"
                  className="h-16 w-24 rounded-sm border border-charcoal/10 object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
                  }}
                />
                <span className="font-sans text-[11px] text-bone">Card preview</span>
              </div>
            )}

            {error && (
              <p className="mt-4 flex items-center gap-2 rounded-card bg-clay-light px-3 py-2 font-sans text-xs font-semibold text-clay">
                <IconAlert className="h-4 w-4" />
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <Button onClick={submit} disabled={busy}>
                <IconSave className="h-4 w-4" />
                {busy ? "Saving…" : "Save dish"}
              </Button>
              <Button variant="ghost" onClick={() => setDraft(null)} disabled={busy}>
                Discard
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-charcoal/10">
                {["Dish", "Category", "Price", "Heat", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="pb-2 font-sans text-[10px] font-bold tracking-[0.16em] text-bone uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr
                  key={item.id}
                  className="group border-b border-charcoal/6 transition-colors last:border-0 hover:bg-canvas/70"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-11 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-canvas">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                            }}
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate font-serif text-sm font-bold text-charcoal">
                            {item.title}
                          </span>
                          {item.isSignature && (
                            <span className="rounded-sm bg-clay-light px-1.5 py-px font-sans text-[9px] font-bold tracking-wide text-clay uppercase">
                              Sig
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate font-sans text-[11px] text-bone">
                          {item.id} · #{item.sortOrder}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-sans text-xs text-charcoal/70">{item.category}</td>
                  <td className="py-3 font-sans text-sm font-bold text-forest tabular-nums">
                    {formatNairaPrice(item.price)}
                  </td>
                  <td className="py-3 font-sans text-xs text-bone">
                    {SPICE_LABELS[Math.max(0, Math.min(4, item.spiceLevel ?? 0))]}
                  </td>
                  <td className="py-3">
                    <Toggle checked={item.isAvailable} onChange={() => handleToggle(item)} />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label={`Edit ${item.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-sm text-bone transition-colors hover:bg-forest-light hover:text-forest"
                      >
                        <IconEdit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={busy}
                        aria-label={`Delete ${item.title}`}
                        className="flex h-8 w-8 items-center justify-center rounded-sm text-bone transition-colors hover:bg-clay-light hover:text-clay disabled:opacity-40"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <IconCheck className="mx-auto mb-2 h-6 w-6 text-charcoal/15" />
                    <p className="font-sans text-sm text-bone">
                      No dishes match that filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
