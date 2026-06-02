import { isInFeed } from "./isInFeed";

test("false wanneer sectie nog buiten beeld", () => {
  expect(isInFeed({ scrollY: 0, viewportH: 800, sectionY: 2000 })).toBe(false);
});

test("true wanneer scrollY + viewportH*ratio >= sectionY", () => {
  // 0 + 800*0.85 = 680 >= 600
  expect(isInFeed({ scrollY: 0, viewportH: 800, sectionY: 600 })).toBe(true);
});

test("exact op de drempel = true", () => {
  // 200 + 500*0.85 = 200+425 = 625 >= 625
  expect(isInFeed({ scrollY: 200, viewportH: 500, sectionY: 625 })).toBe(true);
});

test("één pixel onder drempel = false", () => {
  // 200 + 500*0.85 = 625; sectionY=626
  expect(isInFeed({ scrollY: 200, viewportH: 500, sectionY: 626 })).toBe(false);
});

test("custom ratio wordt gerespecteerd", () => {
  // 0 + 1000*0.5 = 500 >= 500
  expect(
    isInFeed({ scrollY: 0, viewportH: 1000, sectionY: 500, ratio: 0.5 })
  ).toBe(true);
  expect(
    isInFeed({ scrollY: 0, viewportH: 1000, sectionY: 501, ratio: 0.5 })
  ).toBe(false);
});
