export function sumVotes(options, selectedId = null) {
  return options.reduce(
    (a, o) => a + o.votes + (selectedId === o.id ? 1 : 0),
    0
  );
}

export function votePct(votes, total) {
  return total ? Math.round((votes / total) * 100) : 0;
}
