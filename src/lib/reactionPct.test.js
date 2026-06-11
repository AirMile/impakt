import { reactionPct } from "./reactionPct";

test("rekent counts om naar percentages", () => {
  expect(reactionPct({ smile: 18, meh: 31, frown: 51 })).toEqual({
    smile: 18,
    meh: 31,
    frown: 51,
  });
});

test("rondt af op hele procenten", () => {
  expect(reactionPct({ smile: 1, meh: 1, frown: 1 })).toEqual({
    smile: 33,
    meh: 33,
    frown: 33,
  });
});

test("total 0 geeft overal 0", () => {
  expect(reactionPct({ smile: 0, meh: 0, frown: 0 })).toEqual({
    smile: 0,
    meh: 0,
    frown: 0,
  });
});

test("gaat veilig om met ontbrekende velden of null", () => {
  expect(reactionPct({ smile: 2 })).toEqual({ smile: 100, meh: 0, frown: 0 });
  expect(reactionPct(null)).toEqual({ smile: 0, meh: 0, frown: 0 });
});
