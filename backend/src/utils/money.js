export const round2 = (value) => Math.round(value * 100) / 100;

// Razorpay kayakhod l-montant b l-centimes (paise)
export const toMinorUnits = (value) => Math.round(value * 100);
