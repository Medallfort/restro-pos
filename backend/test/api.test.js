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

  test("first user is Admin, next ones are Client (role in body ignored)", async () => {
    admin = await registerAndLogin(1);
    await request(app)
      .post("/api/user/register")
      .send({ ...user(2), role: "Admin" })
      .expect(201);
    waiter = request.agent(app);
    await waiter.post("/api/user/login").send({ email: user(2).email, password: user(2).password });

    assert.equal((await admin.get("/api/user")).body.data.role, "Admin");
    const me = (await waiter.get("/api/user")).body.data;
    assert.equal(me.role, "Client");

    // Admin howa li kay-promoter les employés
    await admin.put(`/api/user/${me._id}/role`).send({ role: "Waiter" }).expect(200);
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

  test("each table keeps the history of its orders", async () => {
    const { body: tables } = await waiter.get("/api/table");
    const table = tables.data[0];

    // Commande tanya 3la nefs table (wlat Available)
    await waiter
      .post("/api/order")
      .send({
        customerDetails: { name: "Second", guests: 3 },
        items: [{ name: "Butter Chicken", quantity: 1 }],
        table: table._id,
        paymentMethod: "Cash",
      })
      .expect(201);

    const { body } = await waiter.get(`/api/table/${table._id}/history`).expect(200);
    assert.equal(body.data.summary.ordersCount, 2);
    assert.equal(body.data.summary.guests, 5);
    assert.equal(body.data.summary.revenue, 842 + 421);
    assert.deepEqual(
      body.data.orders.map((o) => o.customerDetails.name),
      ["Second", "Amine"]
    );
    assert.equal(body.data.orders[0].servedBy.name, "User 2");

    // Table khra ma 3ndha 7ta commande
    const empty = await waiter.get(`/api/table/${tables.data[5]._id}/history`).expect(200);
    assert.equal(empty.body.data.summary.ordersCount, 0);
    assert.deepEqual(empty.body.data.orders, []);

    await waiter.get("/api/table/not-an-id/history").expect(400);
  });

  test("stats reflect orders, revenue is admin-only", async () => {
    const { body } = await waiter.get("/api/stats").expect(200);
    assert.equal(body.data.todayOrders, 2);
    assert.equal(body.data.todayRevenue, undefined);
    assert.equal(body.data.popularDishes[0].name, "Butter Chicken");

    const { body: adminStats } = await admin.get("/api/stats").expect(200);
    assert.equal(adminStats.data.todayRevenue, 842 + 421);
  });

  describe("client orders", () => {
    let client;
    let otherClient;
    let tables;

    before(async () => {
      client = await registerAndLogin(10);
      otherClient = await registerAndLogin(11);
      tables = (await waiter.get("/api/table")).body.data;
    });

    const clientOrder = (extra) => ({
      customerDetails: { name: "Fake name", phone: "000", guests: 2 },
      items: [{ name: "Samosa", quantity: 2 }],
      paymentMethod: "Cash",
      ...extra,
    });

    test("clients cannot see tables, other orders or stats", async () => {
      await client.get("/api/table").expect(403);
      await client.get("/api/order").expect(403);
      await client.get("/api/stats").expect(403);
      await client.get(`/api/table/${tables[0]._id}/history`).expect(403);
      await client.get("/api/menu").expect(200);
    });

    test("dine-in by table number: pending, books the table, uses the account name", async () => {
      const tableNo = tables[2].tableNo;
      const { body } = await client
        .post("/api/order")
        .send(clientOrder({ orderType: "Dine In", tableNo }))
        .expect(201);

      assert.equal(body.data.orderStatus, "Pending");
      assert.equal(body.data.customerDetails.name, "User 10");
      assert.equal(body.data.table.tableNo, tableNo);
      assert.equal(body.data.servedBy, null);

      // Table deja m7jouza: commande tanya katrfod
      await otherClient
        .post("/api/order")
        .send(clientOrder({ orderType: "Dine In", tableNo }))
        .expect(409);

      // Pending ma kat7sbch f chiffre d'affaires
      const { body: stats } = await admin.get("/api/stats");
      assert.equal(stats.data.pending, 1);
      assert.equal(stats.data.todayRevenue, 842 + 421);
    });

    test("dine-in needs a valid table number, takeaway does not", async () => {
      await client.post("/api/order").send(clientOrder({ orderType: "Dine In" })).expect(400);
      await client
        .post("/api/order")
        .send(clientOrder({ orderType: "Dine In", tableNo: 999 }))
        .expect(404);

      const { body } = await client
        .post("/api/order")
        .send(clientOrder({ orderType: "Takeaway" }))
        .expect(201);
      assert.equal(body.data.orderType, "Takeaway");
      assert.equal(body.data.table, null);
    });

    test("clients only see their own orders and cannot change statuses", async () => {
      const mine = (await client.get("/api/order/mine").expect(200)).body.data;
      assert.equal(mine.length, 2);
      assert.ok(mine.every((order) => order.customerDetails.name === "User 10"));

      const others = (await otherClient.get("/api/order/mine").expect(200)).body.data;
      assert.equal(others.length, 0);

      await client.put(`/api/order/${mine[0]._id}`).send({ orderStatus: "Completed" }).expect(403);
    });

    test("waiter confirms or cancels pending orders", async () => {
      const [takeaway, dineIn] = (await client.get("/api/order/mine")).body.data;

      // Ma ymknch nrj3o l Pending wla nsaliw commande msdouda
      await waiter.put(`/api/order/${dineIn._id}`).send({ orderStatus: "Ready" }).expect(409);

      const confirmed = await waiter
        .put(`/api/order/${dineIn._id}`)
        .send({ orderStatus: "In Progress" })
        .expect(200);
      const { body: me } = await waiter.get("/api/user");
      assert.equal(confirmed.body.data.servedBy, me.data._id);

      // Cancel kay7rr table
      await waiter.put(`/api/order/${dineIn._id}`).send({ orderStatus: "Cancelled" }).expect(200);
      const table = (await waiter.get("/api/table")).body.data.find(
        (t) => t._id === dineIn.table._id
      );
      assert.equal(table.status, "Available");
      await waiter.put(`/api/order/${dineIn._id}`).send({ orderStatus: "In Progress" }).expect(409);

      await waiter.put(`/api/order/${takeaway._id}`).send({ orderStatus: "In Progress" }).expect(200);
    });

    test("admin revenue report: totals, per table, per waiter, per type", async () => {
      await waiter.get("/api/stats/revenue").expect(403);
      await admin.get("/api/stats/revenue?period=year").expect(400);

      const { body } = await admin.get("/api/stats/revenue?period=today").expect(200);
      const report = body.data;

      // 842 + 421 (waiter, Table 1) + 210.5 (takeaway confirmé). Cancelled ma kat7sbch
      assert.equal(report.totals.orders, 3);
      assert.equal(report.totals.revenue, 842 + 421 + 210.5);

      assert.equal(report.byTable.length, 1);
      assert.equal(report.byTable[0].tableNo, tables[0].tableNo);
      assert.equal(report.byTable[0].orders, 2);

      assert.equal(report.byStaff.length, 1);
      assert.equal(report.byStaff[0].name, "User 2");
      assert.equal(report.byStaff[0].orders, 3);

      assert.deepEqual(
        report.byType.map(({ type, orders }) => [type, orders]),
        [["Dine In", 2], ["Takeaway", 1]]
      );
    });
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

  test("too many failed logins lock that account only, not the whole IP", async () => {
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post("/api/user/login")
        .send({ email: "victim@restro.test", password: "wrong-password" })
        .expect(401);
    }
    await request(app)
      .post("/api/user/login")
      .send({ email: "victim@restro.test", password: "wrong-password" })
      .expect(429);

    // Chi wa7d akhor 3la nefs l-Wi-Fi (nefs IP) y9der ydkhl
    await request(app)
      .post("/api/user/login")
      .send({ email: user(1).email, password: user(1).password })
      .expect(200);
  });

  test("create-admin script creates an admin, or promotes and resets an existing account", async () => {
    const { upsertAdmin } = await import("../src/data/admin.js");
    const login = (email, password) =>
      request(app).post("/api/user/login").send({ email, password });

    const first = await upsertAdmin({
      name: "Boss",
      email: "Boss@Restro.test",
      phone: "+212 611111111",
      password: "boss-password",
    });
    assert.equal(first.created, true);
    assert.equal((await login("boss@restro.test", "boss-password").expect(200)).body.data.role, "Admin");

    // Compte Client kayn: kaywelli Admin b mot de passe jdid
    const second = await upsertAdmin({ ...user(11), password: "new-password-1" });
    assert.equal(second.created, false);
    await login(user(11).email, user(11).password).expect(401);
    assert.equal((await login(user(11).email, "new-password-1").expect(200)).body.data.role, "Admin");

    await assert.rejects(upsertAdmin({ ...user(12), password: "short" }), /password/);
  });

  test("NoSQL operator injection in login is neutralised", async () => {
    await request(app)
      .post("/api/user/login")
      .send({ email: { $gt: "" }, password: "x" })
      .expect(400);
  });
});
