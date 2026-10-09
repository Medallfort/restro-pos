import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { MdTableBar } from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import { setCustomer } from "../../redux/slices/customerSlice";
import { removeAllItems } from "../../redux/slices/cartSlice";

const MAX_GUESTS = 20;

const types = [
  { key: "Dine In", label: "Dine in", Icon: MdTableBar },
  { key: "Takeaway", label: "Takeaway", Icon: FaShoppingBag },
];

const inputClass = "bg-transparent flex-1 text-white focus:outline-none";
const Field = ({ label, children }) => (
  <div>
    <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">{label}</label>
    <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">{children}</div>
  </div>
);

// Serveur: kaykteb numéro dyal table + smiyt l-client. Client: ghir numéro dyal table (smiya mn compte dyalo)
const NewOrderForm = ({ onDone }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isClient = user.role === "Client";

  const [orderType, setOrderType] = useState("Dine In");
  const [tableNo, setTableNo] = useState("");
  const [guests, setGuests] = useState(isClient ? 1 : 0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const isDineIn = orderType === "Dine In";
  const changeGuests = (delta) => setGuests((g) => Math.min(Math.max(g + delta, 0), MAX_GUESTS));

  const handleSubmit = (e) => {
    e.preventDefault();
    const customerName = isClient ? user.name : name.trim();
    const table = Number(tableNo);

    if (!customerName) return enqueueSnackbar("Enter the customer name", { variant: "warning" });
    // Serveur y9der ykhlli numéro khawi w ykhtar table mn page Tables
    if (isDineIn && isClient && !table) {
      return enqueueSnackbar("Enter your table number", { variant: "warning" });
    }
    if (isDineIn && guests === 0) return enqueueSnackbar("How many guests?", { variant: "warning" });

    dispatch(removeAllItems());
    dispatch(
      setCustomer({
        name: customerName,
        phone: isClient ? user.phone : phone,
        guests: isDineIn ? guests : 1,
        orderType,
        tableNo: isDineIn && table ? table : undefined,
      })
    );
    onDone?.();
    navigate(isDineIn && !table ? "/tables" : "/menu");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        {types.map(({ key, label, Icon }) => (
          <button
            type="button"
            key={key}
            onClick={() => setOrderType(key)}
            className={`flex items-center justify-center gap-2 rounded-lg py-3 font-semibold ${
              orderType === key ? "bg-[#f6b100] text-[#1f1f1f]" : "bg-[#1f1f1f] text-[#ababab]"
            }`}
          >
            <Icon size={20} /> {label}
          </button>
        ))}
      </div>

      {isDineIn && (
        <Field label={isClient ? "Your table number" : "Table number (leave empty to pick a table)"}>
          <input
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value.replace(/\D/g, "").slice(0, 3))}
            inputMode="numeric"
            placeholder="e.g. 7"
            className={inputClass}
          />
        </Field>
      )}

      {!isClient && (
        <>
          <Field label="Customer Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter customer name" className={inputClass} />
          </Field>
          <Field label="Customer Phone (optional)">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+212 6XX XX XX XX" className={inputClass} />
          </Field>
        </>
      )}

      {isDineIn && (
        <div>
          <label className="block mb-2 mt-3 text-sm font-medium text-[#ababab]">Guests</label>
          <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg">
            <button type="button" onClick={() => changeGuests(-1)} className="text-yellow-500 text-2xl">&minus;</button>
            <span className="text-white">{guests} Person</span>
            <button type="button" onClick={() => changeGuests(1)} className="text-yellow-500 text-2xl">&#43;</button>
          </div>
        </div>
      )}

      <button type="submit" className="w-full bg-[#F6B100] text-[#1f1f1f] font-semibold rounded-lg py-3 mt-8 hover:bg-yellow-500">
        Choose dishes
      </button>
    </form>
  );
};

export default NewOrderForm;
