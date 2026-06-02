import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Field } from "../../src/components/Field";

test("rendert label als meegegeven", () => {
  const { getByText } = render(
    <Field label="E-mail" value="" onChange={jest.fn()} />
  );
  expect(getByText("E-mail")).toBeTruthy();
});

test("type=password zet secureTextEntry op true", () => {
  const { getByDisplayValue, UNSAFE_getByType } = render(
    <Field type="password" value="geheim" onChange={jest.fn()} />
  );
  const { TextInput } = require("react-native");
  const input = UNSAFE_getByType(TextInput);
  expect(input.props.secureTextEntry).toBe(true);
});

test("type=email zet keyboardType op email-address", () => {
  const { UNSAFE_getByType } = render(
    <Field type="email" value="" onChange={jest.fn()} />
  );
  const { TextInput } = require("react-native");
  const input = UNSAFE_getByType(TextInput);
  expect(input.props.keyboardType).toBe("email-address");
  expect(input.props.autoCapitalize).toBe("none");
});

test("type=text zet autoCapitalize op words", () => {
  const { UNSAFE_getByType } = render(
    <Field type="text" value="" onChange={jest.fn()} />
  );
  const { TextInput } = require("react-native");
  const input = UNSAFE_getByType(TextInput);
  expect(input.props.autoCapitalize).toBe("words");
});

test("error-tekst wordt getoond als error prop aanwezig", () => {
  const { getByText } = render(
    <Field value="" onChange={jest.fn()} error="Verplicht veld" />
  );
  expect(getByText("Verplicht veld")).toBeTruthy();
});

test("hint-tekst wordt getoond als hint prop aanwezig (en geen error)", () => {
  const { getByText } = render(
    <Field value="" onChange={jest.fn()} hint="Min 6 tekens" />
  );
  expect(getByText("Min 6 tekens")).toBeTruthy();
});

test("error heeft prioriteit boven hint", () => {
  const { getByText, queryByText } = render(
    <Field value="" onChange={jest.fn()} error="Fout" hint="Hint" />
  );
  expect(getByText("Fout")).toBeTruthy();
  expect(queryByText("Hint")).toBeNull();
});

test("onChange wordt aangeroepen bij tekstinvoer", () => {
  const onChange = jest.fn();
  const { UNSAFE_getByType } = render(<Field value="" onChange={onChange} />);
  const { TextInput } = require("react-native");
  fireEvent.changeText(UNSAFE_getByType(TextInput), "hallo");
  expect(onChange).toHaveBeenCalledWith("hallo");
});
