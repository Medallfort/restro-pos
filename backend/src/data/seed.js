import mongoose from "mongoose";
import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";
import { MENU_ITEMS, RETIRED_MENU_ITEMS, TABLES } from "./menuData.js";

// Idempotent: kayzid ghir li ma kaynch (ma kaybeddelch prix li beddel Admin)
export async function seedDatabase() {
  const menuOps = MENU_ITEMS.map((item) => ({
    updateOne: { filter: { name: item.name }, update: { $setOnInsert: item }, upsert: true },
  }));
  const tableOps = TABLES.map((table) => ({
    updateOne: { filter: { tableNo: table.tableNo }, update: { $setOnInsert: table }, upsert: true },
  }));

  const [menu, tables, retired] = await Promise.all([
    MenuItem.bulkWrite(menuOps),
    Table.bulkWrite(tableOps),
    // Menu l9dim: kaytkhba, ma kaytmse7ch (les commandes l9dam kayb9aw kaybano)
    // trusted: liste mn l-code (machi input), sanitizeFilter ma khassoch y7yed $in
    MenuItem.updateMany(
      { name: mongoose.trusted({ $in: RETIRED_MENU_ITEMS }), isActive: true },
      { $set: { isActive: false } }
    ),
  ]);
  return {
    menuAdded: menu.upsertedCount,
    tablesAdded: tables.upsertedCount,
    menuRetired: retired.modifiedCount,
  };
}
