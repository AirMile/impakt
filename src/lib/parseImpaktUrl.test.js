import { parseImpaktUrl } from "./parseImpaktUrl";

describe("parseImpaktUrl", () => {
  it("parseert een story-URL correct", () => {
    expect(parseImpaktUrl("impakt://story/3")).toEqual({
      kind: "story",
      id: "3",
    });
  });

  it("parseert een meme-URL correct", () => {
    expect(parseImpaktUrl("impakt://meme/m7")).toEqual({
      kind: "meme",
      id: "m7",
    });
  });

  it("geeft null terug bij onbekend pad", () => {
    expect(parseImpaktUrl("impakt://onbekend/1")).toBeNull();
  });

  it("geeft null terug bij verkeerd scheme", () => {
    expect(parseImpaktUrl("https://example.com/story/1")).toBeNull();
  });

  it("geeft null terug bij lege id", () => {
    expect(parseImpaktUrl("impakt://story/")).toBeNull();
  });

  it("geeft null terug bij null input", () => {
    expect(parseImpaktUrl(null)).toBeNull();
  });

  it("geeft null terug bij undefined input", () => {
    expect(parseImpaktUrl(undefined)).toBeNull();
  });
});
