import { useMemo, useState } from "react";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems, MAX_QUANTITY } from "../../redux/slices/cartSlice";
import { useMenu } from "../../hooks/queries";
import { categoryRank, getCategoryStyle } from "../../constants";
import { formatPrice } from "../../utils";

const MenuContainer = () => {
  const { data: menuItems = [], isLoading, isError } = useMenu();
  const [selectedName, setSelectedName] = useState(null);
  // Compteur l kol plat (9bel kan compteur wa7ed m9esem bin kolchi)
  const [counts, setCounts] = useState({});
  const dispatch = useDispatch();

  const menus = useMemo(() => {
    const byCategory = new Map();
    for (const item of menuItems) {
      if (!item.isActive) continue;
      if (!byCategory.has(item.category)) byCategory.set(item.category, []);
      byCategory.get(item.category).push(item);
    }
    return [...byCategory]
      .sort(([a], [b]) => categoryRank(a) - categoryRank(b) || a.localeCompare(b))
      .map(([name, items], index) => ({ name, items, ...getCategoryStyle(name, index) }));
  }, [menuItems]);

  const selected = menus.find((menu) => menu.name === selectedName) ?? menus[0];

  const changeCount = (id, delta) => {
    setCounts((prev) => {
      const next = Math.min(Math.max((prev[id] ?? 0) + delta, 0), MAX_QUANTITY);
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (item) => {
    const quantity = counts[item._id] ?? 0;
    if (quantity === 0) return;
    // Prix hna ghir l-affichage: server kay3awd y7sbo mn DB
    dispatch(addItems({ id: crypto.randomUUID(), name: item.name, pricePerQuantity: item.price, quantity }));
    setCounts((prev) => ({ ...prev, [item._id]: 0 }));
  };

  if (isLoading) return <p className="text-[#ababab] px-10 py-4">Loading menu...</p>;
  if (isError) return <p className="text-red-400 px-10 py-4">Could not load the menu.</p>;
  if (menus.length === 0) return <p className="text-[#ababab] px-10 py-4">No dishes yet. An admin can add them from the dashboard.</p>;

  return (
    <>
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {menus.map((menu) => {
          return (
            <div
              key={menu.name}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[100px] cursor-pointer"
              style={{ backgroundColor: menu.bgColor }}
              onClick={() => setSelectedName(menu.name)}
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {menu.icon} {menu.name}
                </h1>
                {selected?.name === menu.name && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
              <p className="text-[#ababab] text-sm font-semibold">
                {menu.items.length} Items
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%] overflow-y-scroll scrollbar-hide max-h-[440px]">
        {selected?.items.map((item) => {
          return (
            <div
              key={item._id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[150px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a]"
            >
              <div className="flex items-start justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {item.name}
                </h1>
                <button onClick={() => handleAddToCart(item)} className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg"><FaShoppingCart size={20} /></button>
              </div>
              <div className="flex items-center justify-between w-full">
                <p className="text-[#f5f5f5] text-xl font-bold">
                  {formatPrice(item.price)}
                </p>
                <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg gap-6 w-[50%]">
                  <button
                    onClick={() => changeCount(item._id, -1)}
                    className="text-yellow-500 text-2xl"
                  >
                    &minus;
                  </button>
                  <span className="text-white">{counts[item._id] ?? 0}</span>
                  <button
                    onClick={() => changeCount(item._id, 1)}
                    className="text-yellow-500 text-2xl"
                  >
                    &#43;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MenuContainer;
