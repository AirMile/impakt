import { updatedAtLabel } from "./updatedAtLabel";

test("formatteert uur en minuut met nul-padding", () => {
  expect(updatedAtLabel(new Date(2026, 5, 16, 9, 5))).toBe(
    "Bijgewerkt om 09:05"
  );
});

test("toont tweecijferige tijden ongewijzigd", () => {
  expect(updatedAtLabel(new Date(2026, 5, 16, 14, 32))).toBe(
    "Bijgewerkt om 14:32"
  );
});
