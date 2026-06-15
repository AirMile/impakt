import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { ProfileScreen } from "../../src/screens/ProfileScreen";

jest.mock("../../src/lib/tags", () => ({
  isInterestTag: jest.requireActual("../../src/lib/tags").isInterestTag,
  fetchTags: jest.fn().mockResolvedValue([]),
  fetchMyTags: jest.fn().mockResolvedValue([]),
  updateMyTags: jest.fn().mockResolvedValue([]),
}));

const defaultProps = {
  onClose: jest.fn(),
  onLogout: jest.fn(),
  onUserUpdate: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test("toont accountgegevens op het profiel", () => {
  const { getAllByText, getByLabelText, getByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        id: 7,
        username: "Happymilan",
        name: "Milan",
        email: "milan@gmail.com",
      }}
    />
  );

  expect(getAllByText("Milan").length).toBeGreaterThan(0);
  expect(getByText("Gebruikersnaam")).toBeTruthy();
  expect(getByText("Happymilan")).toBeTruthy();
  expect(getByText("Naam")).toBeTruthy();
  expect(getByText("E-mail")).toBeTruthy();
  expect(getByText("milan@gmail.com")).toBeTruthy();
  expect(getByLabelText("Bewerk Gebruikersnaam")).toBeTruthy();
  expect(getByText("Wachtwoord wijzigen")).toBeTruthy();
});

test("toont gescheiden tellingen voor artikelen en memes, beide klikbaar", () => {
  const onOpenSaved = jest.fn();
  const { getByText, getAllByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{ username: "bb", email: "bb@hotmail.com" }}
      savedArticlesCount={2}
      savedMemesCount={5}
      onOpenSaved={onOpenSaved}
    />
  );

  // Artikelen-rij telt alleen artikelen, niet de memes.
  expect(getByText("2")).toBeTruthy();
  // Memes-telling komt uit savedMemesCount (niet langer hardcoded 67) en staat
  // op twee plekken: de stat-tegel én de "Nieuws memes"-rij.
  expect(getAllByText("5")).toHaveLength(2);

  fireEvent.press(getByText("Nieuws memes"));
  expect(onOpenSaved).toHaveBeenCalled();
});

test("opent detailweergave en werkt een accountgegeven bij", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        id: 7,
        username: "Happyjulia",
        name: "Milan",
        email: "milan@gmail.com",
      },
    }),
  });

  const {
    getByDisplayValue,
    getByLabelText,
    getByText,
    queryByPlaceholderText,
    queryByText,
  } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        id: 7,
        username: "Happymilan",
        name: "Milan",
        email: "milan@gmail.com",
        token: "abc",
      }}
    />
  );

  expect(queryByPlaceholderText("Nieuw wachtwoord")).toBeNull();
  expect(queryByText("Opslaan")).toBeNull();

  fireEvent.press(getByLabelText("Bewerk Gebruikersnaam"));
  expect(queryByText("Wachtwoord wijzigen")).toBeNull();
  expect(queryByText("Opslaan")).toBeNull();

  fireEvent.changeText(getByDisplayValue("Happymilan"), "Happyjulia");

  fireEvent.press(getByText("Opslaan"));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://145.24.237.97/api/account",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer abc",
        },
        body: JSON.stringify({
          username: "Happyjulia",
        }),
      }
    );
    expect(defaultProps.onUserUpdate).toHaveBeenCalledWith({
      id: 7,
      username: "Happyjulia",
      name: "Milan",
      email: "milan@gmail.com",
      token: "abc",
    });
  });
});

test("wijzigt wachtwoord via de detailweergave", async () => {
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

  const { getByPlaceholderText, getByText, queryByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        id: 7,
        username: "Happymilan",
        name: "Milan",
        email: "milan@gmail.com",
        token: "abc",
      }}
    />
  );

  fireEvent.press(getByText("Wachtwoord wijzigen"));
  expect(getByText("Wachtwoord")).toBeTruthy();
  expect(queryByText("Opslaan")).toBeNull();
  fireEvent.changeText(
    getByPlaceholderText("Nieuw wachtwoord"),
    "N3wStr0ngPassw0rd!"
  );
  fireEvent.changeText(
    getByPlaceholderText("Nog een keer"),
    "N3wStr0ngPassw0rd!"
  );

  fireEvent.press(getByText("Opslaan"));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://145.24.237.97/api/account",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer abc",
        },
        body: JSON.stringify({
          password: "N3wStr0ngPassw0rd!",
          password_confirmation: "N3wStr0ngPassw0rd!",
        }),
      }
    );
    expect(getByText("Wachtwoord bijgewerkt.")).toBeTruthy();
  });
});

test("wachtwoordvelden zijn verborgen en kunnen zichtbaar worden gemaakt", () => {
  const { getByLabelText, getByPlaceholderText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        username: "Happymilan",
        email: "milan@gmail.com",
        token: "abc",
      }}
    />
  );

  fireEvent.press(getByLabelText("Wijzig wachtwoord"));

  expect(getByPlaceholderText("Nieuw wachtwoord").props.secureTextEntry).toBe(
    true
  );
  expect(getByPlaceholderText("Nog een keer").props.secureTextEntry).toBe(true);

  fireEvent.press(getByLabelText("Toon wachtwoord"));

  expect(getByPlaceholderText("Nieuw wachtwoord").props.secureTextEntry).toBe(
    false
  );
  expect(getByPlaceholderText("Nog een keer").props.secureTextEntry).toBe(
    false
  );
});

test("toont validatiefout als wachtwoordbevestiging niet overeenkomt", () => {
  const { getByPlaceholderText, getByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        username: "Happymilan",
        email: "milan@gmail.com",
        token: "abc",
      }}
    />
  );

  fireEvent.press(getByText("Wachtwoord wijzigen"));
  fireEvent.changeText(getByPlaceholderText("Nieuw wachtwoord"), "abcdefgh");
  fireEvent.changeText(getByPlaceholderText("Nog een keer"), "anders12");
  fireEvent.press(getByText("Opslaan"));

  expect(getByText("Komt niet overeen")).toBeTruthy();
  expect(global.fetch).not.toHaveBeenCalled();
});

test("toont validatiefout als nieuw wachtwoord korter is dan acht tekens", () => {
  const { getByPlaceholderText, getByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        username: "Happymilan",
        email: "milan@gmail.com",
        token: "abc",
      }}
    />
  );

  fireEvent.press(getByText("Wachtwoord wijzigen"));
  fireEvent.changeText(getByPlaceholderText("Nieuw wachtwoord"), "abcdef");
  fireEvent.changeText(getByPlaceholderText("Nog een keer"), "abcdef");
  fireEvent.press(getByText("Opslaan"));

  expect(getByText("Minimaal 8 tekens")).toBeTruthy();
  expect(global.fetch).not.toHaveBeenCalled();
});

test("valt terug op username als naam ontbreekt", () => {
  const { getAllByText, getByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        username: "Happymilan",
        email: "milan@gmail.com",
      }}
    />
  );

  expect(getAllByText("Happymilan").length).toBeGreaterThan(0);
  expect(getByText("milan@gmail.com")).toBeTruthy();
});

test("roept logout endpoint aan met bearer token en logt lokaal uit", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "Logged out" }),
  });

  const { getByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        username: "Happymilan",
        email: "milan@gmail.com",
        token: "abc",
      }}
    />
  );

  fireEvent.press(getByText("Uitloggen"));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://145.24.237.97/api/logout",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer abc",
        },
      }
    );
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });
});

test("roept delete-account endpoint aan met bearer token en logt lokaal uit", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: "Account deleted" }),
  });

  const { getByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        username: "Happymilan",
        email: "milan@gmail.com",
        token: "abc",
      }}
    />
  );

  fireEvent.press(getByText("Verwijder account"));

  await waitFor(() => {
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
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });
});

test("toont foutmelding als account verwijderen mislukt", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Account verwijderen mislukt" }),
  });

  const { findByText, getByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        username: "Happymilan",
        email: "milan@gmail.com",
        token: "bad",
      }}
    />
  );

  fireEvent.press(getByText("Verwijder account"));

  expect(await findByText("Account verwijderen mislukt")).toBeTruthy();
  expect(defaultProps.onLogout).not.toHaveBeenCalled();
});

test("toont foutmelding als logout mislukt", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Uitloggen mislukt" }),
  });

  const { findByText, getByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        username: "Happymilan",
        email: "milan@gmail.com",
        token: "bad",
      }}
    />
  );

  fireEvent.press(getByText("Uitloggen"));

  expect(await findByText("Uitloggen mislukt")).toBeTruthy();
  expect(defaultProps.onLogout).not.toHaveBeenCalled();
});
