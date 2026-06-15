import { API_BASE_URL } from "./auth/account";
import { mapArticle } from "./mapArticle";

async function fetchJSON(url, token) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      // Met token geeft de backend `my_reaction` per artikel terug, zodat een
      // eerdere stem na een refresh weer zichtbaar is.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      (data && data.message) ||
        "Artikelen ophalen mislukt. Probeer het opnieuw."
    );
  }
  return data;
}

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

function getNextPageUrl(data) {
  return data?.links?.next ?? data?.next_page_url ?? null;
}

function unwrapItem(data) {
  if (data && data.data && !Array.isArray(data.data)) return data.data;
  if (data && data.article && typeof data.article === "object")
    return data.article;
  return data;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?.id;
    if (id == null) return true;
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildArticleListUrl(options = {}) {
  const qs = Object.entries(options)
    .filter(([, value]) => value != null && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join("&");
  return `${API_BASE_URL}/articles${qs ? `?${qs}` : ""}`;
}

export async function fetchArticles(options = {}) {
  const { token, ...query } = options;
  const articles = [];
  let nextUrl = buildArticleListUrl(query);

  while (nextUrl) {
    const data = await fetchJSON(nextUrl, token);
    articles.push(...unwrapList(data));
    nextUrl = getNextPageUrl(data);
  }

  return uniqueById(articles).map(mapArticle).filter(Boolean);
}

export async function fetchArticle(id, token) {
  if (id == null) throw new Error("Artikel-id ontbreekt.");
  const data = await fetchJSON(`${API_BASE_URL}/articles/${id}`, token);
  return mapArticle(unwrapItem(data));
}

export async function fetchHappyFeed(options = {}) {
  const { token } = options;
  const articles = [];
  let nextUrl = buildArticleListUrl({ sort: "views" });

  while (nextUrl) {
    const data = await fetchJSON(nextUrl, token);
    articles.push(...unwrapList(data));
    nextUrl = getNextPageUrl(data);
  }
  // Happy Feed gebruikt de artikelindex op views en filtert daarna op goodNews.
  return uniqueById(articles)
    .map(mapArticle)
    .filter(Boolean)
    .filter((article) => article.goodNews === true);
}
