"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatNairaPrice, SPICE_LABELS } from "@/lib/helpers";
import {
  IconBasket,
  IconChilli,
  IconClock,
  IconMinus,
  IconPlus,
  IconSearch,
  IconSparkle,
} from "@/components/icons";

/* ─── Type Definitions ─── */

interface MenuItemData {
  id: string;
  title: string;
  price: number;
  description: string;
  tags: string[];
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  isSignature?: boolean;
  spiceLevel?: number;
  prepMinutes?: number;
}

interface MenuShowcaseProps {
  items: MenuItemData[];
  isLoading?: boolean;
}

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

/* ─── Image with graceful failure ─── */

function DishImage({
  src,
  alt,
  available,
}: {
  src: string;
  alt: string;
  available: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_25%,#2f6f57,#143b2f_70%)]">
        <span className="font-serif text-4xl font-bold text-white/25">
          {alt.slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover transition-[transform,filter] duration-[900ms] ease-out group-hover:scale-[1.07] ${
        available ? "" : "saturate-0"
      }`}
    />
  );
}

/* ─── Component ─── */

export default function MenuShowcase({ items, isLoading = false }: MenuShowcaseProps) {
  const { addItem, incrementItem, decrementItem, getItemQuantity, lastTouchedId } =
    useCart();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [query, setQuery] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [hideSoldOut, setHideSoldOut] = useState<boolean>(false);

  /* Category list + per-category counts, ordered by first appearance. */
  const availableCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      if (!item.category || typeof item.category !== "string") continue;
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    const ordered = Array.from(counts.keys());
    return [{ label: "All", count: items.length }, ...ordered.map((c) => ({ label: c, count: counts.get(c) ?? 0 }))];
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;

    if (activeCategory !== "All") {
      list = list.filter(
        (item) => item.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    if (q.length > 0) {
      list = list.filter((item) => {
        const haystack = [item.title, item.description, item.category, ...(item.tags || [])]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    if (hideSoldOut) {
      list = list.filter((item) => item.isAvailable);
    }

    const sorted = [...list];
    switch (sortKey) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        sorted.sort((a, b) => {
          if (a.isSignature !== b.isSignature) return a.isSignature ? -1 : 1;
          if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
          return 0;
        });
    }
    return sorted;
  }, [items, activeCategory, query, sortKey, hideSoldOut]);

  const handleAddToCart = useCallback(
    (item: MenuItemData) => {
      if (!item || !item.isAvailable) return;
      addItem({
        id: item.id,
        title: item.title,
        price: item.price,
        imageUrl: item.imageUrl,
        category: item.category,
      });
    },
    [addItem]
  );

  const handleIncrement = useCallback(
    (id: string) => {
      if (!id) return;
      incrementItem(id);
    },
    [incrementItem]
  );

  const handleDecrement = useCallback(
    (id: string) => {
      if (!id) return;
      decrementItem(id);
    },
    [decrementItem]
  );

  /* ─── Loading Skeleton ─── */
  if (isLoading) {
    return (
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-card border border-charcoal/8 bg-white shadow-sm"
          >
            <div className="aspect-[4/3] bg-canvas" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 rounded bg-canvas" />
              <div className="h-4 w-full rounded bg-canvas" />
              <div className="h-4 w-1/2 rounded bg-canvas" />
              <div className="h-10 w-full rounded bg-canvas" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ─── Empty State ─── */
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-forest-light">
          <IconBasket className="h-8 w-8 text-forest" />
        </div>
        <p className="text-sm text-bone">
          Our chefs are preparing fresh pots. Check back shortly!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ─── Control bar ─── */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-bone" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search egusi, suya, zobo…"
            aria-label="Search the menu"
            className="w-full rounded-card border border-charcoal/12 bg-white py-2.5 pr-4 pl-10 text-sm text-charcoal placeholder:text-bone/70 focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-charcoal/70 select-none">
            <input
              type="checkbox"
              checked={hideSoldOut}
              onChange={(e) => setHideSoldOut(e.target.checked)}
              className="h-4 w-4 accent-[#1b4d3e]"
            />
            Hide sold out
          </label>

          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Sort dishes"
              className="appearance-none rounded-card border border-charcoal/12 bg-white py-2.5 pr-9 pl-3.5 text-xs font-semibold tracking-wide text-charcoal uppercase focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">A – Z</option>
            </select>
            <svg
              className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-bone"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Category pills ─── */}
      {availableCategories.length > 1 && (
        <div className="mb-10 flex flex-wrap items-center gap-2">
          {availableCategories.map((cat) => {
            const active = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveCategory(cat.label)}
                aria-pressed={active}
                className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                  active
                    ? "border-forest bg-forest text-white shadow-[0_6px_18px_-8px_rgba(27,77,62,0.9)]"
                    : "border-charcoal/12 bg-white text-charcoal/70 hover:-translate-y-0.5 hover:border-forest/40 hover:text-forest"
                }`}
              >
                {cat.label}
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
                    active ? "bg-white/20 text-white" : "bg-canvas text-bone"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="mb-6 text-xs font-medium tracking-[0.16em] text-bone uppercase">
        Showing {filteredItems.length} dish{filteredItems.length === 1 ? "" : "es"}
        {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
        {query.trim() ? ` matching “${query.trim()}”` : ""}
      </p>

      {/* ─── Product grid ─── */}
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item, index) => {
          const qty = getItemQuantity(item.id);
          const spice = Math.max(0, Math.min(4, item.spiceLevel ?? 0));
          const justTouched = lastTouchedId === item.id;

          return (
            <article
              key={item.id}
              style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
              className={`group animate-pop-in relative flex flex-col overflow-hidden rounded-card border bg-white shadow-[0_1px_2px_rgba(26,23,20,0.05)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-24px_rgba(26,23,20,0.45)] ${
                qty > 0
                  ? "border-forest/50 ring-1 ring-forest/25"
                  : "border-charcoal/8 hover:border-forest/30"
              } ${item.isAvailable ? "" : "opacity-90"}`}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
                <DishImage src={item.imageUrl} alt={item.title} available={item.isAvailable} />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent opacity-70" />

                {/* Top-left chips */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {item.category && (
                    <span className="rounded-sm bg-white/92 px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-charcoal uppercase backdrop-blur-sm">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Top-right flags */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                  {item.isSignature && item.isAvailable && (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-clay px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-white uppercase">
                      <IconSparkle className="h-3 w-3" />
                      Signature
                    </span>
                  )}
                  {!item.isAvailable && (
                    <span className="rounded-sm bg-charcoal px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                      Sold out today
                    </span>
                  )}
                </div>

                {/* Bottom meta strip */}
                <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {spice > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 rounded-sm bg-charcoal/70 px-1.5 py-1 backdrop-blur-sm"
                        title={SPICE_LABELS[spice]}
                      >
                        {Array.from({ length: spice }).map((_, i) => (
                          <IconChilli key={i} className="h-3 w-3 text-clay" />
                        ))}
                      </span>
                    )}
                    {item.prepMinutes ? (
                      <span className="inline-flex items-center gap-1 rounded-sm bg-charcoal/70 px-1.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
                        <IconClock className="h-3 w-3" />
                        {item.prepMinutes}m
                      </span>
                    ) : null}
                  </div>
                  {qty > 0 && (
                    <span
                      className={`rounded-full bg-forest px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase transition-transform duration-300 ${
                        justTouched ? "scale-110" : "scale-100"
                      }`}
                    >
                      {qty} in order
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h4 className="font-serif text-lg leading-tight font-semibold text-charcoal">
                    {item.title}
                  </h4>
                  <span className="font-sans text-sm font-extrabold whitespace-nowrap text-forest">
                    {formatNairaPrice(item.price)}
                  </span>
                </div>

                <p className="clamp-2 mb-4 text-xs leading-relaxed text-bone">
                  {item.description}
                </p>

                {item.tags && item.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={`${tag}-${idx}`}
                        className="rounded-sm bg-forest-light px-2 py-0.5 text-[10px] font-semibold text-forest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto">
                  {item.isAvailable ? (
                    qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="shimmer flex w-full items-center justify-center gap-2 rounded-card bg-forest py-3 text-xs font-bold tracking-[0.14em] text-white uppercase transition-all duration-300 hover:bg-forest-hover active:scale-[0.98]"
                      >
                        <IconPlus className="h-4 w-4" />
                        Add to order
                      </button>
                    ) : (
                      <div className="flex items-center justify-between overflow-hidden rounded-card border border-forest/30 bg-forest-light">
                        <button
                          type="button"
                          onClick={() => handleDecrement(item.id)}
                          aria-label={`Decrease quantity of ${item.title}`}
                          className="flex h-11 w-11 items-center justify-center text-forest transition-colors hover:bg-forest/12 active:scale-90"
                        >
                          <IconMinus className="h-4 w-4" />
                        </button>
                        <span className="flex-1 text-center font-serif text-base font-bold text-forest tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrement(item.id)}
                          aria-label={`Increase quantity of ${item.title}`}
                          className="flex h-11 w-11 items-center justify-center text-forest transition-colors hover:bg-forest/12 active:scale-90"
                        >
                          <IconPlus className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="w-full cursor-not-allowed rounded-card border border-dashed border-charcoal/15 bg-canvas py-3 text-center text-xs font-bold tracking-[0.14em] text-bone uppercase select-none">
                      Unavailable today
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ─── No results ─── */}
      {filteredItems.length === 0 && (
        <div className="py-14 text-center">
          <p className="font-serif text-lg text-charcoal">
            Nothing on the board matches that.
          </p>
          <p className="mt-2 text-sm text-bone">
            Try another search, or clear the filters to see all {items.length} dishes.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveCategory("All");
              setHideSoldOut(false);
            }}
            className="mt-5 rounded-card border border-charcoal/20 px-5 py-2.5 text-xs font-bold tracking-[0.14em] text-charcoal uppercase transition-colors hover:border-forest hover:bg-forest hover:text-white"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
