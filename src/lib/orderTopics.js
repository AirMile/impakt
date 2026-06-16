// Orders the topic-chip bar:
//   1. selected tags first, then unselected;
//   2. within each group, most-recently-interacted first, driven by `recencyNames`
//      — a most-recent-first list of tag names bumped on every (de)select. So a
//      just-deselected tag lands right after the still-selected ones instead of
//      jumping back to its catalog position;
//   3. tags never touched this session fall back to catalog (allTags) order.
// `selectedNames` accepts a Set or array of tag names. Pure: no side effects.
export function orderTopics(allTags, selectedNames, recencyNames) {
  if (!Array.isArray(allTags) || allTags.length === 0) return [];
  const selected =
    selectedNames instanceof Set ? selectedNames : new Set(selectedNames ?? []);
  const rank = new Map((recencyNames ?? []).map((name, i) => [name, i]));
  const catIndex = new Map(allTags.map((tag, i) => [tag.name, i]));
  const recencyRank = (tag) =>
    rank.has(tag.name) ? rank.get(tag.name) : Infinity;
  return [...allTags].sort((a, b) => {
    const aSel = selected.has(a.name) ? 0 : 1;
    const bSel = selected.has(b.name) ? 0 : 1;
    if (aSel !== bSel) return aSel - bSel; // geselecteerd eerst
    const ar = recencyRank(a);
    const br = recencyRank(b);
    if (ar !== br) return ar - br; // recentst aangeraakt eerst
    return catIndex.get(a.name) - catIndex.get(b.name); // anders catalogus-volgorde
  });
}
