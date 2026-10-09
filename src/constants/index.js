import butterChicken from '../assets/images/butter-chicken-4.jpg';
import palakPaneer from '../assets/images/Saag-Paneer-1.jpg';
import biryani from '../assets/images/hyderabadibiryani.jpg';
import masalaDosa from '../assets/images/masala-dosa.jpg';
import choleBhature from '../assets/images/chole-bhature.jpg';
import rajmaChawal from '../assets/images/rajma-chawal-1.jpg';
import paneerTikka from '../assets/images/paneer-tika.webp';
import gulabJamun from '../assets/images/gulab-jamun.webp';
import pooriSabji from '../assets/images/poori-sabji.webp';
import roganJosh from '../assets/images/rogan-josh.jpg';
import logo from '../assets/images/logo.png';

// Data (plats, prix, tables, commandes) kayji mn l-API. Hna ghir l-presentation.

const dishImages = {
  "butter chicken": butterChicken,
  "palak paneer": palakPaneer,
  "chicken biryani": biryani,
  "hyderabadi biryani": biryani,
  "masala dosa": masalaDosa,
  "chole bhature": choleBhature,
  "rajma chawal": rajmaChawal,
  "paneer tikka": paneerTikka,
  "gulab jamun": gulabJamun,
  "poori sabji": pooriSabji,
  "rogan josh": roganJosh,
};

export const getDishImage = (name) => dishImages[name?.toLowerCase()] ?? logo;

const categoryStyles = {
  "Starters": { bgColor: "#b73e3e", icon: "🍲" },
  "Main Course": { bgColor: "#5b45b0", icon: "🍛" },
  "Beverages": { bgColor: "#7f167f", icon: "🍹" },
  "Soups": { bgColor: "#735f32", icon: "🍜" },
  "Desserts": { bgColor: "#1d2569", icon: "🍰" },
  "Pizzas": { bgColor: "#285430", icon: "🍕" },
  "Alcoholic Drinks": { bgColor: "#b73e3e", icon: "🍺" },
  "Salads": { bgColor: "#5b45b0", icon: "🥗" },
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
