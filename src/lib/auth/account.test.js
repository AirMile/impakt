import {
  deleteAccount,
  fetchAccount,
  logoutAccount,
  normalizeAuthPayload,
  updateAccount,
} from "./account";

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test("normalizeAuthPayload haalt user en token uit auth-response", () => {
  expect(
    normalizeAuthPayload({
      user: { id: 7, username: "Happymilan", email: "milan@gmail.com" },
      token: "abc",
    })
  ).toEqual({
    id: 7,
    username: "Happymilan",
    email: "milan@gmail.com",
    token: "abc",
  });
});

test("fetchAccount haalt account op met bearer token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        id: 7,
        username: "Happymilan",
        name: "Milan",
        email: "milan@gmail.com",
      },
    }),
  });

  await expect(fetchAccount("abc")).resolves.toEqual({
    id: 7,
    username: "Happymilan",
    name: "Milan",
    email: "milan@gmail.com",
    token: "abc",
  });

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/account",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer abc",
      },
    }
  );
});

test("fetchAccount geeft null terug zonder token of bij serverfout", async () => {
  await expect(fetchAccount()).resolves.toBeNull();
  expect(global.fetch).not.toHaveBeenCalled();

  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Unauthenticated" }),
  });

  await expect(fetchAccount("bad")).resolves.toBeNull();
});

test("logoutAccount stuurt logout request met bearer token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "Logged out" }),
  });

  await expect(logoutAccount("abc")).resolves.toEqual({
    message: "Logged out",
  });

  expect(global.fetch).toHaveBeenCalledWith("http://145.24.237.97/api/logout", {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer abc",
    },
  });
});

test("logoutAccount zonder token logt lokaal uit zonder request", async () => {
  await expect(logoutAccount()).resolves.toEqual({ ok: true });
  expect(global.fetch).not.toHaveBeenCalled();
});

test("logoutAccount gooit servermelding bij fout", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Unauthenticated" }),
  });

  await expect(logoutAccount("bad")).rejects.toThrow("Unauthenticated");
});

test("updateAccount stuurt account update met bearer token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        id: 7,
        username: "julia_vermeer",
        name: "Julia Vermeer",
        email: "julia.updated@test.nl",
      },
    }),
  });

  const payload = {
    username: "julia_vermeer",
    name: "Julia Vermeer",
    email: "julia.updated@test.nl",
    password: "N3wStr0ngPassw0rd!",
    password_confirmation: "N3wStr0ngPassw0rd!",
  };

  await expect(updateAccount("abc", payload)).resolves.toEqual({
    id: 7,
    username: "julia_vermeer",
    name: "Julia Vermeer",
    email: "julia.updated@test.nl",
    token: "abc",
  });

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/update-account",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer abc",
      },
      body: JSON.stringify(payload),
    }
  );
});

test("updateAccount vereist token en geeft servermelding door", async () => {
  await expect(updateAccount()).rejects.toThrow("Je bent niet ingelogd.");

  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "E-mail is al in gebruik" }),
  });

  await expect(
    updateAccount("bad", {
      username: "julia",
      email: "julia@test.nl",
      password: "123456",
      password_confirmation: "123456",
    })
  ).rejects.toThrow("E-mail is al in gebruik");
});

test("deleteAccount stuurt delete request met bearer token", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "Account deleted" }),
  });

  await expect(deleteAccount("abc")).resolves.toEqual({
    message: "Account deleted",
  });

  expect(global.fetch).toHaveBeenCalledWith(
    "http://145.24.237.97/api/delete-account",
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer abc",
      },
    }
  );
});

test("deleteAccount vereist token en geeft servermelding door", async () => {
  await expect(deleteAccount()).rejects.toThrow("Je bent niet ingelogd.");

  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Account verwijderen mislukt" }),
  });

  await expect(deleteAccount("bad")).rejects.toThrow(
    "Account verwijderen mislukt"
  );
});
