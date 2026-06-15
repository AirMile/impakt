import {
  fetchPollForArticle,
  fetchPollResults,
  mapPoll,
  removePollVote,
  submitPollVote,
} from "./polls";

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date("2026-06-08T14:30:00Z"));
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test("mapPoll koppelt opties en resultaten aan een poll", () => {
  expect(
    mapPoll(
      { id: 7, article_id: 102, question: "Wat vind je?" },
      [
        { id: 31, poll_id: 7, text: "Ja", votes: 1 },
        { id: 32, poll_id: 7, text: "Nee", votes: 2 },
      ],
      { results: [{ option_id: 31, votes: 4 }] }
    )
  ).toEqual({
    id: 7,
    articleId: 102,
    q: "Wat vind je?",
    options: [
      { id: 31, label: "Ja", votes: 4 },
      { id: 32, label: "Nee", votes: 2 },
    ],
  });
});

test("mapPoll ondersteunt option_text en results als optielijst", () => {
  expect(
    mapPoll({ id: 7, article_id: 102, question: "Wat vind je?" }, [], {
      results: [
        { option_id: 31, option_text: "Ja, zo snel mogelijk", votes_count: 3 },
        { option_id: 32, option_text: "Eerst afwachten", votes_count: 1 },
      ],
    })
  ).toEqual({
    id: 7,
    articleId: 102,
    q: "Wat vind je?",
    options: [
      { id: 31, label: "Ja, zo snel mogelijk", votes: 3 },
      { id: 32, label: "Eerst afwachten", votes: 1 },
    ],
  });
});

test("mapPoll matcht result rows op option label als option_id ontbreekt", () => {
  expect(
    mapPoll(
      { id: 7, article_id: 102, question: "Wat vind je?" },
      [
        { id: 31, poll_id: 7, option_text: "Ja, absoluut" },
        { id: 32, poll_id: 7, option_text: "Alleen bij grote inkomsten" },
        { id: 33, poll_id: 7, option_text: "Nee" },
      ],
      [
        { option: "Ja, absoluut", votes: 1, percentage: 50 },
        { option: "Alleen bij grote inkomsten", votes: 0, percentage: 0 },
        { option: "Nee", votes: 1, percentage: 50 },
      ]
    )
  ).toEqual({
    id: 7,
    articleId: 102,
    q: "Wat vind je?",
    options: [
      { id: 31, label: "Ja, absoluut", votes: 1, percentage: 50 },
      {
        id: 32,
        label: "Alleen bij grote inkomsten",
        votes: 0,
        percentage: 0,
      },
      { id: 33, label: "Nee", votes: 1, percentage: 50 },
    ],
  });
});

test("fetchPollForArticle haalt polls, opties en resultaten op met bearer token", async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 7, article_id: 102, question: "Wat vind je?" }],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: 31, poll_id: 7, option: "Ja", votes: 1 },
          { id: 32, poll_id: 7, option: "Nee", votes: 2 },
        ],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{ option_id: 31, votes: 6 }] }),
    });

  const poll = await fetchPollForArticle("tok123", { id: 102 });

  expect(poll.options[0].votes).toBe(6);
  expect(global.fetch).toHaveBeenNthCalledWith(
    1,
    "http://145.24.237.97/api/polls",
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer tok123" }),
    })
  );
  expect(global.fetch).toHaveBeenNthCalledWith(
    3,
    "http://145.24.237.97/api/polls/7/results",
    expect.any(Object)
  );
});

test("submitPollVote POST't de vereiste velden", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ id: 18 }),
  });

  await submitPollVote("tok123", { pollId: 7, userId: 15, optionId: 31 });

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/poll-votes",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        poll_id: 7,
        user_id: 15,
        option_id: 31,
        voted_at: "2026-06-08 14:30:00",
      }),
    })
  );
});

test("removePollVote DELETE't de bestaande poll vote", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ ok: true }),
  });

  await removePollVote("tok123", 18);

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/poll-votes/18",
    expect.objectContaining({ method: "DELETE" })
  );
});

test("fetchPollResults mapt results over bestaande opties", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: [{ option_id: 31, votes: 9 }] }),
  });

  const poll = await fetchPollResults("tok123", 7, {
    id: 7,
    q: "Vraag",
    options: [{ id: 31, label: "Ja", votes: 1 }],
  });

  expect(poll.options[0].votes).toBe(9);
});
