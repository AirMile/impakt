import { API_BASE_URL } from "./auth/account";
import { mapArticle } from "./mapArticle";
import { mapMeme } from "./mapMeme";

// De backend levert bewaarde artikelen via GET /account. De API gebruikt
// snake_case (`saved_articles`); we houden de camelCase-variant als fallback
// voor het geval de respons-shape verandert. Deze helper mapt naar app-artikelen,
// zodat App.jsx na een toggle niet hoeft te refetchen.
export function mapSavedFromResponse(data) {
  const list = data?.user?.saved_articles ?? data?.user?.savedArticles ?? [];
  return list.map(mapArticle).filter(Boolean);
}

// Idem voor bewaarde memes (user.saved_memes). Defensief: ontbreekt het veld in
// de respons, dan is de lijst leeg en degradeert de meme-read-back graceful.
export function mapSavedMemesFromResponse(data) {
  const list = data?.user?.saved_memes ?? data?.user?.savedMemes ?? [];
  return list.map(mapMeme).filter(Boolean);
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

// Een 404 op DELETE betekent "deze save bestaat (al) niet" — precies de
// eindtoestand die de gebruiker wil. We behandelen dat idempotent als succes,
// zodat de bookmark netjes leegt i.p.v. terug te springen op een serverfout.
function isAlreadyGone(response) {
  return response.status === 404;
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
    if (isAlreadyGone(response)) return { saved: false };
    throw new Error(
      data.message || "Verwijderen uit bewaard mislukt. Probeer het opnieuw."
    );
  }

  return data;
}
