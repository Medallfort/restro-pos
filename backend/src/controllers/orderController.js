import Order, { STATUS_TRANSITIONS } from "../models/Order.js";
import Table from "../models/Table.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { computeBill } from "../utils/pricing.js";
import { notifyOrders } from "../realtime/events.js";
import { addPoints, discountFor, pointsEarnedFor, spendPoints } from "../utils/loyalty.js";

async function findTable({ table, tableNo }) {
  const found = table ? await Table.findById(table) : await Table.findOne({ tableNo });
  if (!found) throw new AppError(404, tableNo ? `Table ${tableNo} not found` : "Table not found");
  if (found.status === "Booked") throw new AppError(409, `Table ${found.tableNo} is already booked`);
  return found;
}

// Table kat-t7rr ghir ila had l-commande hiya li 7ajzaha
async function releaseTable(order) {
  if (!order.table) return;
  const table = await Table.findById(order.table);
  if (table?.currentOrder?.equals(order._id)) {
    table.status = "Available";
    table.currentOrder = null;
    await table.save();
  }
}

export async function createOrder(req, res) {
  const { items, orderType, paymentMethod } = req.body;
  const isClient = req.user.role === "Client";
  const redeemPoints = req.body.redeemPoints ?? 0;
  // Points dyal compte client: serveur ma y9derch ystkhdemhom f commande dyal walk-in
  if (redeemPoints > 0 && !isClient) {
    throw new AppError(400, "Only customers can use loyalty points");
  }

  const table = orderType === "Dine In" ? await findTable(req.body) : null;
  const { items: pricedItems, bills } = await computeBill(items, {
    discount: discountFor(redeemPoints),
  });

  // Client: smiya w tel mn compte dyalo. Commande dyalo katsenna serveur y-confirmiha
  const customerDetails = isClient
    ? { name: req.user.name, phone: req.user.phone, guests: req.body.customerDetails.guests }
    : req.body.customerDetails;

  // Points kayt9esso 9bel l-commande, w kayrj3o ila l-commande tfaylat
  if (redeemPoints > 0) await spendPoints(req.user._id, redeemPoints);
  let order;
  try {
    order = await Order.create({
      customerDetails,
      orderType,
      orderStatus: isClient ? "Pending" : "In Progress",
      items: pricedItems,
      bills,
      table: table?._id ?? null,
      paymentMethod,
      loyalty: { pointsRedeemed: redeemPoints },
      createdBy: req.user._id,
      servedBy: isClient ? null : req.user._id,
    });
  } catch (error) {
    await addPoints(req.user._id, redeemPoints);
    throw error;
  }

  // Table kat-t7jez direct (7ta commande Pending), bach ma ydkhelch 3liha chi wa7d akhor
  if (table) {
    table.status = "Booked";
    table.currentOrder = order._id;
    await table.save();
  }

  await order.populate("table", "tableNo");
  notifyOrders(order.createdBy);
  res.status(201).json({ success: true, message: "Order created!", data: order });
}

export async function listOrders(req, res) {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("table", "tableNo")
    .populate("servedBy", "name");
  res.json({ success: true, data: orders });
}

// Client: ghir les commandes dyalo
export async function listMyOrders(req, res) {
  const orders = await Order.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("table", "tableNo")
    .populate("servedBy", "name");
  res.json({ success: true, data: orders });
}

// Fidélité: commande salat -> client kayrb7 points 3la li khlles; tlghat -> kayrj3o lih
// les points li khdem bihom. Ghir commandes dyal comptes Client (machi walk-in dyal serveur)
async function applyLoyalty(order) {
  if (order.orderStatus === "Cancelled") {
    await addPoints(order.createdBy, order.loyalty?.pointsRedeemed ?? 0);
    return;
  }
  if (order.orderStatus !== "Completed") return;

  const owner = await User.findById(order.createdBy);
  if (owner?.role !== "Client") return;

  const earned = pointsEarnedFor(order.bills.totalWithTax);
  order.loyalty.pointsEarned = earned;
  await order.save();
  await addPoints(owner._id, earned);
}

export async function updateOrderStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, "Order not found");

  const next = req.body.orderStatus;
  if (!STATUS_TRANSITIONS[order.orderStatus].includes(next)) {
    throw new AppError(409, `Cannot change an order from ${order.orderStatus} to ${next}`);
  }

  const update = { orderStatus: next };
  // Serveur li confirma commande dyal client howa li kaytsjjel "servedBy"
  if (!order.servedBy && next !== "Cancelled") update.servedBy = req.user._id;

  // Atomique: ghir ila statut mazal howa li 9rina. Jouj serveurs kaybeddlo nefs l-commande
  // f nefs l-we9t -> wa7ed bo7do li kaynje7 (sinon points ytzado jouj merrat)
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, orderStatus: order.orderStatus },
    { $set: update },
    { returnDocument: "after" }
  );
  if (!updated) throw new AppError(409, "This order was just updated, refresh and try again");

  await applyLoyalty(updated);

  // Commande salat wla tlghat: table katwelli khawya
  if (next === "Completed" || next === "Cancelled") await releaseTable(updated);

  notifyOrders(updated.createdBy);
  res.json({ success: true, message: "Order updated", data: updated });
}
