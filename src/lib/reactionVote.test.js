import { castVote, revertVote } from "./reactionVote";

const base = { smile: 5, meh: 2, frown: 1 };

test("eerste stem verhoogt alleen de gekozen reactie", () => {
  expect(castVote(base, null, "smile")).toEqual({ smile: 6, meh: 2, frown: 1 });
});

test("switchen verlaagt de oude stem en verhoogt de nieuwe", () => {
  expect(castVote(base, "smile", "frown")).toEqual({
    smile: 4,
    meh: 2,
    frown: 2,
  });
});

test("oude stem zakt nooit onder nul", () => {
  expect(castVote({ smile: 0, meh: 0, frown: 1 }, "smile", "frown")).toEqual({
    smile: 0,
    meh: 0,
    frown: 2,
  });
});

test("revertVote is de inverse van castVote (eerste stem)", () => {
  const voted = castVote(base, null, "smile");
  expect(revertVote(voted, null, "smile")).toEqual(base);
});

test("revertVote is de inverse van castVote (switch)", () => {
  const voted = castVote(base, "smile", "frown");
  expect(revertVote(voted, "smile", "frown")).toEqual(base);
});
