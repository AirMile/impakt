import { STORIES, MEMES, CATEGORIES } from "./index";

test("STORIES is een niet-lege array", () => {
  expect(Array.isArray(STORIES)).toBe(true);
  expect(STORIES.length).toBeGreaterThan(0);
});

test("MEMES is een niet-lege array", () => {
  expect(Array.isArray(MEMES)).toBe(true);
  expect(MEMES.length).toBeGreaterThan(0);
});

test("CATEGORIES is een niet-lege array van strings", () => {
  expect(Array.isArray(CATEGORIES)).toBe(true);
  expect(CATEGORIES.length).toBeGreaterThan(0);
  CATEGORIES.forEach((c) => expect(typeof c).toBe("string"));
});

test("elke story heeft verplichte velden", () => {
  STORIES.forEach((s) => {
    expect(typeof s.id).toBe("number");
    expect(typeof s.cat).toBe("string");
    expect(Array.isArray(s.body)).toBe(true);
    expect(typeof s.reactions).toBe("object");
    expect(typeof s.reactions.smile).toBe("number");
    expect(typeof s.reactions.meh).toBe("number");
    expect(typeof s.reactions.frown).toBe("number");
  });
});

test("elke meme heeft verplichte velden", () => {
  MEMES.forEach((m) => {
    expect(m.id).toBeTruthy();
    expect(typeof m.storyId).toBe("number");
  });
});

test("elke meme.storyId resolvet naar een bestaande story", () => {
  const storyIds = new Set(STORIES.map((s) => s.id));
  MEMES.forEach((m) => {
    expect(storyIds.has(m.storyId)).toBe(true);
  });
});

test("elke story.cat zit in CATEGORIES", () => {
  STORIES.forEach((s) => {
    expect(CATEGORIES).toContain(s.cat);
  });
});
