import React from "react";
import { Text } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";

import { DataState } from "./DataState";

const Child = () => <Text>Inhoud</Text>;

test("toont children wanneer niet aan het laden en geen fout", () => {
  render(
    <DataState loading={false} error={null}>
      <Child />
    </DataState>
  );
  expect(screen.getByText("Inhoud")).toBeTruthy();
});

test("verbergt children tijdens het laden", () => {
  render(
    <DataState loading={true} error={null}>
      <Child />
    </DataState>
  );
  expect(screen.queryByText("Inhoud")).toBeNull();
});

test("toont de foutmelding en een retry-knop bij een fout", () => {
  const onRetry = jest.fn();
  render(
    <DataState
      loading={false}
      error={new Error("Netwerkfout")}
      onRetry={onRetry}
    >
      <Child />
    </DataState>
  );

  expect(screen.getByText("Netwerkfout")).toBeTruthy();
  expect(screen.queryByText("Inhoud")).toBeNull();

  fireEvent.press(screen.getByText("Opnieuw proberen"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test("toont geen retry-knop zonder onRetry", () => {
  render(<DataState loading={false} error={new Error("x")} />);
  expect(screen.queryByText("Opnieuw proberen")).toBeNull();
});
