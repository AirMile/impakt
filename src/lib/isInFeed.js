export function isInFeed({ scrollY, viewportH, sectionY, ratio = 0.85 }) {
  return scrollY + viewportH * ratio >= sectionY;
}
