import { FaLongArrowAltRight } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { formatDateAndTime, formatPrice, getAvatarName } from "../../utils/index";
import { getErrorMessage, updateOrderStatus } from "../../https";
import { ORDER_RELATED_KEYS } from "../../hooks/queries";
import StatusBadge from "../shared/StatusBadge";

const nextStep = (order) => {
  const takeaway = order.orderType === "Takeaway";
  return {
    // Commande dyal client: serveur kay-verifi table 9bel ma y-confirmi
    Pending: { status: "In Progress", label: takeaway ? "Confirm order" : `Confirm (client is at table ${order.table?.tableNo ?? "-"})` },
    "In Progress": { status: "Ready", label: "Mark as Ready" },
    Ready: { status: "Completed", label: takeaway ? "Handed over" : "Complete & free table" },
  }[order.orderStatus];
};

const canCancel = (status) => status === "Pending" || status === "In Progress";

const OrderCard = ({ order }) => {
  const queryClient = useQueryClient();
  const step = nextStep(order);
  const takeaway = order.orderType === "Takeaway";

  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      ORDER_RELATED_KEYS.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    onError: (error) => enqueueSnackbar(getErrorMessage(error), { variant: "error" }),
  });

  const setStatus = (orderStatus) => statusMutation.mutate({ orderId: order._id, orderStatus });

  return (
    <div className={`bg-[#262626] p-4 rounded-lg mb-4 ${order.orderStatus === "Pending" ? "ring-2 ring-orange-400" : ""}`}>
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {getAvatarName(order.customerDetails.name)}
        </button>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {order.customerDetails.name}
            </h1>
            <p className="text-[#ababab] text-sm">#{Math.floor(new Date(order.orderDate).getTime())} / {order.orderType ?? "Dine In"}</p>
            {takeaway ? (
              <p className="text-[#ababab] text-sm">Takeaway</p>
            ) : (
              <p className="text-[#ababab] text-sm">Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {order.table?.tableNo ?? "-"}</p>
            )}
          </div>
          <StatusBadge status={order.orderStatus} showHint />
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{order.items.length} Items</p>
      </div>
      <p className="text-[#ababab] text-sm mt-1">
        {order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}
      </p>
      <p className="text-[#ababab] text-xs mt-1">
        {order.servedBy ? `Waiter: ${order.servedBy.name}` : "Ordered by the client from the app"} · {order.paymentMethod}
      </p>
      <hr className="w-full mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">{formatPrice(order.bills.totalWithTax)}</p>
      </div>
      <div className="flex gap-3 mt-4">
        {step && (
          <button
            onClick={() => setStatus(step.status)}
            disabled={statusMutation.isPending}
            className="flex-1 bg-[#1f1f1f] hover:bg-[#343434] text-[#f5f5f5] rounded-lg py-2 font-semibold disabled:opacity-50"
          >
            {step.label}
          </button>
        )}
        {canCancel(order.orderStatus) && (
          <button
            onClick={() => window.confirm("Cancel this order?") && setStatus("Cancelled")}
            disabled={statusMutation.isPending}
            className="bg-[#1f1f1f] hover:bg-[#4a2e2e] text-red-400 rounded-lg py-2 px-4 font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
