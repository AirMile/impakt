import {
  submitArticleReaction,
  submitMemeReaction,
  removeArticleReaction,
  removeMemeReaction,
} from "./reactions";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test("submitArticleReaction POST naar /articles/{id}/reaction met token en body", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "Reaction saved successfully" }),
  });

  await submitArticleReaction("tok123", 7, "smile");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/articles/7/reaction",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
      body: JSON.stringify({ reaction: "smile" }),
    }
  );
});

test("submitMemeReaction POST naar /memes/{id}/reaction met token en body", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "Reaction saved successfully" }),
  });

  await submitMemeReaction("tok123", "m1", "frown");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/memes/m1/reaction",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
      body: JSON.stringify({ reaction: "frown" }),
    }
  );
});

test("submitArticleReaction vereist een token", async () => {
  await expect(submitArticleReaction(null, 7, "smile")).rejects.toThrow(
    "Je bent niet ingelogd."
  );
  expect(global.fetch).not.toHaveBeenCalled();
});

test("submitArticleReaction vereist een artikel-id", async () => {
  await expect(submitArticleReaction("tok123", null, "smile")).rejects.toThrow(
    "Artikel-id ontbreekt."
  );
  expect(global.fetch).not.toHaveBeenCalled();
});

test("submitMemeReaction vereist een meme-id", async () => {
  await expect(submitMemeReaction("tok123", null, "smile")).rejects.toThrow(
    "Meme-id ontbreekt."
  );
  expect(global.fetch).not.toHaveBeenCalled();
});

test("submitArticleReaction weigert een ongeldige reactie", async () => {
  await expect(submitArticleReaction("tok123", 7, "happy")).rejects.toThrow(
    "Ongeldige reactie."
  );
  expect(global.fetch).not.toHaveBeenCalled();
});

test("submitArticleReaction gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Niet toegestaan" }),
  });

  await expect(submitArticleReaction("tok123", 7, "smile")).rejects.toThrow(
    "Niet toegestaan"
  );
});

test("removeArticleReaction DELETE naar /articles/{id}/reaction met token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "Reaction removed successfully" }),
  });

  await removeArticleReaction("tok123", 7);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/articles/7/reaction",
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
});

test("removeMemeReaction DELETE naar /memes/{id}/reaction met token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "Reaction removed successfully" }),
  });

  await removeMemeReaction("tok123", "m1");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/memes/m1/reaction",
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
});
