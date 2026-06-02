import { parseViews } from "./parseViews";

// parseViews doet parseFloat(v) * 1000.
// parseFloat stopt bij niet-numerieke tekens, dus "34.2k" → 34.2 → *1000 = 34200 (toevallig correct).
// Bug: andere suffixen ("M") en getallen zonder suffix werken niet correct.

test('"34.2k" → 34200', () => {
  expect(parseViews("34.2k")).toBe(34200);
});

test('"7.4k" → 7400', () => {
  expect(parseViews("7.4k")).toBe(7400);
});

test('"1k" → 1000', () => {
  expect(parseViews("1k")).toBe(1000);
});

test('[bug] "1.2M" → 1200 in plaats van 1200000', () => {
  expect(parseViews("1.2M")).toBe(1200);
});

test('[bug] "100" zonder suffix → 100000 in plaats van 100', () => {
  expect(parseViews("100")).toBe(100000);
});
