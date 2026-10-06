import MenuItem from "../models/MenuItem.js";
import AppError from "../utils/AppError.js";

export async function listMenu(req, res) {
  // Admin kaychouf 7ta les plats li m3attlin (bach y9der y3awd y-activihom)
  const filter = req.user.role === "Admin" ? {} : { isActive: true };
  const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
  res.json({ success: true, data: items });
}

export async function createMenuItem(req, res) {
  const item = await MenuItem.create(req.body);
  res.status(201).json({ success: true, message: "Dish added!", data: item });
}

export async function updateMenuItem(req, res) {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw new AppError(404, "Dish not found");

  Object.assign(item, req.body);
  await item.save();
  res.json({ success: true, message: "Dish updated", data: item });
}
