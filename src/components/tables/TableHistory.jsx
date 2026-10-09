import Modal from "../shared/Modal";
import StatusBadge from "../shared/StatusBadge";
import { useTableHistory } from "../../hooks/queries";
import { formatDate, formatDateAndTime, formatPrice } from "../../utils";

const Stat = ({ label, value }) => (
  <div className="bg-[#262626] rounded-lg p-3">
    <p className="text-[#ababab] text-xs">{label}</p>
    <p className="text-[#f5f5f5] text-lg font-semibold">{value}</p>
  </div>
);

// Historique dyal table: ga3 les commandes li dazo 3liha mn nhar t-creeat
const TableHistory = ({ table, onClose }) => {
  const { data, isLoading, isError } = useTableHistory(table?.id);

  return (
    <Modal isOpen={Boolean(table)} onClose={onClose} title={`Table ${table?.name} · History`}>
      {isLoading && <p className="text-[#ababab]">Loading...</p>}
      {isError && <p className="text-red-500">Could not load the history.</p>}

      {data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Orders" value={data.summary.ordersCount} />
            <Stat label="Revenue" value={formatPrice(data.summary.revenue)} />
            <Stat label="Guests served" value={data.summary.guests} />
            <Stat label="Since" value={formatDate(new Date(data.summary.since))} />
          </div>

          <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto scrollbar-hide">
            {data.orders.length === 0 && (
              <p className="text-gray-500">No orders on this table yet.</p>
            )}
            {data.orders.map((order) => (
              <div key={order._id} className="bg-[#262626] rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[#f5f5f5] font-semibold">
                      {order.customerDetails.name}
                      <span className="text-[#ababab] text-sm font-normal">
                        {" "}· {order.customerDetails.guests} guests
                      </span>
                    </p>
                    <p className="text-[#ababab] text-xs">{formatDateAndTime(order.createdAt)}</p>
                  </div>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <p className="text-[#ababab] text-sm mt-2">
                  {order.items.map((item) => `${item.name} ×${item.quantity}`).join(", ")}
                </p>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-[#ababab]">
                    {order.paymentMethod} · {order.servedBy ? `Waiter: ${order.servedBy.name}` : "Not confirmed"}
                  </span>
                  <span className="text-[#f5f5f5] font-semibold">
                    {formatPrice(order.bills.totalWithTax)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TableHistory;
