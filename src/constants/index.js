import logo from '../assets/images/logo.png';

// Data (plats, prix, tables, commandes) kayji mn l-API. Hna ghir l-presentation.

// Tsawer dyal les plats: kol fichier f assets/images/menu kaykhdem b smiya dyalo
// (ex: "tajine-poulet-citron.jpg"). Sources w licenses f assets/images/menu/CREDITS.md
const menuPhotos = import.meta.glob('../assets/images/menu/*.jpg', { eager: true, import: 'default' });
const photo = (slug) => menuPhotos[`../assets/images/menu/${slug}.jpg`];

const dishImages = {
  "salade marocaine": photo("salade-marocaine"),
  "zaalouk": photo("zaalouk"),
  "harira": photo("harira"),
  "bissara": photo("bissara"),
  "tajine poulet citron": photo("tajine-poulet-citron"),
  "tajine agneau pruneaux": photo("tajine-pruneaux"),
  "couscous sept légumes": photo("couscous"),
  "seffa medfouna": photo("seffa"),
  "pastilla poulet": photo("pastilla-poulet"),
  "rfissa": photo("rfissa"),
  "tanjia marrakchia": photo("tanjia"),
  "méchoui": photo("mechoui"),
  "brochettes kefta": photo("brochettes-kefta"),
  "chebakia": photo("chebakia"),
  "cornes de gazelle": photo("cornes-gazelle"),
  "baghrir au miel": photo("baghrir"),
  "msemen au miel": photo("msemen"),
  "thé à la menthe": photo("the-menthe"),
  "jus d'orange": photo("jus-orange"),
};

// Tswira dyal l-plat, wla null ila ma3ndoch
export const findDishImage = (name) => dishImages[name?.toLowerCase()] ?? null;

export const getDishImage = (name) => findDishImage(name) ?? logo;

const categoryStyles = {
  "Starters": { bgColor: "#285430", icon: "🥗" },
  "Soups": { bgColor: "#735f32", icon: "🍲" },
  "Tagines": { bgColor: "#b73e3e", icon: "🥘" },
  "Couscous": { bgColor: "#5b45b0", icon: "🍛" },
  "Specialties": { bgColor: "#7f167f", icon: "🥧" },
  "Grills": { bgColor: "#be3e3f", icon: "🍢" },
  "Pizzas": { bgColor: "#025cca", icon: "🍕" },
  "Desserts": { bgColor: "#1d2569", icon: "🍯" },
  "Beverages": { bgColor: "#285430", icon: "🍵" },
};

// Tartib dyal les categories f l-menu (jdad kayjiw f l-lekher)
export const categoryRank = (category) => {
  const index = Object.keys(categoryStyles).indexOf(category);
  return index === -1 ? Infinity : index;
};

const fallbackColors = ["#025cca", "#285430", "#735f32", "#7f167f", "#1d2569"];

export const getCategoryStyle = (category, index = 0) =>
  categoryStyles[category] ?? { bgColor: fallbackColors[index % fallbackColors.length], icon: "🍽️" };

export const ORDER_STATUSES = ["Pending", "In Progress", "Ready", "Completed", "Cancelled"];
export const ROLES = ["Admin", "Cashier", "Waiter", "Client"];
export const STAFF_ROLES = ["Admin", "Cashier", "Waiter"];
export const ORDER_TYPES = ["Dine In", "Takeaway"];

// Nefs les règles dyal backend (models/Order.js): chmen statut y9der yji mn b3d kol wa7d
export const STATUS_TRANSITIONS = {
  Pending: ["In Progress", "Cancelled"],
  "In Progress": ["Ready", "Completed", "Cancelled"],
  Ready: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};
