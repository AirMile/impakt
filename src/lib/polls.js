import { API_BASE_URL } from "./auth/account";

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.polls)) return data.polls;
  if (Array.isArray(data?.poll_votes)) return data.poll_votes;
  if (Array.isArray(data?.pollVotes)) return data.pollVotes;
  if (Array.isArray(data?.poll_options)) return data.poll_options;
  if (Array.isArray(data?.pollOptions)) return data.pollOptions;
  if (Array.isArray(data?.options)) return data.options;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.votes)) return data.votes;
  return [];
}

async function fetchJSON(token, path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Peiling ophalen mislukt.");
  }

  return data;
}

function pickId(value) {
  if (value == null) return null;
  return String(value);
}

function normalizeLabel(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function optionId(option) {
  return (
    option?.option_id ??
    option?.poll_option_id ??
    option?.optionId ??
    option?.pollOptionId ??
    option?.option?.id ??
    option?.poll_option?.id ??
    option?.id
  );
}

function optionPollId(option) {
  return (
    option?.poll_id ??
    option?.pollId ??
    option?.poll?.id ??
    option?.option?.poll_id ??
    option?.poll_option?.poll_id
  );
}

function pollArticleId(poll) {
  return poll?.article_id ?? poll?.articleId ?? poll?.article?.id;
}

function pollId(poll) {
  return poll?.poll_id ?? poll?.id;
}

function optionLabel(option) {
  return (
    option?.label ??
    option?.option_text ??
    option?.optionText ??
    option?.text ??
    option?.title ??
    option?.name ??
    option?.option ??
    option?.answer ??
    option?.content ??
    option?.option?.label ??
    option?.option?.option_text ??
    option?.option?.text ??
    option?.poll_option?.label ??
    option?.poll_option?.option_text ??
    option?.poll_option?.text ??
    ""
  );
}

function optionVotes(option) {
  const value =
    option?.votes ??
    option?.votes_count ??
    option?.vote_count ??
    option?.votesCount ??
    option?.voteCount ??
    option?.count ??
    option?.total ??
    option?.total_votes ??
    option?.totalVotes ??
    0;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function optionPercentage(option) {
  const value = option?.percentage ?? option?.pct ?? option?.percent;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function resultRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.summary)) return data.summary;
  if (Array.isArray(data?.options)) return data.options;
  if (Array.isArray(data?.votes)) return data.votes;
  if (data && typeof data === "object") {
    return Object.entries(data)
      .filter(([, value]) => typeof value === "number")
      .map(([id, votes]) => ({ option_id: id, votes }));
  }
  return [];
}

export function mapPoll(rawPoll, rawOptions = [], rawResults = null) {
  if (!rawPoll || typeof rawPoll !== "object") return null;

  const id = pollId(rawPoll);
  const allOptions =
    rawOptions.length > 0
      ? rawOptions
      : (rawPoll.options ?? rawPoll.poll_options ?? rawPoll.pollOptions ?? []);
  const rows = resultRows(rawResults);
  const sourceOptions = allOptions.length > 0 ? allOptions : rows;

  const options = sourceOptions
    .filter((option) => {
      const linkedPollId = optionPollId(option);
      return linkedPollId == null || pickId(linkedPollId) === pickId(id);
    })
    .map((option) => {
      const currentOptionId = optionId(option);
      const currentLabel = optionLabel(option);
      const result = rows.find(
        (row) =>
          pickId(optionId(row)) === pickId(currentOptionId) ||
          pickId(row.id) === pickId(currentOptionId) ||
          normalizeLabel(optionLabel(row)) === normalizeLabel(currentLabel)
      );
      const percentage = optionPercentage(result ?? option);
      return {
        id: currentOptionId,
        label: currentLabel,
        votes: optionVotes(result ?? option),
        ...(percentage != null ? { percentage } : {}),
      };
    })
    .filter((option) => option.id != null && option.label);

  if (!id || options.length === 0) return null;

  return {
    id,
    articleId: pollArticleId(rawPoll),
    q: rawPoll.question ?? rawPoll.q ?? rawPoll.title ?? rawPoll.name ?? "",
    options,
  };
}

function findPollForArticle(polls, article) {
  const articleId = article?.id;
  const articlePollId =
    article?.poll_id ?? article?.pollId ?? article?.poll?.id;

  return polls.find((poll) => {
    const rawPollId = pollId(poll);
    const rawArticleId = pollArticleId(poll);
    if (articlePollId != null && pickId(rawPollId) === pickId(articlePollId)) {
      return true;
    }
    return articleId != null && pickId(rawArticleId) === pickId(articleId);
  });
}

export async function fetchPollForArticle(token, article) {
  if (article?.id == null) return null;

  const pollsData = await fetchJSON(token, "/polls");
  const rawPoll = findPollForArticle(unwrapList(pollsData), article);
  if (!rawPoll) return null;

  const optionsData = await fetchJSON(token, "/poll-options").catch(() => []);
  let poll = mapPoll(rawPoll, unwrapList(optionsData));
  if (!poll) {
    const resultsData = await fetchJSON(
      token,
      `/polls/${pollId(rawPoll)}/results`
    ).catch(() => null);
    poll = mapPoll(rawPoll, [], resultsData);
  }
  if (!poll) return null;

  return fetchPollResults(token, poll.id, poll).catch(() => poll);
}

export async function fetchPollResults(token, pollIdValue, poll) {
  if (pollIdValue == null) return poll ?? null;
  const data = await fetchJSON(token, `/polls/${pollIdValue}/results`);
  return poll ? mapPoll(poll, poll.options, data) : data;
}

export async function fetchPollsForArticles(token, articles) {
  if (!Array.isArray(articles) || articles.length === 0) {
    return articles;
  }

  try {
    const [pollsData, optionsData] = await Promise.all([
      fetchJSON(token, "/polls"),
      fetchJSON(token, "/poll-options").catch(() => []),
    ]);
    const rawPolls = unwrapList(pollsData);
    const rawOptions = unwrapList(optionsData);

    const pollEntries = await Promise.all(
      articles.map(async (article) => {
        const rawPoll = findPollForArticle(rawPolls, article);
        if (!rawPoll) return [article.id, null];

        let poll = mapPoll(rawPoll, rawOptions);
        if (!poll) {
          const resultsData = await fetchJSON(
            token,
            `/polls/${pollId(rawPoll)}/results`
          ).catch(() => null);
          poll = mapPoll(rawPoll, [], resultsData);
        }
        if (!poll) return [article.id, null];

        const pollWithResults = await fetchPollResults(
          token,
          poll.id,
          poll
        ).catch(() => poll);
        return [article.id, pollWithResults];
      })
    );

    const pollsByArticleId = new Map(
      pollEntries.filter(([, poll]) => poll != null)
    );

    return articles.map((article) => {
      const poll = pollsByArticleId.get(article.id);
      return poll ? { ...article, poll } : article;
    });
  } catch {
    return articles;
  }
}

export async function submitPollVote(token, { pollId, userId, optionId }) {
  if (!token) throw new Error("Je bent niet ingelogd.");
  if (pollId == null) throw new Error("Peiling-id ontbreekt.");
  if (userId == null) throw new Error("Gebruiker-id ontbreekt.");
  if (optionId == null) throw new Error("Optie-id ontbreekt.");

  return fetchJSON(token, "/poll-votes", {
    method: "POST",
    body: JSON.stringify({
      poll_id: pollId,
      user_id: userId,
      option_id: optionId,
      voted_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    }),
  });
}

export async function removePollVote(token, pollVoteId) {
  if (pollVoteId == null) return null;
  return fetchJSON(token, `/poll-votes/${pollVoteId}`, { method: "DELETE" });
}
