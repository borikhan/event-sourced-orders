import test from "node:test";
import assert from "node:assert/strict";
import { decide, evolve, initial } from "../src/domain.js";
test("confirmed order preserves event-sourced total", () => {
  let order = initial();
  for (const command of [
    { type: "CreateOrder", orderId: "o1", customerId: "c1" },
    { type: "AddItem", sku: "coffee", quantity: 2, unitPriceCents: 450 },
    { type: "ConfirmOrder" },
  ])
    for (const event of decide(order, command)) order = evolve(order, event);
  assert.equal(order.totalCents, 900);
  assert.equal(order.status, "confirmed");
  assert.throws(() =>
    decide(order, {
      type: "AddItem",
      sku: "x",
      quantity: 1,
      unitPriceCents: 1,
    }),
  );
});
