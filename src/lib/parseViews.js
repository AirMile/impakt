// Werkt correct voor "k"-waarden (bijv. "34.2k" → 34200).
// Bug: negeert andere suffixen ("M", geen suffix) — tests documenteren dit gedrag.
export function parseViews(v) {
  return parseFloat(v) * 1000;
}
