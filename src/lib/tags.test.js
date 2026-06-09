import { fetchMyTags, fetchTags, updateMyTags } from "./tags";

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

test("updateMyTags vereist token", async () => {
  await expect(updateMyTags(undefined, [1])).rejects.toThrow(
    "Je bent niet ingelogd."
  );
  expect(global.fetch).not.toHaveBeenCalled();
});

test("updateMyTags gooit servermelding door bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "tag_ids field is required" }),
  });

  await expect(updateMyTags("abc", [])).rejects.toThrow(
    "tag_ids field is required"
  );
});
