import { useStats } from "../../hooks/queries";
import { getDishImage } from "../../constants";

const PopularDishes = () => {
  const { data: stats } = useStats();
  const dishes = stats?.popularDishes ?? [];

  return (
    <div className="mt-6 pr-6">
      <div className="bg-[#1a1a1a] w-full rounded-lg">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            Popular Dishes
          </h1>
          <span className="text-[#ababab] text-sm">By quantity ordered</span>
        </div>

        <div className="overflow-y-scroll h-[680px] scrollbar-hide">
          {dishes.length === 0 && (
            <p className="text-[#ababab] px-6 py-4">No orders yet. Popular dishes will show up here.</p>
          )}
          {dishes.map((dish, index) => {
            const rank = index + 1;
            return (
              <div
                key={dish.name}
                className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-6 py-4 mt-4 mx-6"
              >
                <h1 className="text-[#f5f5f5] font-bold text-xl mr-4">{rank < 10 ? `0${rank}` : rank}</h1>
                <img
                  src={getDishImage(dish.name)}
                  alt={dish.name}
                  className="w-[50px] h-[50px] rounded-full object-cover"
                />
                <div>
                  <h1 className="text-[#f5f5f5] font-semibold tracking-wide">{dish.name}</h1>
                  <p className="text-[#f5f5f5] text-sm font-semibold mt-1">
                    <span className="text-[#ababab]">Orders: </span>
                    {dish.quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PopularDishes;
