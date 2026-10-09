import Order, { STATUS_TRANSITIONS } from "../models/Order.js";
import Payment from "../models/Payment.js";
import Table from "../models/Table.js";
import AppError from "../utils/AppError.js";
import { computeBill } from "../utils/pricing.js";
import { toMinorUnits } from "../utils/money.js";

// Kat7jez paiement b tari9a atomique (paid -> used): ila jouj requetes jaw f nefs l-we9t
// b nefs paiement, wa7da bo7dha li ghadi tnje7 (protection men replay).
// createdBy: paiement khasso ykoun dyal nefs l-compte (client ma y9derch yst3ml paiement dyal chi wa7d akhor)
async function claimVerifiedPayment(paymentData, expectedTotal, userId) {
  if (!paymentData?.razorpay_order_id) throw new AppError(400, "Missing payment data");

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: paymentData.razorpay_order_id, status: "paid", createdBy: userId },
    { $set: { status: "used" } },
    { returnDocument: "after" }
  );
  if (!payment) throw new AppError(402, "Payment not verified");

  if (payment.amount !== toMinorUnits(expectedTotal)) {
    payment.status = "paid";
    await payment.save();
    throw new AppError(400, "Payment amount does not match order total");
  }
  return payment;
}

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
  const { items, orderType, paymentMethod, paymentData } = req.body;
  const isClient = req.user.role === "Client";

  const table = orderType === "Dine In" ? await findTable(req.body) : null;
  const { items: pricedItems, bills } = await computeBill(items);

  const payment =
    paymentMethod === "Online"
      ? await claimVerifiedPayment(paymentData, bills.totalWithTax, req.user._id)
      : null;

  // Client: smiya w tel mn compte dyalo. Commande dyalo katsenna serveur y-confirmiha
  const customerDetails = isClient
    ? { name: req.user.name, phone: req.user.phone, guests: req.body.customerDetails.guests }
    : req.body.customerDetails;

  const order = await Order.create({
    customerDetails,
    orderType,
    orderStatus: isClient ? "Pending" : "In Progress",
    items: pricedItems,
    bills,
    table: table?._id ?? null,
    paymentMethod,
    paymentData: payment
      ? { razorpay_order_id: payment.razorpayOrderId, razorpay_payment_id: payment.razorpayPaymentId }
      : undefined,
    createdBy: req.user._id,
    servedBy: isClient ? null : req.user._id,
  });

  if (payment) {
    payment.order = order._id;
    await payment.save();
  }

  // Table kat-t7jez direct (7ta commande Pending), bach ma ydkhelch 3liha chi wa7d akhor
  if (table) {
    table.status = "Booked";
    table.currentOrder = order._id;
    await table.save();
  }

  await order.populate("table", "tableNo");
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

export async function updateOrderStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, "Order not found");

  const next = req.body.orderStatus;
  if (!STATUS_TRANSITIONS[order.orderStatus].includes(next)) {
    throw new AppError(409, `Cannot change an order from ${order.orderStatus} to ${next}`);
  }

  order.orderStatus = next;
  // Serveur li confirma commande dyal client howa li kaytsjjel "servedBy"
  if (!order.servedBy && next !== "Cancelled") order.servedBy = req.user._id;
  await order.save();

  // Commande salat wla tlghat: table katwelli khawya
  if (next === "Completed" || next === "Cancelled") await releaseTable(order);

  res.json({ success: true, message: "Order updated", data: order });
}
