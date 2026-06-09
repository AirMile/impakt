// Returns allTags in mine-first order: tags from `myTags` (matched on id) come
// first in their original allTags-order, followed by the rest in their original
// allTags-order. Pure: no side effects, stable output for stable input.
export function orderUserTags(allTags, myTags) {
  if (!Array.isArray(allTags) || allTags.length === 0) return [];
  const mineIds = new Set((myTags ?? []).map((tag) => tag.id));
  const mine = allTags.filter((tag) => mineIds.has(tag.id));
  const others = allTags.filter((tag) => !mineIds.has(tag.id));
  return [...mine, ...others];
}
