import {
  REACTIONS,
  REACTION_EMOJI,
  REACTION_LABELS,
  REACTION_COLORS,
} from "./reactionMeta";
import { REACTION_TYPES } from "./reactions";

test("dekt alle backend reactie-types", () => {
  for (const type of REACTION_TYPES) {
    expect(REACTION_EMOJI[type]).toBeTruthy();
    expect(REACTION_LABELS[type]).toBeTruthy();
    expect(REACTION_COLORS[type]).toBeTruthy();
  }
  // Geen verweesde meta voor onbekende types.
  expect(REACTIONS.map((r) => r.key).sort()).toEqual(
    [...REACTION_TYPES].sort()
  );
});

test("levert de verwachte emoji's en labels", () => {
  expect(REACTION_EMOJI).toEqual({
    smile: "😊",
    meh: "😐",
    frown: "☹️",
  });
  expect(REACTION_LABELS).toEqual({
    smile: "Blij",
    meh: "Neutraal",
    frown: "Verdrietig",
  });
});
