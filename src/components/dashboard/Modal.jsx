import { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMenuItem, addTable, getErrorMessage } from "../../https";
import { enqueueSnackbar } from "notistack"
import { useMenu } from "../../hooks/queries";

// Config dyal kol formulaire (table / plat): nefs l-modal, champs mkhtalfin
const forms = {
  table: {
    title: "Add Table",
    initial: { tableNo: "", seats: "" },
    fields: [
      { name: "tableNo", label: "Table Number", type: "number", min: 1 },
      { name: "seats", label: "Number of Seats", type: "number", min: 1 },
    ],
    request: addTable,
    invalidate: [["tables"], ["stats"]],
  },
  dish: {
    title: "Add Dish",
    initial: { name: "", category: "", price: "" },
    fields: [
      { name: "name", label: "Dish Name", type: "text" },
      { name: "category", label: "Category", type: "text", list: "dish-categories" },
      { name: "price", label: "Price (DH)", type: "number", min: 0, step: "0.01" },
    ],
    request: addMenuItem,
    invalidate: [["menu"], ["stats"]],
  },
};

const Modal = ({ type, onClose }) => {
  const form = forms[type];
  const queryClient = useQueryClient();
  const { data: menuItems = [] } = useMenu();
  const categories = [...new Set(menuItems.map((item) => item.category))];
  const [formData, setFormData] = useState(form.initial);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mutation = useMutation({
    mutationFn: form.request,
    onSuccess: (res) => {
        form.invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
        enqueueSnackbar(res.data.message, { variant: "success" })
        onClose();
    },
    onError: (error) => {
        enqueueSnackbar(getErrorMessage(error), { variant: "error" })
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        {/* Modal Header */}
        <div className="flex justify-between item-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">{form.title}</h2>
          <button onClick={onClose} className="text-[#f5f5f5] hover:text-red-500">
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-10">
          {form.fields.map(({ name, label, ...inputProps }) => (
            <div key={name}>
              <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
                {label}
              </label>
              <div className="flex item-center rounded-lg p-5 px-4 bg-[#1f1f1f]">
                <input
                  name={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                  className="bg-transparent flex-1 text-white focus:outline-none"
                  required
                  {...inputProps}
                />
              </div>
            </div>
          ))}
          <datalist id="dish-categories">
            {categories.map((category) => <option key={category} value={category} />)}
          </datalist>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg mt-10 mb-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold disabled:opacity-60"
          >
            {form.title}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Modal;
