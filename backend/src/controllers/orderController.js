import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Table from "../models/Table.js";
import AppError from "../utils/AppError.js";
import { computeBill } from "../utils/pricing.js";
import { toMinorUnits } from "../utils/money.js";

// Kat7jez paiement b tari9a atomique (paid -> used): ila jouj requetes jaw f nefs l-we9t
// b nefs paiement, wa7da bo7dha li ghadi tnje7 (protection men replay)
async function claimVerifiedPayment(paymentData, expectedTotal) {
  if (!paymentData?.razorpay_order_id) throw new AppError(400, "Missing payment data");

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: paymentData.razorpay_order_id, status: "paid" },
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

export async function createOrder(req, res) {
  const { customerDetails, items, table: tableId, paymentMethod, paymentData } = req.body;

  const table = await Table.findById(tableId);
  if (!table) throw new AppError(404, "Table not found");
  if (table.status === "Booked") throw new AppError(409, "Table is already booked");

  const { items: pricedItems, bills } = await computeBill(items);

  const payment =
    paymentMethod === "Online" ? await claimVerifiedPayment(paymentData, bills.totalWithTax) : null;

  const order = await Order.create({
    customerDetails,
    items: pricedItems,
    bills,
    table: table._id,
    paymentMethod,
    paymentData: payment
      ? { razorpay_order_id: payment.razorpayOrderId, razorpay_payment_id: payment.razorpayPaymentId }
      : undefined,
    createdBy: req.user._id,
  });

  if (payment) {
    payment.order = order._id;
    await payment.save();
  }

  table.status = "Booked";
  table.currentOrder = order._id;
  await table.save();

  res.status(201).json({ success: true, message: "Order created!", data: order });
}

export async function listOrders(req, res) {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200).populate("table", "tableNo");
  res.json({ success: true, data: orders });
}

export async function updateOrderStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError(404, "Order not found");

  order.orderStatus = req.body.orderStatus;
  await order.save();

  // Commande salat: table katwelli khawya
  if (order.orderStatus === "Completed") {
    const table = await Table.findById(order.table);
    if (table?.currentOrder?.equals(order._id)) {
      table.status = "Available";
      table.currentOrder = null;
      await table.save();
    }
  }

  res.json({ success: true, message: "Order updated", data: order });
}
