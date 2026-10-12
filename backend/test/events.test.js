import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

let mongo;
let server;
let baseUrl;
let disconnectDB;
let closeAll;

before(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(process.env, {
    NODE_ENV: "test",
    MONGODB_URI: mongo.getUri("restro-events-test"),
    JWT_SECRET: "test-secret-that-is-long-enough-1234567890",
  });

  const db = await import("../src/config/db.js");
  const { createApp } = await import("../src/app.js");
  const { seedDatabase } = await import("../src/data/seed.js");
  ({ closeAll } = await import("../src/realtime/events.js"));
  disconnectDB = db.disconnectDB;
  await db.connectDB(process.env.MONGODB_URI);
  await seedDatabase();

  // SSE khasso server 7a9i9i (supertest kaysenna l-response tsala)
  server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  closeAll();
  await new Promise((resolve) => server.close(resolve));
  await disconnectDB();
  await mongo.stop();
});

// Kat-sjjel compte w katrje3 l-cookie dyal session
async function sessionCookie(n) {
  const account = {
    name: `User ${n}`,
    email: `live${n}@restro.test`,
    phone: "+212 600000000",
    password: "password123",
  };
  await request(baseUrl).post("/api/user/register").send(account).expect(201);
  const res = await request(baseUrl)
    .post("/api/user/login")
    .send({ email: account.email, password: account.password })
    .expect(200);
  return res.headers["set-cookie"][0].split(";")[0];
}

// Kat-7l connexion SSE w kat-jme3 les types dyal les events li wslo
async function listen(cookie) {
  const controller = new AbortController();
  const res = await fetch(`${baseUrl}/api/events`, {
    headers: { cookie },
    signal: controller.signal,
  });
  const events = [];
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  (async () => {
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) return;
        for (const line of value.split("\n")) {
          if (line.startsWith("data: ")) events.push(JSON.parse(line.slice(6)).type);
        }
      }
    } catch {
      // abort
    }
  })();
  return { res, events, close: () => controller.abort() };
}

const waitFor = async (check) => {
  for (let i = 0; i < 50; i++) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.fail("event never arrived");
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 200));

describe("Live updates (SSE)", () => {
  let adminCookie;
  let clientCookie;
  let otherClientCookie;

  before(async () => {
    adminCookie = await sessionCookie(1); // awel compte = Admin
    clientCookie = await sessionCookie(2);
    otherClientCookie = await sessionCookie(3);
  });

  test("needs a session", async () => {
    const res = await fetch(`${baseUrl}/api/events`);
    assert.equal(res.status, 401);
  });

  test("staff and the order owner are notified, other clients are not", async () => {
    const staff = await listen(adminCookie);
    const owner = await listen(clientCookie);
    const stranger = await listen(otherClientCookie);
    assert.equal(staff.res.headers.get("content-type"), "text/event-stream; charset=utf-8");

    await request(baseUrl)
      .post("/api/order")
      .set("Cookie", clientCookie)
      .send({
        customerDetails: { name: "Client", guests: 1 },
        orderType: "Takeaway",
        items: [{ name: "Harira", quantity: 1 }],
        paymentMethod: "Cash",
      })
      .expect(201);

    await waitFor(() => staff.events.includes("orders") && owner.events.includes("orders"));
    await settle();
    assert.deepEqual(stranger.events, []);

    staff.close();
    owner.close();
    stranger.close();
  });

  test("table changes go to staff only, menu changes to everyone", async () => {
    const staff = await listen(adminCookie);
    const client = await listen(clientCookie);

    await request(baseUrl)
      .post("/api/table")
      .set("Cookie", adminCookie)
      .send({ tableNo: 99, seats: 2 })
      .expect(201);
    await waitFor(() => staff.events.includes("tables"));

    const { body } = await request(baseUrl).get("/api/menu").set("Cookie", adminCookie);
    await request(baseUrl)
      .put(`/api/menu/${body.data[0]._id}`)
      .set("Cookie", adminCookie)
      .send({ price: 123 })
      .expect(200);
    await waitFor(() => client.events.includes("menu"));
    assert.ok(!client.events.includes("tables"));

    staff.close();
    client.close();
  });
});
