import type { LineResult } from "./regex";
import type { Level } from "./levels";

export interface CheckLine {
  line: string;
  wanted: boolean;
  hidden: boolean;
  /** Exactly what has to match, when the level says. */
  spans?: [number, number][];
  /** What the capture groups have to hold, when the level says. */
  captures?: string[];
  /** What a Replace level should turn the line into. */
  output?: string;
}

/** Every line a level tests, shown ones first. */
export const allLines = (level: Level): CheckLine[] => {
  const wanted = (line: string, hidden: boolean): CheckLine => {
    const captures = level.captures.get(line);
    return { line, wanted: true, hidden, spans: level.wanted.get(line), ...(level.rewrite ? { output: captures?.[0] } : { captures }) };
  };
  return [
    ...level.match.map((line) => wanted(line, false)),
    ...level.reject.map((line) => ({ line, wanted: false, hidden: false })),
    ...level.hiddenMatch.map((line) => wanted(line, true)),
    ...level.hiddenReject.map((line) => ({ line, wanted: false, hidden: true })),
  ];
};

export const matched = (r: LineResult) => r.spans.length > 0;

export function isRight(l: CheckLine, r: LineResult) {
  if (l.spans) return JSON.stringify(r.spans) === JSON.stringify(l.spans);
  if (l.output !== undefined) return r.replaced === l.output;
  if (l.captures) return JSON.stringify(r.groups) === JSON.stringify(l.captures);
  return matched(r) === l.wanted;
}

export interface Verdict {
  pass: boolean;
  /** Shown lines that are still wrong. */
  wrong: number;
  /** The first hidden line that's wrong, once the shown ones are right. */
  hiddenMiss?: CheckLine;
}

export function judge(lines: CheckLine[], results: LineResult[]): Verdict {
  const misses = lines.filter((l, i) => !isRight(l, results[i]));
  const wrong = misses.filter((l) => !l.hidden).length;
  return { pass: misses.length === 0, wrong, hiddenMiss: wrong ? undefined : misses[0] };
}
