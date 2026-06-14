import { API_BASE_URL } from "./auth/account";
import { mapArticle } from "./mapArticle";

async function fetchJSON(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
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

function buildArticleListUrl(options = {}) {
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value == null || value === "") return;
    params.set(key, String(value));
  });

  const qs = params.toString();
  return `${API_BASE_URL}/articles${qs ? `?${qs}` : ""}`;
}

export async function fetchArticles(options = {}) {
  const articles = [];
  let nextUrl = buildArticleListUrl(options);

  while (nextUrl) {
    const data = await fetchJSON(nextUrl);
    articles.push(...unwrapList(data));
    nextUrl = getNextPageUrl(data);
  }

  return articles.map(mapArticle).filter(Boolean);
}

export async function fetchArticle(id) {
  if (id == null) throw new Error("Artikel-id ontbreekt.");
  const data = await fetchJSON(`${API_BASE_URL}/articles/${id}`);
  return mapArticle(unwrapItem(data));
}

export async function fetchHappyFeed() {
  const articles = [];
  let nextUrl = buildArticleListUrl({ sort: "views" });

  while (nextUrl) {
    const data = await fetchJSON(nextUrl);
    articles.push(...unwrapList(data));
    nextUrl = getNextPageUrl(data);
  }
  // Happy Feed gebruikt de artikelindex op views en filtert daarna op goodNews.
  return articles
    .map(mapArticle)
    .filter(Boolean)
    .filter((article) => article.goodNews === true);
}
