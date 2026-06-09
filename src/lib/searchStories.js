function tagText(tag) {
  if (!tag) return "";
  if (typeof tag === "string") return tag;
  return [tag.name, tag.category].filter(Boolean).join(" ");
}

export function searchStories(query, stories) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return stories.filter((s) => {
    const haystack = [
      s.title,
      s.sub,
      s.cat,
      ...(Array.isArray(s.tags) ? s.tags.map(tagText) : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
