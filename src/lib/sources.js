import { API_BASE_URL } from "./auth/account";

export function mapSource(raw) {
  if (!raw || typeof raw !== "object") return null;
  const label = raw.name ?? "";
  // De artikel-specifieke deeplink (pivot.source_url) is informatiever dan de
  // generieke bron-url; val terug op de generieke url als de deeplink ontbreekt.
  const sub = raw.pivot?.source_url ?? raw.url ?? "";
  if (!label && !sub) return null;
  return { label, sub };
}

export async function fetchSources(articleId) {
  if (articleId == null) throw new Error("Artikel-id ontbreekt.");

  const response = await fetch(
    `${API_BASE_URL}/articles/${articleId}/sources`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      (data && data.message) || "Bronnen ophalen mislukt. Probeer het opnieuw."
    );
  }

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return list.map(mapSource).filter(Boolean);
}
