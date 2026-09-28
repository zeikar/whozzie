import { describe, expect, it } from "vitest";
import { MAX_NAME_LENGTH, MAX_NAMES, mergeNames, parseNames, restoreName } from "./names";

// The same name in decomposed Hangul (jamo), as macOS file names store it.
const NFD = (text: string) => text.normalize("NFD");

describe("parseNames", () => {
  it("splits on newlines and commas and trims", () => {
    expect(parseNames(" Minsu \nJiyoung,  Chulsoo\r\nYuna ")).toEqual(["Minsu", "Jiyoung", "Chulsoo", "Yuna"]);
  });

  it("drops blank entries", () => {
    expect(parseNames("\n , ,\n\n")).toEqual([]);
  });

  it("caps each name's length", () => {
    const [name] = parseNames("x".repeat(MAX_NAME_LENGTH + 10));
    expect(name).toHaveLength(MAX_NAME_LENGTH);
  });

  it("drops the numbering column of a pasted roster", () => {
    expect(parseNames("1\t김민준\n2\t이서연\r\n3.\t박도윤\n")).toEqual(["김민준", "이서연", "박도윤"]);
  });

  it("keeps a spreadsheet row's other cells together as one name", () => {
    expect(parseNames("1)\tAnn\tLee\n2\tBo\tKim")).toEqual(["Ann Lee", "Bo Kim"]);
  });

  it("keeps a plain one-column list, numbers included", () => {
    expect(parseNames("Ann\nBob\n7")).toEqual(["Ann", "Bob", "7"]);
  });

  it("keeps a row that is only numbers", () => {
    expect(parseNames("12\t\n5\t6")).toEqual(["12", "5 6"]);
  });

  it("composes decomposed Hangul before capping", () => {
    const [name] = parseNames(NFD("가".repeat(MAX_NAME_LENGTH)));
    expect(name).toBe("가".repeat(MAX_NAME_LENGTH));
  });
});

describe("mergeNames", () => {
  it("appends new names and reports each duplicate once", () => {
    const result = mergeNames(["a", "b"], ["b", "c", "c", "b"]);
    expect(result.names).toEqual(["a", "b", "c"]);
    expect(result.added).toEqual(["c"]);
    expect(result.duplicates).toEqual(["b", "c"]);
  });

  it("treats composed and decomposed Hangul as the same name", () => {
    const result = mergeNames(["김민수"], [NFD("김민수"), NFD("이서연")]);
    expect(result.names).toEqual(["김민수", "이서연"]);
    expect(result.duplicates).toEqual(["김민수"]);
  });

  it("stops at MAX_NAMES", () => {
    const full = Array.from({ length: MAX_NAMES - 1 }, (_, i) => `n${i}`);
    const result = mergeNames(full, ["x", "y"]);
    expect(result.names).toHaveLength(MAX_NAMES);
    expect(result.added).toEqual(["x"]);
    expect(result.overflow).toEqual(["y"]);
  });
});

describe("restoreName", () => {
  it("puts the name back where it was", () => {
    expect(restoreName(["a", "c"], "b", 1)).toEqual(["a", "b", "c"]);
    expect(restoreName(["b", "c"], "a", 0)).toEqual(["a", "b", "c"]);
  });

  it("appends when the list has shrunk since", () => {
    expect(restoreName(["a"], "d", 3)).toEqual(["a", "d"]);
  });

  it("leaves the list alone if the name is back already or the list is full", () => {
    const list = ["a", "b"];
    expect(restoreName(list, "b", 0)).toBe(list);
    const full = Array.from({ length: MAX_NAMES }, (_, i) => `n${i}`);
    expect(restoreName(full, "x", 0)).toBe(full);
  });
});
