import { CATEGORIES } from "./index";

test("CATEGORIES is een niet-lege array van strings", () => {
  expect(Array.isArray(CATEGORIES)).toBe(true);
  expect(CATEGORIES.length).toBeGreaterThan(0);
  CATEGORIES.forEach((c) => expect(typeof c).toBe("string"));
});
