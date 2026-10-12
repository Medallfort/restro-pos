import { describe, expect, test } from "vitest";
import { formatDate, formatPrice, getAvatarName, orderLabel } from "./index";

describe("utils", () => {
  test("getAvatarName takes the initials", () => {
    expect(getAvatarName("med amine lotfi")).toBe("MAL");
    expect(getAvatarName("")).toBe("");
    expect(getAvatarName(undefined)).toBe("");
  });

  test("formatPrice shows dirhams with at most 2 decimals", () => {
    expect(formatPrice(42)).toMatch(/^42 DH$/);
    expect(formatPrice(12.345)).toMatch(/^12,35 DH$/);
  });

  test("formatDate", () => {
    expect(formatDate(new Date(2026, 9, 5))).toBe("October 05, 2026");
  });

  test("orderLabel: table number, takeaway, or missing table", () => {
    expect(orderLabel({ orderType: "Dine In", table: { tableNo: 4 } })).toBe("Table 4");
    expect(orderLabel({ orderType: "Takeaway" })).toBe("Takeaway");
    expect(orderLabel({ orderType: "Dine In", table: null })).toBe("Table -");
  });
});
