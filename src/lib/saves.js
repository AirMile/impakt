import { API_BASE_URL } from "./auth/account";

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
