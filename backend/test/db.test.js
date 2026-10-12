import { after, test } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, disconnectDB } from "../src/config/db.js";

let mongo;

after(async () => {
  await disconnectDB();
  await mongo?.stop();
});

test("connectDB waits for a MongoDB that starts late", async () => {
  // Port khawi daba; MongoDB katbda 3lih ba3d chwiya (b7al awel démarrage f Docker)
  const probe = await MongoMemoryServer.create();
  const port = probe.instanceInfo.port;
  await probe.stop();

  const retries = [];
  const started = new Promise((resolve) => {
    setTimeout(async () => {
      mongo = await MongoMemoryServer.create({ instance: { port } });
      resolve();
    }, 1500);
  });

  await connectDB(`mongodb://127.0.0.1:${port}/late`, {
    attempts: 40,
    delayMs: 200,
    serverSelectionTimeoutMS: 300,
    log: (message) => retries.push(message),
  });
  await started;
  assert.ok(retries.length >= 1, "it retried at least once");
});

test("connectDB gives up after the last attempt", async () => {
  const retries = [];
  await assert.rejects(
    connectDB("mongodb://127.0.0.1:1/never", {
      attempts: 2,
      delayMs: 10,
      serverSelectionTimeoutMS: 200,
      log: (m) => retries.push(m),
    })
  );
  assert.equal(retries.length, 1);
});
