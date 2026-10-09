import { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import MyOrderCard from "../components/client/MyOrderCard";
import { useMyOrders } from "../hooks/queries";

// Client: ga3 les commandes dyalo (kat-actualiser kol 15s)
const MyOrders = () => {
  useEffect(() => {
    document.title = "Restro | My Orders";
  }, []);

  const { data: orders = [], isLoading, isError } = useMyOrders();

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex items-center gap-4 px-10 py-4">
        <BackButton />
        <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">My Orders</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 px-16 py-4 h-[calc(100vh-14rem)] overflow-y-scroll scrollbar-hide content-start">
        {isLoading && <p className="text-[#ababab]">Loading...</p>}
        {isError && <p className="text-red-400">Could not load your orders.</p>}
        {!isLoading && orders.length === 0 && (
          <p className="col-span-3 text-gray-500">You have not ordered yet.</p>
        )}
        {orders.map((order) => (
          <MyOrderCard key={order._id} order={order} />
        ))}
      </div>

      <BottomNav />
    </section>
  );
};

export default MyOrders;
