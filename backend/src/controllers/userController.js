import bcrypt from "bcryptjs";
import env from "../config/env.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { COOKIE_NAME, cookieOptions, signToken } from "../middleware/auth.js";

const BCRYPT_ROUNDS = 12;

// Hash dyal password wahmi: ila email ma kaynch, kandirou nefs l-khedma dyal bcrypt
// bach wa9t l-jawab ykoun nefsou (sinon attaquant y3ref chmen emails kaynin b l-wa9t)
const DUMMY_HASH = bcrypt.hashSync("timing-attack-protection", BCRYPT_ROUNDS);

export async function register(req, res) {
  const { name, email, phone, password } = req.body;

  // Awel compte f système kaywelli Admin (bootstrap). Ay compte mn ba3d kaybda Waiter,
  // w Admin bo7do li y9der ybeddel role (machi l-utilisateur li kaykhtar role dyalo).
  const isFirstUser = (await User.countDocuments()) === 0;
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: isFirstUser ? "Admin" : "Waiter",
  });

  res.status(201).json({
    success: true,
    message: isFirstUser
      ? "Admin account created! You can now log in."
      : "Account created! An admin will assign your role.",
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  const passwordOk = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  // Nefs l-message f jouj l-7alat: ma n3tiwch l-attaquant wach email kayn
  if (!user || !passwordOk) throw new AppError(401, "Invalid email or password");

  res.cookie(COOKIE_NAME, signToken(user), {
    ...cookieOptions(),
    maxAge: env.JWT_TTL_HOURS * 60 * 60 * 1000,
  });
  res.json({ success: true, message: "Login successful", data: user.toPublic() });
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ success: true, message: "Logged out" });
}

export function getMe(req, res) {
  res.json({ success: true, data: req.user.toPublic() });
}

export async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: 1 });
  res.json({ success: true, data: users.map((user) => user.toPublic()) });
}

export async function updateRole(req, res) {
  if (req.params.id === req.user._id.toString()) {
    throw new AppError(400, "You cannot change your own role");
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError(404, "User not found");

  user.role = req.body.role;
  await user.save();
  res.json({ success: true, message: "Role updated", data: user.toPublic() });
}
