// Optimistische count-overgang bij (her)stemmen. Gedeeld door feed/detail/humor
// zodat de switch-math (oude stem -1, nieuwe stem +1) niet drie keer leeft.
//
// `prev` is de vorige reactie-key (null bij de eerste stem), `next` de nieuwe.

// Pas de counts aan voor een nieuwe/gewijzigde stem.
export function castVote(counts, prev, next) {
  const c = { ...counts, [next]: (counts[next] ?? 0) + 1 };
  if (prev != null && prev !== next) {
    c[prev] = Math.max(0, (c[prev] ?? 1) - 1);
  }
  return c;
}

// Inverse van castVote — draait een optimistische stem terug bij een serverfout.
export function revertVote(counts, prev, next) {
  const c = { ...counts, [next]: Math.max(0, (counts[next] ?? 1) - 1) };
  if (prev != null && prev !== next) {
    c[prev] = (c[prev] ?? 0) + 1;
  }
  return c;
}
