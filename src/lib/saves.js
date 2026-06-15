import { API_BASE_URL } from "./auth/account";
import { mapArticle } from "./mapArticle";
import { mapMeme } from "./mapMeme";

// De backend levert bewaarde artikelen via GET /account (user.savedArticles)
// en geeft diezelfde lijst terug bij elke save/unsave. Deze helper mapt die
// shape naar app-artikelen, zodat App.jsx na een toggle niet hoeft te refetchen.
export function mapSavedFromResponse(data) {
  return (data?.user?.savedArticles ?? []).map(mapArticle).filter(Boolean);
}

// Idem voor bewaarde memes (user.savedMemes). Defensief: ontbreekt het veld in
// de respons, dan is de lijst leeg en degradeert de meme-read-back graceful.
export function mapSavedMemesFromResponse(data) {
  return (data?.user?.savedMemes ?? []).map(mapMeme).filter(Boolean);
}

export async function fetchSavedArticles(token) {
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/account`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) return [];

  return mapSavedFromResponse(data);
}

export async function fetchSavedMemes(token) {
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/account`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) return [];

  return mapSavedMemesFromResponse(data);
}

export async function saveArticle(token, articleId) {
  if (!token) throw new Error("Je bent niet ingelogd.");
  if (articleId == null) throw new Error("Artikel-id ontbreekt.");

  const response = await fetch(
    `${API_BASE_URL}/account/articles/${articleId}/save`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Bewaren mislukt. Probeer het opnieuw.");
  }

  return data;
}

export async function unsaveArticle(token, articleId) {
  if (!token) throw new Error("Je bent niet ingelogd.");
  if (articleId == null) throw new Error("Artikel-id ontbreekt.");

  const response = await fetch(
    `${API_BASE_URL}/account/articles/${articleId}/save`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Verwijderen uit bewaard mislukt. Probeer het opnieuw."
    );
  }

  return data;
}

export async function saveMeme(token, memeId) {
  if (!token) throw new Error("Je bent niet ingelogd.");
  if (memeId == null) throw new Error("Meme-id ontbreekt.");

  const response = await fetch(`${API_BASE_URL}/account/memes/${memeId}/save`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Bewaren mislukt. Probeer het opnieuw.");
  }

  return data;
}

export async function unsaveMeme(token, memeId) {
  if (!token) throw new Error("Je bent niet ingelogd.");
  if (memeId == null) throw new Error("Meme-id ontbreekt.");

  const response = await fetch(`${API_BASE_URL}/account/memes/${memeId}/save`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Verwijderen uit bewaard mislukt. Probeer het opnieuw."
    );
  }

  return data;
}
