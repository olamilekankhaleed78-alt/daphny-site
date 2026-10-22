"use client";

import React, { type ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-card border border-charcoal/10 bg-white shadow-[0_1px_3px_rgba(26,23,20,0.05)] ${className}`}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal/8 px-5 py-4">
          <div>
            {title && (
              <h2 className="font-serif text-lg font-bold text-charcoal">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-0.5 font-sans text-xs text-bone">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-sans text-[11px] font-bold tracking-[0.1em] text-charcoal uppercase">
          {label}
        </span>
        {hint && <span className="font-sans text-[10px] text-bone">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block font-sans text-xs text-clay">{error}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-card border border-charcoal/12 bg-white px-3.5 py-2.5 font-sans text-sm text-charcoal placeholder:text-bone/60 transition-all focus:border-forest focus:ring-2 focus:ring-forest/15 focus:outline-none";

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  className = "",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger" | "dark";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-forest text-white hover:bg-forest-hover shadow-[0_8px_20px_-12px_rgba(27,77,62,1)]",
    dark: "bg-charcoal text-ivory hover:bg-forest",
    ghost:
      "border border-charcoal/15 bg-white text-charcoal hover:border-forest hover:text-forest",
    danger:
      "border border-clay/30 bg-clay-light text-clay hover:border-clay hover:bg-clay hover:text-white",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-card px-4 py-2.5 font-sans text-xs font-bold tracking-[0.1em] uppercase transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  labelOn = "Available",
  labelOff = "Sold out",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  labelOn?: string;
  labelOff?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
          checked ? "bg-forest" : "bg-charcoal/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
            checked ? "left-[1.4rem]" : "left-0.5"
          }`}
        />
      </span>
      <span
        className={`font-sans text-[11px] font-bold tracking-wide uppercase ${
          checked ? "text-forest" : "text-bone"
        }`}
      >
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
}

export function Toast({ message, tone = "ok" }: { message: string; tone?: "ok" | "error" }) {
  return (
    <div
      className={`animate-slide-up fixed right-5 bottom-5 z-[70] max-w-sm rounded-card border px-4 py-3 font-sans text-sm font-semibold shadow-2xl ${
        tone === "ok"
          ? "border-forest/30 bg-forest text-white"
          : "border-clay/40 bg-clay text-white"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}
