export function createDoubleTapDetector(thresholdMs = 280) {
  let lastTap = 0;
  return function detect(now) {
    const isDouble = now - lastTap < thresholdMs;
    lastTap = now;
    return isDouble;
  };
}
