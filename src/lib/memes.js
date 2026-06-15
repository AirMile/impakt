import { API_BASE_URL } from "./auth/account";
import { mapMeme } from "./mapMeme";

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

export async function fetchMemes(storyId, token) {
  const qs = storyId != null ? `?storyId=${encodeURIComponent(storyId)}` : "";
  const data = await fetchJSON(`${API_BASE_URL}/memes${qs}`, token);
  return unwrapList(data).map(mapMeme).filter(Boolean);
}
