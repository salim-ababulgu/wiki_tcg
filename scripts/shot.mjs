import { writeFile } from "node:fs/promises";

/**
 * Capture d'écran + mesures de layout via le protocole DevTools (CDP).
 * Usage : node scripts/shot.mjs <url> <sortie.png> <largeur> <hauteur>
 */
const [, , url, out, widthArg = "390", heightArg = "844"] = process.argv;
const width = Number(widthArg);
const height = Number(heightArg);

const targets = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = targets.find((target) => target.type === "page");
if (!page) throw new Error("Aucune cible 'page' trouvée sur le port 9222");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 1;
const pending = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});

function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 640,
});
await send("Page.navigate", { url });
await new Promise((resolve) => setTimeout(resolve, 2500));

const metrics = await send("Runtime.evaluate", {
  expression: `JSON.stringify({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    title: document.title
  })`,
  returnByValue: true,
});

const shot = await send("Page.captureScreenshot", { format: "png" });
await writeFile(out, Buffer.from(shot.result.data, "base64"));
console.log(metrics.result.result.value);
socket.close();
