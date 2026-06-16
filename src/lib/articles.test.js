import { fetchArticle, fetchArticles, fetchHappyFeed } from "./articles";

const RAW_ARTICLE = {
  id: 1,
  title: "Klimaat",
  summary: "Sub",
  content: "Eerste.\n\nTweede.",
  image_url: "https://x.test/img.jpg",
  published_at: "2026-06-08T13:04:53Z",
  views_count: 4200,
  tone: "light",
  tags: [{ id: 2, name: "Politiek", category: "politiek" }],
  call_to_action: null,
  memes: [],
};

const RAW_HAPPY = {
  ...RAW_ARTICLE,
  id: 9,
  title: "Vrolijk verhaal",
  tags: [{ id: 1, name: "happy", category: "happy" }],
};

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test("fetchArticles haalt mapped lijst op uit /articles", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [RAW_ARTICLE] }),
  });

  const articles = await fetchArticles();

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/articles",
    { method: "GET", headers: { Accept: "application/json" } }
  );
  expect(articles).toHaveLength(1);
  expect(articles[0].id).toBe(1);
  expect(articles[0].sub).toBe("Sub");
  expect(articles[0].views).toBe("4.2k");
});

test("fetchArticles stuurt Authorization-header met token (voor my_reaction)", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [{ ...RAW_ARTICLE, my_reaction: "smile" }] }),
  });

  const articles = await fetchArticles({ token: "tok123" });

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/articles",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
  // Token hoort niet als query-param mee te liften.
  expect(global.fetch.mock.calls[0][0]).not.toContain("token");
  expect(articles[0].myReaction).toBe("smile");
});

test("fetchArticles hydrateert polls direct wanneer token aanwezig is", async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [RAW_ARTICLE] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 7, article_id: 1, question: "Wat vind je?" }],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: 31, poll_id: 7, option_text: "Ja, absoluut" },
          { id: 32, poll_id: 7, option_text: "Nee" },
        ],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { option: "Ja, absoluut", votes: 1, percentage: 50 },
        { option: "Nee", votes: 1, percentage: 50 },
      ],
    });

  const articles = await fetchArticles({ token: "tok123" });

  expect(articles[0].poll).toEqual({
    id: 7,
    articleId: 1,
    q: "Wat vind je?",
    options: [
      { id: 31, label: "Ja, absoluut", votes: 1, percentage: 50 },
      { id: 32, label: "Nee", votes: 1, percentage: 50 },
    ],
  });
});

test("fetchArticles haalt alle gepagineerde article pagina's op", async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [RAW_ARTICLE],
        links: { next: "http://145.24.237.97/api/articles?page=2" },
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ ...RAW_ARTICLE, id: 2, title: "Tweede" }],
        links: { next: null },
      }),
    });

  const articles = await fetchArticles();

  expect(global.fetch).toHaveBeenNthCalledWith(
    2,
    "http://145.24.237.97/api/articles?page=2",
    { method: "GET", headers: { Accept: "application/json" } }
  );
  expect(articles.map((article) => article.id)).toEqual([1, 2]);
});

test("fetchArticles verwijdert dubbele article ids uit gepagineerde responses", async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [RAW_ARTICLE],
        links: { next: "http://145.24.237.97/api/articles?page=2" },
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ ...RAW_ARTICLE, title: "Dubbel" }],
        links: { next: null },
      }),
    });

  const articles = await fetchArticles();

  expect(articles).toHaveLength(1);
  expect(articles[0].title).toBe("Klimaat");
});

test("fetchArticles ondersteunt query opties zoals sort=views", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [RAW_ARTICLE] }),
  });

  await fetchArticles({ sort: "views" });

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/articles?sort=views",
    { method: "GET", headers: { Accept: "application/json" } }
  );
});

test("fetchArticles gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Backend down" }),
  });

  await expect(fetchArticles()).rejects.toThrow("Backend down");
});

test("fetchArticle haalt één artikel op via id", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => RAW_ARTICLE,
  });

  const article = await fetchArticle(1);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/articles/1",
    { method: "GET", headers: { Accept: "application/json" } }
  );
  expect(article.id).toBe(1);
});

test("fetchArticle hydrateert poll direct wanneer token aanwezig is", async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => RAW_ARTICLE,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 7, article_id: 1, question: "Wat vind je?" }],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 31, poll_id: 7, option_text: "Ja" }],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{ option: "Ja", votes: 2, percentage: 100 }],
    });

  const article = await fetchArticle(1, "tok123");

  expect(article.poll.options[0]).toEqual({
    id: 31,
    label: "Ja",
    votes: 2,
    percentage: 100,
  });
});

test("fetchArticle accepteert een data-wrapper voor detail response", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: RAW_ARTICLE }),
  });

  const article = await fetchArticle(1);

  expect(article.id).toBe(1);
  expect(article.title).toBe("Klimaat");
});

test("fetchArticle vereist een id", async () => {
  await expect(fetchArticle()).rejects.toThrow("Artikel-id ontbreekt.");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("fetchHappyFeed haalt alle goodNews artikelen op uit /articles zonder views-sortering", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [RAW_ARTICLE, RAW_HAPPY],
  });

  const happy = await fetchHappyFeed();

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/articles",
    { method: "GET", headers: { Accept: "application/json" } }
  );
  expect(happy).toHaveLength(1);
  expect(happy[0].id).toBe(9);
  expect(happy[0].goodNews).toBe(true);
});

test("fetchHappyFeed verwijdert dubbele happy article ids", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [RAW_HAPPY, { ...RAW_HAPPY, title: "Dubbel happy" }],
  });

  const happy = await fetchHappyFeed();

  expect(happy).toHaveLength(1);
  expect(happy[0].title).toBe("Vrolijk verhaal");
});

test("fetchHappyFeed accepteert raw goodNews uit de article index", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [{ ...RAW_ARTICLE, goodNews: true }],
  });

  const happy = await fetchHappyFeed();
  expect(happy).toHaveLength(1);
  expect(happy[0].goodNews).toBe(true);
});

test("fetchHappyFeed gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Backend down" }),
  });

  await expect(fetchHappyFeed()).rejects.toThrow("Backend down");
});
