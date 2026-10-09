import { FaLongArrowAltRight } from "react-icons/fa";
import { getAvatarName, orderLabel } from "../../utils/index";
import StatusBadge from "../shared/StatusBadge";

const OrderList = ({ order }) => {
  return (
    <div className="flex items-center gap-5 mb-3">
      <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
        {getAvatarName(order.customerDetails.name)}
      </button>
      <div className="flex items-center justify-between w-[100%]">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
            {order.customerDetails.name}
          </h1>
          <p className="text-[#ababab] text-sm">{order.items.length} Items</p>
        </div>

        <h1 className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg p-1">
          {order.orderType === "Takeaway" ? (
            orderLabel(order)
          ) : (
            <>
              Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" />{" "}
              {order.table?.tableNo ?? "-"}
            </>
          )}
        </h1>

        <StatusBadge status={order.orderStatus} />
      </div>
    </div>
  );
};

export default OrderList;
