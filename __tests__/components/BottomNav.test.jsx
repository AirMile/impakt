import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { BottomNav } from "../../src/components/BottomNav";

const defaultProps = {
  active: "feed",
  onChange: jest.fn(),
  onSearch: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("label is alleen zichtbaar voor de actieve tab", () => {
  const { getByText, queryByText } = render(
    <BottomNav {...defaultProps} active="feed" />
  );
  expect(getByText("Feed")).toBeTruthy();
  expect(queryByText("Humor")).toBeNull();
  expect(queryByText("Happy feed")).toBeNull();
});

test("klik op niet-actieve tab vuurt onChange met juiste id", () => {
  const onChange = jest.fn();
  const { getByLabelText } = render(
    <BottomNav {...defaultProps} active="feed" onChange={onChange} />
  );
  fireEvent.press(getByLabelText("Humor"));
  expect(onChange).toHaveBeenCalledWith("humor");
});

test("klik op zoek-knop vuurt onSearch", () => {
  const onSearch = jest.fn();
  const { getByLabelText } = render(
    <BottomNav {...defaultProps} onSearch={onSearch} />
  );
  fireEvent.press(getByLabelText("Zoeken"));
  expect(onSearch).toHaveBeenCalledTimes(1);
});

test("humor-tab label zichtbaar wanneer humor actief is", () => {
  const { getByText } = render(<BottomNav {...defaultProps} active="humor" />);
  expect(getByText("Humor")).toBeTruthy();
});

test("good-tab label zichtbaar wanneer good actief is", () => {
  const { getByText } = render(<BottomNav {...defaultProps} active="good" />);
  expect(getByText("Happy feed")).toBeTruthy();
});
