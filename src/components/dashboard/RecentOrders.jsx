import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getErrorMessage, updateOrderStatus } from "../../https/index";
import { formatDateAndTime, formatPrice, orderLabel } from "../../utils";
import { ORDER_RELATED_KEYS, useOrders } from "../../hooks/queries";
import { STATUS_TRANSITIONS } from "../../constants";

const statusColor = {
  Pending: "text-orange-400",
  Cancelled: "text-red-400",
  "In Progress": "text-yellow-500",
  Ready: "text-green-500",
  Completed: "text-[#9aa9ff]",
};

const RecentOrders = () => {
  const queryClient = useQueryClient();

  const orderStatusUpdateMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      enqueueSnackbar("Order status updated successfully!", { variant: "success" });
      // Completed kat7err table, donc tables w stats tahouma tbeddlo
      ORDER_RELATED_KEYS.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error), { variant: "error" });
    }
  })

  const { data: orders = [], isError } = useOrders();

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">
        Recent Orders
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Items</th>
              <th className="p-3">Table</th>
              <th className="p-3">Waiter</th>
              <th className="p-3">Total</th>
              <th className="p-3 text-center">Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-gray-600 hover:bg-[#333]"
              >
                <td className="p-4">#{Math.floor(new Date(order.orderDate).getTime())}</td>
                <td className="p-4">{order.customerDetails.name}</td>
                <td className="p-4">
                  <select
                    className={`bg-[#1a1a1a] border border-gray-500 p-2 rounded-lg focus:outline-none ${statusColor[order.orderStatus]}`}
                    value={order.orderStatus}
                    disabled={STATUS_TRANSITIONS[order.orderStatus].length === 0 || orderStatusUpdateMutation.isPending}
                    onChange={(e) => orderStatusUpdateMutation.mutate({ orderId: order._id, orderStatus: e.target.value })}
                  >
                    {[order.orderStatus, ...STATUS_TRANSITIONS[order.orderStatus]].map((status) => (
                      <option key={status} className={statusColor[status]} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4">{formatDateAndTime(order.orderDate)}</td>
                <td className="p-4">{order.items.length} Items</td>
                <td className="p-4">{orderLabel(order)}</td>
                <td className="p-4">{order.servedBy?.name ?? "—"}</td>
                <td className="p-4">{formatPrice(order.bills.totalWithTax)}</td>
                <td className="p-4 text-center">
                  {order.paymentMethod}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
