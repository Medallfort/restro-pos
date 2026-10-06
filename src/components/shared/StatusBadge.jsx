import { FaCheckDouble, FaCircle, FaFlagCheckered } from "react-icons/fa";

const styles = {
  "In Progress": { badge: "text-yellow-600 bg-[#4a452e]", Icon: FaCircle, dot: "text-yellow-600", hint: "Preparing your order" },
  Ready: { badge: "text-green-600 bg-[#2e4a40]", Icon: FaCheckDouble, dot: "text-green-600", hint: "Ready to serve" },
  Completed: { badge: "text-[#9aa9ff] bg-[#2e3350]", Icon: FaFlagCheckered, dot: "text-[#9aa9ff]", hint: "Served & closed" },
};

const StatusBadge = ({ status, showHint = false }) => {
  const { badge, Icon, dot, hint } = styles[status] ?? styles["In Progress"];
  return (
    <div className="flex flex-col items-end gap-2">
      <p className={`${badge} px-2 py-1 rounded-lg`}>
        <Icon className="inline mr-2" /> {status}
      </p>
      {showHint && (
        <p className="text-[#ababab] text-sm">
          <FaCircle className={`inline mr-2 ${dot}`} /> {hint}
        </p>
      )}
    </div>
  );
};

export default StatusBadge;
