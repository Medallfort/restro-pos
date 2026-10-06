import mongoose from "mongoose";

mongoose.set("strictQuery", true);
// Defense en profondeur contre NoSQL injection: kol objet fih cle kat-bda b "$"
// f filtre kaytbeddel l $eq (ex: { email: { $gt: "" } } ma kaybqach operateur)
mongoose.set("sanitizeFilter", true);

export async function connectDB(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
