import { fetchSources, mapSource } from "./sources";

const RAW_SOURCE = {
  id: 1,
  name: "NOS",
  url: "https://nos.nl",
  reliability_score: 90,
  pivot: {
    article_id: 1,
    source_id: 1,
    source_url: "https://nos.nl/artikel/aangepaste-bron-url",
    is_primary: 0,
  },
};

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test("fetchSources haalt mapped bronnen op uit /articles/{id}/sources", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [RAW_SOURCE],
  });

  const sources = await fetchSources(1);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/articles/1/sources",
    { method: "GET", headers: { Accept: "application/json" } }
  );
  expect(sources).toEqual([
    {
      label: "NOS",
      sub: "https://nos.nl/artikel/aangepaste-bron-url",
      url: "https://nos.nl/artikel/aangepaste-bron-url",
    },
  ]);
});

test("fetchSources vereist een artikel-id", async () => {
  await expect(fetchSources()).rejects.toThrow("Artikel-id ontbreekt.");
  expect(global.fetch).not.toHaveBeenCalled();
});

test("fetchSources gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Niet gevonden" }),
  });

  await expect(fetchSources(1)).rejects.toThrow("Niet gevonden");
});

test("mapSource gebruikt name als label en pivot.source_url als sub", () => {
  expect(mapSource(RAW_SOURCE)).toEqual({
    label: "NOS",
    sub: "https://nos.nl/artikel/aangepaste-bron-url",
    url: "https://nos.nl/artikel/aangepaste-bron-url",
  });
});

test("mapSource valt terug op url als pivot.source_url ontbreekt", () => {
  expect(mapSource({ name: "Reuters", url: "https://reuters.com" })).toEqual({
    label: "Reuters",
    sub: "https://reuters.com",
    url: "https://reuters.com",
  });
});

test("mapSource negeert lege input", () => {
  expect(mapSource(null)).toBeNull();
  expect(mapSource({})).toBeNull();
});
