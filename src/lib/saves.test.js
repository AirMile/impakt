import { saveArticle, unsaveArticle, saveMeme, unsaveMeme } from "./saves";

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
    json: async () => ({ message: "Bestaat niet" }),
  });

  await expect(unsaveMeme("tok123", 7)).rejects.toThrow("Bestaat niet");
});
