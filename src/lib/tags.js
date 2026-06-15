import { API_BASE_URL } from "./auth/account";

// Interesse-tags zijn echte onderwerpen, niet de good-news-markering. De
// backend noemt die markering "flag" (eerder "happy"); beide sluiten we uit.
const NON_INTEREST_CATEGORIES = new Set(["happy", "flag"]);
export const isInterestTag = (tag) =>
  Boolean(tag?.category) && !NON_INTEREST_CATEGORIES.has(tag.category);

export async function fetchTags() {
  const response = await fetch(`${API_BASE_URL}/tags`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      (data && data.message) || "Tags ophalen mislukt. Probeer het opnieuw."
    );
  }

  return Array.isArray(data) ? data : [];
}

export async function fetchMyTags(token) {
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/me/tags`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error((data && data.message) || "Jouw tags ophalen mislukt.");
  }

  return Array.isArray(data) ? data : [];
}

// Werkt de interesses bij via PUT /me/tags { tag_ids } (full replace). Een lege
// lijst betekent "geen interesses" en wordt gewoon meegestuurd — dat vereist dat
// de backend-validatie van tag_ids een lege array toestaat (niet `required`).
export async function updateMyTags(token, tagIds) {
  if (!token) throw new Error("Je bent niet ingelogd.");

  const response = await fetch(`${API_BASE_URL}/me/tags`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tag_ids: tagIds }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Tags bijwerken mislukt.");
  }

  return Array.isArray(data.tags) ? data.tags : [];
}
