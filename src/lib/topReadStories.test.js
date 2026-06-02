import { topReadStories } from "./topReadStories";

const STORIES = [
  { id: 1, views: "1k" },
  { id: 2, views: "5k" },
  { id: 3, views: "0.3k" },
  { id: 4, views: "10k" },
];

test("sorteert aflopend op views", () => {
  const result = topReadStories(STORIES, 4);
  expect(result.map((s) => s.id)).toEqual([4, 2, 1, 3]);
});

test("slice respecteert n", () => {
  expect(topReadStories(STORIES, 2)).toHaveLength(2);
  expect(topReadStories(STORIES, 2)[0].id).toBe(4);
});

test("muteert de oorspronkelijke array niet", () => {
  const original = STORIES.map((s) => s.id);
  topReadStories(STORIES, 4);
  expect(STORIES.map((s) => s.id)).toEqual(original);
});
