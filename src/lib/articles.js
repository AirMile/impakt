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

export async function fetchArticles() {
  const data = await fetchJSON(`${API_BASE_URL}/articles`);
  return unwrapList(data).map(mapArticle).filter(Boolean);
}

export async function fetchArticle(id) {
  if (id == null) throw new Error("Artikel-id ontbreekt.");
  const data = await fetchJSON(`${API_BASE_URL}/articles/${id}`);
  return mapArticle(data);
}

export async function fetchHappyFeed() {
  const data = await fetchJSON(`${API_BASE_URL}/happy-feed`);
  // Alles uit /happy-feed is per definitie goed nieuws. De backend stript de
  // happy-tag uit de response, dus mapArticle leidt goodNews niet zelf af —
  // hier forceren we de invariant zodat gedeelde componenten erop kunnen leunen.
  return unwrapList(data)
    .map(mapArticle)
    .filter(Boolean)
    .map((article) => ({ ...article, goodNews: true }));
}
