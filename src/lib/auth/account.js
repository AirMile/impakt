export const API_BASE_URL = "http://145.24.237.97/api";

export function normalizeAuthPayload(data) {
  const source = data?.user ?? data ?? {};
  const token =
    data?.token ?? data?.auth_token ?? data?.access_token ?? source.token;

  return {
    ...source,
    ...(token ? { token } : {}),
  };
}

export async function fetchAccount(token) {
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/account`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) return null;

  return data.user ? { ...data.user, token } : null;
}

export async function logoutAccount(token) {
  if (!token) return { ok: true };

  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Uitloggen mislukt. Probeer het opnieuw.");
  }

  return data;
}

export async function updateAccount(token, payload) {
  if (!token) throw new Error("Je bent niet ingelogd.");

  const response = await fetch(`${API_BASE_URL}/account`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Account bijwerken mislukt.");
  }

  return data.user ? { ...data.user, token } : { ...data, token };
}

export async function deleteAccount(token) {
  if (!token) throw new Error("Je bent niet ingelogd.");

  const response = await fetch(`${API_BASE_URL}/delete-account`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Account verwijderen mislukt. Probeer het opnieuw."
    );
  }

  return data;
}
