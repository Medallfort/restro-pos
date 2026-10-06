import Order from "../models/Order.js";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";
import { round2 } from "../utils/money.js";

// Ar9am dyal Home w Dashboard, m7sobin f DB (machi f l-frontend 3la 200 commande)
export async function getStats(req, res) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [today, inProgress, ready, totalTables, bookedTables, dishes, categories, popular] =
    await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$bills.totalWithTax" },
            orders: { $sum: 1 },
            guests: { $sum: "$customerDetails.guests" },
          },
        },
      ]),
      Order.countDocuments({ orderStatus: "In Progress" }),
      Order.countDocuments({ orderStatus: "Ready" }),
      Table.countDocuments(),
      Table.countDocuments({ status: "Booked" }),
      MenuItem.countDocuments({ isActive: true }),
      MenuItem.distinct("category", { isActive: true }),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
        { $sort: { quantity: -1, _id: 1 } },
        { $limit: 10 },
      ]),
    ]);

  const todayStats = today[0] ?? { revenue: 0, orders: 0, guests: 0 };

  res.json({
    success: true,
    data: {
      todayRevenue: round2(todayStats.revenue),
      todayOrders: todayStats.orders,
      todayGuests: todayStats.guests,
      inProgress,
      ready,
      totalTables,
      bookedTables,
      dishes,
      categories: categories.length,
      popularDishes: popular.map(({ _id, quantity }) => ({ name: _id, quantity })),
    },
  });
}
