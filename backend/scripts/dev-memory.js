// Dev bla MongoDB installe: kaybda MongoDB f RAM, kay-seedi, w kaylanci l-API.
// Data kattms7 mli tsedd l-process.
import crypto from "node:crypto";
import { MongoMemoryServer } from "mongodb-memory-server";

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri("restro");
process.env.JWT_SECRET ||= crypto.randomBytes(48).toString("hex");
process.env.HOST ||= "127.0.0.1";

const { connectDB } = await import("../src/config/db.js");
const { seedDatabase } = await import("../src/data/seed.js");
await connectDB(process.env.MONGODB_URI);
const result = await seedDatabase();
console.log(`In-memory MongoDB ready (${result.menuAdded} dishes, ${result.tablesAdded} tables)`);
console.log("Awel compte li tsjjel ghadi ykoun Admin.");

process.on("exit", () => mongo.stop());
await import("../src/server.js");
