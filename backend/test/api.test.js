import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

let mongo;
let app;
let disconnectDB;

// env.js kay9ra process.env f l-import, donc khass n7ddedouh 9bel
before(async () => {
  mongo = await MongoMemoryServer.create();
  Object.assign(process.env, {
    NODE_ENV: "test",
    MONGODB_URI: mongo.getUri("restro-test"),
    JWT_SECRET: "test-secret-that-is-long-enough-1234567890",
    TAX_RATE: "5.25",
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

const user = (n) => ({
  name: `User ${n}`,
  email: `user${n}@restro.test`,
  phone: "+212 600000000",
  password: "password123",
});

async function registerAndLogin(n) {
  await request(app).post("/api/user/register").send(user(n)).expect(201);
  const agent = request.agent(app);
  await agent.post("/api/user/login").send({ email: user(n).email, password: user(n).password }).expect(200);
  return agent;
}

describe("Restro POS API", () => {
  let admin;
  let waiter;

  test("first user is Admin, next ones are Waiter (role in body ignored)", async () => {
    admin = await registerAndLogin(1);
    await request(app)
      .post("/api/user/register")
      .send({ ...user(2), role: "Admin" })
      .expect(201);
    waiter = request.agent(app);
    await waiter.post("/api/user/login").send({ email: user(2).email, password: user(2).password });

    assert.equal((await admin.get("/api/user")).body.data.role, "Admin");
    assert.equal((await waiter.get("/api/user")).body.data.role, "Waiter");
  });

  test("login does not reveal whether the email exists", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ email: "nobody@restro.test", password: "whatever1" })
      .expect(401);
    assert.equal(res.body.message, "Invalid email or password");
  });

  test("protected routes need a session", async () => {
    await request(app).get("/api/order").expect(401);
  });

  test("waiter cannot use admin routes", async () => {
    await waiter.post("/api/table").send({ tableNo: 50, seats: 4 }).expect(403);
    await waiter.post("/api/menu").send({ name: "Hack", category: "X", price: 1 }).expect(403);
    await waiter.get("/api/user/all").expect(403);
  });

  test("order prices are computed by the server, not the client", async () => {
    const { body: tables } = await waiter.get("/api/table").expect(200);
    const table = tables.data[0];

    const res = await waiter
      .post("/api/order")
      .send({
        customerDetails: { name: "Amine", phone: "", guests: 2 },
        items: [{ name: "Butter Chicken", quantity: 2, price: 1 }],
        bills: { total: 1, tax: 0, totalWithTax: 1 },
        table: table._id,
        paymentMethod: "Cash",
      })
      .expect(201);

    assert.deepEqual(res.body.data.bills, { total: 800, tax: 42, totalWithTax: 842 });
    assert.equal(res.body.data.items[0].pricePerQuantity, 400);

    const after = await waiter.get("/api/table");
    assert.equal(after.body.data[0].status, "Booked");

    // Nefs table ma t9derch tt7jez jouj merrat
    await waiter
      .post("/api/order")
      .send({
        customerDetails: { name: "Other", guests: 1 },
        items: [{ name: "Samosa", quantity: 1 }],
        table: table._id,
        paymentMethod: "Cash",
      })
      .expect(409);
  });

  test("unknown dishes are rejected", async () => {
    const { body } = await waiter.get("/api/table");
    await waiter
      .post("/api/order")
      .send({
        customerDetails: { name: "X", guests: 1 },
        items: [{ name: "Free Lobster", quantity: 1 }],
        table: body.data[1]._id,
        paymentMethod: "Cash",
      })
      .expect(400);
  });

  test("completing an order frees its table", async () => {
    const { body: orders } = await waiter.get("/api/order");
    const order = orders.data[0];
    await waiter.put(`/api/order/${order._id}`).send({ orderStatus: "Completed" }).expect(200);

    const { body: tables } = await waiter.get("/api/table");
    const table = tables.data.find((t) => t._id === order.table._id);
    assert.equal(table.status, "Available");
  });

  test("stats reflect orders", async () => {
    const { body } = await waiter.get("/api/stats").expect(200);
    assert.equal(body.data.todayOrders, 1);
    assert.equal(body.data.todayRevenue, 842);
    assert.equal(body.data.popularDishes[0].name, "Butter Chicken");
  });

  test("admin can add dishes and manage roles", async () => {
    await admin
      .post("/api/menu")
      .send({ name: "Harira", category: "Soups", price: 40 })
      .expect(201);
    const { body: menu } = await waiter.get("/api/menu");
    assert.ok(menu.data.some((item) => item.name === "Harira"));

    const { body: users } = await admin.get("/api/user/all").expect(200);
    const target = users.data.find((u) => u.email === user(2).email);
    await admin.put(`/api/user/${target._id}/role`).send({ role: "Cashier" }).expect(200);
    assert.equal((await waiter.get("/api/user")).body.data.role, "Cashier");
  });

  test("online payment is disabled without Razorpay keys", async () => {
    const { body } = await waiter.get("/api/payment/config");
    assert.equal(body.data.onlineEnabled, false);
    await waiter
      .post("/api/payment/create-order")
      .send({ items: [{ name: "Samosa", quantity: 1 }] })
      .expect(503);
  });

  test("NoSQL operator injection in login is neutralised", async () => {
    await request(app)
      .post("/api/user/login")
      .send({ email: { $gt: "" }, password: "x" })
      .expect(400);
  });
});
