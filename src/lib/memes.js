import { API_BASE_URL } from "./auth/account";
import { mapMeme } from "./mapMeme";
import { fetchArticleIndex } from "./articles";

async function fetchJSON(url, token) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      // Met token geeft de backend `my_reaction` per meme terug, zodat een
      // eerdere stem na een refresh weer zichtbaar is.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      (data && data.message) || "Memes ophalen mislukt. Probeer het opnieuw."
    );
  }
  return data;
}

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.memes)) return data.memes;
  return [];
}

// De /memes-respons nest het gekoppelde artikel zonder afbeelding of summary.
// Voor de "Lees meer"-kaart hebben we die wél nodig, dus joinen we op storyId
// met de artikelindex (titel/afbeelding/summary). Faalt de index-fetch, dan
// valt de kaart terug op wat de meme zelf al levert (tekst zonder thumbnail).
async function enrichMemesWithArticles(memes, token) {
  const ids = new Set(
    memes
      .map((m) => m.storyId)
      .filter((id) => id != null)
      .map(String)
  );
  if (ids.size === 0) return memes;

  let index;
  try {
    index = await fetchArticleIndex({ token });
  } catch {
    return memes;
  }

  const byId = new Map(index.map((a) => [String(a.id), a]));
  return memes.map((meme) => {
    const article = byId.get(String(meme.storyId));
    if (!article) return meme;
    return {
      ...meme,
      storyHeadline: meme.storyHeadline || article.title || "",
      storyTeaser: meme.storyTeaser || article.sub || "",
      storyThumb: meme.storyThumb || article.img || "",
    };
  });
}

export async function fetchMemes(storyId, token) {
  const qs = storyId != null ? `?storyId=${encodeURIComponent(storyId)}` : "";
  const data = await fetchJSON(`${API_BASE_URL}/memes${qs}`, token);
  const memes = unwrapList(data).map(mapMeme).filter(Boolean);
  return enrichMemesWithArticles(memes, token);
}
