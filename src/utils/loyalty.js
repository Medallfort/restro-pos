// Nefs l-9awa3id dyal backend (backend/src/utils/loyalty.js). Server howa li kay7seb
// l-remise l-7a9i9iya; hna ghir l-affichage f panier.
export const DEFAULT_LOYALTY = { pointsPerDh: 1, redeemStep: 100, redeemValue: 10 };

// Ch7al mn "step" (100 pts) y9der ystkhdem l-client: b l-solde dyalo, w remise ma tfoutch l-montant
export const redeemOptions = ({ points = 0, total = 0, loyalty = DEFAULT_LOYALTY }) => {
  const { redeemStep: step, redeemValue: value } = loyalty;
  const maxSteps = Math.max(0, Math.min(Math.floor(points / step), Math.floor(total / value)));
  return { maxSteps, step, value };
};

// Ch7al kaysswaw les points b DH (ghir les tranches kamlin dyal 100)
export const pointsValue = (points = 0, loyalty = DEFAULT_LOYALTY) =>
  Math.floor(points / loyalty.redeemStep) * loyalty.redeemValue;
