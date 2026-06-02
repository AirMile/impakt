import { filterStories } from "./filterStories";

const stories = [
  { id: 1, cat: "Klimaat", goodNews: true },
  { id: 2, cat: "Sport", goodNews: false },
  { id: 3, cat: "Klimaat", goodNews: false },
  { id: 4, cat: "Tech" },
];

test("geen filters → alle stories", () => {
  expect(filterStories({ stories, cat: "Voor jou" })).toHaveLength(4);
});

test("goodNewsOnly=true → alleen goodNews stories", () => {
  expect(filterStories({ stories, goodNewsOnly: true })).toEqual([stories[0]]);
});

test('cat="Voor jou" → alle stories (wildcard)', () => {
  expect(filterStories({ stories, cat: "Voor jou" })).toHaveLength(4);
});

test("specifieke cat filtert exact", () => {
  expect(filterStories({ stories, cat: "Klimaat" })).toEqual([
    stories[0],
    stories[2],
  ]);
});

test("excludeId verwijdert story uit resultaat", () => {
  const result = filterStories({ stories, cat: "Voor jou", excludeId: 2 });
  expect(result).toHaveLength(3);
  expect(result.find((s) => s.id === 2)).toBeUndefined();
});

test("goodNewsOnly heeft prioriteit boven cat", () => {
  const result = filterStories({ stories, goodNewsOnly: true, cat: "Sport" });
  expect(result).toEqual([stories[0]]);
});

test("goodNewsOnly + excludeId combinatie", () => {
  expect(
    filterStories({ stories, goodNewsOnly: true, excludeId: 1 })
  ).toHaveLength(0);
});
