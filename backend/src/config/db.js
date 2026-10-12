import mongoose from "mongoose";

mongoose.set("strictQuery", true);
// Defense en profondeur contre NoSQL injection: kol objet fih cle kat-bda b "$"
// f filtre kaytbeddel l $eq (ex: { email: { $gt: "" } } ma kaybqach operateur)
mongoose.set("sanitizeFilter", true);

// MongoDB y9der yji mt2kher (awel démarrage, reboot dyal VM): kan3awdo nmo7awlo
// 9bel ma n7bso l-API, sinon backend kaytfa w Nginx m3ah
export async function connectDB(
  uri,
  { attempts = 12, delayMs = 5000, serverSelectionTimeoutMS = 10000, log = console.warn } = {}
) {
  for (let attempt = 1; ; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS });
      return;
    } catch (error) {
      // Nsdo l-connexion li fchlat 9bel l-mo7awala l-jaya (sinon kat-b9a m7loula f l-khfa)
      await mongoose.disconnect().catch(() => {});
      if (attempt >= attempts) throw error;
      log(`MongoDB not reachable (attempt ${attempt}/${attempts}): ${error.message}. Retrying in ${delayMs / 1000}s`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
