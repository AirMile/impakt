import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";

import { OnboardingScreen } from "./OnboardingScreen";

test("rendert de curated onboarding-thema's en toont geen good-news-thema", () => {
  render(<OnboardingScreen onBack={jest.fn()} onConfirm={jest.fn()} />);

  expect(screen.getByText("Politiek")).toBeTruthy();
  expect(screen.getByText("Sport")).toBeTruthy();
  // Good-news is een markering, geen kiesbaar interesse-thema.
  expect(screen.queryByText("Goed nieuws")).toBeNull();
});

test("bevestigen geeft de geselecteerde topic-id's door", () => {
  const onConfirm = jest.fn();

  render(<OnboardingScreen onBack={jest.fn()} onConfirm={onConfirm} />);

  fireEvent.press(screen.getByText("Politiek"));
  fireEvent.press(screen.getByText("Bevestig"));

  expect(onConfirm).toHaveBeenCalledWith(["politiek"]);
});

test("Bevestig doet niets zonder selectie", () => {
  const onConfirm = jest.fn();

  render(<OnboardingScreen onBack={jest.fn()} onConfirm={onConfirm} />);

  fireEvent.press(screen.getByText("Bevestig"));

  expect(onConfirm).not.toHaveBeenCalled();
});
