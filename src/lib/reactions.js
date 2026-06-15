import { API_BASE_URL } from "./auth/account";

// Geldige reactie-types — moeten overeenkomen met de DB-enum van de backend
// (smile/meh/frown). Zie docs/backend.md § Reacties.
export const REACTION_TYPES = ["smile", "meh", "frown"];

// Gedeelde POST-helper: zelfde stramien als src/lib/saves.js (Bearer-token,
// foutmelding uit data.message). De POST-respons bevat geen verse counts, dus
// de aanroeper updatet de UI optimistisch.
async function postReaction(token, path, reaction) {
  if (!token) throw new Error("Je bent niet ingelogd.");
  if (!REACTION_TYPES.includes(reaction)) {
    throw new Error("Ongeldige reactie.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reaction }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Reactie opslaan mislukt. Probeer het opnieuw."
    );
  }

  return data;
}

async function deleteReaction(token, path) {
  if (!token) throw new Error("Je bent niet ingelogd.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Reactie verwijderen mislukt. Probeer het opnieuw."
    );
  }

  return data;
}

// De backend levert de eigen reactie niet in de lijst-respons, maar via aparte
// routes: GET /articles/:id/my-reaction en /memes/:id/my-reaction. Respons:
// { my_reaction: null } of { my_reaction: { reaction: "smile", ... } }.
// We geven alleen de reactie-key terug (of null) en slikken fouten — een mislukte
// my-reaction-call mag de feed nooit breken.
async function fetchMyReaction(token, path) {
  if (!token) return null;
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    const mine = data?.my_reaction;
    if (typeof mine === "string") return mine;
    return mine?.reaction ?? null;
  } catch {
    return null;
  }
}

export async function fetchArticleMyReaction(token, articleId) {
  if (articleId == null) return null;
  return fetchMyReaction(token, `/articles/${articleId}/my-reaction`);
}

export async function fetchMemeMyReaction(token, memeId) {
  if (memeId == null) return null;
  return fetchMyReaction(token, `/memes/${memeId}/my-reaction`);
}

export async function submitArticleReaction(token, articleId, reaction) {
  if (articleId == null) throw new Error("Artikel-id ontbreekt.");
  return postReaction(token, `/articles/${articleId}/reaction`, reaction);
}

export async function submitMemeReaction(token, memeId, reaction) {
  if (memeId == null) throw new Error("Meme-id ontbreekt.");
  return postReaction(token, `/memes/${memeId}/reaction`, reaction);
}

// Nog niet gewired in de UI (na het stemmen kun je niet meer wisselen), maar
// beschikbaar voor lib-compleetheid en latere "verwijder je reactie".
export async function removeArticleReaction(token, articleId) {
  if (articleId == null) throw new Error("Artikel-id ontbreekt.");
  return deleteReaction(token, `/articles/${articleId}/reaction`);
}

export async function removeMemeReaction(token, memeId) {
  if (memeId == null) throw new Error("Meme-id ontbreekt.");
  return deleteReaction(token, `/memes/${memeId}/reaction`);
}
