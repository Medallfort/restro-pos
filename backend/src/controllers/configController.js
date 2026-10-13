import env from "../config/env.js";
import { LOYALTY } from "../utils/loyalty.js";

// Config public dyal l-app: l-frontend kay7seb l-affichage dyal panier b nefs l-9awa3id
export function getConfig(req, res) {
  res.json({ success: true, data: { taxRate: env.TAX_RATE, loyalty: LOYALTY } });
}
