import Table from "../models/Table.js";
import Order from "../models/Order.js";
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
