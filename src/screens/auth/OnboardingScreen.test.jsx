import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";

import { OnboardingScreen } from "./OnboardingScreen";
import { fetchTags } from "../../lib/tags";

jest.mock("../../lib/tags", () => ({
  ...jest.requireActual("../../lib/tags"),
  fetchTags: jest.fn(),
}));

const SAMPLE_TAGS = [
  { id: 2, name: "Politiek", category: "politiek" },
  { id: 5, name: "Sport", category: "sport" },
  { id: 9, name: "Goed nieuws", category: "happy" },
];

afterEach(() => {
  jest.clearAllMocks();
});

test("rendert thema's uit het endpoint en verbergt de happy-tag", async () => {
  fetchTags.mockResolvedValueOnce(SAMPLE_TAGS);

  render(<OnboardingScreen onBack={jest.fn()} onConfirm={jest.fn()} />);

  expect(await screen.findByText("Politiek")).toBeTruthy();
  expect(screen.getByText("Sport")).toBeTruthy();
  expect(screen.queryByText("Goed nieuws")).toBeNull();
});

test("bevestigen geeft de geselecteerde tag-id's door", async () => {
  fetchTags.mockResolvedValueOnce(SAMPLE_TAGS);
  const onConfirm = jest.fn();

  render(<OnboardingScreen onBack={jest.fn()} onConfirm={onConfirm} />);

  fireEvent.press(await screen.findByText("Politiek"));
  fireEvent.press(screen.getByText("Bevestig"));

  expect(onConfirm).toHaveBeenCalledWith([2]);
});

test("Bevestig doet niets zonder selectie", async () => {
  fetchTags.mockResolvedValueOnce(SAMPLE_TAGS);
  const onConfirm = jest.fn();

  render(<OnboardingScreen onBack={jest.fn()} onConfirm={onConfirm} />);

  await screen.findByText("Politiek");
  fireEvent.press(screen.getByText("Bevestig"));

  expect(onConfirm).not.toHaveBeenCalled();
});

test("lege tag-lijst bij fetch-fout blokkeert niet", async () => {
  fetchTags.mockRejectedValueOnce(new Error("offline"));

  render(<OnboardingScreen onBack={jest.fn()} onConfirm={jest.fn()} />);

  await waitFor(() => expect(fetchTags).toHaveBeenCalled());
  expect(screen.queryByText("Politiek")).toBeNull();
});
