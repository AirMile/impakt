import { votePct } from "./pollPct";

// Zet absolute reactie-counts ({smile,meh,frown}) om naar percentages voor de
// ReactionRail, die `reactions?.[key]}%` toont. Hergebruikt votePct (zelfde
// rond-logica als de peiling). Bij total === 0 is elke key 0.
export function reactionPct(counts) {
  const smile = counts?.smile ?? 0;
  const meh = counts?.meh ?? 0;
  const frown = counts?.frown ?? 0;
  const total = smile + meh + frown;

  return {
    smile: votePct(smile, total),
    meh: votePct(meh, total),
    frown: votePct(frown, total),
  };
}
