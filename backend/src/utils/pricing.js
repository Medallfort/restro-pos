import env from "../config/env.js";
import MenuItem from "../models/MenuItem.js";
import AppError from "./AppError.js";
import { round2 } from "./money.js";

// Kay7seb l-facture mn les prix li f DB. Ay prix jay mn l-client kayt-ignora:
// sinon attaquant y9der ybeddel requete w ykhlles 1 DH f plat dyal 400.
export async function computeBill(items) {
  const catalog = await MenuItem.find({ isActive: true }).lean();
  const byName = new Map(catalog.map((item) => [item.name.toLowerCase(), item]));

  const pricedItems = items.map(({ name, quantity }) => {
    const menuItem = byName.get(name.toLowerCase());
    if (!menuItem) throw new AppError(400, `Unknown menu item: ${name}`);
    return {
      name: menuItem.name,
      quantity,
      pricePerQuantity: menuItem.price,
      price: round2(menuItem.price * quantity),
    };
  });

  const total = round2(pricedItems.reduce((sum, item) => sum + item.price, 0));
  const tax = round2((total * env.TAX_RATE) / 100);

  return { items: pricedItems, bills: { total, tax, totalWithTax: round2(total + tax) } };
}
