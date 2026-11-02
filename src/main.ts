import "./tokens.css";
import "./style.css";
import { marked } from "marked";
import { allLines, isRight, judge, type Verdict } from "./check";
import { chapters, isUnlocked, KIND_LABELS, levelById, levels, type Level } from "./levels";
import { Matcher } from "./matcher";
import { nudge, type LineResult } from "./regex";
import { loadState, saveState, starsFor, type Attempt } from "./storage";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const md = (s: string) => marked.parse(s, { async: false });
const starText = (n: number) => "★".repeat(n) + "☆".repeat(3 - n);

const state = loadState();
const starsOf = (id: string) => state.stars[id] ?? 0;
const matcher = new Matcher();

// ---------- Views ----------

type View = "map" | "level" | "sheet";

function showView(v: View) {
  for (const name of ["map", "level", "sheet"]) $(`${name}-view`).classList.toggle("hidden", name !== v);
  $("nav-sheet").classList.toggle("active", v === "sheet");
  updateStarTotal();
}

function updateStarTotal() {
  const total = Object.values(state.stars).reduce((a, b) => a + b, 0);
  $("star-total").innerHTML = `★ ${total} <span class="muted">/ ${levels.length * 3}</span>`;
}

/** Cheat sheet entry added by the last first-time solve, highlighted on the next visit. */
let freshEntry: string | undefined;

// ---------- Map ----------

function showMap() {
  showView("map");
  $("meta").textContent = `A ${chapters.length * 4}-level course in regular expressions`;

  const next = levels.find((l) => !starsOf(l.id) && isUnlocked(l, starsOf));
  const hero = next
    ? `<a class="continue" href="#/level/${next.id}">
         <span class="muted">${starsOf(levels[0].id) ? "Continue" : "Start"}</span>
         <b>${next.chapter}-${next.order} · ${esc(next.title)}</b>
       </a>`
    : `<div class="continue"><b>All written levels solved.</b><span class="muted">Go back for missing stars ★</span></div>`;

  const sections = chapters.map((ch) => {
    const inChapter = levels.filter((l) => l.chapter === ch.n);
    const earned = inChapter.reduce((sum, l) => sum + starsOf(l.id), 0);
    const nodes = inChapter.length
      ? inChapter
          .map((l) => {
            const open = isUnlocked(l, starsOf);
            const stars = starsOf(l.id);
            const cls = ["node", l.kind, stars ? "done" : open ? "open" : "locked", l === next ? "next" : ""].join(" ");
            const inner = `
              <span class="node-kind">${KIND_LABELS[l.kind]}</span>
              <span class="node-title">${esc(l.title)}</span>
              ${open ? `<span class="stars">${starText(stars)}</span>` : '<span class="lock">locked</span>'}`;
            return open
              ? `<li><a class="${cls}" href="#/level/${l.id}">${inner}</a></li>`
              : `<li><div class="${cls}">${inner}</div></li>`;
          })
          .join("")
      : '<li class="soon">Coming soon</li>';
    return `
      <section class="chapter ${inChapter.length ? "" : "unwritten"}">
        <div class="chapter-head">
          <span class="chapter-n">Chapter ${ch.n}</span>
          <h2>${esc(ch.title)}</h2>
          ${inChapter.length ? `<span class="chapter-stars">★ ${earned} / ${inChapter.length * 3}</span>` : ""}
          <p>${esc(ch.blurb)}</p>
        </div>
        <ol class="nodes">${nodes}</ol>
      </section>`;
  });

  $("map-view").innerHTML = hero + sections.join("") + `<p class="legal">Also from plaintext.guru: <a href="https://backtick.plaintext.guru">Backtick</a>, for Markdown, and <a href="https://tilde.plaintext.guru">Tilde</a>, the shell</p><p class="legal"><a href="https://github.com/dwot/caret">Source on GitHub</a> · <a href="third-party.txt">Licences</a> · Visits are counted with Cloudflare Web Analytics</p>`;
  window.scrollTo(0, 0);
}

// ---------- Cheat sheet ----------

function showSheet() {
  showView("sheet");
  $("meta").textContent = "Cheat sheet";

  const entries = levels.filter((l) => l.sheet);
  const collected = entries.filter((l) => starsOf(l.id)).length;

  const entry = (l: Level) => {
    if (!starsOf(l.id)) {
      const hint = isUnlocked(l, starsOf)
        ? `<a href="#/level/${l.id}">Play ${l.chapter}-${l.order}</a> to add this.`
        : `Solve ${l.chapter}-${l.order} to add this.`;
      return `<article class="entry locked"><h3>${esc(l.title)}</h3><p>${hint}</p></article>`;
    }
    return `
      <article class="entry ${l.id === freshEntry ? "fresh" : ""}" id="entry-${l.id}">
        <div class="entry-head">
          <h3>${esc(l.title)}</h3>
          <a class="replay" href="#/level/${l.id}">${l.chapter}-${l.order}</a>
        </div>
        <div class="entry-body">${md(l.sheet)}</div>
        ${l.tip ? `<div class="entry-tip">${md(l.tip)}</div>` : ""}
      </article>`;
  };

  const sections = chapters
    .filter((ch) => entries.some((l) => l.chapter === ch.n))
    .map(
      (ch) => `
    <section>
      <div class="chapter-head">
        <span class="chapter-n">Chapter ${ch.n}</span>
        <h2>${esc(ch.title)}</h2>
      </div>
      <div class="entries">${entries.filter((l) => l.chapter === ch.n).map(entry).join("")}</div>
    </section>`,
    );

  $("sheet-view").innerHTML = `
    <div class="sheet-head">
      <h2>Cheat sheet</h2>
      <p class="muted">${collected} of ${entries.length} collected. Each level you solve adds its pattern here.</p>
      <div class="progress"><span style="width: ${(100 * collected) / entries.length}%"></span></div>
    </div>
    ${sections.join("")}`;

  const fresh = freshEntry && document.getElementById(`entry-${freshEntry}`);
  freshEntry = undefined;
  if (fresh) fresh.scrollIntoView({ block: "center" });
  else window.scrollTo(0, 0);
}

// ---------- Level ----------

let current: Level | undefined;

function attempt(level: Level): Attempt {
  return (state.attempts[level.id] ??= { help: 0, step: 0 });
}

/** The help panel: what's open, and what this attempt can still earn. */
function renderHelp(level: Level) {
  const a = attempt(level);
  const best = starsOf(level.id);
  $("stakes").textContent =
    `Playing for ${starText(starsFor(a.help))}` + (best ? ` · best so far ${starText(best)}` : "");

  const tools = $<HTMLButtonElement>("btn-tools");
  const steps = $<HTMLButtonElement>("btn-steps");
  tools.hidden = a.help >= 1 || !level.tools;
  tools.innerHTML = `Toolbox <span class="cost">${starText(2)}</span>`;
  steps.hidden = a.help >= 2 || level.steps.length === 0;
  steps.innerHTML = `Walk me through it <span class="cost">${starText(1)}</span>`;

  const toolsCard = $("tools");
  toolsCard.hidden = a.help < 1;
  toolsCard.innerHTML = `<h3>Toolbox</h3>${md(level.tools)}`;

  const stepsCard = $("steps");
  stepsCard.hidden = a.help < 2;
  const shown = level.steps.slice(0, Math.max(1, a.step));
  stepsCard.innerHTML =
    `<h3>Walkthrough</h3><ol>${shown.map((s) => `<li>${md(s)}</li>`).join("")}</ol>` +
    (shown.length < level.steps.length ? `<button id="btn-next-step" class="ghost">Next step</button>` : "");
  $("btn-next-step")?.addEventListener("click", () => {
    attempt(level).step = shown.length + 1;
    saveState(state);
    renderHelp(level);
  });
}

function openHelp(stage: 1 | 2) {
  if (!current) return;
  const a = attempt(current);
  if (a.help >= stage) return;
  a.help = stage;
  if (stage === 2) a.step = 1;
  saveState(state);
  renderHelp(current);
}

const pattern = $<HTMLInputElement>("pattern");
const flagsBox = $<HTMLInputElement>("flags");
const flags = () => flagsBox.value.trim();
const replacement = $<HTMLInputElement>("replacement");
/** What to send with a pattern: Replace levels also want each line rewritten. */
const rewrite = (level: Level) => (level.rewrite ? replacement.value : undefined);

const TOO_SLOW = "That pattern was taking too long, so it was stopped. Repeats inside repeats, like (a+)+, can do that.";

/** A line with its matches highlighted. Spans come from the regex, so they never overlap and are in order. */
function highlighted(line: string, r?: LineResult) {
  let html = "";
  let at = 0;
  for (const [start, end] of r?.spans ?? []) {
    if (end === start) continue;
    html += esc(line.slice(at, start)) + `<mark>${esc(line.slice(start, end))}</mark>`;
    at = end;
  }
  return html + esc(line.slice(at));
}

/** Show what the pattern matches. Only Check passes `marked`, because a live verdict would give the answer away. */
function renderLines(level: Level, results: LineResult[], marked = false) {
  const all = allLines(level);
  const list = (shown: string[], offset: number) =>
    shown
      .map((line, i) => {
        const r = results[offset + i];
        const mark = !marked || !r ? "" : isRight(all[offset + i], r) ? "right" : "wrong";
        const wants = all[offset + i].spans?.map(([start, end]) => `<code>${esc(line.slice(start, end))}</code>`).join(" ");
        const values = (list: (string | undefined)[]) => list.map((v) => `<code>${esc(v ?? "nothing")}</code>`).join(" ");
        const { captures, output } = all[offset + i];
        const note = wants
          ? `<span class="wants">separate matches: ${wants}</span>`
          : output !== undefined
            ? `<span class="wants">wanted: ${values([output])}${r?.replaced !== undefined ? ` · you have: ${values([r.replaced])}` : ""}</span>`
            : captures
            ? `<span class="wants">capture: ${values(captures)}${r?.groups.length ? ` · you have: ${values(r.groups)}` : ""}</span>`
            : "";
        return `<li class="${mark}">${highlighted(line, r) || "&nbsp;"}${note}</li>`;
      })
      .join("");
  $("want-match").innerHTML = list(level.match, 0);
  $("want-reject").innerHTML = list(level.reject, level.match.length);
}

function status(text: string, isError = true) {
  const el = $("status");
  el.textContent = text;
  el.classList.toggle("error", isError && !!text);
}

/** Highlight the lines on show. Runs on every keystroke; the matcher drops any that are overtaken. */
async function preview() {
  const level = current;
  if (!level) return;
  const shown = [...level.match, ...level.reject];
  const r = await matcher.run({ pattern: pattern.value, flags: flags(), lines: shown, replacement: rewrite(level) });
  if (level !== current || r.kind === "superseded") return;
  if (r.kind === "ok") {
    renderLines(level, r.lines);
    // The slashes on screen are part of the box, so typing them searches for real slashes.
    status(/^\/.*\/\s*\w*$/.test(pattern.value) ? "The slashes are already there: type only what goes between them, and put flags in their own box." : (nudge(pattern.value) ?? ""));
  } else {
    // Keep the last good highlight: patterns are often briefly incomplete mid-word.
    status(r.kind === "timeout" ? TOO_SLOW : `Not a complete pattern yet: ${r.message}`);
  }
}

function showLevel(level: Level) {
  showView("level");
  $("meta").textContent = `Chapter ${level.chapter} · ${KIND_LABELS[level.kind]}`;
  if (level === current) return;
  current = level;
  $("title").textContent = level.title;
  $("goal").innerHTML = md(level.goal);
  $("result").innerHTML = "";
  $("help").hidden = false;
  renderHelp(level);
  pattern.value = state.attempts[level.id]?.pattern ?? level.start;
  flagsBox.value = state.attempts[level.id]?.flags ?? level.flags;
  replacement.value = state.attempts[level.id]?.replacement ?? "";
  $("replace-box").hidden = !level.rewrite;
  status("");
  renderLines(level, []);
  preview();
  pattern.focus();
}

function renderResult(level: Level, v: Verdict, stars: number, firstSolve: boolean) {
  let html = "";
  if (v.pass) {
    const next = levels[levels.indexOf(level) + 1];
    html += `<p class="solved-msg">Solved <span class="stars">${starText(stars)}</span></p>`;
    if (firstSolve && level.sheet) html += `<p class="sheet-note">New on your <a href="#/sheet">cheat sheet</a>: ${esc(level.title)}</p>`;
    html += `<div class="card debrief"><h3>One way to do it</h3><pre>/${esc(level.solution)}/${level.solutionFlags}${level.rewrite ? ` → ${esc(level.replacement)}` : ""}</pre>${md(level.debrief)}</div>`;
    html += next
      ? `<p><a class="next" href="#/level/${next.id}">Next: ${esc(next.title)} →</a></p>`
      : `<p><a class="next" href="#/">Back to the map →</a></p>`;
  } else if (v.hiddenMiss) {
    const { line, wanted } = v.hiddenMiss;
    html += `<p class="note">Right for the lines on show, but not for this one:</p><pre>${esc(line)}</pre>`;
    html += `<p class="note">This line ${wanted ? "should match" : "shouldn't match"}. Does your pattern describe the rule, or just these examples?</p>`;
  } else {
    html += `<p class="note">${v.wrong} line${v.wrong > 1 ? "s are" : " is"} still wrong.</p>`;
  }
  $("result").innerHTML = html;
}

async function check() {
  const level = current;
  if (!level || !pattern.value) return;
  const lines = allLines(level);
  const r = await matcher.run({ pattern: pattern.value, flags: flags(), lines: lines.map((l) => l.line), replacement: rewrite(level) });
  if (level !== current || r.kind === "superseded") return;
  if (r.kind !== "ok") {
    $("result").innerHTML = `<p class="note">${esc(r.kind === "timeout" ? TOO_SLOW : `Not a complete pattern yet: ${r.message}`)}</p>`;
    return;
  }
  const v = judge(lines, r.lines);
  renderLines(level, r.lines, true);
  let stars = 0;
  let firstSolve = false;
  if (v.pass) {
    stars = starsFor(attempt(level).help);
    firstSolve = !starsOf(level.id);
    if (firstSolve && level.sheet) freshEntry = level.id;
    state.stars[level.id] = Math.max(starsOf(level.id), stars);
    delete state.attempts[level.id];
    saveState(state);
    updateStarTotal();
    $("help").hidden = true;
  }
  renderResult(level, v, stars, firstSolve);
}

function edited() {
  if (current) {
    Object.assign(attempt(current), { pattern: pattern.value, flags: flagsBox.value, replacement: replacement.value });
    saveState(state);
  }
  $("result").innerHTML = "";
  preview();
}

for (const box of [pattern, flagsBox, replacement]) {
  box.addEventListener("input", edited);
  box.addEventListener("keydown", (e) => {
    if (e.key === "Enter") check();
  });
}
$("btn-check").addEventListener("click", check);
$("btn-tools").addEventListener("click", () => openHelp(1));
$("btn-steps").addEventListener("click", () => openHelp(2));
$("btn-reset").addEventListener("click", () => {
  if (!current) return;
  pattern.value = current.start;
  flagsBox.value = current.flags;
  delete attempt(current).pattern;
  delete attempt(current).flags;
  delete attempt(current).replacement;
  replacement.value = "";
  saveState(state);
  $("result").innerHTML = "";
  $("help").hidden = false;
  renderHelp(current);
  preview();
  pattern.focus();
});

// ---------- How to play ----------

const modal = $<HTMLDialogElement>("modal");
modal.querySelector(".close")!.addEventListener("click", () => modal.close());
modal.addEventListener("click", (e) => e.target === modal && modal.close());
modal.addEventListener("close", () => {
  if (!$("level-view").classList.contains("hidden")) pattern.focus();
});

function showHelp() {
  $("modal-body").innerHTML = `
    <h2>How to play</h2>
    <p>Each level gives you some lines of text. Type a regular expression between the slashes, and everything it matches lights up as you type. Flags, like <code>i</code>, go in their own box.</p>
    <p>Press <b>Check</b> when it looks right, and it marks each line. It also tries lines you can't see, so the pattern has to describe the rule, not just list the examples.</p>
    <p>Stars reward working from memory:</p>
    <div class="help-rows">
      <div><span class="stars">${starText(3)}</span> No help</div>
      <div><span class="stars">${starText(2)}</span> You opened the Toolbox</div>
      <div><span class="stars">${starText(1)}</span> You opened the walkthrough</div>
    </div>
    <p>You can replay any level later for more stars. Solved levels add to your cheat sheet.</p>`;
  if (!modal.open) modal.showModal();
  $("modal-body").focus();
}

$("btn-help").addEventListener("click", showHelp);

// ---------- Routing ----------

function route() {
  if (modal.open) modal.close();
  if (location.hash === "#/sheet") return showSheet();
  const m = /^#\/level\/(.+)$/.exec(location.hash);
  const level = m && levelById(m[1]);
  if (level && isUnlocked(level, starsOf)) return showLevel(level);
  if (location.hash && location.hash !== "#/") history.replaceState(null, "", "#/");
  showMap();
}

window.addEventListener("hashchange", route);
route();
if (!Object.keys(state.stars).length && !Object.keys(state.attempts).length) showHelp();
