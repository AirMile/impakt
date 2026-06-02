import { toggleInSet } from "./toggleInSet";

test("voegt item toe als het er niet in zit", () => {
  const result = toggleInSet(new Set(["a"]), "b");
  expect(result.has("b")).toBe(true);
  expect(result.size).toBe(2);
});

test("verwijdert item als het er al in zit", () => {
  const result = toggleInSet(new Set(["a", "b"]), "a");
  expect(result.has("a")).toBe(false);
  expect(result.size).toBe(1);
});

test("retourneert een nieuwe Set (immutabiliteit)", () => {
  const original = new Set(["a"]);
  const result = toggleInSet(original, "b");
  expect(result).not.toBe(original);
  expect(original.size).toBe(1);
});

test("werkt met lege Set", () => {
  const result = toggleInSet(new Set(), "x");
  expect(result.has("x")).toBe(true);
});
