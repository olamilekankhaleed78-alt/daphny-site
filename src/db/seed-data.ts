import type { SiteSettings } from "@/lib/types";
import {
  DELIVERY_ZONES,
  MENU_CATEGORIES,
  type DeliveryZone,
} from "@/lib/helpers";

/** Pexels CDN helper — keeps the seed readable. */
const photo = (id: number, w = 900, h = 620) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export interface SeedMenuItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  imageUrl: string;
  isAvailable: boolean;
  isSignature: boolean;
  spiceLevel: number;
  prepMinutes: number;
  sortOrder: number;
}

export const DELIVERY_FEE_TABLE: Record<DeliveryZone, number> = {
  Lekki: 3000,
  Ikoyi: 3000,
  "Victoria Island": 3000,
  Ikeja: 2500,
  Ajah: 4000,
  Surulere: 1500,
  Yaba: 2000,
  Maryland: 2500,
  Gbagada: 2500,
  Other: 4500,
};

export const DEFAULT_SETTINGS: SiteSettings = {
  business_name: "Daphny Dodo Cuisine",
  phone_number: "+234 913 332 1505",
  email: "hello@daphnydodo.ng",
  address: "14 Adeniran Ajao Road, Surulere, Lagos",
  opening_hours: "Monday – Sunday · 11:00 AM – 10:00 PM",
  kitchen_close: "9:30 PM",
  hero_eyebrow: "Surulere wood-fire kitchen · Island & mainland dispatch",
  hero_title: "Lagos runs on this pot of jollof.",
  hero_subtitle:
    "Small-batch Nigerian cooking fired over wood every single morning. Egusi, ofada, suya and the smokiest party jollof on the island — build your order here, confirm on WhatsApp, eat inside the hour.",
  hero_image_url: "/images/hero-spread.jpg",
  announcement:
    "Free delivery above ₦40,000 · Kitchen closes 9:30 PM · We cook in small batches, so pre-order for parties",
  about_title: "Two pots, one fire, no shortcuts.",
  about_body:
    "Daphny started selling dodo and peppered gizzard from a kiosk on Adeniran Ajao Road in 2014. Ten years later the kiosk is a kitchen, the kettle drum is a wood-fire pit, and the queue stretches to the junction every Friday. We still buy our pepper at Mile 12 at 5am, still pound our own egusi, and still refuse to hold a pot over until the next day.",
  chef_name: "Daphny Okoro",
  chef_quote:
    "If the smoke does not enter the rice, you have only cooked tomato and water.",
  chef_image_url: photo(27617687, 900, 1100),
  kitchen_image_url: photo(36874376, 900, 1100),
  market_image_url: photo(15171155, 900, 700),
  delivery_eta: "45 – 75 minutes",
  min_order: "2500",
  free_delivery_threshold: "40000",
  delivery_fees: JSON.stringify(DELIVERY_FEE_TABLE),
  payment_info:
    "Bank transfer to Daphny Dodo Cuisine · GTBank 0123456789 · Pay on confirmation. Cash on delivery available inside Surulere, Yaba and Ikeja.",
  instagram_url: "https://instagram.com/daphnydodocuisine",
  facebook_url: "https://facebook.com/daphnydodocuisine",
  nextorder_url: "",
};

export interface SeedOrder {
  id: string;
  reference: string;
  customerName: string;
  phone: string;
  address: string;
  zone: string;
  note: string;
  items: { title: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  waDispatched: boolean;
  minutesAgo: number;
}

/** First-run order log so the kitchen console is never an empty room. */
export const SEED_ORDERS: SeedOrder[] = [
  {
    id: "ord_demo_surulere",
    reference: "DDC-2K8W5R",
    customerName: "Ifeanyi Nwosu",
    phone: "08122334455",
    address: "9 Bode Thomas Street, Surulere, beside the pharmacy, black gate",
    zone: "Surulere",
    note: "Please call when the rider reaches the junction.",
    items: [
      { title: "Ofada Rice & Ayamase Sauce", quantity: 1, price: 6500 },
      { title: "Grilled Tilapia & Dodo", quantity: 1, price: 8500 },
    ],
    subtotal: 15000,
    deliveryFee: 1500,
    total: 16500,
    status: "pending",
    waDispatched: false,
    minutesAgo: 4,
  },
  {
    id: "ord_demo_lekki",
    reference: "DDC-4F2K9A",
    customerName: "Chidinma Adeyemi",
    phone: "08033112244",
    address: "12B Admiralty Way, Lekki Phase 1, above Sweet Sensation",
    zone: "Lekki",
    note: "Extra ata dindin on the side, no coleslaw.",
    items: [
      { title: "Smoky Party Jollof Rice", quantity: 2, price: 5000 },
      { title: "Beef Suya Skewers", quantity: 1, price: 4500 },
      { title: "Zobo (Hibiscus & Ginger)", quantity: 2, price: 1500 },
    ],
    subtotal: 17500,
    deliveryFee: 3000,
    total: 20500,
    status: "dispatched",
    waDispatched: true,
    minutesAgo: 118,
  },
  {
    id: "ord_demo_ikeja",
    reference: "DDC-7M1Q3Z",
    customerName: "Tunde Bakare",
    phone: "08155667788",
    address: "8 Oba Akran Avenue, Ikeja GRA, gate 3, second floor",
    zone: "Ikeja",
    note: "",
    items: [
      { title: "Egusi Soup & Pounded Yam", quantity: 1, price: 6500 },
      { title: "Assorted Meat Bowl", quantity: 1, price: 3000 },
      { title: "Puff Puff (6 pieces)", quantity: 1, price: 2000 },
    ],
    subtotal: 11500,
    deliveryFee: 2500,
    total: 14000,
    status: "cooking",
    waDispatched: true,
    minutesAgo: 305,
  },
  {
    id: "ord_demo_vi",
    reference: "DDC-9P6T2L",
    customerName: "Amaka Obi",
    phone: "07066554433",
    address: "Flat 4, 22 Kofo Abayomi Street, Victoria Island",
    zone: "Victoria Island",
    note: "Birthday dinner — please pack the puff puff separately.",
    items: [
      { title: "Daphny Family Feast (serves 6)", quantity: 1, price: 28000 },
      { title: "Virgin Chapman", quantity: 4, price: 2500 },
      { title: "Puff Puff (6 pieces)", quantity: 2, price: 2000 },
    ],
    subtotal: 42000,
    deliveryFee: 0,
    total: 42000,
    status: "completed",
    waDispatched: true,
    minutesAgo: 1520,
  },
];

export const SEED_MENU: SeedMenuItem[] = [
  /* ── Soups & Swallows ── */
  {
    id: "egusi-pounded-yam",
    title: "Egusi Soup & Pounded Yam",
    description:
      "Melon seed ground in-house, simmered in red palm oil with ugu, assorted meat, stockfish and ponmo. Served with a fist-sized wrap of smooth pounded yam.",
    price: 6500,
    category: MENU_CATEGORIES[0],
    tags: ["Wood fire", "Assorted meat", "Best seller"],
    imageUrl: photo(37648018),
    isAvailable: true,
    isSignature: true,
    spiceLevel: 2,
    prepMinutes: 30,
    sortOrder: 1,
  },
  {
    id: "efo-riro-amala",
    title: "Efo Riro & Amala",
    description:
      "Spinach and scent leaf braised in locust bean, pepper and palm oil with smoked fish. Comes with a soft, dark amala ball.",
    price: 5500,
    category: MENU_CATEGORIES[0],
    tags: ["Smoked fish", "Iru", "Leafy"],
    imageUrl: photo(37648019),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 2,
    prepMinutes: 25,
    sortOrder: 2,
  },
  {
    id: "banga-starch",
    title: "Banga Soup & Starch",
    description:
      "Palm fruit concentrate cooked slow with beletete, banga spice and fresh catfish. Paired with Delta-style starch.",
    price: 6000,
    category: MENU_CATEGORIES[0],
    tags: ["Delta style", "Catfish", "Banga spice"],
    imageUrl: photo(9546273),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 1,
    prepMinutes: 30,
    sortOrder: 3,
  },
  {
    id: "oha-fufu",
    title: "Oha Soup & Fufu",
    description:
      "Torn oha leaves thickened with cocoyam paste, loaded with goat meat and dried fish. Fufu fermented overnight.",
    price: 6200,
    category: MENU_CATEGORIES[0],
    tags: ["Cocoyam", "Goat meat", "Classic"],
    imageUrl: photo(34822475),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 2,
    prepMinutes: 30,
    sortOrder: 4,
  },
  {
    id: "goat-pepper-soup",
    title: "Goat Pepper Soup & Agidi",
    description:
      "Clear, scalding broth with utazi, ehuru and calabash nutmeg. Goat on the bone. Agidi (eka) on the side to soak it up.",
    price: 5800,
    category: MENU_CATEGORIES[0],
    tags: ["Utazi", "Light", "Late night"],
    imageUrl: photo(27397344),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 3,
    prepMinutes: 20,
    sortOrder: 5,
  },
  {
    id: "afang-garri",
    title: "Afang Soup & Garri",
    description:
      "Waterleaf and afang pounded together with periwinkle, pomo and beef. Rich, green and heavy on the spoon.",
    price: 6800,
    category: MENU_CATEGORIES[0],
    tags: ["Periwinkle", "Efik", "Pomo"],
    imageUrl: photo(8024112),
    isAvailable: false,
    isSignature: false,
    spiceLevel: 2,
    prepMinutes: 35,
    sortOrder: 6,
  },

  /* ── Rice Dishes ── */
  {
    id: "smoky-party-jollof",
    title: "Smoky Party Jollof Rice",
    description:
      "Long grain parboiled in a pepper-onyon base and finished over open wood so the bottom of the pot catches. That smoke is the whole point.",
    price: 5000,
    category: MENU_CATEGORIES[1],
    tags: ["Wood fire", "Smoky", "Best seller"],
    imageUrl: photo(17952748),
    isAvailable: true,
    isSignature: true,
    spiceLevel: 2,
    prepMinutes: 25,
    sortOrder: 7,
  },
  {
    id: "jollof-grilled-chicken",
    title: "Jollof & Grilled Chicken Quarter",
    description:
      "Our party jollof with a charcoal-grilled chicken quarter brushed in suya butter, plus dodo and coleslaw.",
    price: 6500,
    category: MENU_CATEGORIES[1],
    tags: ["Charcoal", "Dodo", "Coleslaw"],
    imageUrl: photo(40262791),
    isAvailable: true,
    isSignature: true,
    spiceLevel: 2,
    prepMinutes: 30,
    sortOrder: 8,
  },
  {
    id: "coconut-fried-rice",
    title: "Coconut Fried Rice",
    description:
      "Fried rice tossed in fresh coconut milk with carrot, green peas, sweetcorn and diced liver.",
    price: 4800,
    category: MENU_CATEGORIES[1],
    tags: ["Coconut milk", "Mild", "Kids friendly"],
    imageUrl: photo(17952745),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 0,
    prepMinutes: 25,
    sortOrder: 9,
  },
  {
    id: "ofada-ayamase",
    title: "Ofada Rice & Ayamase Sauce",
    description:
      "Unpolished local rice steamed with locust bean, served with green ata dindin designer stew, boiled egg and panla.",
    price: 6500,
    category: MENU_CATEGORIES[1],
    tags: ["Ata dindin", "Hot", "Boiled egg"],
    imageUrl: photo(17952746),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 3,
    prepMinutes: 30,
    sortOrder: 10,
  },
  {
    id: "white-rice-stew",
    title: "White Rice & Tomato Stew",
    description:
      "Plain basmati with our Sunday beef stew — blended tomato, tatashe and scotch bonnet reduced for four hours.",
    price: 3800,
    category: MENU_CATEGORIES[1],
    tags: ["Everyday", "Beef stew", "Budget"],
    imageUrl: photo(18805640),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 1,
    prepMinutes: 20,
    sortOrder: 11,
  },

  /* ── Grills & BBQ ── */
  {
    id: "beef-suya-skewers",
    title: "Beef Suya Skewers",
    description:
      "Thin-shaved beef loin rolled in our own yaji — groundnut, ginger, cayenne and cloves — grilled over coal until the edges char.",
    price: 4500,
    category: MENU_CATEGORIES[2],
    tags: ["Yaji spice", "Coal grill", "Street classic"],
    imageUrl: photo(35610087),
    isAvailable: true,
    isSignature: true,
    spiceLevel: 3,
    prepMinutes: 20,
    sortOrder: 12,
  },
  {
    id: "grilled-tilapia-dodo",
    title: "Grilled Tilapia & Dodo",
    description:
      "Whole tilapia scored and stuffed with pepper, onion and garlic, grilled till the skin blisters. Served with fried plantain and ata dindin.",
    price: 8500,
    category: MENU_CATEGORIES[2],
    tags: ["Whole fish", "Pepper sauce", "For two"],
    imageUrl: photo(20067063),
    isAvailable: true,
    isSignature: true,
    spiceLevel: 3,
    prepMinutes: 35,
    sortOrder: 13,
  },
  {
    id: "peppered-asun",
    title: "Peppered Asun (Goat)",
    description:
      "Roasted goat diced and flash-fried in ata dindin with onion and green pepper. Order double — you will want double.",
    price: 7000,
    category: MENU_CATEGORIES[2],
    tags: ["Very hot", "Goat", "Bar snack"],
    imageUrl: photo(29259327),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 4,
    prepMinutes: 25,
    sortOrder: 14,
  },
  {
    id: "grilled-chicken-quarter",
    title: "Charcoal Chicken Quarter",
    description:
      "Marinated 12 hours in yoghurt, ginger and suya spice, then grilled low and slow over charcoal.",
    price: 6000,
    category: MENU_CATEGORIES[2],
    tags: ["12hr marinade", "Charcoal"],
    imageUrl: photo(37080253),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 2,
    prepMinutes: 30,
    sortOrder: 15,
  },
  {
    id: "catfish-pepper-grill",
    title: "Catfish Pepper Grill & Chips",
    description:
      "Fresh catfish fillet in a smoked pepper glaze, grilled and served with hand-cut chips and lemon.",
    price: 7500,
    category: MENU_CATEGORIES[2],
    tags: ["Fresh catch", "Lemon", "Chips"],
    imageUrl: photo(29852479),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 2,
    prepMinutes: 30,
    sortOrder: 16,
  },

  /* ── Appetizers & Sides ── */
  {
    id: "dodo-fried-plantain",
    title: "Dodo — Fried Plantain",
    description:
      "Overripe plantain sliced thick and fried in oil hot enough to caramelise the edges but keep the middle soft.",
    price: 1800,
    category: MENU_CATEGORIES[3],
    tags: ["Sweet", "Vegetarian", "Add-on"],
    imageUrl: photo(14090826),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 0,
    prepMinutes: 10,
    sortOrder: 17,
  },
  {
    id: "moi-moi",
    title: "Moi Moi Elewe",
    description:
      "Steamed bean pudding wrapped in uma leaf with mackerel, boiled egg and red pepper. Three wraps per portion.",
    price: 1500,
    category: MENU_CATEGORIES[3],
    tags: ["Steamed", "Mackerel", "Three wraps"],
    imageUrl: photo(37019704),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 1,
    prepMinutes: 15,
    sortOrder: 18,
  },
  {
    id: "akara-pap",
    title: "Akara & Pap",
    description:
      "Six bean fritters fried to order with a cup of warm ogi. The proper Saturday morning.",
    price: 2000,
    category: MENU_CATEGORIES[3],
    tags: ["Breakfast", "Fried to order"],
    imageUrl: photo(37178844),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 1,
    prepMinutes: 15,
    sortOrder: 19,
  },
  {
    id: "side-board",
    title: "The Side Board (for 3)",
    description:
      "A sharing board of dodo, akara, moi moi and peppered gizzard with ata dindin for dipping.",
    price: 5500,
    category: MENU_CATEGORIES[3],
    tags: ["Sharing", "Gizzard", "Dip"],
    imageUrl: photo(36458103),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 2,
    prepMinutes: 20,
    sortOrder: 20,
  },

  /* ── Proteins & Add-Ons ── */
  {
    id: "assorted-meat-bowl",
    title: "Assorted Meat Bowl",
    description:
      "Shaki, ponmo, cow foot and roundabout braised in pepper and locust bean. Adds serious weight to any swallow.",
    price: 3000,
    category: MENU_CATEGORIES[4],
    tags: ["Shaki", "Ponmo", "Cow foot"],
    imageUrl: photo(12642132),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 2,
    prepMinutes: 15,
    sortOrder: 21,
  },
  {
    id: "grilled-tiger-prawns",
    title: "Grilled Tiger Prawns",
    description:
      "Six jumbo prawns in garlic-suya butter, chargrilled and finished with lime.",
    price: 7500,
    category: MENU_CATEGORIES[4],
    tags: ["Seafood", "Garlic butter", "Lime"],
    imageUrl: photo(5041489),
    isAvailable: false,
    isSignature: false,
    spiceLevel: 1,
    prepMinutes: 20,
    sortOrder: 22,
  },
  {
    id: "goat-stockfish-addon",
    title: "Goat & Stockfish Add-On",
    description:
      "Two pieces of bone-in goat plus a stockfish head for your soup or rice. The reason people come back.",
    price: 4000,
    category: MENU_CATEGORIES[4],
    tags: ["Bone-in", "Stockfish", "Add-on"],
    imageUrl: photo(15648991),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 2,
    prepMinutes: 10,
    sortOrder: 23,
  },

  /* ── Beverages ── */
  {
    id: "zobo-hibiscus",
    title: "Zobo (Hibiscus & Ginger)",
    description:
      "Hibiscus steeped with pineapple skin, ginger and clove. Lightly sweetened, served over crushed ice. 75cl bottle.",
    price: 1500,
    category: MENU_CATEGORIES[5],
    tags: ["No alcohol", "Iced", "75cl"],
    imageUrl: photo(38638932),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 0,
    prepMinutes: 5,
    sortOrder: 24,
  },
  {
    id: "virgin-chapman",
    title: "Virgin Chapman",
    description:
      "Blackcurrant, grenadine, lemon, cucumber and bitters over ice with a fizz top. The Lagos classic, minus the gin.",
    price: 2500,
    category: MENU_CATEGORIES[5],
    tags: ["Cucumber", "Fizzy", "Signature drink"],
    imageUrl: photo(30591632),
    isAvailable: true,
    isSignature: true,
    spiceLevel: 0,
    prepMinutes: 5,
    sortOrder: 25,
  },
  {
    id: "pineapple-ginger-juice",
    title: "Pineapple & Ginger Juice",
    description:
      "Cold-pressed pineapple with a serious hit of raw ginger. No added sugar.",
    price: 1800,
    category: MENU_CATEGORIES[5],
    tags: ["Cold pressed", "No sugar"],
    imageUrl: photo(34481088),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 1,
    prepMinutes: 5,
    sortOrder: 26,
  },
  {
    id: "kunun-aya",
    title: "Iced Kunun Aya",
    description:
      "Tiger nut milk blended with dates and a whisper of coconut. Creamy, dairy-free, northern style.",
    price: 1500,
    category: MENU_CATEGORIES[5],
    tags: ["Tiger nut", "Dairy free", "Northern"],
    imageUrl: photo(37680620),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 0,
    prepMinutes: 5,
    sortOrder: 27,
  },

  /* ── Desserts ── */
  {
    id: "puff-puff-6",
    title: "Puff Puff (6 pieces)",
    description:
      "Yeast-raised, golden and hollow in the middle. Rolled in caster sugar while still hot.",
    price: 2000,
    category: MENU_CATEGORIES[6],
    tags: ["Fried fresh", "Sweet", "Six pieces"],
    imageUrl: photo(13915068),
    isAvailable: true,
    isSignature: true,
    spiceLevel: 0,
    prepMinutes: 12,
    sortOrder: 28,
  },
  {
    id: "puff-puff-pap",
    title: "Puff Puff, Pap & Condensed Milk",
    description:
      "Warm ogi poured with condensed milk and a side of six puff puff. Sunday dessert, settled.",
    price: 2500,
    category: MENU_CATEGORIES[6],
    tags: ["Warm", "Condensed milk"],
    imageUrl: photo(37324435),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 0,
    prepMinutes: 12,
    sortOrder: 29,
  },
  {
    id: "choco-puff-puff",
    title: "Chocolate Puff Puff Bites",
    description:
      "Twelve mini puff puff drizzled with dark chocolate and a pinch of sea salt. Party tray favourite.",
    price: 2800,
    category: MENU_CATEGORIES[6],
    tags: ["Party tray", "Dark chocolate"],
    imageUrl: photo(13988855),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 0,
    prepMinutes: 15,
    sortOrder: 30,
  },

  /* ── Specials ── */
  {
    id: "family-feast-platter",
    title: "Daphny Family Feast (serves 6)",
    description:
      "Jollof, fried rice, egusi with pounded yam, grilled chicken, assorted meat, dodo, moi moi and six zobo. Everything on the board.",
    price: 28000,
    category: MENU_CATEGORIES[7],
    tags: ["Serves 6", "Everything", "Party"],
    imageUrl: photo(13994299),
    isAvailable: true,
    isSignature: true,
    spiceLevel: 2,
    prepMinutes: 60,
    sortOrder: 31,
  },
  {
    id: "ofada-board-two",
    title: "Sunday Ofada Board (for 2)",
    description:
      "Ofada rice, ayamase designer stew, grilled chicken skewers, whole fish, boiled egg and a jug of zobo.",
    price: 12500,
    category: MENU_CATEGORIES[7],
    tags: ["For two", "Ayamase", "Sunday"],
    imageUrl: photo(13915043),
    isAvailable: true,
    isSignature: false,
    spiceLevel: 3,
    prepMinutes: 45,
    sortOrder: 32,
  },
  {
    id: "jollof-party-pot",
    title: "Wood-Fire Jollof Party Pot (20 plates)",
    description:
      "A full kettle drum of party jollof cooked over wood for your event, with 20 assorted proteins and dodo. 48-hour notice required.",
    price: 65000,
    category: MENU_CATEGORIES[7],
    tags: ["Events", "48hr notice", "20 plates"],
    imageUrl: photo(36707708),
    isAvailable: true,
    isSignature: true,
    spiceLevel: 2,
    prepMinutes: 180,
    sortOrder: 33,
  },
];
