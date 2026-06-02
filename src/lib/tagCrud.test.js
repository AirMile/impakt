import { addTag, removeTag } from "./tagCrud";

describe("addTag", () => {
  test("voegt een nieuwe tag toe", () => {
    expect(addTag(["Sport"], "Klimaat")).toEqual(["Sport", "Klimaat"]);
  });

  test("negeert lege string (na trim)", () => {
    expect(addTag(["Sport"], "   ")).toEqual(["Sport"]);
  });

  test("negeert duplicaat", () => {
    expect(addTag(["Sport"], "Sport")).toEqual(["Sport"]);
  });

  test("trimt witruimte voor dedup-check", () => {
    expect(addTag(["Sport"], " Sport ")).toEqual(["Sport"]);
  });

  test("muteert de originele array niet", () => {
    const original = ["Sport"];
    addTag(original, "Klimaat");
    expect(original).toEqual(["Sport"]);
  });
});

describe("removeTag", () => {
  test("verwijdert de opgegeven tag", () => {
    expect(removeTag(["Sport", "Klimaat"], "Sport")).toEqual(["Klimaat"]);
  });

  test("laat array ongewijzigd als tag niet bestaat", () => {
    expect(removeTag(["Sport"], "Onbekend")).toEqual(["Sport"]);
  });

  test("muteert de originele array niet", () => {
    const original = ["Sport", "Klimaat"];
    removeTag(original, "Sport");
    expect(original).toEqual(["Sport", "Klimaat"]);
  });
});
