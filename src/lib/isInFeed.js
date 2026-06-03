export function isInFeed({
  scrollY,
  viewportH,
  sectionY,
  enterRatio = 0.85,
  exitRatio = 0.95,
  ratio,
  current = false,
}) {
  const enter = ratio ?? enterRatio;
  const exit = ratio ?? exitRatio;
  return scrollY + viewportH * (current ? exit : enter) >= sectionY;
}
