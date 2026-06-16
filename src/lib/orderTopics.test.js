import { orderTopics } from "./orderTopics";

const ALL = [
  { id: 1, name: "Innovatie" },
  { id: 2, name: "Kunst" },
  { id: 3, name: "Politiek" },
  { id: 4, name: "Sport" },
  { id: 5, name: "Buitenland" },
];

const names = (tags) => tags.map((t) => t.name);

test("geselecteerde tags komen vooraan, rest in catalogus-volgorde", () => {
  const result = orderTopics(ALL, ["Kunst"], []);
  expect(names(result)).toEqual([
    "Kunst",
    "Innovatie",
    "Politiek",
    "Sport",
    "Buitenland",
  ]);
});

test("binnen de selectie geldt recency: recentst aangeraakt eerst", () => {
  // Innovatie is recenter aangeraakt dan Kunst
  const result = orderTopics(
    ALL,
    ["Innovatie", "Kunst"],
    ["Innovatie", "Kunst"]
  );
  expect(names(result).slice(0, 2)).toEqual(["Innovatie", "Kunst"]);
});

test("net-gedeselecteerde tag landt direct rechts van de selectie", () => {
  // Start: Innovatie + Kunst geselecteerd, Innovatie recentst.
  // Innovatie wordt gedeselecteerd → selectie = {Kunst}, recency bumpt Innovatie vooraan.
  const result = orderTopics(ALL, ["Kunst"], ["Innovatie", "Kunst"]);
  expect(names(result)).toEqual([
    "Kunst", // enige geselecteerde
    "Innovatie", // net aangeraakt → direct na de selectie, niet naar achteren
    "Politiek",
    "Sport",
    "Buitenland",
  ]);
});

test("nooit-aangeraakte tags blijven in catalogus-volgorde achteraan", () => {
  const result = orderTopics(ALL, [], ["Sport", "Politiek"]);
  // geen selectie; aangeraakte tags (Sport, Politiek) eerst op recency, rest catalogus
  expect(names(result)).toEqual([
    "Sport",
    "Politiek",
    "Innovatie",
    "Kunst",
    "Buitenland",
  ]);
});

test("accepteert een Set als selectedNames", () => {
  const result = orderTopics(ALL, new Set(["Sport"]), []);
  expect(names(result)[0]).toBe("Sport");
});

test("lege/ontbrekende recency → geselecteerd eerst, dan catalogus", () => {
  expect(names(orderTopics(ALL, ["Politiek"], undefined))).toEqual([
    "Politiek",
    "Innovatie",
    "Kunst",
    "Sport",
    "Buitenland",
  ]);
});

test("lege allTags geeft een lege array", () => {
  expect(orderTopics([], ["Kunst"], ["Kunst"])).toEqual([]);
  expect(orderTopics(undefined, [], [])).toEqual([]);
});
