import {
  formatNLDate,
  formatTime,
  formatViews,
  mapArticle,
  paragraphsFromContent,
} from "./mapArticle";

const SAMPLE_RAW = {
  id: 1,
  title: "Jongeren maken zich zorgen over klimaat",
  summary: "Een kort en helder artikel.",
  content:
    "Veel jongvolwassenen willen duurzamer leven.\n\nKleine keuzes zoals minder voedsel verspillen kunnen veel verschil maken.",
  image_url: "https://images.unsplash.com/photo-1497436072909",
  original_url: "https://example.com/klimaat-jongeren",
  tone: "light",
  status: "active",
  author_id: 1,
  published_at: "2026-06-08T13:04:53.000000Z",
  views_count: 34200,
  tags: [
    { id: 2, name: "Politiek", category: "politiek", pivot: {} },
    { id: 6, name: "Natuur", category: "natuur", pivot: {} },
  ],
  call_to_action: { id: 1, title: "Help" },
  memes: [{ id: 1, image_url: "x" }],
};

test("formatNLDate produceert dag-maand-jaar in NL met lowercase maand", () => {
  expect(formatNLDate("2026-06-08T13:04:53Z")).toMatch(/^8 juni 2026$/);
});

test("formatNLDate geeft lege string bij ongeldige input", () => {
  expect(formatNLDate(null)).toBe("");
  expect(formatNLDate("kaas")).toBe("");
});

test("formatTime produceert HH:MM met leading zero", () => {
  // We toetsen het patroon — werkelijke uur hangt van timezone af
  expect(formatTime("2026-06-08T13:04:53Z")).toMatch(/^\d{2}:\d{2}$/);
});

test("formatViews kort getallen af tot k en M", () => {
  expect(formatViews(0)).toBe("0");
  expect(formatViews(999)).toBe("999");
  expect(formatViews(1000)).toBe("1k");
  expect(formatViews(34200)).toBe("34.2k");
  expect(formatViews(1_500_000)).toBe("1.5M");
});

test("paragraphsFromContent splitst op dubbele newlines", () => {
  expect(paragraphsFromContent("Eerste.\n\nTweede.\n\nDerde.")).toEqual([
    "Eerste.",
    "Tweede.",
    "Derde.",
  ]);
});

test("paragraphsFromContent accepteert ook bestaande array", () => {
  expect(paragraphsFromContent(["a", "b"])).toEqual(["a", "b"]);
});

test("paragraphsFromContent geeft lege array bij null/undefined", () => {
  expect(paragraphsFromContent(null)).toEqual([]);
  expect(paragraphsFromContent("")).toEqual([]);
});

test("mapArticle bevat de hoofdvelden uit een live backend article", () => {
  const article = mapArticle(SAMPLE_RAW);
  expect(article.id).toBe(1);
  expect(article.title).toBe(SAMPLE_RAW.title);
  expect(article.sub).toBe(SAMPLE_RAW.summary);
  expect(article.img).toBe(SAMPLE_RAW.image_url);
  expect(article.body).toHaveLength(2);
  expect(article.views).toBe("34.2k");
  expect(article.tone).toBe("light");
  expect(article.tags).toEqual([
    { id: 2, name: "Politiek", category: "politiek" },
    { id: 6, name: "Natuur", category: "natuur" },
  ]);
  expect(article.callToAction).toEqual({ id: 1, title: "Help" });
  expect(article.memes).toHaveLength(1);
});

test("mapArticle stubt ontbrekende velden", () => {
  const article = mapArticle(SAMPLE_RAW);
  expect(article.reactions).toEqual({ smile: 0, meh: 0, frown: 0 });
  expect(article.trending).toBe(false);
  expect(article.poll).toBeNull();
  expect(article.actions).toBeNull();
  expect(article.sources).toBeNull();
});

test("mapArticle neemt reactie-counts over van de backend", () => {
  const article = mapArticle({
    ...SAMPLE_RAW,
    reactions: { smile: 5, meh: 2, frown: 1 },
  });
  expect(article.reactions).toEqual({ smile: 5, meh: 2, frown: 1 });
});

test("mapArticle leidt goodNews af uit de happy-tag", () => {
  const happy = mapArticle({
    ...SAMPLE_RAW,
    tags: [{ id: 1, name: "happy", category: "happy" }],
  });
  expect(happy.goodNews).toBe(true);

  const niet = mapArticle({
    ...SAMPLE_RAW,
    tags: [{ id: 2, name: "Politiek", category: "politiek" }],
  });
  expect(niet.goodNews).toBe(false);
});

test("mapArticle is veilig bij ontbrekende tags en content", () => {
  const article = mapArticle({
    id: 9,
    title: "Leeg",
    published_at: "2026-06-01T10:00:00Z",
  });
  expect(article.tags).toEqual([]);
  expect(article.body).toEqual([]);
  expect(article.views).toBe("0");
  expect(article.memes).toEqual([]);
  expect(article.callToAction).toBeNull();
});

test("mapArticle returnt null bij ongeldig input", () => {
  expect(mapArticle(null)).toBeNull();
  expect(mapArticle(undefined)).toBeNull();
  expect(mapArticle("string")).toBeNull();
});
