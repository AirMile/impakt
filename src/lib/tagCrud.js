export function addTag(tags, raw) {
  const t = raw.trim();
  if (!t || tags.includes(t)) return tags;
  return [...tags, t];
}

export function removeTag(tags, t) {
  return tags.filter((x) => x !== t);
}
