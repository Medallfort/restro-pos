import { useStats } from "../../hooks/queries";
import { formatPrice } from "../../utils";

const StatCard = ({ title, value, color }) => (
  <div className="shadow-sm rounded-lg p-4" style={{ backgroundColor: color }}>
    <p className="font-medium text-xs text-[#f5f5f5]">{title}</p>
    <p className="mt-1 font-semibold text-2xl text-[#f5f5f5]">{value}</p>
  </div>
);

const Metrics = () => {
  const { data: stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return <p className="container mx-auto px-6 text-[#ababab]">Loading metrics...</p>;
  }

  const performance = [
    { title: "Revenue (today)", value: formatPrice(stats.todayRevenue), color: "#025cca" },
    { title: "Orders (today)", value: stats.todayOrders, color: "#02ca3a" },
    { title: "Customers (today)", value: stats.todayGuests, color: "#f6b100" },
    { title: "Ready to serve", value: stats.ready, color: "#be3e3f" },
  ];

  const items = [
    { title: "Total Categories", value: stats.categories, color: "#5b45b0" },
    { title: "Total Dishes", value: stats.dishes, color: "#285430" },
    { title: "Active Orders", value: stats.inProgress + stats.ready, color: "#735f32" },
    { title: "Tables Booked", value: `${stats.bookedTables} / ${stats.totalTables}`, color: "#7f167f" },
  ];

  return (
    <div className="container mx-auto py-2 px-6 md:px-4">
      <div>
        <h2 className="font-semibold text-[#f5f5f5] text-xl">Overall Performance</h2>
        <p className="text-sm text-[#ababab]">Today's sales and service activity, updated every minute.</p>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {performance.map((metric) => <StatCard key={metric.title} {...metric} />)}
      </div>

      <div className="flex flex-col justify-between mt-12">
        <div>
          <h2 className="font-semibold text-[#f5f5f5] text-xl">Item Details</h2>
          <p className="text-sm text-[#ababab]">Menu, orders and table occupancy right now.</p>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          {items.map((item) => <StatCard key={item.title} {...item} />)}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
