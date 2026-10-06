import MenuItem from "../models/MenuItem.js";
import Table from "../models/Table.js";
import { MENU_ITEMS, TABLES } from "./menuData.js";

// Idempotent: kayzid ghir li ma kaynch (ma kaybeddelch prix li beddel Admin)
export async function seedDatabase() {
  const menuOps = MENU_ITEMS.map((item) => ({
    updateOne: { filter: { name: item.name }, update: { $setOnInsert: item }, upsert: true },
  }));
  const tableOps = TABLES.map((table) => ({
    updateOne: { filter: { tableNo: table.tableNo }, update: { $setOnInsert: table }, upsert: true },
  }));

  const [menu, tables] = await Promise.all([
    MenuItem.bulkWrite(menuOps),
    Table.bulkWrite(tableOps),
  ]);
  return { menuAdded: menu.upsertedCount, tablesAdded: tables.upsertedCount };
}
