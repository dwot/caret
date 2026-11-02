// Plays the course in a real browser, against a built site with the worker slowed down as on a real connection.
// Each level's solution has to solve it, and each `+++ wrong` pattern has to fail.
//   npm run build && npm run play                 every level, in Chrome
//   npm run play -- spot-the-typos                just that level
//   BROWSER=firefox npm run play                  firefox or webkit, from `npx playwright-core install`
import { readFileSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { chromium, firefox, webkit } from "playwright-core";

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain" };
const port = 5198;
const base = `http://localhost:${port}/`;

const server = createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, base).pathname);
  const file = join("dist", normalize(path.endsWith("/") ? path + "index.html" : path));
  try {
    const body = await readFile(file);
    // A level can open before the worker arrives, and has to wait for it.
    if (file.includes("worker")) await new Promise((r) => setTimeout(r, 1000));
    response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(port);

const section = (text, name) => (new RegExp(`^\\+\\+\\+ ${name}\\n([\\s\\S]*?)(?=\\n\\+\\+\\+ |$(?![\\s\\S]))`, "m").exec(text)?.[1] ?? "").trim();
const levels = readdirSync("src/levels").filter((f) => f.endsWith(".md")).sort().map((file) => {
  const text = readFileSync(`src/levels/${file}`, "utf8");
  const meta = (key) => new RegExp(`^${key}: (.+)$`, "m").exec(text)?.[1];
  return {
    id: meta("id"),
    flags: meta("solutionflags") ?? meta("flags") ?? "",
    solution: section(text, "solution"),
    replacement: section(text, "replacement"),
    wrong: section(text, "wrong").split("\n").filter(Boolean),
  };
});
const chosen = process.argv.slice(2).length ? levels.filter((l) => process.argv.includes(l.id)) : levels;

const engines = { chromium, firefox, webkit };
const name = process.env.BROWSER ?? "chromium";
const browser = await engines[name].launch(name === "chromium" ? { executablePath: process.env.CHROME ?? "/usr/bin/google-chrome" } : {});
const context = await browser.newContext({ viewport: { width: 1280, height: 820 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const failures = [];
async function attempt(label, run) {
  try {
    await run();
    if (errors.length) throw new Error(`page error: ${errors.splice(0).join("; ")}`);
    console.log(`ok    ${label}`);
  } catch (error) {
    failures.push(`${label}: ${error.message.split("\n")[0]}`);
    console.log(`FAIL  ${label}: ${error.message.split("\n")[0]}`);
  }
}

const result = () => page.$eval("#result", (e) => e.innerText);

async function play(level, pattern, flags, replacement) {
  await page.fill("#pattern", pattern);
  await page.fill("#flags", flags);
  if (await page.isVisible("#replacement")) await page.fill("#replacement", replacement);
  await page.click("#btn-check");
  await page.waitForFunction(() => document.querySelector("#result").innerText !== "", null, { timeout: 5000 });
  return result();
}

async function open(id) {
  await page.evaluate((id) => (location.hash = `#/level/${id}`), id);
  await page.waitForFunction((id) => location.hash.endsWith(id), id);
  await page.click("#btn-reset");
}

await attempt("first visit shows How to play", async () => {
  await page.goto(base);
  await page.waitForSelector("dialog[open]", { timeout: 5000 });
  await page.keyboard.press("Escape");
  await page.click(".continue");
  await page.fill("#pattern", "cat");
  await page.waitForFunction(() => document.querySelectorAll("#want-match mark").length === 3, null, { timeout: 5000 });
  if (await page.$(".lines li.right")) throw new Error("marks showed before Check");
});

await page.evaluate((ids) => localStorage.setItem("caret:v1", JSON.stringify({ stars: Object.fromEntries(ids.map((id) => [id, 3])), attempts: {} })), levels.map((l) => l.id));
await page.reload();
await page.waitForSelector("#star-total");

for (const level of chosen) {
  await attempt(`${level.id}: solution`, async () => {
    await open(level.id);
    const text = await play(level, level.solution, level.flags, level.replacement);
    if (!text.includes("Solved ★★★")) throw new Error(`got: ${text.slice(0, 120)}`);
  });
  for (const wrong of level.wrong) {
    await attempt(`${level.id}: rejects ${wrong}`, async () => {
      await open(level.id);
      const [pattern, replacement] = wrong.split(" ==> ");
      const text = await play(level, pattern, level.flags, replacement ?? level.replacement);
      if (text.includes("Solved")) throw new Error("solved it");
    });
  }
}

await attempt("a runaway pattern is stopped, and the next one works", async () => {
  await open("just-the-word");
  await page.evaluate(() => {
    window.stalls = [];
    let last = performance.now();
    setInterval(() => (window.stalls.push(performance.now() - last), (last = performance.now())), 20);
  });
  await page.fill("#pattern", "(.|.|.)+#");
  await page.waitForFunction(() => /too long/.test(document.querySelector("#status").textContent), null, { timeout: 5000 });
  const worst = await page.evaluate(() => Math.max(...window.stalls));
  if (worst > 300) throw new Error(`the page stalled for ${Math.round(worst)} ms`);
  await page.fill("#pattern", "cat");
  await page.waitForFunction(() => document.querySelectorAll("#want-match mark").length === 3, null, { timeout: 5000 });
});

await attempt("the hanging level hangs until it's fixed", async () => {
  await open("the-hanging-pattern");
  await page.waitForFunction(() => /too long/.test(document.querySelector("#status").textContent), null, { timeout: 5000 });
});

await attempt("nudges for silent slips", async () => {
  await open("just-the-word");
  await page.fill("#pattern", "[a+]");
  await page.waitForFunction(() => /after the \]/.test(document.querySelector("#status").textContent), null, { timeout: 5000 });
  await page.fill("#pattern", "/cat/");
  await page.waitForFunction(() => /already there/.test(document.querySelector("#status").textContent), null, { timeout: 5000 });
});

await attempt("every view fits a phone", async () => {
  const phone = await (await browser.newContext({ viewport: { width: 360, height: 700 } })).newPage();
  await phone.goto(base);
  await phone.waitForSelector("dialog[open]");
  await phone.keyboard.press("Escape");
  for (const hash of ["#/", "#/sheet", "#/level/just-the-word"]) {
    await phone.evaluate((hash) => (location.hash = hash), hash);
    await phone.waitForTimeout(150);
    const [scroll, width] = await phone.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    if (scroll > width) throw new Error(`${hash} is ${scroll}px wide`);
  }
});

await browser.close();
server.close();
console.log(failures.length ? `\n${failures.length} failed:\n${failures.join("\n")}` : `\nAll ${chosen.length} levels pass in ${name}.`);
process.exit(failures.length ? 1 : 0);
