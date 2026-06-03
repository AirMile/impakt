import {
  parseNLDate,
  isToday,
  isThisWeek,
  groupHappyStories,
} from "./storyDate";

const JUN_3 = new Date(2026, 5, 3);

describe("parseNLDate", () => {
  test("parst valide datum", () => {
    expect(parseNLDate("3 Juni 2026")).toEqual(new Date(2026, 5, 3));
  });

  test("is case-insensitive voor de maandnaam", () => {
    expect(parseNLDate("21 mei 2026")).toEqual(new Date(2026, 4, 21));
    expect(parseNLDate("21 MEI 2026")).toEqual(new Date(2026, 4, 21));
  });

  test("handelt alle NL-maanden", () => {
    const maanden = [
      ["januari", 0],
      ["februari", 1],
      ["maart", 2],
      ["april", 3],
      ["mei", 4],
      ["juni", 5],
      ["juli", 6],
      ["augustus", 7],
      ["september", 8],
      ["oktober", 9],
      ["november", 10],
      ["december", 11],
    ];
    for (const [naam, idx] of maanden) {
      expect(parseNLDate(`1 ${naam} 2026`)).toEqual(new Date(2026, idx, 1));
    }
  });

  test("handelt jaargrens", () => {
    expect(parseNLDate("31 December 2025")).toEqual(new Date(2025, 11, 31));
    expect(parseNLDate("1 Januari 2026")).toEqual(new Date(2026, 0, 1));
  });

  test("retourneert null voor ongeldige invoer", () => {
    expect(parseNLDate("foo")).toBeNull();
    expect(parseNLDate("")).toBeNull();
    expect(parseNLDate(null)).toBeNull();
    expect(parseNLDate(undefined)).toBeNull();
    expect(parseNLDate("1 onbekendemaand 2026")).toBeNull();
    expect(parseNLDate("2026-06-03")).toBeNull();
  });
});

describe("isToday", () => {
  test("herkent vandaag", () => {
    expect(isToday(new Date(2026, 5, 3), JUN_3)).toBe(true);
  });

  test("gisteren is niet vandaag", () => {
    expect(isToday(new Date(2026, 5, 2), JUN_3)).toBe(false);
  });

  test("morgen is niet vandaag", () => {
    expect(isToday(new Date(2026, 5, 4), JUN_3)).toBe(false);
  });

  test("retourneert false voor null", () => {
    expect(isToday(null, JUN_3)).toBe(false);
  });
});

describe("isThisWeek", () => {
  test("gisteren valt in deze week", () => {
    expect(isThisWeek(new Date(2026, 5, 2), JUN_3)).toBe(true);
  });

  test("7 dagen geleden valt in deze week", () => {
    expect(isThisWeek(new Date(2026, 4, 27), JUN_3)).toBe(true);
  });

  test("8 dagen geleden valt niet in deze week", () => {
    expect(isThisWeek(new Date(2026, 4, 26), JUN_3)).toBe(false);
  });

  test("vandaag valt niet in isThisWeek", () => {
    expect(isThisWeek(new Date(2026, 5, 3), JUN_3)).toBe(false);
  });

  test("handelt maandgrens correct", () => {
    expect(isThisWeek(new Date(2026, 4, 27), JUN_3)).toBe(true);
    expect(isThisWeek(new Date(2026, 4, 26), JUN_3)).toBe(false);
  });

  test("retourneert false voor null", () => {
    expect(isThisWeek(null, JUN_3)).toBe(false);
  });
});

const TODAY = "3 Juni 2026";
const WEEK = "1 Juni 2026";
const EARLIER = "20 Mei 2026";

function mk(date, smile, id = Math.random()) {
  return { id, date, reactions: { smile } };
}

function nStories(date, count) {
  return Array.from({ length: count }, (_, i) => mk(date, 10 - i));
}

describe("groupHappyStories", () => {
  test("today(1)+week(3) → 1 sectie WEEK met 4 stories", () => {
    const stories = [...nStories(TODAY, 1), ...nStories(WEEK, 3)];
    const result = groupHappyStories(stories, { now: JUN_3 });
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("week");
    expect(result[0].stories).toHaveLength(4);
  });

  test("today(3)+week(5)+earlier(10) → 3 secties ongewijzigd", () => {
    const stories = [
      ...nStories(TODAY, 3),
      ...nStories(WEEK, 5),
      ...nStories(EARLIER, 10),
    ];
    const result = groupHappyStories(stories, { now: JUN_3 });
    expect(result).toHaveLength(3);
    expect(result[0].key).toBe("today");
    expect(result[0].stories).toHaveLength(3);
    expect(result[1].key).toBe("week");
    expect(result[1].stories).toHaveLength(5);
    expect(result[2].key).toBe("earlier");
    expect(result[2].stories).toHaveLength(10);
  });

  test("today(0)+week(8) → 1 sectie WEEK met 8 stories", () => {
    const stories = nStories(WEEK, 8);
    const result = groupHappyStories(stories, { now: JUN_3 });
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("week");
    expect(result[0].stories).toHaveLength(8);
  });

  test("today(5)+week(1)+earlier(3) → VANDAAG(5) + EERDER(4)", () => {
    const stories = [
      ...nStories(TODAY, 5),
      ...nStories(WEEK, 1),
      ...nStories(EARLIER, 3),
    ];
    const result = groupHappyStories(stories, { now: JUN_3 });
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("today");
    expect(result[0].stories).toHaveLength(5);
    expect(result[1].key).toBe("earlier");
    expect(result[1].stories).toHaveLength(4);
  });

  test("today(2)+week(2)+earlier(1) → WEEK(4) + EERDER(1)", () => {
    const stories = [
      ...nStories(TODAY, 2),
      ...nStories(WEEK, 2),
      ...nStories(EARLIER, 1),
    ];
    const result = groupHappyStories(stories, { now: JUN_3 });
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe("week");
    expect(result[0].stories).toHaveLength(4);
    expect(result[1].key).toBe("earlier");
    expect(result[1].stories).toHaveLength(1);
  });

  test("lege input → []", () => {
    expect(groupHappyStories([], { now: JUN_3 })).toEqual([]);
  });

  test("ongeldige datum valt in earlier-bucket", () => {
    // 3 week-stories (≥ drempel) + 1 ongeldige datum → week blijft, earlier krijgt de ongeldige
    const stories = [...nStories(WEEK, 3), mk("niet-een-datum", 5)];
    const result = groupHappyStories(stories, { now: JUN_3 });
    const earlier = result.find((s) => s.key === "earlier");
    expect(earlier).toBeDefined();
    expect(earlier.stories).toHaveLength(1);
    expect(earlier.stories[0].date).toBe("niet-een-datum");
  });

  test("threshold=1 → geen merging (origineel gedrag)", () => {
    const stories = [
      ...nStories(TODAY, 1),
      ...nStories(WEEK, 1),
      ...nStories(EARLIER, 1),
    ];
    const result = groupHappyStories(stories, { now: JUN_3, threshold: 1 });
    expect(result).toHaveLength(3);
    expect(result[0].key).toBe("today");
    expect(result[1].key).toBe("week");
    expect(result[2].key).toBe("earlier");
  });

  test("labels zijn LEUK NIEUWS", () => {
    const stories = [
      ...nStories(TODAY, 3),
      ...nStories(WEEK, 3),
      ...nStories(EARLIER, 3),
    ];
    const result = groupHappyStories(stories, { now: JUN_3 });
    expect(result.find((s) => s.key === "today").label).toBe(
      "LEUK NIEUWS VAN VANDAAG"
    );
    expect(result.find((s) => s.key === "week").label).toBe(
      "LEUK NIEUWS VAN DEZE WEEK"
    );
    expect(result.find((s) => s.key === "earlier").label).toBe("EERDER");
  });

  test("filterTag toont alleen stories met die tag", () => {
    const withTag = { ...mk(WEEK, 10), tags: ["Natuur", "Goed nieuws"] };
    const withoutTag = { ...mk(WEEK, 8), tags: ["Sport"] };
    const result = groupHappyStories([withTag, withoutTag], {
      now: JUN_3,
      threshold: 1,
      filterTag: "Natuur",
    });
    expect(result).toHaveLength(1);
    expect(result[0].stories).toHaveLength(1);
    expect(result[0].stories[0]).toBe(withTag);
  });

  test("filterTag zonder matches → []", () => {
    const stories = nStories(WEEK, 3).map((s) => ({ ...s, tags: ["Sport"] }));
    const result = groupHappyStories(stories, {
      now: JUN_3,
      filterTag: "Natuur",
    });
    expect(result).toEqual([]);
  });

  test("filterTag met stories zonder tags-veld → geen crash", () => {
    const noTags = mk(WEEK, 5);
    const withTag = { ...mk(WEEK, 8), tags: ["Natuur"] };
    const result = groupHappyStories([noTags, withTag], {
      now: JUN_3,
      threshold: 1,
      filterTag: "Natuur",
    });
    expect(result).toHaveLength(1);
    expect(result[0].stories[0]).toBe(withTag);
  });
});
