import {
  formatNLDate,
  formatTime,
  formatViews,
  mapArticle,
  paragraphsFromContent,
  resolveArticleImageUrl,
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
    { id: 2, name: "Politiek", category: "politiek", icon: "info", pivot: {} },
    { id: 6, name: "Natuur", category: "natuur", icon: "sparkle", pivot: {} },
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

test("paragraphsFromContent accepteert body_paragraph objecten uit happy-feed", () => {
  expect(paragraphsFromContent([{ value: "a" }, { value: "b" }])).toEqual([
    "a",
    "b",
  ]);
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

test("mapArticle neemt call-to-action acties uit de article response over", () => {
  const article = mapArticle({
    ...SAMPLE_RAW,
    actions: [
      {
        label: "Doneer aan Giro555",
        sub: "1 min - veilig via iDEAL",
        goal: null,
        url: "https://example.test/doneer",
      },
    ],
  });

  expect(article.actions).toEqual([
    {
      label: "Doneer aan Giro555",
      sub: "1 min - veilig via iDEAL",
      goal: null,
      url: "https://example.test/doneer",
    },
  ]);
});

test("resolveArticleImageUrl laat absolute en data-URLs ongemoeid", () => {
  expect(resolveArticleImageUrl("http://host/storage/a.jpg")).toBe(
    "http://host/storage/a.jpg"
  );
  expect(resolveArticleImageUrl("https://images.unsplash.com/x")).toBe(
    "https://images.unsplash.com/x"
  );
  expect(resolveArticleImageUrl("data:image/png;base64,AAAA")).toBe(
    "data:image/png;base64,AAAA"
  );
});

test("resolveArticleImageUrl prefixt relatieve happy-feed paden met host + /storage/", () => {
  // /happy-feed levert image_url als "articles/xxx.jpg" zonder host of /storage/.
  expect(resolveArticleImageUrl("articles/abc.jpg")).toBe(
    "http://145.24.237.97/storage/articles/abc.jpg"
  );
  // Pad dat al met storage/ begint krijgt geen dubbele prefix.
  expect(resolveArticleImageUrl("/storage/articles/abc.jpg")).toBe(
    "http://145.24.237.97/storage/articles/abc.jpg"
  );
});

test("resolveArticleImageUrl geeft lege string bij ontbrekend beeld", () => {
  expect(resolveArticleImageUrl("")).toBe("");
  expect(resolveArticleImageUrl(null)).toBe("");
});

test("mapArticle stubt ontbrekende velden", () => {
  const article = mapArticle(SAMPLE_RAW);
  expect(article.reactions).toEqual({ smile: 0, meh: 0, frown: 0 });
  expect(article.trending).toBe(false);
  expect(article.poll).toBeTruthy();
  expect(article.actions).toBeNull();
  expect(article.sources).toBeNull();
});

test("mapArticle gebruikt lokale poll-fallback voor guest weergave", () => {
  const article = mapArticle({ ...SAMPLE_RAW, id: 1 });

  expect(article.poll.q).toBe("Moet Nederland direct extra noodhulp sturen?");
  expect(article.poll.options.map((opt) => opt.label)).toEqual([
    "Ja, zo snel mogelijk",
    "Eerst situatie afwachten",
  ]);
});

test("mapArticle neemt reactie-counts over van de backend", () => {
  const article = mapArticle({
    ...SAMPLE_RAW,
    reactions: { smile: 5, meh: 2, frown: 1 },
  });
  expect(article.reactions).toEqual({ smile: 5, meh: 2, frown: 1 });
});

test("mapArticle mapt my_reaction naar myReaction (null als afwezig)", () => {
  expect(mapArticle({ ...SAMPLE_RAW, my_reaction: "frown" }).myReaction).toBe(
    "frown"
  );
  expect(mapArticle(SAMPLE_RAW).myReaction).toBeNull();
});

test("mapArticle maakt relatieve article images volledig", () => {
  const article = mapArticle({
    ...SAMPLE_RAW,
    image_url: "articles/test.jpg",
  });

  expect(article.img).toBe("http://145.24.237.97/storage/articles/test.jpg");
});

test("mapArticle gebruikt bestaande date en time als published_at ontbreekt", () => {
  const article = mapArticle({
    ...SAMPLE_RAW,
    published_at: null,
    date: "14 juni 2026",
    time: "19:34",
  });

  expect(article.date).toBe("14 juni 2026");
  expect(article.time).toBe("19:34");
});

test("mapArticle normaliseert tags naar objecten (string of object)", () => {
  // Losse string-tags uit de live API worden objecten met category null.
  expect(mapArticle({ ...SAMPLE_RAW, tags: ["Lokaal", "Kunst"] }).tags).toEqual(
    [
      { id: "Lokaal", name: "Lokaal", category: null },
      { id: "Kunst", name: "Kunst", category: null },
    ]
  );
  // Objecten behouden hun category voor de tag-styling.
  expect(
    mapArticle({
      ...SAMPLE_RAW,
      tags: [{ id: 3, name: "Lokaal", category: "regio" }, "Kunst"],
    }).tags
  ).toEqual([
    { id: 3, name: "Lokaal", category: "regio" },
    { id: "Kunst", name: "Kunst", category: null },
  ]);
});

test("mapArticle bepaalt goodNews uit de backend-flag of een good-news-tag", () => {
  expect(mapArticle({ ...SAMPLE_RAW, goodNews: true }).goodNews).toBe(true);
  expect(mapArticle({ ...SAMPLE_RAW, goodNews: false }).goodNews).toBe(false);
  // Zonder flag en zonder good-news-tag is het geen goed-nieuws-artikel.
  expect(mapArticle({ ...SAMPLE_RAW }).goodNews).toBe(false);
  // Afgeleid uit een good-news-tag (naam "Goed nieuws"/"happy" of categorie "happy").
  expect(
    mapArticle({
      ...SAMPLE_RAW,
      tags: [{ id: 18, name: "Goed nieuws", category: "flag" }],
    }).goodNews
  ).toBe(true);
  expect(
    mapArticle({
      ...SAMPLE_RAW,
      tags: [{ id: 1, name: "happy", category: "happy" }],
    }).goodNews
  ).toBe(true);
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
