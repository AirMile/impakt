import { orderUserTags } from "./orderUserTags";

const ALL = [
  { id: 2, name: "Politiek", category: "politiek" },
  { id: 3, name: "Buitenland", category: "buitenland" },
  { id: 5, name: "Sport", category: "sport" },
  { id: 6, name: "Natuur", category: "natuur" },
];

test("mine-tags komen vooraan, anderen in backend-volgorde", () => {
  const mine = [{ id: 5, name: "Sport", category: "sport" }];
  const result = orderUserTags(ALL, mine);

  expect(result.map((t) => t.id)).toEqual([5, 2, 3, 6]);
});

test("meerdere mine-tags behouden hun backend-volgorde", () => {
  const mine = [
    { id: 6, name: "Natuur", category: "natuur" },
    { id: 2, name: "Politiek", category: "politiek" },
  ];
  const result = orderUserTags(ALL, mine);

  // 2 staat voor 6 in allTags, dus die volgorde overheerst — niet de myTags-volgorde
  expect(result.map((t) => t.id)).toEqual([2, 6, 3, 5]);
});

test("lege mine-lijst geeft allTags onveranderd terug", () => {
  expect(orderUserTags(ALL, []).map((t) => t.id)).toEqual([2, 3, 5, 6]);
});

test("undefined of null myTags wordt behandeld als lege lijst", () => {
  expect(orderUserTags(ALL, null).map((t) => t.id)).toEqual([2, 3, 5, 6]);
  expect(orderUserTags(ALL, undefined).map((t) => t.id)).toEqual([2, 3, 5, 6]);
});

test("lege allTags geeft lege array, ook met mine-input", () => {
  expect(orderUserTags([], [{ id: 1 }])).toEqual([]);
});

test("mine-tag-id die niet in allTags zit wordt genegeerd", () => {
  const mine = [{ id: 999, name: "Onbekend", category: "x" }];
  expect(orderUserTags(ALL, mine).map((t) => t.id)).toEqual([2, 3, 5, 6]);
});
