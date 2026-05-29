export const CATEGORIES = [
  "Electronics",
  "Phones",
  "Wallets",
  "IDs/Documents",
  "Bags",
  "Clothing",
  "Jewelry",
  "Keys",
  "Pets",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICONS: Record<Category, string> = {
  Electronics: "💻",
  Phones: "📱",
  Wallets: "👛",
  "IDs/Documents": "🪪",
  Bags: "🎒",
  Clothing: "🧥",
  Jewelry: "💍",
  Keys: "🔑",
  Pets: "🐾",
  Other: "📦",
};