import env from "../src/config/env.js";
import { connectDB, disconnectDB } from "../src/config/db.js";
import { seedDatabase } from "../src/data/seed.js";

await connectDB(env.MONGODB_URI);
const result = await seedDatabase();
console.log(`Seed done: ${result.menuAdded} dishes, ${result.tablesAdded} tables added`);
await disconnectDB();
