/** The part that runs a pattern. Plain functions, so a test can call them and the worker can hang safely. */

export interface RunRequest {
  pattern: string;
  flags: string;
  lines: string[];
  /** Replacement text. When set, each line also comes back rewritten. */
  replacement?: string;
}

export interface LineResult {
  /** Start and end of every match. */
  spans: [number, number][];
  /** The capture groups of the first match. */
  groups: (string | undefined)[];
  replaced?: string;
}

export type RunResult = { kind: "ok"; lines: LineResult[] } | { kind: "invalid"; message: string };

/** A pattern that matches nothing but empty strings could otherwise report one span per character, forever. */
const MAX_SPANS = 1000;

export function run({ pattern, flags, lines, replacement }: RunRequest): RunResult {
  if (!pattern) return { kind: "ok", lines: lines.map(() => ({ spans: [], groups: [] })) };
  let re: RegExp;
  try {
    if (/[^gi]/.test(flags)) throw new Error("Invalid flags");
    re = new RegExp(pattern, flags.replace("g", "") + "g");
  } catch (e) {
    const message = (e as Error).message;
    if (message.startsWith("Invalid flags")) return { kind: "invalid", message: "unknown flag" };
    return { kind: "invalid", message: message.replace(/^Invalid regular expression: \/.*\/\w*: /, "") };
  }
  return {
    kind: "ok",
    lines: lines.map((line) => {
      const spans: [number, number][] = [];
      let groups: (string | undefined)[] = [];
      re.lastIndex = 0;
      for (let m = re.exec(line); m && spans.length < MAX_SPANS; m = re.exec(line)) {
        if (!spans.length) groups = m.slice(1);
        spans.push([m.index, m.index + m[0].length]);
        if (m[0] === "") re.lastIndex++;
      }
      const result: LineResult = { spans, groups };
      if (replacement !== undefined) {
        const once = new RegExp(pattern, flags);
        result.replaced = line.replace(once, replacement);
      }
      return result;
    }),
  };
}

/** Slips that are valid regex, so nothing complains, but almost never what was meant. */
export function nudge(pattern: string): string | undefined {
  const brace = /(?<!\\)\{\d+(,\d*)?(?!\d|,|\d*\})/.exec(pattern);
  if (brace) return `${brace[0]} isn't a repeat without a closing }, so it's being read as plain text.`;
  const inside = /(?<!\\)\[[^\]]*[+*]\]/.exec(pattern);
  if (inside) return `Inside square brackets, ${inside[0].at(-2)} is a plain character. To repeat the class, put it after the ].`;
}
