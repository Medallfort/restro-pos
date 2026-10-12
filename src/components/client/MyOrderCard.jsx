import StatusBadge from "../shared/StatusBadge";
import { formatDateAndTime, formatPrice, orderLabel } from "../../utils";

// Commande kif kaychoufha client: statut, chno tlb, ch7al
const MyOrderCard = ({ order }) => (
  <div className="bg-[#262626] rounded-lg p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[#f5f5f5] font-semibold">{orderLabel(order)}</p>
        <p className="text-[#ababab] text-xs">{formatDateAndTime(order.createdAt)}</p>
      </div>
      <StatusBadge status={order.orderStatus} showHint />
    </div>
    <p className="text-[#ababab] text-sm mt-3">
      {order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}
    </p>
    <div className="flex items-center justify-between mt-3 text-sm">
      <span className="text-[#ababab]">
        {order.paymentMethod}
        {order.servedBy && ` · Waiter: ${order.servedBy.name}`}
      </span>
      <span className="text-[#f5f5f5] font-semibold">{formatPrice(order.bills.totalWithTax)}</span>
    </div>
    {(order.loyalty?.pointsRedeemed > 0 || order.loyalty?.pointsEarned > 0) && (
      <div className="flex items-center justify-end gap-3 mt-2 text-xs font-semibold">
        {order.loyalty.pointsRedeemed > 0 && (
          <span className="text-[#ababab]">
            −{order.loyalty.pointsRedeemed} pts used
            {order.orderStatus === "Cancelled" && " (refunded)"}
          </span>
        )}
        {order.loyalty.pointsEarned > 0 && (
          <span className="text-[#f6b100]">+{order.loyalty.pointsEarned} pts</span>
        )}
      </div>
    )}
  </div>
);

export default MyOrderCard;
