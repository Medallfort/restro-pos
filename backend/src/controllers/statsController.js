import Order, { BILLABLE_STATUSES } from "../models/Order.js";
import Table from "../models/Table.js";
import MenuItem from "../models/MenuItem.js";
import { round2 } from "../utils/money.js";

const billable = { orderStatus: { $in: BILLABLE_STATUSES } };

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// Ar9am dyal Home w Dashboard, m7sobin f DB (machi f l-frontend 3la 200 commande).
// Chiffre d'affaires kaychoufo ghir Admin.
export async function getStats(req, res) {
  const startOfDay = startOfToday();

  const [today, pending, inProgress, ready, totalTables, bookedTables, dishes, categories, popular] =
    await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay }, ...billable } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$bills.totalWithTax" },
            orders: { $sum: 1 },
            guests: { $sum: "$customerDetails.guests" },
          },
        },
      ]),
      Order.countDocuments({ orderStatus: "Pending" }),
      Order.countDocuments({ orderStatus: "In Progress" }),
      Order.countDocuments({ orderStatus: "Ready" }),
      Table.countDocuments(),
      Table.countDocuments({ status: "Booked" }),
      MenuItem.countDocuments({ isActive: true }),
      MenuItem.distinct("category", { isActive: true }),
      Order.aggregate([
        { $match: billable },
        { $unwind: "$items" },
        { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
        { $sort: { quantity: -1, _id: 1 } },
        { $limit: 10 },
      ]),
    ]);

  const todayStats = today[0] ?? { revenue: 0, orders: 0, guests: 0 };
  const isAdmin = req.user.role === "Admin";

  res.json({
    success: true,
    data: {
      ...(isAdmin && { todayRevenue: round2(todayStats.revenue) }),
      todayOrders: todayStats.orders,
      todayGuests: todayStats.guests,
      pending,
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

function periodStart(period) {
  const start = startOfToday();
  if (period === "week") start.setDate(start.getDate() - 6);
  if (period === "month") start.setDate(start.getDate() - 29);
  return period === "all" ? null : start;
}

const sumGroup = (key) => ({
  $group: {
    _id: key,
    orders: { $sum: 1 },
    revenue: { $sum: "$bills.totalWithTax" },
    guests: { $sum: "$customerDetails.guests" },
  },
});

const clean = ({ _id, revenue, ...rest }) => ({ ...rest, revenue: round2(revenue) });

// Rapport dyal l-arba7 (Admin): total, par table, par serveur, par type w par paiement
export async function getRevenueReport(req, res) {
  const { period } = req.validatedQuery;
  const start = periodStart(period);
  const match = { ...billable, ...(start && { createdAt: { $gte: start } }) };

  const [totals, byTable, byStaff, byType, byPayment] = await Promise.all([
    Order.aggregate([{ $match: match }, sumGroup(null)]),
    Order.aggregate([
      { $match: { ...match, table: { $ne: null } } },
      sumGroup("$table"),
      { $lookup: { from: "tables", localField: "_id", foreignField: "_id", as: "table" } },
      { $unwind: "$table" },
      { $sort: { revenue: -1 } },
    ]),
    Order.aggregate([
      { $match: match },
      sumGroup("$servedBy"),
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $sort: { revenue: -1 } },
    ]),
    // Les commandes 9dam (9bel orderType) kanou Dine In
    Order.aggregate([
      { $match: match },
      sumGroup({ $ifNull: ["$orderType", "Dine In"] }),
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $match: match }, sumGroup("$paymentMethod"), { $sort: { _id: 1 } }]),
  ]);

  res.json({
    success: true,
    data: {
      period,
      since: start,
      totals: clean(totals[0] ?? { revenue: 0, orders: 0, guests: 0 }),
      byTable: byTable.map(({ table, ...row }) => ({
        tableId: table._id,
        tableNo: table.tableNo,
        ...clean(row),
      })),
      byStaff: byStaff.map(({ user, ...row }) => ({
        userId: user?._id ?? null,
        name: user?.name ?? "Unknown",
        role: user?.role ?? null,
        ...clean(row),
      })),
      byType: byType.map((row) => ({ type: row._id, ...clean(row) })),
      byPayment: byPayment.map((row) => ({ method: row._id, ...clean(row) })),
    },
  });
}
