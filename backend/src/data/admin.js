import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { BCRYPT_ROUNDS } from "../controllers/userController.js";
import { registerSchema } from "../validators/schemas.js";

// Kaysayb compte Admin, wla ila l-email deja kayn: kayrddo Admin w kaybeddel lih mot de passe
// (kaynf3 7ta ila nsiti mot de passe dyal Admin)
export async function upsertAdmin(input) {
  const result = registerSchema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`${issue.path.join(".")}: ${issue.message}`);
  }
  const { name, email, phone, password } = result.data;
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "Admin";
    existing.password = hashedPassword;
    await existing.save();
    return { created: false, user: existing.toPublic() };
  }

  const user = await User.create({ name, email, phone, password: hashedPassword, role: "Admin" });
  return { created: true, user: user.toPublic() };
}
