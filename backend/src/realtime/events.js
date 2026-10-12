// Live updates b Server-Sent Events: server kaygoul l-navigateur "chi 7aja tbeddlat",
// w l-frontend kay3awd ychargi data mn l-API (ma kansiftouch data f l-event, ghir type dyalo).
// SSE kafi hna 7it l-communication f ttijah wa7ed (server -> client), w l-cookie dyal
// session kaytsift m3a l-connexion bla ma nzido walou.
import { STAFF_ROLES } from "../models/User.js";

const HEARTBEAT_MS = 25000;
// Connexion kat-tsedd ba3d sa3a: EventSource kay3awd yconnecta w requireAuth kay3awd ychecki session/role
const MAX_CONNECTION_MS = 60 * 60 * 1000;

const clients = new Set();

const isStaff = (user) => STAFF_ROLES.includes(user.role);

function send(client, type) {
  client.res.write(`data: ${JSON.stringify({ type })}\n\n`);
}

export function subscribe(req, res) {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    // Nginx: ma t-buffferich l-events
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();
  // Ila t9ta3 l-connexion, navigateur kay3awd ba3d 5s
  res.write("retry: 5000\n\n");

  const client = { res, userId: req.user._id.toString(), staff: isStaff(req.user) };
  clients.add(client);

  // Commentaire kol 25s bach proxies (Nginx, Tailscale) ma ysdouch connexion "khawya"
  const heartbeat = setInterval(() => res.write(": ping\n\n"), HEARTBEAT_MS);
  const expiry = setTimeout(() => res.end(), MAX_CONNECTION_MS);

  req.on("close", () => {
    clearInterval(heartbeat);
    clearTimeout(expiry);
    clients.delete(client);
  });
}

// Commande tbeddlat: staff kaychoufo kolchi, client ghir ila kant dyalo
export function notifyOrders(ownerId) {
  const owner = ownerId?.toString();
  for (const client of clients) {
    if (client.staff || client.userId === owner) send(client, "orders");
  }
}

export function notifyTables() {
  for (const client of clients) {
    if (client.staff) send(client, "tables");
  }
}

export function notifyMenu() {
  for (const client of clients) send(client, "menu");
}

// Arret dyal server: n-sdo les connexions SSE bach server.close() ma ytsennach
export function closeAll() {
  for (const client of clients) client.res.end();
  clients.clear();
}

export const connectedCount = () => clients.size;
