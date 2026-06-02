import { sumVotes, votePct } from "./pollPct";

const options = [
  { id: "a", votes: 30 },
  { id: "b", votes: 20 },
  { id: "c", votes: 50 },
];

describe("sumVotes", () => {
  test("telt alle stemmen op", () => {
    expect(sumVotes(options)).toBe(100);
  });

  test("voegt 1 extra stem toe voor geselecteerde optie", () => {
    expect(sumVotes(options, "a")).toBe(101);
  });

  test("null selectedId → geen extra stem", () => {
    expect(sumVotes(options, null)).toBe(100);
  });

  test("enkelvoudige optie", () => {
    expect(sumVotes([{ id: "x", votes: 42 }])).toBe(42);
  });

  test("lege opties → 0", () => {
    expect(sumVotes([])).toBe(0);
  });
});

describe("votePct", () => {
  test("berekent correct percentage", () => {
    expect(votePct(30, 100)).toBe(30);
    expect(votePct(50, 100)).toBe(50);
  });

  test("rondt af naar geheel getal", () => {
    expect(votePct(1, 3)).toBe(33);
    expect(votePct(2, 3)).toBe(67);
  });

  test("total=0 → 0 (geen deling door nul)", () => {
    expect(votePct(5, 0)).toBe(0);
  });

  test("enkelvoudige optie → 100%", () => {
    const opts = [{ id: "a", votes: 42 }];
    expect(votePct(42, sumVotes(opts))).toBe(100);
  });
});
