import { searchStories } from "./searchStories";

const stories = [
  {
    id: 1,
    title: "Klimaat crisis",
    sub: "Het wordt warmer",
    cat: "Klimaat",
    tags: ["opwarming", "CO2"],
  },
  {
    id: 2,
    title: "FC Amsterdam wint",
    sub: "Dramatisch einde",
    cat: "Sport",
    tags: ["voetbal", "kampioen"],
  },
  {
    id: 3,
    title: "Tech nieuws",
    sub: "AI verandert alles",
    cat: "Tech",
    tags: ["AI", "machine learning"],
  },
];

test("lege query → leeg resultaat", () => {
  expect(searchStories("", stories)).toHaveLength(0);
});

test("whitespace-only query → leeg resultaat", () => {
  expect(searchStories("   ", stories)).toHaveLength(0);
});

test("match op title, hoofdletter-onafhankelijk", () => {
  expect(searchStories("KLIMAAT", stories)).toEqual([stories[0]]);
});

test("match op sub", () => {
  expect(searchStories("warmer", stories)).toEqual([stories[0]]);
});

test("match op cat", () => {
  expect(searchStories("sport", stories)).toEqual([stories[1]]);
});

test("match op tags", () => {
  expect(searchStories("voetbal", stories)).toEqual([stories[1]]);
});

test("geen match → leeg array", () => {
  expect(searchStories("onzin123", stories)).toHaveLength(0);
});

test("whitespace in query wordt getrimd", () => {
  expect(searchStories("  AI  ", stories)).toEqual([stories[2]]);
});

test("meerdere resultaten mogelijk", () => {
  expect(searchStories("nieuws", stories)).toHaveLength(1);
});

test("matcht ook op tag-objects met name/category", () => {
  const withObjectTags = [
    {
      id: 4,
      title: "Iets",
      sub: "anders",
      tags: [{ id: 5, name: "Sport", category: "sport" }],
    },
  ];
  expect(searchStories("Sport", withObjectTags)).toHaveLength(1);
  expect(searchStories("sport", withObjectTags)).toHaveLength(1);
});
