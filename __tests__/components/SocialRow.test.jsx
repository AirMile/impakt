import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SocialRow } from "../../src/components/SocialRow";

const onSocial = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

test("roept onSocial aan met 'google' bij druk op Google-knop", () => {
  const { getByLabelText } = render(<SocialRow onSocial={onSocial} />);
  fireEvent.press(getByLabelText("google"));
  expect(onSocial).toHaveBeenCalledWith("google");
});

test("roept onSocial aan met 'apple' bij druk op Apple-knop", () => {
  const { getByLabelText } = render(<SocialRow onSocial={onSocial} />);
  fireEvent.press(getByLabelText("apple"));
  expect(onSocial).toHaveBeenCalledWith("apple");
});

test("roept onSocial aan met 'facebook' bij druk op Facebook-knop", () => {
  const { getByLabelText } = render(<SocialRow onSocial={onSocial} />);
  fireEvent.press(getByLabelText("facebook"));
  expect(onSocial).toHaveBeenCalledWith("facebook");
});

test("standaard label 'Of ga verder met' wordt getoond", () => {
  const { getByText } = render(<SocialRow onSocial={onSocial} />);
  expect(getByText("Of ga verder met")).toBeTruthy();
});

test("label prop overschrijft het standaard label", () => {
  const { getByText, queryByText } = render(
    <SocialRow onSocial={onSocial} label="Of log in met" />
  );
  expect(getByText("Of log in met")).toBeTruthy();
  expect(queryByText("Of ga verder met")).toBeNull();
});
