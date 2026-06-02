import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Btn, BTN_PALETTE } from "../../src/components/Btn";

beforeEach(() => {
  jest.clearAllMocks();
});

test("rendert children als tekst", () => {
  const { getByText } = render(<Btn onPress={jest.fn()}>Doorgaan</Btn>);
  expect(getByText("Doorgaan")).toBeTruthy();
});

test("roept onPress aan bij drukken", () => {
  const onPress = jest.fn();
  const { getByText } = render(<Btn onPress={onPress}>Klik</Btn>);
  fireEvent.press(getByText("Klik"));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test("disabled blokkeert onPress", () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <Btn onPress={onPress} disabled>
      Klik
    </Btn>
  );
  fireEvent.press(getByText("Klik"));
  expect(onPress).not.toHaveBeenCalled();
});

test("icon-slot rendert als icon prop meegegeven", () => {
  const { UNSAFE_getByProps } = render(
    <Btn onPress={jest.fn()} icon="home">
      Home
    </Btn>
  );
  // IIcon wordt gerenderd met name="home"
  expect(UNSAFE_getByProps({ name: "home" })).toBeTruthy();
});

test("iconRight-slot rendert als iconRight prop meegegeven", () => {
  const { UNSAFE_getByProps } = render(
    <Btn onPress={jest.fn()} iconRight="arrow-right">
      Verder
    </Btn>
  );
  expect(UNSAFE_getByProps({ name: "arrow-right" })).toBeTruthy();
});

test("geen icon-slots zonder icon props", () => {
  const { UNSAFE_queryAllByProps } = render(
    <Btn onPress={jest.fn()}>Simpel</Btn>
  );
  expect(UNSAFE_queryAllByProps({ name: "home" })).toHaveLength(0);
});
