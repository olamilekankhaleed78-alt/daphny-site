/* Static editorial copy — safe to import from client components. */

export interface Testimonial {
  name: string;
  zone: string;
  rating: number;
  text: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Chidinma A.",
    zone: "Lekki Phase 1",
    rating: 5,
    text: "The jollof actually has smoke in it. I have stopped cooking rice on Fridays — I just open the site, build the tray and order the party pot for the office.",
  },
  {
    name: "Tunde B.",
    zone: "Ikeja GRA",
    rating: 5,
    text: "Egusi with proper stockfish and a pounded yam that does not fight you. Landed in Ikeja in 52 minutes and it was still steaming when I opened the bowl.",
  },
  {
    name: "Amaka O.",
    zone: "Yaba",
    rating: 5,
    text: "Ordered suya and asun for a house party at 8pm and they still cooked it fresh. The WhatsApp confirmation is so much easier than shouting over a phone call.",
  },
  {
    name: "Ifeanyi N.",
    zone: "Victoria Island",
    rating: 4,
    text: "The grilled tilapia is enormous — genuinely a two-person fish. That ata dindin on the side is dangerously good, I asked for a second cup.",
  },
  {
    name: "Bisi K.",
    zone: "Surulere",
    rating: 5,
    text: "I grew up two streets from this kitchen. The puff puff tastes exactly like my grandmother's Saturday batch. Nothing else in Lagos comes close.",
  },
  {
    name: "Emeka D.",
    zone: "Ajah",
    rating: 5,
    text: "Ajah is far and they still came. The tray bar showing my running total is the reason I ordered ₦38,000 worth of food for my sister's introduction.",
  },
];

export const DELIVERY_ZONE_ETAS: Record<string, string> = {
  Lekki: "50 – 70 min",
  Ikoyi: "45 – 60 min",
  "Victoria Island": "45 – 60 min",
  Ikeja: "40 – 55 min",
  Ajah: "65 – 90 min",
  Surulere: "20 – 35 min",
  Yaba: "30 – 45 min",
  Maryland: "35 – 50 min",
  Gbagada: "35 – 50 min",
  Other: "75 – 110 min",
};

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Build the tray",
    body: "Tap any dish to drop it into your order. The bar at the bottom of the screen keeps a running count, a live subtotal and your free-delivery progress.",
  },
  {
    step: "02",
    title: "Verify delivery",
    body: "Give us a name, a number, a zone and a real Lagos address with a landmark. We price the rider from your zone the moment you select it.",
  },
  {
    step: "03",
    title: "Confirm on WhatsApp",
    body: "Your order is written into our kitchen log and opened in WhatsApp as a formatted bill of materials. Hit send — we reply with payment and a dispatch time.",
  },
];

export const STORY_BEATS = [
  {
    year: "2014",
    title: "A kiosk on Adeniran Ajao",
    body: "Daphny fried dodo and peppered gizzard from a kiosk the size of a wardrobe. She sold out by 2pm every day and closed on Sundays to rest.",
  },
  {
    year: "2018",
    title: "The first wood-fire pit",
    body: "A kettle drum cut open, bricks stacked around it, and the first pot of party jollof that actually tasted like a party. Word travelled to the island.",
  },
  {
    year: "2022",
    title: "Mile 12 at 5am",
    body: "We stopped buying blended pepper from a supplier and started going to the market ourselves. Ugu, scent leaf, ehuru, utazi — chosen by hand, every morning.",
  },
  {
    year: "Today",
    title: "Delivering across Lagos",
    body: "Ten riders, two kitchens and a queue that reaches the junction every Friday. Same fire, same hands, same refusal to hold a pot over overnight.",
  },
];

export const GALLERY_IDS = [17952748, 35610087, 13915068, 20067063, 38638932, 12642132];

export const galleryPhoto = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=700&h=700`;
