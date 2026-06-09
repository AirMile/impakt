import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { RegisterScreen } from "../../src/screens/auth/RegisterScreen";

const defaultProps = {
  onBack: jest.fn(),
  onSuccess: jest.fn(),
  onSwitchToLogin: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

function fillAndSubmit(getByPlaceholderText, getByText) {
  fireEvent.changeText(getByPlaceholderText("julia_vermeer"), "julia_vermeer");
  fireEvent.changeText(getByPlaceholderText("Julia Vermeer"), "Julia Vermeer");
  fireEvent.changeText(getByPlaceholderText("jij@email.nl"), "julia@test.nl");
  fireEvent.changeText(getByPlaceholderText("Wachtwoord"), "Str0ngPassw0rd!");
  fireEvent.changeText(getByPlaceholderText("Nog een keer"), "Str0ngPassw0rd!");
  fireEvent.press(getByText("Account aanmaken"));
}

test("toont validatiefout bij lege velden en doet geen fetch", () => {
  const { getByText } = render(<RegisterScreen {...defaultProps} />);

  fireEvent.press(getByText("Account aanmaken"));

  expect(global.fetch).not.toHaveBeenCalled();
  expect(defaultProps.onSuccess).not.toHaveBeenCalled();
});

test("registreert met backend payload en roept onSuccess aan", async () => {
  const apiData = { user: { id: 1, username: "julia_vermeer" }, token: "abc" };
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => apiData,
  });

  const { getByPlaceholderText, getByText } = render(
    <RegisterScreen {...defaultProps} />
  );

  fillAndSubmit(getByPlaceholderText, getByText);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://145.24.237.97/api/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: "julia_vermeer",
          name: "Julia Vermeer",
          email: "julia@test.nl",
          password: "Str0ngPassw0rd!",
          password_confirmation: "Str0ngPassw0rd!",
        }),
      }
    );
    expect(defaultProps.onSuccess).toHaveBeenCalledWith({
      id: 1,
      username: "julia_vermeer",
      token: "abc",
    });
  });
});

test("toont foutmelding van de API bij !response.ok", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: "E-mailadres is al in gebruik" }),
  });

  const { getByPlaceholderText, getByText, findByText } = render(
    <RegisterScreen {...defaultProps} />
  );

  fillAndSubmit(getByPlaceholderText, getByText);

  expect(await findByText("E-mailadres is al in gebruik")).toBeTruthy();
  expect(defaultProps.onSuccess).not.toHaveBeenCalled();
});

test("toont fallback foutmelding bij netwerkfout", async () => {
  global.fetch.mockRejectedValueOnce(new Error("Network request failed"));

  const { getByPlaceholderText, getByText, findByText } = render(
    <RegisterScreen {...defaultProps} />
  );

  fillAndSubmit(getByPlaceholderText, getByText);

  expect(
    await findByText("Kan geen verbinding maken met de server.")
  ).toBeTruthy();
  expect(defaultProps.onSuccess).not.toHaveBeenCalled();
});
