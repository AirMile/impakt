import { pwStrength } from "./pwStrength";

test("leeg string → 0", () => {
  expect(pwStrength("")).toBe(0);
});

test("null → 0", () => {
  expect(pwStrength(null)).toBe(0);
});

test("undefined → 0", () => {
  expect(pwStrength(undefined)).toBe(0);
});

test("6+ tekens, alleen kleine letters → 1", () => {
  expect(pwStrength("abcdef")).toBe(1);
});

test("10+ tekens, alleen kleine letters → 2", () => {
  expect(pwStrength("abcdefghij")).toBe(2);
});

test("6+ tekens, hoofd- én kleine letters → 2", () => {
  expect(pwStrength("Abcdef")).toBe(2);
});

test("6+ tekens, hoofd+kleine letters + cijfer → 3", () => {
  expect(pwStrength("Abcde1")).toBe(3);
});

test("volledig sterk (10+ chars, mixed case, cijfer/special) → 4", () => {
  expect(pwStrength("Abcdef1!gh")).toBe(4);
});

test("kort wachtwoord met mixed case en special telt wel die punten", () => {
  // < 6 tekens krijgen geen lengte-punt maar wel de andere criteria
  expect(pwStrength("Ab1!")).toBe(2);
});
