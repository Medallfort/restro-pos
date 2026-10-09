import { useState, useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import OrderCard from "../components/orders/OrderCard";
import BackButton from "../components/shared/BackButton";
import { enqueueSnackbar } from "notistack"
import { useOrders } from "../hooks/queries";

const filters = [
  { key: "all", label: "All" },
  { key: "Pending", label: "To confirm" },
  { key: "In Progress", label: "In Progress" },
  { key: "Ready", label: "Ready" },
  { key: "Completed", label: "Completed" },
];

const Orders = () => {

  const [status, setStatus] = useState("all");

    useEffect(() => {
      document.title = "POS | Orders"
    }, [])

  const { data: orders = [], isError } = useOrders();

  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  const visibleOrders = status === "all" ? orders : orders.filter((order) => order.orderStatus === status);

  return (
    <section className="bg-[#1f1f1f]  h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Orders
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`text-[#ababab] text-lg ${status === key ? "bg-[#383838]" : ""} rounded-lg px-5 py-2 font-semibold`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-16 py-4 h-[calc(100vh-14rem)] overflow-y-scroll scrollbar-hide content-start">
        {
          visibleOrders.length > 0 ? (
            visibleOrders.map((order) => {
              return <OrderCard key={order._id} order={order} />
            })
          ) : <p className="col-span-3 text-gray-500">No orders available</p>
        }
      </div>

      <BottomNav />
    </section>
  );
};

export default Orders;
