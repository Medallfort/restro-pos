import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice, removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import { addOrder, getErrorMessage } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ORDER_RELATED_KEYS, useAppConfig, useMe } from "../../hooks/queries";
import { redeemOptions } from "../../utils/loyalty";
import { formatPrice } from "../../utils";
import Invoice from "../invoice/Invoice";

const Bill = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const customerData = useSelector((state) => state.customer);
  const isClient = useSelector((state) => state.user.role === "Client");
  const isDineIn = customerData.orderType === "Dine In";
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const { data: config } = useAppConfig();

  const { data: me } = useMe(isClient);

  // Points de fidélité: client kaykhtar ch7al ystkhdem (b 100 b 100), max = solde wla l-montant
  const [redeemSteps, setRedeemSteps] = useState(0);
  const { maxSteps, step, value } = redeemOptions({
    points: isClient ? me?.loyaltyPoints ?? 0 : 0,
    total,
    loyalty: config?.loyalty,
  });
  const steps = Math.min(redeemSteps, maxSteps);
  const redeemPoints = steps * step;
  const discount = steps * value;

  // Estimation l-affichage. Montant l-7a9i9i kay7sbo server (w kayban f facture)
  const taxRate = config?.taxRate ?? 5.25;
  const tax = ((total - discount) * taxRate) / 100;
  const totalPriceWithTax = total - discount + tax;

  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState();

  // Server ma kayakhod ghir smiya w quantite: prix kay7sbhom houwa
  const orderItems = cartData.map(({ name, quantity }) => ({ name, quantity }));

  // Paiement: ghir Cash (server kaydir Cash par défaut)
  const buildOrder = () => ({
    customerDetails: {
      name: customerData.customerName,
      phone: customerData.customerPhone,
      guests: customerData.guests,
    },
    items: orderItems,
    orderType: customerData.orderType,
    // Table mn page Tables (id) wla numéro li tkteb
    ...(isDineIn &&
      (customerData.table.tableId
        ? { table: customerData.table.tableId }
        : { tableNo: customerData.table.tableNo })),
    ...(redeemPoints > 0 && { redeemPoints }),
  });

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      setOrderInfo(data);
      setShowInvoice(true);
      // Backend deja 7jez table f nefs l-requete
      dispatch(removeCustomer());
      dispatch(removeAllItems());
      setRedeemSteps(0);
      ORDER_RELATED_KEYS.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      enqueueSnackbar(
        isClient ? "Order sent! A waiter will confirm it shortly." : "Order Placed!",
        { variant: "success" }
      );
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error), { variant: "error" });
    },
  });

  const handlePlaceOrder = async () => {
    if (!customerData.customerName) {
      enqueueSnackbar("Create an order for a customer first!", { variant: "warning" });
      return;
    }
    if (isDineIn && !customerData.table) {
      enqueueSnackbar("Select a table first!", { variant: "warning" });
      return;
    }
    if (cartData.length === 0) {
      enqueueSnackbar("Add items first!", { variant: "warning" });
      return;
    }
    orderMutation.mutate(buildOrder());
  };

  const isBusy = orderMutation.isPending;

  return (
    <>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Items({cartData.length})
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">{formatPrice(total)}</h1>
      </div>
      {maxSteps > 0 && (
        <div className="flex items-center justify-between gap-3 px-5 mt-2">
          <p className="text-xs text-[#ababab] font-medium">
            Loyalty points <span className="text-[#f6b100]">({me.loyaltyPoints} pts)</span>
          </p>
          <div className="flex items-center gap-3 bg-[#1f1f1f] rounded-lg px-3 py-1">
            <button
              onClick={() => setRedeemSteps(steps - 1)}
              disabled={steps === 0}
              aria-label="Use fewer points"
              className="text-yellow-500 text-xl disabled:opacity-30"
            >
              &minus;
            </button>
            <span className="text-[#f5f5f5] text-sm font-semibold min-w-[4.5rem] text-center">
              {redeemPoints} pts
            </span>
            <button
              onClick={() => setRedeemSteps(steps + 1)}
              disabled={steps >= maxSteps}
              aria-label="Use more points"
              className="text-yellow-500 text-xl disabled:opacity-30"
            >
              &#43;
            </button>
          </div>
        </div>
      )}
      {discount > 0 && (
        <div className="flex items-center justify-between px-5 mt-2">
          <p className="text-xs text-[#ababab] font-medium mt-2">Points discount</p>
          <h1 className="text-[#02ca3a] text-md font-bold">−{formatPrice(discount)}</h1>
        </div>
      )}
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">Tax({taxRate}%)</p>
        <h1 className="text-[#f5f5f5] text-md font-bold">{formatPrice(tax)}</h1>
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium mt-2">
          Total With Tax
        </p>
        <h1 className="text-[#f5f5f5] text-md font-bold">
          {formatPrice(totalPriceWithTax)}
        </h1>
      </div>
      <p className="px-5 mt-4 text-xs text-[#ababab]">Payment: Cash</p>
      <div className="flex items-center gap-3 px-5 mt-4">
        <button
          onClick={() => setShowInvoice(true)}
          disabled={!orderInfo}
          className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#f5f5f5] font-semibold text-lg disabled:opacity-40"
        >
          Print Receipt
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={isBusy}
          className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] font-semibold text-lg disabled:opacity-60"
        >
          {isBusy ? "Placing..." : "Place Order"}
        </button>
      </div>

      {showInvoice && orderInfo && (
        <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
      )}
    </>
  );
};

export default Bill;
