import { fetchMyTags, fetchTags, isInterestTag, updateMyTags } from "./tags";

describe("isInterestTag", () => {
  test("true voor een gewone interesse-tag", () => {
    expect(
      isInterestTag({ id: 2, name: "Politiek", category: "politiek" })
    ).toBe(true);
  });

  test("false voor de good-news-markering (happy of flag)", () => {
    expect(
      isInterestTag({ id: 9, name: "Goed nieuws", category: "happy" })
    ).toBe(false);
    expect(
      isInterestTag({ id: 18, name: "Goed nieuws", category: "flag" })
    ).toBe(false);
  });

  test("false voor een tag zonder category", () => {
    expect(isInterestTag({ id: 1, name: "Zonder" })).toBe(false);
    expect(isInterestTag(null)).toBe(false);
  });
});

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

const SAMPLE_TAGS = [
  { id: 2, name: "Politiek", category: "politiek" },
  { id: 5, name: "Sport", category: "sport" },
];

test("fetchTags haalt alle tags op zonder token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => SAMPLE_TAGS,
  });

  await expect(fetchTags()).resolves.toEqual(SAMPLE_TAGS);

  expect(global.fetch).toHaveBeenCalledWith("http://145.24.237.97/api/tags", {
    method: "GET",
    headers: { Accept: "application/json" },
  });
});

test("fetchTags gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Server is down" }),
  });

  await expect(fetchTags()).rejects.toThrow("Server is down");
});

test("fetchMyTags haalt interesses op met bearer token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => SAMPLE_TAGS,
  });

  await expect(fetchMyTags("abc")).resolves.toEqual(SAMPLE_TAGS);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/me/tags",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer abc",
      },
    }
  );
});

test("fetchMyTags geeft lege lijst terug zonder token", async () => {
  await expect(fetchMyTags()).resolves.toEqual([]);
  expect(global.fetch).not.toHaveBeenCalled();
});

test("fetchMyTags gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Unauthenticated" }),
  });

  await expect(fetchMyTags("bad")).rejects.toThrow("Unauthenticated");
});

test("updateMyTags stuurt tag_ids als PUT met bearer token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      message: "Tag preferences updated successfully",
      tags: SAMPLE_TAGS,
    }),
  });

  await expect(updateMyTags("abc", [2, 5])).resolves.toEqual(SAMPLE_TAGS);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/me/tags",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer abc",
      },
      body: JSON.stringify({ tag_ids: [2, 5] }),
    }
  );
});

test("updateMyTags stuurt een lege tag_ids voor 'geen interesses'", async () => {
  // "Geen tags" wordt gewoon als lege lijst gePUT; de backend moet dat toestaan
  // (tag_ids niet `required`), zodat de lege selectie server-side persisteert.
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ tags: [] }),
  });

  await expect(updateMyTags("abc", [])).resolves.toEqual([]);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/me/tags",
    expect.objectContaining({ body: JSON.stringify({ tag_ids: [] }) })
  );
});

test("updateMyTags vereist token", async () => {
  await expect(updateMyTags(undefined, [1])).rejects.toThrow(
    "Je bent niet ingelogd."
  );
  expect(global.fetch).not.toHaveBeenCalled();
});

test("updateMyTags gooit servermelding door bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Tags bijwerken mislukt." }),
  });

  await expect(updateMyTags("abc", [2])).rejects.toThrow(
    "Tags bijwerken mislukt."
  );
});
