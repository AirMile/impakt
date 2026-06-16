import { fetchMemes } from "./memes";

const RAW = {
  id: 1,
  article_id: 7,
  title: "Top",
  image_url: "x",
  caption: "Bot",
  article: { id: 7, title: "Headline" },
};

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test("fetchMemes haalt mapped lijst op uit /memes (Laravel paginator)", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [RAW] }),
  });

  const memes = await fetchMemes();

  expect(global.fetch).toHaveBeenCalledWith("http://145.24.237.97/api/memes", {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  expect(memes).toHaveLength(1);
  expect(memes[0].storyId).toBe(7);
  expect(memes[0].storyHeadline).toBe("Headline");
});

test("fetchMemes hangt storyId query-param aan", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [] }),
  });

  await fetchMemes(5);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/memes?storyId=5",
    { method: "GET", headers: { Accept: "application/json" } }
  );
});

test("fetchMemes stuurt Authorization-header met token en mapt my_reaction", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [{ ...RAW, my_reaction: "meh" }] }),
  });

  const memes = await fetchMemes(5, "tok123");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/memes?storyId=5",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer tok123",
      },
    }
  );
  expect(memes[0].myReaction).toBe("meh");
});

test("fetchMemes gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Backend down" }),
  });

  await expect(fetchMemes()).rejects.toThrow("Backend down");
});

test("fetchMemes returnt lege lijst als data geen array bevat", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  });

  await expect(fetchMemes()).resolves.toEqual([]);
});

test("fetchMemes verrijkt de kaart met artikel-thumbnail en teaser via de index", async () => {
  // De /memes-respons nest het artikel zonder afbeelding/summary; die komen
  // uit een tweede call naar de artikelindex (/articles), gejoind op storyId.
  global.fetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [RAW] }) })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 7,
            title: "Headline",
            summary: "Korte teaser",
            image_url: "https://x.test/artikel.jpg",
          },
        ],
      }),
    });

  const memes = await fetchMemes();

  expect(memes[0].storyThumb).toBe("https://x.test/artikel.jpg");
  expect(memes[0].storyTeaser).toBe("Korte teaser");
});

test("fetchMemes valt terug op de kale kaart als de artikelindex faalt", async () => {
  global.fetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [RAW] }) })
    .mockRejectedValueOnce(new Error("index down"));

  const memes = await fetchMemes();

  expect(memes).toHaveLength(1);
  expect(memes[0].storyThumb).toBe("");
});
