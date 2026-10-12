import { test } from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import express from "express";
import { pinoHttp } from "pino-http";
import request from "supertest";
import { httpLoggerOptions } from "../src/config/logger.js";

test("request logs never contain the session cookie", async () => {
  const lines = [];
  const stream = new Writable({
    write(chunk, encoding, done) {
      lines.push(chunk.toString());
      done();
    },
  });

  const app = express();
  app.use(pinoHttp(httpLoggerOptions, stream));
  // Login: kaysift cookie f Set-Cookie
  app.get("/login", (req, res) => res.cookie("accessToken", "NEW-SECRET-JWT").json({ ok: true }));

  await request(app).get("/login").set("Cookie", "accessToken=OLD-SECRET-JWT").expect(200);
  await new Promise((resolve) => setImmediate(resolve));

  const log = lines.join("");
  assert.ok(log.includes('"url":"/login"'), "the request is still logged");
  assert.ok(!log.includes("OLD-SECRET-JWT"), "request cookie is redacted");
  assert.ok(!log.includes("NEW-SECRET-JWT"), "Set-Cookie is redacted");
  assert.ok(log.includes("[redacted]"));
});
