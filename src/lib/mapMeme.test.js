import { mapMeme } from "./mapMeme";

const RAW = {
  id: 1,
  article_id: 7,
  title: "Wanneer je vandaag duurzaam zegt",
  image_url: "https://x.test/m.jpg",
  caption: "Ik op de fiets: character development.",
  created_at: "2026-06-08T13:05:00.000000Z",
  article: { id: 7, title: "Jongeren over klimaat" },
};

test("mapMeme mapt backend-velden naar frontend-shape", () => {
  const m = mapMeme(RAW);
  expect(m.id).toBe(1);
  expect(m.storyId).toBe(7);
  expect(m.img).toBe("https://x.test/m.jpg");
  expect(m.top).toBe("Wanneer je vandaag duurzaam zegt");
  expect(m.bot).toBe("Ik op de fiets: character development.");
  expect(m.storyHeadline).toBe("Jongeren over klimaat");
  expect(m.storySource).toBe("Impakt");
});

test("mapMeme stubt reactions met nullen als backend geen reactions levert", () => {
  const m = mapMeme(RAW);
  expect(m.reactions).toEqual({ smile: 0, meh: 0, frown: 0 });
});

test("mapMeme returnt null voor null of niet-object", () => {
  expect(mapMeme(null)).toBeNull();
  expect(mapMeme(undefined)).toBeNull();
  expect(mapMeme("string")).toBeNull();
});

test("mapMeme accepteert al-gemapte shape (storyId/img/top/bot fallback)", () => {
  const m = mapMeme({
    id: 9,
    storyId: 3,
    img: "x",
    top: "T",
    bot: "B",
    reactions: { smile: 50, meh: 30, frown: 20 },
  });
  expect(m.storyId).toBe(3);
  expect(m.img).toBe("x");
  expect(m.top).toBe("T");
  expect(m.reactions.smile).toBe(50);
});

test("mapMeme zonder embedded article geeft lege headline", () => {
  const m = mapMeme({
    id: 2,
    article_id: 4,
    title: "T",
    caption: "C",
    image_url: "x",
  });
  expect(m.storyHeadline).toBe("");
  expect(m.storyTeaser).toBe("");
});
