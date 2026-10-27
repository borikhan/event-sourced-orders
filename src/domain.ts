export type Event =
  | {
      type: "OrderCreated";
      at: string;
      data: { orderId: string; customerId: string };
    }
  | {
      type: "ItemAdded";
      at: string;
      data: { sku: string; quantity: number; unitPriceCents: number };
    }
  | { type: "OrderConfirmed"; at: string; data: {} }
  | { type: "OrderCancelled"; at: string; data: { reason: string } };
export type Order = {
  id: string;
  customerId: string;
  status: "draft" | "confirmed" | "cancelled";
  items: { sku: string; quantity: number; unitPriceCents: number }[];
  totalCents: number;
  version: number;
};
export const initial = (): Order => ({
  id: "",
  customerId: "",
  status: "draft",
  items: [],
  totalCents: 0,
  version: 0,
});
export function evolve(order: Order, event: Event): Order {
  const next = structuredClone(order);
  next.version++;
  if (event.type === "OrderCreated") {
    next.id = event.data.orderId;
    next.customerId = event.data.customerId;
  }
  if (event.type === "ItemAdded") {
    next.items.push(event.data);
    next.totalCents += event.data.quantity * event.data.unitPriceCents;
  }
  if (event.type === "OrderConfirmed") next.status = "confirmed";
  if (event.type === "OrderCancelled") next.status = "cancelled";
  return next;
}
export function decide(order: Order, command: any): Event[] {
  const at = new Date().toISOString();
  if (command.type === "CreateOrder" && order.version === 0)
    return [
      {
        type: "OrderCreated",
        at,
        data: { orderId: command.orderId, customerId: command.customerId },
      },
    ];
  if (
    command.type === "AddItem" &&
    order.status === "draft" &&
    command.quantity > 0 &&
    command.unitPriceCents > 0
  )
    return [
      {
        type: "ItemAdded",
        at,
        data: {
          sku: command.sku,
          quantity: command.quantity,
          unitPriceCents: command.unitPriceCents,
        },
      },
    ];
  if (
    command.type === "ConfirmOrder" &&
    order.status === "draft" &&
    order.items.length
  )
    return [{ type: "OrderConfirmed", at, data: {} }];
  if (command.type === "CancelOrder" && order.status !== "cancelled")
    return [
      {
        type: "OrderCancelled",
        at,
        data: { reason: command.reason ?? "unspecified" },
      },
    ];
  throw new Error("command violates order invariant");
}
