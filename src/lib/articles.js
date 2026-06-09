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

// Backend `/happy-feed` bestaat in routes/api.php maar is niet uitgerold
// (404 in productie). Voor nu: client-side filter op de happy-tag. Vervang
// door `fetchJSON('/happy-feed')` zodra Martijn het endpoint deployt.
export async function fetchHappyFeed() {
  const articles = await fetchArticles();
  return articles.filter((a) => a.goodNews);
}
