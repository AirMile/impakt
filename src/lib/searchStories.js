export function searchStories(query, stories) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return stories.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.sub.toLowerCase().includes(q) ||
      s.cat.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
  );
}
