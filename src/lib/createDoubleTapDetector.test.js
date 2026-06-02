import { createDoubleTapDetector } from "./createDoubleTapDetector";

test("eerste tap retourneert altijd false", () => {
  const detect = createDoubleTapDetector(280);
  expect(detect(1000)).toBe(false);
});

test("tweede tap binnen threshold retourneert true", () => {
  const detect = createDoubleTapDetector(280);
  detect(1000);
  expect(detect(1200)).toBe(true);
});

test("tweede tap exact op de drempel (279ms) = true", () => {
  const detect = createDoubleTapDetector(280);
  detect(1000);
  expect(detect(1279)).toBe(true);
});

test("tweede tap op de drempel zelf (280ms) = false", () => {
  const detect = createDoubleTapDetector(280);
  detect(1000);
  expect(detect(1280)).toBe(false);
});

test("tap na te lang wachten retourneert false", () => {
  const detect = createDoubleTapDetector(280);
  detect(1000);
  expect(detect(2000)).toBe(false);
});

test("custom threshold wordt gerespecteerd", () => {
  const detect = createDoubleTapDetector(500);
  detect(0);
  expect(detect(400)).toBe(true);
  expect(detect(400 + 500)).toBe(false);
});
