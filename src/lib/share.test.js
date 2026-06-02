import { Share } from "react-native";
import { buildShareUrl, shareStory, shareMeme } from "./share";

jest.mock("react-native", () => ({
  Share: { share: jest.fn() },
  Platform: { OS: "ios" },
}));

beforeEach(() => {
  Share.share.mockReset();
  Share.share.mockResolvedValue({ action: "sharedAction" });
});

describe("buildShareUrl", () => {
  it("bouwt een story-URL", () => {
    expect(buildShareUrl({ kind: "story", id: 5 })).toBe("impakt://story/5");
  });

  it("bouwt een meme-URL", () => {
    expect(buildShareUrl({ kind: "meme", id: "m1" })).toBe("impakt://meme/m1");
  });

  it("accepteert id 0", () => {
    expect(buildShareUrl({ kind: "story", id: 0 })).toBe("impakt://story/0");
  });

  it("gooit bij onbekend kind", () => {
    expect(() => buildShareUrl({ kind: "onbekend", id: 1 })).toThrow();
  });
});

describe("shareStory", () => {
  it("roept Share.share aan met de juiste url", async () => {
    await shareStory({ id: 5, title: "Titel", sub: "Sub" });
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Titel",
        url: "impakt://story/5",
        message: expect.stringContaining("impakt://story/5"),
      })
    );
  });

  it("gooit niet bij een geannuleerde share (dismiss)", async () => {
    Share.share.mockRejectedValue(
      Object.assign(new Error("dismissed"), { code: "ENOMEM" })
    );
    await expect(
      shareStory({ id: 1, title: "X", sub: "Y" })
    ).resolves.toBeUndefined();
  });
});

describe("shareMeme", () => {
  it("roept Share.share aan met de juiste meme-url en message", async () => {
    await shareMeme({
      id: "m1",
      storyHeadline: "Headline",
      top: "Top tekst",
      bot: "Bottom tekst",
    });
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "impakt://meme/m1",
        message: expect.stringContaining("Top tekst / Bottom tekst"),
      })
    );
  });
});
