export type LevelKind = "lesson" | "fix" | "boss";

export const KIND_LABELS: Record<LevelKind, string> = { lesson: "Lesson", fix: "Fix-it", boss: "Boss" };

export interface Level {
  id: string;
  chapter: number;
  order: number;
  kind: LevelKind;
  title: string;
  /** Flags the level starts with, such as `i`. */
  flags: string;
  /** Markdown. */
  goal: string;
  /** What's in the pattern box to begin with: a fix-it's broken pattern. */
  start: string;
  /** Lines that should match, and lines that shouldn't. */
  match: string[];
  reject: string[];
  /** The same, kept out of sight so a pattern can't pass by listing the answers. */
  hiddenMatch: string[];
  hiddenReject: string[];
  /** For lines marked up in the level file: exactly what has to be matched in them. */
  wanted: Map<string, [number, number][]>;
  /** Whether this is a Replace level: ` ==> value` is then the rewritten line. */
  rewrite: boolean;
  /** The replacement that goes with `solution`. */
  replacement: string;
  /** For lines ending in ` ==> value`: what the capture groups have to hold. */
  captures: Map<string, string[]>;
  solution: string;
  /** Flags the solution needs, when they aren't on from the start. */
  solutionFlags: string;
  /** Tempting patterns that have to fail. Only the tests read these. */
  wrong: string[];
  tools: string;
  steps: string[];
  debrief: string;
  sheet: string;
  tip: string;
}

export interface Chapter {
  n: number;
  title: string;
  blurb: string;
}

export const chapters: Chapter[] = [
  { n: 1, title: "Plain text first", blurb: "Literal text, the dot, and escaping it." },
  { n: 2, title: "Character classes", blurb: "One character out of a set: [abc], ranges, \\d and friends." },
  { n: 3, title: "Repetition", blurb: "How many times: * + ? {n,m}, and greedy against lazy." },
  { n: 4, title: "Anchors", blurb: "Where a match sits: ^ $ and \\b." },
  { n: 5, title: "Groups and alternation", blurb: "Either this or that, and pulling pieces out." },
  { n: 6, title: "Rewriting", blurb: "Replacing text with what you captured." },
];

const lines = (s?: string) => (s ? s.split("\n") : []);

/** Takes the « » out of a marked line, and records what they surrounded. */
function unmark(marked: string, wanted: Level["wanted"], captures: Level["captures"]) {
  const [line, ...values] = marked.split(" ==> ");
  if (values.length) captures.set(line, values);
  const spans: [number, number][] = [];
  let plain = "";
  for (const [i, part] of line.split(/[«»]/).entries()) {
    if (i % 2) spans.push([plain.length, plain.length + part.length]);
    plain += part;
  }
  if (spans.length) wanted.set(plain, spans);
  return plain;
}

/**
 * Level files: frontmatter (id, chapter, order, kind, title, and optionally `flags`, `solutionflags` and
 * `type: replace`, which also takes `+++ replacement`), then the
 * goal, then `+++ match` / `+++ reject` / `+++ hiddenmatch` / `+++ hiddenreject` / `+++ start` / `+++ solution` /
 * `+++ wrong` / `+++ tools` /
 * `+++ steps` / `+++ debrief` / `+++ sheet` / `+++ tip` sections. Steps are separated by `---` lines. In match lines,
 * `«text»` means the pattern has to match exactly that, not merely something in the line, and
 * ` ==> value ==> value` gives what its capture groups have to hold.
 * Sections are trimmed, so a line that needs a leading space can't come first, and one
 * that needs a trailing space can't come last.
 */
export function parseLevel(src: string): Level {
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(src);
  if (!fm) throw new Error("Level is missing frontmatter");
  const meta: Record<string, string> = {};
  for (const line of fm[1].split("\n")) {
    const m = /^(\w+):\s*(.*)$/.exec(line);
    if (m) meta[m[1]] = m[2].trim();
  }
  const [goal, ...rest] = src.slice(fm[0].length).split(/^\+\+\+ (\w+)[ \t]*$/m);
  const sections: Record<string, string> = {};
  for (let i = 0; i < rest.length; i += 2) sections[rest[i]] = rest[i + 1].trim();

  const wanted: Level["wanted"] = new Map();
  const captures: Level["captures"] = new Map();

  return {
    id: meta.id,
    chapter: Number(meta.chapter),
    order: Number(meta.order),
    kind: meta.kind === "boss" || meta.kind === "fix" ? meta.kind : "lesson",
    title: meta.title,
    flags: meta.flags ?? "",
    goal: goal.trim(),
    start: sections.start ?? "",
    match: lines(sections.match).map((l) => unmark(l, wanted, captures)),
    reject: lines(sections.reject),
    hiddenMatch: lines(sections.hiddenmatch).map((l) => unmark(l, wanted, captures)),
    hiddenReject: lines(sections.hiddenreject),
    wanted,
    captures,
    rewrite: meta.type === "replace",
    replacement: sections.replacement ?? "",
    solution: sections.solution ?? "",
    solutionFlags: meta.solutionflags ?? meta.flags ?? "",
    wrong: lines(sections.wrong),
    tools: sections.tools ?? "",
    steps: (sections.steps ?? "").split(/^---$/m).map((s) => s.trim()).filter(Boolean),
    debrief: sections.debrief ?? "",
    sheet: sections.sheet ?? "",
    tip: sections.tip ?? "",
  };
}

const files = import.meta.glob("./levels/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

/** Every level, in course order. */
export const levels: Level[] = Object.values(files)
  .map(parseLevel)
  .sort((a, b) => a.chapter - b.chapter || a.order - b.order);

export const levelById = (id: string) => levels.find((l) => l.id === id);

/** Levels open in order: each one once the written level before it is solved. */
export function isUnlocked(level: Level, stars: (id: string) => number): boolean {
  const i = levels.indexOf(level);
  return i === 0 || stars(levels[i - 1].id) > 0;
}
