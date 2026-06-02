export function filterStories({
  stories,
  goodNewsOnly = false,
  cat = "Voor jou",
  excludeId = null,
}) {
  const base = goodNewsOnly
    ? stories.filter((s) => s.goodNews === true)
    : cat === "Voor jou"
      ? stories
      : stories.filter((s) => s.cat === cat);
  return excludeId ? base.filter((s) => s.id !== excludeId) : base;
}
