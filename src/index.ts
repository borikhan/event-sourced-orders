import { createServer } from "node:http";
import { decide } from "./domain.js";
import { EventStore } from "./store.js";
const store = new EventStore();
const port = Number(process.env.PORT ?? 8080);
createServer(async (req, res) => {
  res.setHeader("content-type", "application/json");
  if (req.url === "/healthz") return end(res, 200, { status: "ok" });
  const id = req.url?.split("/")[3];
  try {
    if (req.method === "POST" && id) {
      const command = await read(req);
      const current = store.load(id);
      const events = decide(current, { ...command, orderId: id });
      return end(res, 200, store.append(id, current.version, events));
    }
    if (req.method === "GET" && id) return end(res, 200, store.load(id));
    return end(res, 404, { error: "not found" });
  } catch (e) {
    return end(res, 409, { error: String(e) });
  }
}).listen(port, () =>
  console.log(JSON.stringify({ level: "info", message: "listening", port })),
);
async function read(req: any) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString());
}
function end(res: any, s: number, v: unknown) {
  res.statusCode = s;
  res.end(JSON.stringify(v));
}
