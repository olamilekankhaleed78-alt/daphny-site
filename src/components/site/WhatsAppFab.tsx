"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { IconWhatsApp } from "@/components/icons";

interface WhatsAppFabProps {
  whatsappUrl: string;
}

/**
 * Floating WhatsApp launcher. It lifts above the sticky cart bar as soon as
 * the tray has items in it so the two never overlap.
 */
export default function WhatsAppFab({ whatsappUrl }: WhatsAppFabProps) {
  const { totalItems } = useCart();

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group fixed right-5 z-30 flex items-center transition-all duration-500 ease-out sm:right-6 ${
        totalItems > 0 ? "bottom-24 md:bottom-[5.75rem]" : "bottom-6"
      }`}
      aria-label="Chat with us on WhatsApp"
      title="Chat with the kitchen on WhatsApp"
    >
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-card bg-charcoal px-3 py-2 font-sans text-[11px] font-semibold text-ivory opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 sm:block">
        Ask a question first
      </span>

      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_14px_34px_-10px_rgba(37,211,102,0.85)] transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
        <IconWhatsApp className="h-7 w-7 text-white" />
        <span className="animate-badge-ping absolute inset-0 rounded-full bg-[#25D366]/60" />
      </span>
    </a>
  );
}
