import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import OrderList from "./OrderList";
import { enqueueSnackbar } from "notistack";
import { useOrders } from "../../hooks/queries";

const RecentOrders = () => {
  const { data: orders = [], isError } = useOrders();
  const [search, setSearch] = useState("");

  // Side effect f useEffect, machi f render (sinon notification kat3awd kol render)
  useEffect(() => {
    if (isError) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  }, [isError]);

  const term = search.trim().toLowerCase();
  const filtered = term
    ? orders.filter(
        (order) =>
          order.customerDetails.name.toLowerCase().includes(term) ||
          String(order.table?.tableNo ?? "") === term
      )
    : orders;

  return (
    <div className="px-8 mt-6">
      <div className="bg-[#1a1a1a] w-full h-[450px] rounded-lg">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Recent Orders
          </h1>
          <Link to="/orders" className="text-[#025cca] text-sm font-semibold">
            View all
          </Link>
        </div>

        <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-4 mx-6">
          <FaSearch className="text-[#f5f5f5]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or table number"
            className="bg-[#1f1f1f] outline-none text-[#f5f5f5] flex-1"
          />
        </div>

        {/* Order list */}
        <div className="mt-4 px-6 overflow-y-scroll h-[300px] scrollbar-hide">
          {filtered.length > 0 ? (
            filtered.map((order) => <OrderList key={order._id} order={order} />)
          ) : (
            <p className="col-span-3 text-gray-500">No orders available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
