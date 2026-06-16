import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FeedEndCard } from "../../src/components/FeedEndCard";

beforeEach(() => {
  jest.clearAllMocks();
});

test("toont default titel zonder props", () => {
  const { getByText } = render(<FeedEndCard />);
  expect(getByText("Je bent helemaal bij")).toBeTruthy();
});

test("toont aangepaste titel en subtitle", () => {
  const { getByText } = render(
    <FeedEndCard
      title="Dat waren alle resultaten"
      subtitle="Bijgewerkt om 14:32"
    />
  );
  expect(getByText("Dat waren alle resultaten")).toBeTruthy();
  expect(getByText("Bijgewerkt om 14:32")).toBeTruthy();
});

test("rendert geen subtitle als die ontbreekt", () => {
  const { queryByText } = render(<FeedEndCard />);
  expect(queryByText("Bijgewerkt om", { exact: false })).toBeNull();
});

test("toont knop en roept onBackToTop aan bij drukken", () => {
  const onBackToTop = jest.fn();
  const { getByLabelText } = render(<FeedEndCard onBackToTop={onBackToTop} />);
  fireEvent.press(getByLabelText("Terug naar boven"));
  expect(onBackToTop).toHaveBeenCalledTimes(1);
});

test("toont geen knop zonder onBackToTop", () => {
  const { queryByLabelText } = render(<FeedEndCard />);
  expect(queryByLabelText("Terug naar boven")).toBeNull();
});
