import { getRelatedMemes } from "./getRelatedMemes";

const MEMES = [
  { id: "m1", storyId: 1 },
  { id: "m2", storyId: 2 },
  { id: "m3", storyId: 1 },
];

test("retourneert alle memes die bij storyId horen", () => {
  const result = getRelatedMemes(MEMES, 1);
  expect(result).toHaveLength(2);
  expect(result.map((m) => m.id)).toEqual(["m1", "m3"]);
});

test("retourneert lege array bij geen match", () => {
  expect(getRelatedMemes(MEMES, 99)).toEqual([]);
});

test("firstMeme is undefined bij lege array", () => {
  const result = getRelatedMemes(MEMES, 99);
  expect(result[0]).toBeUndefined();
});

test("muteert de oorspronkelijke array niet", () => {
  const original = [...MEMES];
  getRelatedMemes(MEMES, 1);
  expect(MEMES).toEqual(original);
});
