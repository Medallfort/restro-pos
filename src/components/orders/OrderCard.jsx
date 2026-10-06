import { FaLongArrowAltRight } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { formatDateAndTime, formatPrice, getAvatarName } from "../../utils/index";
import { getErrorMessage, updateOrderStatus } from "../../https";
import { ORDER_RELATED_KEYS } from "../../hooks/queries";
import StatusBadge from "../shared/StatusBadge";

const nextStep = {
  "In Progress": { status: "Ready", label: "Mark as Ready" },
  Ready: { status: "Completed", label: "Complete & free table" },
};

const OrderCard = ({ order }) => {
  const queryClient = useQueryClient();
  const step = nextStep[order.orderStatus];

  const statusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      ORDER_RELATED_KEYS.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    onError: (error) => enqueueSnackbar(getErrorMessage(error), { variant: "error" }),
  });

  return (
    <div className="bg-[#262626] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {getAvatarName(order.customerDetails.name)}
        </button>
        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {order.customerDetails.name}
            </h1>
            <p className="text-[#ababab] text-sm">#{Math.floor(new Date(order.orderDate).getTime())} / Dine in</p>
            <p className="text-[#ababab] text-sm">Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {order.table?.tableNo ?? "-"}</p>
          </div>
          <StatusBadge status={order.orderStatus} showHint />
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formatDateAndTime(order.orderDate)}</p>
        <p>{order.items.length} Items</p>
      </div>
      <hr className="w-full mt-4 border-t-1 border-gray-500" />
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">{formatPrice(order.bills.totalWithTax)}</p>
      </div>
      {step && (
        <button
          onClick={() => statusMutation.mutate({ orderId: order._id, orderStatus: step.status })}
          disabled={statusMutation.isPending}
          className="w-full mt-4 bg-[#1f1f1f] hover:bg-[#343434] text-[#f5f5f5] rounded-lg py-2 font-semibold disabled:opacity-50"
        >
          {step.label}
        </button>
      )}
    </div>
  );
};

export default OrderCard;
