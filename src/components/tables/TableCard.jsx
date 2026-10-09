import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../utils"
import { useDispatch } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";
import { FaHistory, FaLongArrowAltRight } from "react-icons/fa";

const TableCard = ({id, name, status, initials, seats, onShowHistory}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleClick = (name) => {
    if(status === "Booked") return;

    const table = { tableId: id, tableNo: name }
    dispatch(updateTable({table}))
    navigate(`/menu`);
  };

  return (
    <div onClick={() => handleClick(name)} key={id} className="w-full hover:bg-[#2c2c2c] bg-[#262626] p-4 rounded-lg cursor-pointer">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[#f5f5f5] text-base md:text-xl font-semibold whitespace-nowrap">Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {name}</h1>
        <p className={`${status === "Booked" ? "text-green-600 bg-[#2e4a40]" : "bg-[#664a04] text-white"} px-2 py-1 rounded-lg text-xs md:text-base`}>
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center mt-4 mb-5 md:mt-5 md:mb-8">
        <h1 className={`text-white rounded-full p-5 text-xl`} style={{backgroundColor : initials ? getBgColor() : "#1f1f1f"}} >{getAvatarName(initials) || "N/A"}</h1>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[#ababab] text-xs">Seats: <span className="text-[#f5f5f5]">{seats}</span></p>
        <button
          onClick={(e) => {
            // Ma n7llouch l-menu: ghir l-historique
            e.stopPropagation();
            onShowHistory({ id, name });
          }}
          className="text-[#ababab] hover:text-[#f5f5f5] text-xs flex items-center gap-1"
        >
          <FaHistory /> History
        </button>
      </div>
    </div>
  );
};

export default TableCard;