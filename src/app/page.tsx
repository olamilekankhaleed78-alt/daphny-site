import type { Metadata } from "next";
import { getMenuItems, getSiteSettings } from "./actions";
import StorefrontClient from "@/components/site/StorefrontClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tonight's Board — Daphny Dodo Cuisine | Lagos",
  description:
    "Browse tonight's Nigerian menu, build your tray and confirm on WhatsApp. Egusi, smoky party jollof, suya, grilled tilapia and zobo delivered across Lagos.",
};

export default async function StorefrontPage() {
  /* Both helpers bootstrap the schema, seed first-run content and swallow
     database faults so a cold preview never renders a blank storefront. */
  const [settings, activeMenu] = await Promise.all([
    getSiteSettings(),
    getMenuItems(),
  ]);

  return <StorefrontClient settings={settings} menuItems={activeMenu} />;
}
