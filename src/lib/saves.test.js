import {
  saveArticle,
  unsaveArticle,
  saveMeme,
  unsaveMeme,
  fetchSavedArticles,
  fetchSavedMemes,
  mapSavedFromResponse,
  mapSavedMemesFromResponse,
} from "./saves";

const RAW_SAVED = {
  id: 3,
  title: "Bewaard artikel",
  summary: "Sub",
  content: "Body.",
  image_url: "https://x.test/i.jpg",
  published_at: "2026-06-08T13:04:53Z",
  views_count: 1200,
  tags: [],
};

const RAW_SAVED_MEME = {
  id: 8,
  image_url: "https://x.test/m.jpg",
  article_id: 3,
};

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test("saveArticle POST naar /account/articles/{id}/save met token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ saved: true }),
  });

  await saveArticle("tok123", 7);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/account/articles/7/save",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
});

test("saveArticle vereist een token", async () => {
  await expect(saveArticle(null, 7)).rejects.toThrow("Je bent niet ingelogd.");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("saveArticle vereist een artikel-id", async () => {
  await expect(saveArticle("tok123")).rejects.toThrow("Artikel-id ontbreekt.");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("saveArticle gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Niet toegestaan" }),
  });

  await expect(saveArticle("tok123", 7)).rejects.toThrow("Niet toegestaan");
});

test("unsaveArticle DELETE naar /account/articles/{id}/save met token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ saved: false }),
  });

  await unsaveArticle("tok123", 7);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/account/articles/7/save",
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
});

test("unsaveArticle gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Bestaat niet" }),
  });

  await expect(unsaveArticle("tok123", 7)).rejects.toThrow("Bestaat niet");
});

test("saveMeme POST naar /account/memes/{id}/save met token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ saved: true }),
  });

  await saveMeme("tok123", 7);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/account/memes/7/save",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
});

test("saveMeme vereist een token", async () => {
  await expect(saveMeme(null, 7)).rejects.toThrow("Je bent niet ingelogd.");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("saveMeme vereist een meme-id", async () => {
  await expect(saveMeme("tok123")).rejects.toThrow("Meme-id ontbreekt.");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("unsaveMeme DELETE naar /account/memes/{id}/save met token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ saved: false }),
  });

  await unsaveMeme("tok123", 7);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/account/memes/7/save",
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
});

test("unsaveMeme gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => ({ message: "Bestaat niet" }),
  });

  await expect(unsaveMeme("tok123", 7)).rejects.toThrow("Bestaat niet");
});

test("unsaveMeme behandelt 404 idempotent als al-verwijderd", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 404,
    json: async () => ({ message: "Not Found" }),
  });

  await expect(unsaveMeme("tok123", 7)).resolves.toEqual({ saved: false });
});

test("fetchSavedArticles haalt en mapt user.saved_articles uit /account", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ user: { id: 1, saved_articles: [RAW_SAVED] } }),
  });

  const saved = await fetchSavedArticles("tok123");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/account",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
  expect(saved).toHaveLength(1);
  expect(saved[0].id).toBe(3);
  expect(saved[0].sub).toBe("Sub");
});

test("fetchSavedArticles geeft lege lijst zonder token", async () => {
  const saved = await fetchSavedArticles(null);
  expect(saved).toEqual([]);
  expect(global.fetch).not.toHaveBeenCalled();
});

test("fetchSavedArticles geeft lege lijst bij serverfout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Unauthorized" }),
  });

  const saved = await fetchSavedArticles("tok123");
  expect(saved).toEqual([]);
});

test("mapSavedFromResponse mapt save-respons en negeert ontbrekende data", () => {
  const mapped = mapSavedFromResponse({
    user: { saved_articles: [RAW_SAVED] },
  });
  expect(mapped).toHaveLength(1);
  expect(mapped[0].id).toBe(3);

  expect(mapSavedFromResponse({})).toEqual([]);
  expect(mapSavedFromResponse(null)).toEqual([]);
});

test("mapSavedFromResponse accepteert camelCase als fallback", () => {
  const mapped = mapSavedFromResponse({
    user: { savedArticles: [RAW_SAVED] },
  });
  expect(mapped).toHaveLength(1);
  expect(mapped[0].id).toBe(3);
});

test("fetchSavedMemes haalt en mapt user.saved_memes uit /account", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ user: { id: 1, saved_memes: [RAW_SAVED_MEME] } }),
  });

  const saved = await fetchSavedMemes("tok123");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/account",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
  expect(saved).toHaveLength(1);
  expect(saved[0].id).toBe(8);
  expect(saved[0].storyId).toBe(3);
});

test("fetchSavedMemes geeft lege lijst zonder token", async () => {
  const saved = await fetchSavedMemes(null);
  expect(saved).toEqual([]);
  expect(global.fetch).not.toHaveBeenCalled();
});

test("fetchSavedMemes geeft lege lijst als saved_memes ontbreekt", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ user: { id: 1 } }),
  });

  const saved = await fetchSavedMemes("tok123");
  expect(saved).toEqual([]);
});

test("mapSavedMemesFromResponse mapt memes en negeert ontbrekende data", () => {
  const mapped = mapSavedMemesFromResponse({
    user: { saved_memes: [RAW_SAVED_MEME] },
  });
  expect(mapped).toHaveLength(1);
  expect(mapped[0].id).toBe(8);

  expect(mapSavedMemesFromResponse({})).toEqual([]);
  expect(mapSavedMemesFromResponse(null)).toEqual([]);
});
