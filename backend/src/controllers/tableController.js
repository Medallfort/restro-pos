import Table from "../models/Table.js";
import Order, { BILLABLE_STATUSES } from "../models/Order.js";
import AppError from "../utils/AppError.js";

export async function createTable(req, res) {
  const table = await Table.create(req.body);
  res.status(201).json({ success: true, message: "Table added!", data: table });
}

export async function listTables(req, res) {
  const tables = await Table.find()
    .sort({ tableNo: 1 })
    .populate({ path: "currentOrder", select: "customerDetails" });
  res.json({ success: true, data: tables });
}

export async function updateTable(req, res) {
  const table = await Table.findById(req.params.id);
  if (!table) throw new AppError(404, "Table not found");

  const { status, orderId } = req.body;
  if (status === "Booked" && orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError(404, "Order not found");
    table.currentOrder = order._id;
  }
  if (status === "Available") table.currentOrder = null;
  table.status = status;

  await table.save();
  res.json({ success: true, message: "Table updated", data: table });
}

// Historique dyal table: ga3 les commandes li dazo 3liha + résumé (ch7al, chiffre d'affaires...)
export async function getTableHistory(req, res) {
  const table = await Table.findById(req.params.id);
  if (!table) throw new AppError(404, "Table not found");

  const [orders, [summary]] = await Promise.all([
    Order.find({ table: table._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("servedBy", "name"),
    // Résumé: ghir les commandes confirmées (machi Pending wla Cancelled)
    Order.aggregate([
      { $match: { table: table._id, orderStatus: { $in: BILLABLE_STATUSES } } },
      {
        $group: {
          _id: null,
          ordersCount: { $sum: 1 },
          revenue: { $sum: "$bills.totalWithTax" },
          guests: { $sum: "$customerDetails.guests" },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      table,
      summary: {
        ordersCount: summary?.ordersCount ?? 0,
        revenue: summary?.revenue ?? 0,
        guests: summary?.guests ?? 0,
        lastOrderAt: summary?.lastOrderAt ?? null,
        since: table.createdAt,
      },
      orders,
    },
  });
}
