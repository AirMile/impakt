const ALLOWED_KINDS = ["story", "meme"];

export function parseImpaktUrl(url) {
  if (!url) return null;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "impakt:") return null;

  const kind = parsed.hostname;
  const id = parsed.pathname.replace(/^\//, "");

  if (!ALLOWED_KINDS.includes(kind)) return null;
  if (!id) return null;

  return { kind, id };
}
