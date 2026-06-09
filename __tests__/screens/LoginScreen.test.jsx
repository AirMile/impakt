import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LoginScreen } from "../../src/screens/auth/LoginScreen";

const defaultProps = {
  onBack: jest.fn(),
  onSuccess: jest.fn(),
  onSwitchToRegister: jest.fn(),
  onSkip: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

function fillAndSubmit(getByPlaceholderText, getByText, email, pw) {
  fireEvent.changeText(getByPlaceholderText("jij@email.nl"), email);
  fireEvent.changeText(getByPlaceholderText("••••••••"), pw);
  fireEvent.press(getByText("Inloggen"));
}

test("toont validatiefout bij lege velden — geen fetch", () => {
  const { getByText } = render(<LoginScreen {...defaultProps} />);
  fireEvent.press(getByText("Inloggen"));
  expect(global.fetch).not.toHaveBeenCalled();
  expect(defaultProps.onSuccess).not.toHaveBeenCalled();
});

test("roept onSuccess aan met API-data bij succesvolle login", async () => {
  const userData = { id: 1, name: "Miles", token: "abc" };
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => userData,
  });

  const { getByPlaceholderText, getByText } = render(
    <LoginScreen {...defaultProps} />
  );
  fillAndSubmit(
    getByPlaceholderText,
    getByText,
    "miles@test.nl",
    "wachtwoord1"
  );

  await waitFor(() => {
    expect(defaultProps.onSuccess).toHaveBeenCalledWith(userData);
  });
});

test("toont foutmelding van de API bij !response.ok", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "Ongeldige inloggegevens" }),
  });

  const { getByPlaceholderText, getByText, findByText } = render(
    <LoginScreen {...defaultProps} />
  );
  fillAndSubmit(getByPlaceholderText, getByText, "miles@test.nl", "fout123");

  expect(await findByText("Ongeldige inloggegevens")).toBeTruthy();
  expect(defaultProps.onSuccess).not.toHaveBeenCalled();
});

test("toont fallback foutmelding bij netwerkfout", async () => {
  global.fetch.mockRejectedValueOnce(new Error("Network request failed"));

  const { getByPlaceholderText, getByText, findByText } = render(
    <LoginScreen {...defaultProps} />
  );
  fillAndSubmit(
    getByPlaceholderText,
    getByText,
    "miles@test.nl",
    "wachtwoord1"
  );

  expect(
    await findByText("Kan geen verbinding maken met de server.")
  ).toBeTruthy();
  expect(defaultProps.onSuccess).not.toHaveBeenCalled();
});
