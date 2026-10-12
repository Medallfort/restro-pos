import { describe, expect, test } from "vitest";
import { pointsValue, redeemOptions } from "./loyalty";

describe("loyalty", () => {
  test("can use points in steps of 100, limited by the balance", () => {
    expect(redeemOptions({ points: 350, total: 500 })).toEqual({ maxSteps: 3, step: 100, value: 10 });
    expect(redeemOptions({ points: 99, total: 500 }).maxSteps).toBe(0);
  });

  test("the discount never goes above the order total", () => {
    // 25 DH: max 2 x 10 DH, meme b 1000 points
    expect(redeemOptions({ points: 1000, total: 25 }).maxSteps).toBe(2);
    expect(redeemOptions({ points: 1000, total: 0 }).maxSteps).toBe(0);
  });

  test("points value only counts full blocks of 100", () => {
    expect(pointsValue(0)).toBe(0);
    expect(pointsValue(99)).toBe(0);
    expect(pointsValue(250)).toBe(20);
  });
});
