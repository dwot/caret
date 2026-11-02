import { describe, expect, it } from "vitest";
import { judge } from "./check";
import { nudge, run } from "./regex";

const ok = (pattern: string, lines: string[], flags = "", replacement?: string) => {
  const r = run({ pattern, flags, lines, replacement });
  if (r.kind !== "ok") throw new Error(r.message);
  return r.lines;
};

describe("run", () => {
  it("finds every match in a line", () => {
    expect(ok("a", ["banana"])[0].spans).toEqual([[1, 2], [3, 4], [5, 6]]);
  });
  it("matches nothing for an empty pattern", () => {
    expect(ok("", ["abc"])[0].spans).toEqual([]);
  });
  it("gets past empty matches", () => {
    expect(ok("x*", ["abc"])[0].spans).toHaveLength(4);
  });
  it("keeps each line separate", () => {
    expect(ok("^b", ["ab", "ba"]).map((l) => l.spans.length)).toEqual([0, 1]);
  });
  it("honours flags", () => {
    expect(ok("cat", ["CAT"], "i")[0].spans).toHaveLength(1);
  });
  it("returns the first match's groups", () => {
    expect(ok("(\\d)-(\\d)", ["1-2 3-4"])[0].groups).toEqual(["1", "2"]);
  });
  it("replaces once, or everywhere with g", () => {
    expect(ok("a", ["aa"], "", "b")[0].replaced).toBe("ba");
    expect(ok("a", ["aa"], "g", "b")[0].replaced).toBe("bb");
  });
  it("reports a flag it doesn't know", () => {
    expect(run({ pattern: "a", flags: "x", lines: ["a"] })).toEqual({ kind: "invalid", message: "unknown flag" });
  });
  it("reports a broken pattern instead of throwing", () => {
    expect(run({ pattern: "(", flags: "", lines: ["x"] }).kind).toBe("invalid");
  });
});

describe("judge", () => {
  const line = (wanted: boolean, hidden = false) => ({ line: "", wanted, hidden });
  const hit = { spans: [[0, 1]] as [number, number][], groups: [] };
  const miss = { spans: [], groups: [] };

  it("passes when every line is right", () => {
    expect(judge([line(true), line(false)], [hit, miss]).pass).toBe(true);
  });
  it("counts wrong shown lines and holds back hidden ones", () => {
    const v = judge([line(true), line(false, true)], [miss, hit]);
    expect(v).toMatchObject({ pass: false, wrong: 1, hiddenMiss: undefined });
  });
  it("names a hidden miss once the shown lines are right", () => {
    const hidden = line(true, true);
    expect(judge([line(true), hidden], [hit, miss]).hiddenMiss).toBe(hidden);
  });
});

describe("exact spans", () => {
  const line = { line: "", wanted: true, hidden: false, spans: [[0, 1]] as [number, number][] };

  it("needs exactly the wanted spans", () => {
    expect(judge([line], [{ spans: [[0, 1]], groups: [] }]).pass).toBe(true);
    expect(judge([line], [{ spans: [[0, 2]], groups: [] }]).pass).toBe(false);
    expect(judge([line], [{ spans: [[0, 1], [2, 3]], groups: [] }]).pass).toBe(false);
  });
});

describe("captures", () => {
  const line = { line: "", wanted: true, hidden: false, captures: ["a", "b"] };

  it("needs the groups in order", () => {
    expect(judge([line], [{ spans: [[0, 1]], groups: ["a", "b"] }]).pass).toBe(true);
    expect(judge([line], [{ spans: [[0, 1]], groups: ["b", "a"] }]).pass).toBe(false);
    expect(judge([line], [{ spans: [[0, 1]], groups: [] }]).pass).toBe(false);
  });
});

describe("nudge", () => {
  it("spots an unclosed repeat", () => {
    expect(nudge("\\d{2]")).toContain("{2");
    expect(nudge("a{2,3")).toContain("{2,3");
  });
  it("spots a repeat inside a class", () => {
    expect(nudge("[A-Z+]")).toContain("after the ]");
    expect(nudge("[a*]")).toContain("after the ]");
  });
  it("leaves correct patterns alone", () => {
    for (const p of ["\\d{4}", "a{2,}", "x{2,11}$", "[A-Z]+", "[a+b]", "\\[a+\\]", "\\{2", ""]) expect(nudge(p)).toBeUndefined();
  });
});
