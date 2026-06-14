import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AppHeader } from "../../src/components/AppHeader";

beforeEach(() => {
  jest.clearAllMocks();
});

test("showBack=false toont geen terug-knop", () => {
  const { queryByLabelText } = render(
    <AppHeader onProfile={jest.fn()} showBack={false} />
  );
  expect(queryByLabelText("Terug")).toBeNull();
});

test("showBack=true toont een terug-knop die onBack aanroept", () => {
  const onBack = jest.fn();
  const { getByLabelText } = render(
    <AppHeader onProfile={jest.fn()} showBack onBack={onBack} />
  );
  fireEvent.press(getByLabelText("Terug"));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test("profiel-knop roept onProfile aan", () => {
  const onProfile = jest.fn();
  const { getByLabelText } = render(<AppHeader onProfile={onProfile} />);
  fireEvent.press(getByLabelText("Profiel"));
  expect(onProfile).toHaveBeenCalledTimes(1);
});

test("showProfile=false verbergt profiel-knop", () => {
  const { queryByLabelText } = render(
    <AppHeader onProfile={jest.fn()} showProfile={false} />
  );
  expect(queryByLabelText("Profiel")).toBeNull();
});

test("dark=true geeft een donkere achtergrondkleur", () => {
  const { UNSAFE_root } = render(<AppHeader onProfile={jest.fn()} dark />);
  const wrapper = UNSAFE_root.children[0];
  const bg =
    wrapper.props.style.find?.((s) => s?.backgroundColor)?.backgroundColor ??
    wrapper.props.style.backgroundColor;
  expect(bg).toBe("#0F111A");
});

test("dark=false (standaard) geeft een lichte achtergrondkleur", () => {
  const { UNSAFE_root } = render(<AppHeader onProfile={jest.fn()} />);
  const wrapper = UNSAFE_root.children[0];
  const bg =
    wrapper.props.style.find?.((s) => s?.backgroundColor)?.backgroundColor ??
    wrapper.props.style.backgroundColor;
  expect(bg).toBe("#EFEBE6");
});
