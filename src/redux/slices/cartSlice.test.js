import { describe, expect, test } from "vitest";
import reducer, { addItems, getTotalPrice, MAX_QUANTITY, removeAllItems, removeItem } from "./cartSlice";

const samosa = (quantity = 1) => ({ id: 1, name: "Samosa", pricePerQuantity: 30, quantity });
const chai = (quantity = 1) => ({ id: 2, name: "Chai", pricePerQuantity: 15, quantity });

describe("cartSlice", () => {
  test("adds a dish and computes its price", () => {
    const state = reducer([], addItems(samosa(2)));
    expect(state).toEqual([{ ...samosa(2), price: 60 }]);
  });

  test("adding the same dish again increases the quantity instead of duplicating it", () => {
    let state = reducer([], addItems(samosa(1)));
    state = reducer(state, addItems(samosa(3)));
    expect(state).toHaveLength(1);
    expect(state[0]).toMatchObject({ quantity: 4, price: 120 });
  });

  test("quantity never goes above the backend limit", () => {
    let state = reducer([], addItems(samosa(MAX_QUANTITY + 5)));
    expect(state[0].quantity).toBe(MAX_QUANTITY);
    state = reducer(state, addItems(samosa(1)));
    expect(state[0]).toMatchObject({ quantity: MAX_QUANTITY, price: 30 * MAX_QUANTITY });
  });

  test("removes one dish or empties the cart", () => {
    let state = reducer([], addItems(samosa()));
    state = reducer(state, addItems(chai()));
    state = reducer(state, removeItem(1));
    expect(state.map((item) => item.name)).toEqual(["Chai"]);
    expect(reducer(state, removeAllItems())).toEqual([]);
  });

  test("getTotalPrice sums the cart", () => {
    let cart = reducer([], addItems(samosa(2)));
    cart = reducer(cart, addItems(chai(1)));
    expect(getTotalPrice({ cart })).toBe(75);
  });
});
