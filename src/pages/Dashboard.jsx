import { useState, useEffect } from "react";
import { MdTableBar } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import MenuManager from "../components/dashboard/MenuManager";
import StaffManager from "../components/dashboard/StaffManager";
import Modal from "../components/dashboard/Modal";

const buttons = [
  { label: "Add Table", icon: <MdTableBar />, action: "table" },
  { label: "Add Dish", icon: <BiSolidDish />, action: "dish" },
];

const tabs = {
  Metrics: <Metrics />,
  Orders: <RecentOrders />,
  Menu: <MenuManager />,
  Staff: <StaffManager />,
};

const Dashboard = () => {

  useEffect(() => {
    document.title = "POS | Admin Dashboard"
  }, [])

  const [openModal, setOpenModal] = useState(null);
  const [activeTab, setActiveTab] = useState("Metrics");

  return (
    <div className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="container mx-auto flex items-center justify-between py-14 px-6 md:px-4">
        <div className="flex items-center gap-3">
          {buttons.map(({ label, icon, action }) => {
            return (
              <button
                key={action}
                onClick={() => setOpenModal(action)}
                className="bg-[#1a1a1a] hover:bg-[#262626] px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2"
              >
                {label} {icon}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {Object.keys(tabs).map((tab) => {
            return (
              <button
                key={tab}
                className={`
                px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2 ${
                  activeTab === tab
                    ? "bg-[#262626]"
                    : "bg-[#1a1a1a] hover:bg-[#262626]"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {tabs[activeTab]}

      {openModal && <Modal type={openModal} onClose={() => setOpenModal(null)} />}
    </div>
  );
};

export default Dashboard;
