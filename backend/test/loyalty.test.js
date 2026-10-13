import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

let mongo;
let app;
let disconnectDB;

before(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(process.env, {
    NODE_ENV: "test",
    MONGODB_URI: mongo.getUri("restro-loyalty-test"),
    JWT_SECRET: "test-secret-that-is-long-enough-1234567890",
    TAX_RATE: "10",
  });

  const db = await import("../src/config/db.js");
  const { createApp } = await import("../src/app.js");
  const { seedDatabase } = await import("../src/data/seed.js");
  disconnectDB = db.disconnectDB;
  await db.connectDB(process.env.MONGODB_URI);
  await seedDatabase();
  app = createApp();
});

after(async () => {
  await disconnectDB();
  await mongo.stop();
});

async function account(n) {
  const user = {
    name: `Loyal ${n}`,
    email: `loyal${n}@restro.test`,
    phone: "+212 600000000",
    password: "password123",
  };
  await request(app).post("/api/user/register").send(user).expect(201);
  const agent = request.agent(app);
  await agent.post("/api/user/login").send({ email: user.email, password: user.password }).expect(200);
  return agent;
}

const points = async (agent) => (await agent.get("/api/user")).body.data.loyaltyPoints;

// Takeaway: ma kat7jezch table, donc n9dro ndiro bzzaf dyal commandes
const takeaway = (items, extra = {}) => ({
  customerDetails: { name: "x", guests: 1 },
  orderType: "Takeaway",
  items,
  paymentMethod: "Cash",
  ...extra,
});

describe("Loyalty points", () => {
  let staff;
  let client;

  // Serveur kay-confirmi w kaysalli commande dyal client
  const complete = async (orderId) => {
    await staff.put(`/api/order/${orderId}`).send({ orderStatus: "In Progress" }).expect(200);
    await staff.put(`/api/order/${orderId}`).send({ orderStatus: "Completed" }).expect(200);
  };

  before(async () => {
    staff = await account(1); // awel compte = Admin
    client = await account(2);
  });

  test("a new client starts with 0 points; the config is public", async () => {
    assert.equal(await points(client), 0);
    const { body } = await client.get("/api/config");
    assert.deepEqual(body.data.loyalty, { pointsPerDh: 1, redeemStep: 100, redeemValue: 10 });
  });

  test("points are earned only when the order is completed, 1 point per DH paid", async () => {
    // 2 x Tanjia (110) = 220 + 10% TVA = 242 DH
    const { body } = await client
      .post("/api/order")
      .send(takeaway([{ name: "Tanjia Marrakchia", quantity: 2 }]))
      .expect(201);
    assert.equal(body.data.bills.totalWithTax, 242);

    await staff.put(`/api/order/${body.data._id}`).send({ orderStatus: "In Progress" }).expect(200);
    assert.equal(await points(client), 0);

    const done = await staff
      .put(`/api/order/${body.data._id}`)
      .send({ orderStatus: "Completed" })
      .expect(200);
    assert.equal(done.body.data.loyalty.pointsEarned, 242);
    assert.equal(await points(client), 242);
  });

  test("100 points = 10 DH off, before tax", async () => {
    const { body } = await client
      .post("/api/order")
      .send(takeaway([{ name: "Tanjia Marrakchia", quantity: 1 }], { redeemPoints: 200 }))
      .expect(201);

    // 110 - 20 = 90 + 10% = 99
    assert.deepEqual(body.data.bills, { total: 110, discount: 20, tax: 9, totalWithTax: 99 });
    assert.equal(body.data.loyalty.pointsRedeemed, 200);
    assert.equal(await points(client), 42);

    // Points jdad 3la li khlles b sa7 (99), machi 3la 110
    await complete(body.data._id);
    assert.equal(await points(client), 42 + 99);
  });

  test("cannot use more points than the balance, nor in steps other than 100", async () => {
    const balance = await points(client);
    await client
      .post("/api/order")
      .send(takeaway([{ name: "Méchoui", quantity: 3 }], { redeemPoints: 200 }))
      .expect(400);
    await client
      .post("/api/order")
      .send(takeaway([{ name: "Méchoui", quantity: 1 }], { redeemPoints: 50 }))
      .expect(400);
    assert.equal(await points(client), balance);
  });

  test("the discount cannot be more than the order", async () => {
    const rich = await account(3);
    // 10 x Méchoui (120) = 1200 + 10% = 1320 points
    const { body } = await rich
      .post("/api/order")
      .send(takeaway([{ name: "Méchoui", quantity: 10 }]))
      .expect(201);
    await complete(body.data._id);
    assert.equal(await points(rich), 1320);

    // Eau Minérale = 10 DH: 200 points (20 DH) bzzaf
    await rich
      .post("/api/order")
      .send(takeaway([{ name: "Eau Minérale", quantity: 1 }], { redeemPoints: 200 }))
      .expect(400);
    assert.equal(await points(rich), 1320);
  });

  test("cancelling an order gives the used points back, and earns nothing", async () => {
    const before = await points(client);
    const { body } = await client
      .post("/api/order")
      .send(takeaway([{ name: "Méchoui", quantity: 1 }], { redeemPoints: 100 }))
      .expect(201);
    assert.equal(await points(client), before - 100);

    await staff.put(`/api/order/${body.data._id}`).send({ orderStatus: "Cancelled" }).expect(200);
    assert.equal(await points(client), before);
  });

  test("staff orders (walk-in customers) neither earn nor use points", async () => {
    await staff
      .post("/api/order")
      .send(takeaway([{ name: "Harira", quantity: 1 }], { redeemPoints: 100 }))
      .expect(400);

    const { body } = await staff
      .post("/api/order")
      .send(takeaway([{ name: "Harira", quantity: 5 }]))
      .expect(201);
    await staff.put(`/api/order/${body.data._id}`).send({ orderStatus: "Completed" }).expect(200);
    assert.equal(await points(staff), 0);
  });

  test("completing the same order twice at once awards points only once", async () => {
    const solo = await account(4);
    const { body } = await solo
      .post("/api/order")
      .send(takeaway([{ name: "Harira", quantity: 10 }]))
      .expect(201);
    await staff.put(`/api/order/${body.data._id}`).send({ orderStatus: "In Progress" }).expect(200);

    const results = await Promise.all([
      staff.put(`/api/order/${body.data._id}`).send({ orderStatus: "Completed" }),
      staff.put(`/api/order/${body.data._id}`).send({ orderStatus: "Completed" }),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
    // 10 x 20 = 200 + 10% = 220
    assert.equal(await points(solo), 220);
  });
});
