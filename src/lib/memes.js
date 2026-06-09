import { API_BASE_URL } from "./auth/account";
import { mapMeme } from "./mapMeme";

async function fetchJSON(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
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

export async function fetchMemes(storyId) {
  const qs = storyId != null ? `?storyId=${encodeURIComponent(storyId)}` : "";
  const data = await fetchJSON(`${API_BASE_URL}/memes${qs}`);
  return unwrapList(data).map(mapMeme).filter(Boolean);
}
