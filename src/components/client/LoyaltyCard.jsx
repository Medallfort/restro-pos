import { FaGift } from "react-icons/fa";
import { useAppConfig, useMe } from "../../hooks/queries";
import { DEFAULT_LOYALTY, pointsValue } from "../../utils/loyalty";
import { formatPrice } from "../../utils";

// Carte de fidélité dyal client: solde, ch7al kaysswa, w ch7al b9a l remise jaya
const LoyaltyCard = () => {
  const { data: me } = useMe();
  const { data: config } = useAppConfig();
  const loyalty = config?.loyalty ?? DEFAULT_LOYALTY;
  const points = me?.loyaltyPoints ?? 0;
  const toNext = loyalty.redeemStep - (points % loyalty.redeemStep);
  const progress = ((points % loyalty.redeemStep) / loyalty.redeemStep) * 100;

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 md:p-6 mx-4 md:mx-8 mt-4 max-w-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FaGift className="text-[#f6b100]" size={22} />
          <h2 className="text-[#f5f5f5] text-lg font-semibold">Loyalty points</h2>
        </div>
        <p className="text-[#f6b100] text-2xl font-bold">{points} pts</p>
      </div>

      <p className="text-[#ababab] text-sm mt-2">
        {pointsValue(points, loyalty) > 0
          ? `Worth ${formatPrice(pointsValue(points, loyalty))} off your next order.`
          : "Order and collect points for discounts."}{" "}
        {toNext} pts to your next {formatPrice(loyalty.redeemValue)}.
      </p>
      <div
        className="h-2 bg-[#262626] rounded-full mt-3 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-[#f6b100]" style={{ width: `${progress}%` }} />
      </div>

      <p className="text-[#ababab] text-xs mt-3">
        {formatPrice(100)} spent = {100 * loyalty.pointsPerDh} pts · {loyalty.redeemStep} pts ={" "}
        {formatPrice(loyalty.redeemValue)} off. Points are added when your order is completed.
      </p>
    </div>
  );
};

export default LoyaltyCard;
