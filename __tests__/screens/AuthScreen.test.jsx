import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AuthScreen } from "../../src/screens/AuthScreen";

jest.mock("../../src/lib/auth/account", () => ({
  fetchAccount: jest.fn().mockResolvedValue(null),
  normalizeAuthPayload: jest.fn((data) => data),
}));

jest.mock("../../src/lib/tags", () => ({
  fetchTags: jest.fn(),
  updateMyTags: jest.fn(),
}));

jest.mock("../../src/storage/prefs", () => ({
  setOnboarded: jest.fn().mockResolvedValue(undefined),
  setPreferences: jest.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("verder zonder account slaat onboarding over", async () => {
  const { setPreferences } = require("../../src/storage/prefs");
  const onComplete = jest.fn();
  const { getByText } = render(<AuthScreen onComplete={onComplete} />);

  fireEvent.press(getByText(/Verder zonder account/));

  await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  expect(onComplete.mock.calls[0][0]).toEqual(
    expect.objectContaining({ guest: true })
  );
  expect(setPreferences).not.toHaveBeenCalled();
});

test("onboarding-selectie wordt naar backend gepost via updateMyTags", async () => {
  const { fetchTags, updateMyTags } = require("../../src/lib/tags");
  const { fetchAccount } = require("../../src/lib/auth/account");

  fetchAccount.mockResolvedValueOnce({
    id: 9,
    name: "Test",
    email: "t@test.nl",
    token: "tok123",
  });
  fetchTags.mockResolvedValueOnce([
    { id: 18, name: "Goed nieuws", category: "flag" },
    { id: 3, name: "Politiek", category: "navigation" },
    { id: 4, name: "Sport", category: "navigation" },
    { id: 15, name: "Innovatie", category: "topic" },
    { id: 20, name: "Lokaal", category: "topic" },
  ]);
  updateMyTags.mockResolvedValueOnce([
    { id: 3, name: "Politiek", category: "navigation" },
    { id: 4, name: "Sport", category: "navigation" },
  ]);

  const onComplete = jest.fn();
  const { getByText } = render(
    <AuthScreen initialView="onboarding" onComplete={onComplete} />
  );

  fireEvent.press(getByText("Politiek"));
  fireEvent.press(getByText("Sport"));
  fireEvent.press(getByText("Bevestig"));

  await waitFor(() => {
    expect(updateMyTags).toHaveBeenCalledWith("tok123", [3, 4]);
  });
  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({ token: "tok123" }),
    ["politiek", "sport"],
    [
      { id: 3, name: "Politiek", category: "navigation" },
      { id: 4, name: "Sport", category: "navigation" },
    ]
  );
});

test("gast zonder token slaat geen tags op in backend", async () => {
  const { fetchTags, updateMyTags } = require("../../src/lib/tags");
  const { fetchAccount } = require("../../src/lib/auth/account");
  fetchAccount.mockResolvedValueOnce(null);

  const onComplete = jest.fn();
  const { getByText } = render(
    <AuthScreen initialView="onboarding" onComplete={onComplete} />
  );

  fireEvent.press(getByText("Politiek"));
  fireEvent.press(getByText("Bevestig"));

  await waitFor(() => expect(onComplete).toHaveBeenCalled());
  expect(updateMyTags).not.toHaveBeenCalled();
  expect(fetchTags).not.toHaveBeenCalled();
});

test("backend-fout tijdens tag-sync blokkeert onboarding niet", async () => {
  const { fetchTags, updateMyTags } = require("../../src/lib/tags");
  const { fetchAccount } = require("../../src/lib/auth/account");
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

  fetchAccount.mockResolvedValueOnce({ id: 1, token: "tok" });
  fetchTags.mockRejectedValueOnce(new Error("Server down"));

  const onComplete = jest.fn();
  const { getByText } = render(
    <AuthScreen initialView="onboarding" onComplete={onComplete} />
  );

  fireEvent.press(getByText("Politiek"));
  fireEvent.press(getByText("Bevestig"));

  await waitFor(() => expect(onComplete).toHaveBeenCalled());
  expect(updateMyTags).not.toHaveBeenCalled();
  expect(warn).toHaveBeenCalled();
  warn.mockRestore();
});
