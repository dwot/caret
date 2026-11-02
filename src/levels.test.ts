import { describe, expect, it } from "vitest";
import { allLines, judge } from "./check";
import { chapters, levels } from "./levels";
import { nudge, run } from "./regex";

const verdict = (level: (typeof levels)[number], pattern: string, flags = level.solutionFlags, replacement = level.replacement) => {
  const lines = allLines(level);
  const result = run({ pattern, flags, lines: lines.map((l) => l.line), replacement: level.rewrite ? replacement : undefined });
  if (result.kind !== "ok") throw new Error(result.message);
  return judge(lines, result.lines);
};

describe.each(levels)("$id", (level) => {
  it("is solved by its own solution", () => {
    expect(verdict(level, level.solution).pass).toBe(true);
  });
  it("isn't solved by listing the lines it shows", () => {
    expect(verdict(level, level.match.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")).pass).toBe(false);
  });
  it.each(level.wrong)("rejects %s", (wrong) => {
    const [pattern, replacement] = wrong.split(" ==> ");
    expect(verdict(level, pattern, level.solutionFlags, replacement ?? level.replacement).pass).toBe(false);
  });
  it("needs any flags it asks for", () => {
    if (level.solutionFlags !== level.flags) expect(verdict(level, level.solution, level.flags).pass).toBe(false);
  });
  it("isn't nudged for its own solution", () => {
    expect(nudge(level.solution)).toBeUndefined();
  });
  it("ends its walkthrough with a full answer", () => {
    expect(level.steps.at(-1)).toContain(`\`${level.solution}\``);
  });
  it("is complete", () => {
    expect(level.match.length && level.reject.length).toBeTruthy();
    expect(level.hiddenMatch.length + level.hiddenReject.length).toBeGreaterThan(0);
    expect(level.tools && level.steps.length && level.debrief && level.sheet).toBeTruthy();
    expect(chapters.some((c) => c.n === level.chapter)).toBe(true);
  });
});
