// Menu initial (seed). Prix f DB houma l-source de verite, had l-fichier ghir l-awel mara.
const section = (category, items) => items.map(([name, price]) => ({ name, category, price }));

export const MENU_ITEMS = [
  ...section("Starters", [
    ["Salade Marocaine", 25],
    ["Zaalouk", 25],
    ["Taktouka", 25],
    ["Briouates Kefta", 35],
  ]),
  ...section("Soups", [
    ["Harira", 20],
    ["Bissara", 15],
  ]),
  ...section("Tagines", [
    ["Tajine Poulet Citron", 75],
    ["Tajine Kefta aux Oeufs", 65],
    ["Tajine Agneau Pruneaux", 95],
    ["Tajine Poisson", 85],
  ]),
  ...section("Couscous", [
    ["Couscous Sept Légumes", 70],
    ["Couscous Poulet Tfaya", 85],
    ["Seffa Medfouna", 80],
  ]),
  ...section("Specialties", [
    ["Pastilla Poulet", 80],
    ["Pastilla Fruits de Mer", 95],
    ["Rfissa", 85],
    ["Tanjia Marrakchia", 110],
    ["Méchoui", 120],
  ]),
  ...section("Grills", [
    ["Brochettes Kefta", 60],
    ["Brochettes Poulet", 55],
  ]),
  ...section("Pizzas", [
    ["Margherita Pizza", 60],
    ["Veg Supreme Pizza", 70],
    ["Pepperoni Pizza", 80],
  ]),
  ...section("Desserts", [
    ["Chebakia", 20],
    ["Cornes de Gazelle", 30],
    ["Baghrir au Miel", 20],
    ["Msemen au Miel", 20],
  ]),
  ...section("Beverages", [
    ["Thé à la Menthe", 15],
    ["Jus d'Orange", 20],
    ["Jus d'Avocat", 30],
    ["Café Noss Noss", 15],
    ["Eau Minérale", 10],
  ]),
];

// Menu l9dim (hindi). Seed kaykhbih (isActive: false) bla ma ymse7o: les commandes l9dam
// w l-revenue mrbotin b had les plats. Admin y9der y3awd y-activi chi wa7d mn Dashboard.
export const RETIRED_MENU_ITEMS = [
  "Paneer Tikka", "Chicken Tikka", "Tandoori Chicken", "Samosa", "Aloo Tikki", "Hara Bhara Kebab",
  "Butter Chicken", "Paneer Butter Masala", "Chicken Biryani", "Dal Makhani", "Kadai Paneer",
  "Rogan Josh", "Masala Chai", "Lemon Soda", "Mango Lassi", "Cold Coffee", "Fresh Lime Water",
  "Iced Tea", "Tomato Soup", "Sweet Corn Soup", "Hot & Sour Soup", "Chicken Clear Soup",
  "Mushroom Soup", "Lemon Coriander Soup", "Gulab Jamun", "Kulfi", "Chocolate Lava Cake",
  "Ras Malai", "Beer", "Whiskey", "Vodka", "Rum", "Tequila", "Cocktail", "Caesar Salad",
  "Greek Salad", "Fruit Salad", "Chicken Salad", "Tuna Salad",
];

export const TABLES = Array.from({ length: 12 }, (_, i) => ({
  tableNo: i + 1,
  seats: [2, 4, 4, 6][i % 4],
}));
