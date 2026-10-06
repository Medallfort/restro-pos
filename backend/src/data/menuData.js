// Menu initial (seed). Prix f DB houma l-source de verite, had l-fichier ghir l-awel mara.
const section = (category, items) => items.map(([name, price]) => ({ name, category, price }));

export const MENU_ITEMS = [
  ...section("Starters", [
    ["Paneer Tikka", 250],
    ["Chicken Tikka", 300],
    ["Tandoori Chicken", 350],
    ["Samosa", 100],
    ["Aloo Tikki", 120],
    ["Hara Bhara Kebab", 220],
  ]),
  ...section("Main Course", [
    ["Butter Chicken", 400],
    ["Paneer Butter Masala", 350],
    ["Chicken Biryani", 450],
    ["Dal Makhani", 180],
    ["Kadai Paneer", 300],
    ["Rogan Josh", 500],
  ]),
  ...section("Beverages", [
    ["Masala Chai", 50],
    ["Lemon Soda", 80],
    ["Mango Lassi", 120],
    ["Cold Coffee", 150],
    ["Fresh Lime Water", 60],
    ["Iced Tea", 100],
  ]),
  ...section("Soups", [
    ["Tomato Soup", 120],
    ["Sweet Corn Soup", 130],
    ["Hot & Sour Soup", 140],
    ["Chicken Clear Soup", 160],
    ["Mushroom Soup", 150],
    ["Lemon Coriander Soup", 110],
  ]),
  ...section("Desserts", [
    ["Gulab Jamun", 100],
    ["Kulfi", 150],
    ["Chocolate Lava Cake", 250],
    ["Ras Malai", 180],
  ]),
  ...section("Pizzas", [
    ["Margherita Pizza", 350],
    ["Veg Supreme Pizza", 400],
    ["Pepperoni Pizza", 450],
  ]),
  ...section("Alcoholic Drinks", [
    ["Beer", 200],
    ["Whiskey", 500],
    ["Vodka", 450],
    ["Rum", 350],
    ["Tequila", 600],
    ["Cocktail", 400],
  ]),
  ...section("Salads", [
    ["Caesar Salad", 200],
    ["Greek Salad", 250],
    ["Fruit Salad", 150],
    ["Chicken Salad", 300],
    ["Tuna Salad", 350],
  ]),
];

export const TABLES = Array.from({ length: 12 }, (_, i) => ({
  tableNo: i + 1,
  seats: [2, 4, 4, 6][i % 4],
}));
