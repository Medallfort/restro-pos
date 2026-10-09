import { useEffect } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import NewOrderForm from "../components/shared/NewOrderForm";
import MyOrderCard from "../components/client/MyOrderCard";
import { useMyOrders } from "../hooks/queries";

// Page d'accueil dyal client: commande jdida (sur place wla à emporter) + akhir commandes dyalo
const ClientHome = () => {
  useEffect(() => {
    document.title = "Restro | Order";
  }, []);

  const { data: orders = [] } = useMyOrders();
  const active = orders.filter((o) => !["Completed", "Cancelled"].includes(o.orderStatus));

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-y-auto pb-24 flex flex-col lg:flex-row gap-3">
      <div className="flex-[3]">
        <Greetings />
        <div className="bg-[#1a1a1a] rounded-lg p-4 md:p-6 mx-4 md:mx-8 mt-6 md:mt-8 max-w-xl">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">New order</h2>
          <p className="text-[#ababab] text-sm mb-4">
            Eating here? Enter your table number. Taking it away? Choose Takeaway.
          </p>
          <NewOrderForm />
        </div>
      </div>

      <div className="flex-[2] px-4 md:px-6 mt-2 lg:mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#f5f5f5] text-lg font-semibold">Current orders</h2>
          <Link to="/orders" className="text-[#025cca] text-sm font-semibold">
            View all
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {active.length === 0 && <p className="text-gray-500">No current orders.</p>}
          {active.map((order) => (
            <MyOrderCard key={order._id} order={order} />
          ))}
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default ClientHome;
