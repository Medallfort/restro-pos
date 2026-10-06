import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getErrorMessage, updateMenuItem } from "../../https";
import { useMenu } from "../../hooks/queries";
import { formatPrice } from "../../utils";

const MenuManager = () => {
  const queryClient = useQueryClient();
  const { data: items = [] } = useMenu();

  const mutation = useMutation({
    mutationFn: updateMenuItem,
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message, { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error) => enqueueSnackbar(getErrorMessage(error), { variant: "error" }),
  });

  const changePrice = (item) => {
    const input = window.prompt(`New price for ${item.name} (DH)`, item.price);
    if (input === null) return;
    const price = Number(input);
    if (!Number.isFinite(price) || price < 0) {
      enqueueSnackbar("Invalid price", { variant: "warning" });
      return;
    }
    mutation.mutate({ itemId: item._id, price });
  };

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-4">Menu ({items.length} dishes)</h2>
      <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab] sticky top-0">
            <tr>
              <th className="p-3">Dish</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className={`border-b border-gray-600 hover:bg-[#333] ${item.isActive ? "" : "opacity-50"}`}>
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.category}</td>
                <td className="p-4">{formatPrice(item.price)}</td>
                <td className="p-4">{item.isActive ? "On menu" : "Hidden"}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => changePrice(item)} className="bg-[#1a1a1a] px-3 py-1 rounded-lg hover:bg-[#1f1f1f]">
                    Edit price
                  </button>
                  <button
                    onClick={() => mutation.mutate({ itemId: item._id, isActive: !item.isActive })}
                    className="bg-[#1a1a1a] px-3 py-1 rounded-lg hover:bg-[#1f1f1f]"
                  >
                    {item.isActive ? "Hide" : "Show"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuManager;
