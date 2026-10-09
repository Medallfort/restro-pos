import { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import { FaHourglassHalf } from "react-icons/fa";
import { useSelector } from "react-redux";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";
import { useStats } from "../hooks/queries";
import { formatPrice } from "../utils";

const Home = () => {

    useEffect(() => {
      document.title = "POS | Home"
    }, [])

  const { data: stats } = useStats();
  // L-arba7 kaychoufhom ghir Admin
  const isAdmin = useSelector((state) => state.user.role === "Admin");

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-y-auto lg:overflow-hidden pb-24 lg:pb-0 flex flex-col lg:flex-row gap-3">
      {/* Left Div */}
      <div className="flex-[3]">
        <Greetings />
        <div className="flex items-center w-full gap-3 px-4 md:px-8 mt-6 md:mt-8">
          {isAdmin ? (
            <MiniCard
              title="Today's Earnings"
              icon={<BsCashCoin />}
              accent="#02ca3a"
              value={formatPrice(stats?.todayRevenue ?? 0)}
              footer={`${stats?.todayOrders ?? 0} orders today`}
            />
          ) : (
            <MiniCard
              title="To Confirm"
              icon={<FaHourglassHalf />}
              accent="#fb923c"
              value={stats?.pending ?? 0}
              footer="client orders from the app"
            />
          )}
          <MiniCard
            title="In Progress"
            icon={<GrInProgress />}
            value={stats?.inProgress ?? 0}
            footer={`${stats?.ready ?? 0} ready to serve`}
          />
        </div>
        <RecentOrders />
      </div>
      {/* Right Div */}
      <div className="flex-[2]">
        <PopularDishes />
      </div>
      <BottomNav />
    </section>
  );
};

export default Home;
