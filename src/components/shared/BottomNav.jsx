import { useState } from "react";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Modal from "./Modal";
import NewOrderForm from "./NewOrderForm";

const staffLinks = [
  { path: "/", label: "Home", Icon: FaHome },
  { path: "/orders", label: "Orders", Icon: MdOutlineReorder },
  { path: "/tables", label: "Tables", Icon: MdTableBar },
];

// Client ma kaychoufch les tables
const clientLinks = [
  { path: "/", label: "Home", Icon: FaHome },
  { path: "/orders", label: "My Orders", Icon: MdOutlineReorder },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useSelector((state) => state.user.role);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const links = role === "Client" ? clientLinks : staffLinks;
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around">
      {links.map(({ path, label, Icon }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`flex items-center justify-center font-bold ${
            isActive(path) ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
          } w-[300px] rounded-[20px]`}
        >
          <Icon className="inline mr-2" size={20} /> <p>{label}</p>
        </button>
      ))}

      <button
        disabled={isActive("/tables") || isActive("/menu")}
        onClick={() => setIsModalOpen(true)}
        title="New order"
        className="absolute bottom-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-4 items-center"
      >
        <BiSolidDish size={40} />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Order">
        <NewOrderForm onDone={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default BottomNav;
