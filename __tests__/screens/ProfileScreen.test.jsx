import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { ProfileScreen } from "../../src/screens/ProfileScreen";

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
  const { getByDisplayValue, getByText } = render(
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

  expect(getByText("Milan")).toBeTruthy();
  expect(getByText("Gebruikersnaam")).toBeTruthy();
  expect(getByDisplayValue("Happymilan")).toBeTruthy();
  expect(getByText("Naam")).toBeTruthy();
  expect(getByText("E-mail")).toBeTruthy();
  expect(getByDisplayValue("milan@gmail.com")).toBeTruthy();
});

test("werkt accountgegevens bij vanuit de profiel form", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      user: {
        id: 7,
        username: "Happyjulia",
        name: "Julia Vermeer",
        email: "julia@test.nl",
      },
    }),
  });

  const { getByDisplayValue, getByPlaceholderText, getByText } = render(
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

  fireEvent.changeText(getByDisplayValue("Happymilan"), "Happyjulia");
  fireEvent.changeText(getByDisplayValue("Milan"), "Julia Vermeer");
  fireEvent.changeText(getByDisplayValue("milan@gmail.com"), "julia@test.nl");
  fireEvent.changeText(
    getByPlaceholderText("Nieuw wachtwoord"),
    "N3wStr0ngPassw0rd!"
  );
  fireEvent.changeText(
    getByPlaceholderText("Nog een keer"),
    "N3wStr0ngPassw0rd!"
  );

  fireEvent.press(getByText("Gegevens opslaan"));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://145.24.237.97/api/update-account",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer abc",
        },
        body: JSON.stringify({
          username: "Happyjulia",
          name: "Julia Vermeer",
          email: "julia@test.nl",
          password: "N3wStr0ngPassw0rd!",
          password_confirmation: "N3wStr0ngPassw0rd!",
        }),
      }
    );
    expect(defaultProps.onUserUpdate).toHaveBeenCalledWith({
      id: 7,
      username: "Happyjulia",
      name: "Julia Vermeer",
      email: "julia@test.nl",
      token: "abc",
    });
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

  fireEvent.changeText(getByPlaceholderText("Nieuw wachtwoord"), "abcdef");
  fireEvent.changeText(getByPlaceholderText("Nog een keer"), "anders");
  fireEvent.press(getByText("Gegevens opslaan"));

  expect(getByText("Komt niet overeen")).toBeTruthy();
  expect(global.fetch).not.toHaveBeenCalled();
});

test("valt terug op username als naam ontbreekt", () => {
  const { getByDisplayValue, getByText } = render(
    <ProfileScreen
      {...defaultProps}
      user={{
        username: "Happymilan",
        email: "milan@gmail.com",
      }}
    />
  );

  expect(getByText("Happymilan")).toBeTruthy();
  expect(getByDisplayValue("milan@gmail.com")).toBeTruthy();
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
