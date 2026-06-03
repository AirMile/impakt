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

test("hysteresis: enter (current=false) gebruikt enterRatio 0.85", () => {
  // 0 + 800*0.85 = 680; sectionY=680 → net over drempel
  expect(
    isInFeed({ scrollY: 0, viewportH: 800, sectionY: 680, current: false })
  ).toBe(true);
  // exitRatio 0.95: 0 + 800*0.95 = 760 < 680 — irrelevant hier, current=false gebruikt enter
});

test("hysteresis: exit (current=true) gebruikt exitRatio 0.95", () => {
  // scrollY=0, viewportH=800, sectionY=680
  // exitRatio: 0 + 800*0.95 = 760 >= 680 → nog steeds true (niet verlaten)
  expect(
    isInFeed({ scrollY: 0, viewportH: 800, sectionY: 680, current: true })
  ).toBe(true);
  // scrollY=0, sectionY=770: exit 0 + 800*0.95 = 760 < 770 → false (verlaten)
  expect(
    isInFeed({ scrollY: 0, viewportH: 800, sectionY: 770, current: true })
  ).toBe(false);
  // maar enter-drempel 0.85: 0 + 800*0.85 = 680 < 770 → ook false wanneer current=false
  expect(
    isInFeed({ scrollY: 0, viewportH: 800, sectionY: 770, current: false })
  ).toBe(false);
});

test("hysteresis buffer: waarde tussen enterRatio en exitRatio sticks bij current=true", () => {
  // sectionY=700, viewportH=800
  // enter: 0 + 800*0.85 = 680 >= 700? nee → false (niet ingegaan)
  expect(
    isInFeed({ scrollY: 0, viewportH: 800, sectionY: 700, current: false })
  ).toBe(false);
  // exit:  0 + 800*0.95 = 760 >= 700? ja → true (blijft in feed)
  expect(
    isInFeed({ scrollY: 0, viewportH: 800, sectionY: 700, current: true })
  ).toBe(true);
});
