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
