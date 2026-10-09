// Kaysayb compte Admin (wla kayrdd compte kayn Admin + mot de passe jdid).
// Kaysowel 3la les infos f terminal. Docker:
//   docker compose exec backend node scripts/create-admin.js
// Bla questions (ex: script): ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD
import readline from "node:readline";
import env from "../src/config/env.js";
import { connectDB, disconnectDB } from "../src/config/db.js";
import { upsertAdmin } from "../src/data/admin.js";

function ask(question, { hidden = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    // Mot de passe ma kaybanch f écran
    rl._writeToOutput = (text) => {
      if (text.includes(question)) rl.output.write(text);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    })
  );
}

const name = process.env.ADMIN_NAME || (await ask("Name: "));
const email = process.env.ADMIN_EMAIL || (await ask("Email: "));
const phone = process.env.ADMIN_PHONE || (await ask("Phone (ex: +212 600000000): "));
let password = process.env.ADMIN_PASSWORD;
if (!password) {
  password = await ask("Password (8+ characters): ", { hidden: true });
  const confirm = await ask("Confirm password: ", { hidden: true });
  if (password !== confirm) {
    console.error("Passwords do not match");
    process.exit(1);
  }
}

await connectDB(env.MONGODB_URI);
try {
  const { created, user } = await upsertAdmin({ name, email, phone, password });
  console.log(
    created
      ? `Admin created: ${user.email}`
      : `${user.email} already existed: it is now Admin, with the new password`
  );
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDB();
}
