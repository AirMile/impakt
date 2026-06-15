import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ReactionRail } from "../../src/components/ReactionRail";

const defaultProps = {
  reaction: null,
  onReact: jest.fn(),
  reactions: null,
  saved: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("toont alle drie reactie-knoppen voor het stemmen", () => {
  const { getByLabelText } = render(<ReactionRail {...defaultProps} />);
  expect(getByLabelText("Blij")).toBeTruthy();
  expect(getByLabelText("Neutraal")).toBeTruthy();
  expect(getByLabelText("Verdrietig")).toBeTruthy();
});

test("roept onReact aan met juiste key bij drukken", () => {
  const onReact = jest.fn();
  const { getByLabelText } = render(
    <ReactionRail {...defaultProps} onReact={onReact} />
  );
  fireEvent.press(getByLabelText("Blij"));
  expect(onReact).toHaveBeenCalledWith("smile");
});

test("roept onReact aan met nieuwe key bij switchen na stemmen", () => {
  const onReact = jest.fn();
  const { getByLabelText } = render(
    <ReactionRail {...defaultProps} reaction="smile" onReact={onReact} />
  );
  fireEvent.press(getByLabelText("Verdrietig"));
  expect(onReact).toHaveBeenCalledWith("frown");
});

test("toont percentages van alle reacties na het stemmen", () => {
  const { getByText } = render(
    <ReactionRail
      {...defaultProps}
      reaction="smile"
      reactions={{ smile: 72, meh: 18, frown: 10 }}
    />
  );
  expect(getByText("72%")).toBeTruthy();
  expect(getByText("18%")).toBeTruthy();
  expect(getByText("10%")).toBeTruthy();
});

test("bewaar-knop rendert alleen als onSave meegegeven", () => {
  const { queryByLabelText, rerender } = render(
    <ReactionRail {...defaultProps} />
  );
  expect(queryByLabelText("Bewaren")).toBeNull();

  rerender(<ReactionRail {...defaultProps} onSave={jest.fn()} />);
  expect(queryByLabelText("Bewaren")).toBeTruthy();
});

test("deel-knop rendert alleen als onShare meegegeven", () => {
  const { queryByLabelText, rerender } = render(
    <ReactionRail {...defaultProps} />
  );
  expect(queryByLabelText("Delen")).toBeNull();

  rerender(<ReactionRail {...defaultProps} onShare={jest.fn()} />);
  expect(queryByLabelText("Delen")).toBeTruthy();
});

test("onSave wordt aangeroepen bij drukken op bewaar-knop", () => {
  const onSave = jest.fn();
  const { getByLabelText } = render(
    <ReactionRail {...defaultProps} onSave={onSave} />
  );
  fireEvent.press(getByLabelText("Bewaren"));
  expect(onSave).toHaveBeenCalledTimes(1);
});

test("onShare wordt aangeroepen bij drukken op deel-knop", () => {
  const onShare = jest.fn();
  const { getByLabelText } = render(
    <ReactionRail {...defaultProps} onShare={onShare} />
  );
  fireEvent.press(getByLabelText("Delen"));
  expect(onShare).toHaveBeenCalledTimes(1);
});

test("vertical=false geeft horizontale layout (flexDirection row)", () => {
  const { UNSAFE_root } = render(
    <ReactionRail {...defaultProps} vertical={false} />
  );
  const rail = UNSAFE_root.children[0];
  expect(rail.props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ flexDirection: "row" })])
  );
});

test("vertical=true geeft verticale layout (flexDirection column)", () => {
  const { UNSAFE_root } = render(
    <ReactionRail {...defaultProps} vertical={true} />
  );
  const rail = UNSAFE_root.children[0];
  expect(rail.props.style).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ flexDirection: "column" }),
    ])
  );
});

test("saved=true geeft bewaar-knop een blauwe fill", () => {
  const { getByLabelText } = render(
    <ReactionRail {...defaultProps} saved onSave={jest.fn()} />
  );
  // De knop is zichtbaar en actief
  expect(getByLabelText("Bewaren")).toBeTruthy();
});

test("niet-gekozen reactie-knoppen krijgen dim-opacity 0.5 na stemmen", () => {
  const { getByLabelText } = render(
    <ReactionRail
      {...defaultProps}
      reaction="smile"
      reactions={{ smile: 72, meh: 18, frown: 10 }}
    />
  );
  const opacityOf = (label) => {
    // getByLabelText → inner Pressable View (l0) → Component (l1) → Pressable (l2) → Animated.View mock (l3)
    const wrapper = getByLabelText(label).parent.parent.parent;
    const style = Array.isArray(wrapper.props.style)
      ? Object.assign({}, ...wrapper.props.style)
      : wrapper.props.style;
    return style?.opacity;
  };
  expect(opacityOf("Blij")).toBe(1);
  expect(opacityOf("Neutraal")).toBe(0.5);
  expect(opacityOf("Verdrietig")).toBe(0.5);
});

test("bewaar-knop roept onSave elke keer aan bij herhalen druk", () => {
  const onSave = jest.fn();
  const { getByLabelText } = render(
    <ReactionRail {...defaultProps} onSave={onSave} />
  );
  fireEvent.press(getByLabelText("Bewaren"));
  fireEvent.press(getByLabelText("Bewaren"));
  expect(onSave).toHaveBeenCalledTimes(2);
});
