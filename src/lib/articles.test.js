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

test("fetchArticle vereist een id", async () => {
  await expect(fetchArticle()).rejects.toThrow("Artikel-id ontbreekt.");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("fetchHappyFeed filtert client-side op happy-tag", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [RAW_ARTICLE, RAW_HAPPY] }),
  });

  const happy = await fetchHappyFeed();
  expect(happy).toHaveLength(1);
  expect(happy[0].id).toBe(9);
  expect(happy[0].goodNews).toBe(true);
});

test("fetchHappyFeed geeft lege lijst terug als geen happy articles", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [RAW_ARTICLE] }),
  });

  const happy = await fetchHappyFeed();
  expect(happy).toEqual([]);
});
