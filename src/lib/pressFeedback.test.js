import { pressFx } from "./pressFeedback";

test("pressed=false geeft lege stijl terug", () => {
  const style = pressFx()({ pressed: false });
  expect(style).toEqual({});
});

test("pressed=true gebruikt standaard scale en opacity", () => {
  const style = pressFx()({ pressed: true });
  expect(style).toEqual({ transform: [{ scale: 0.96 }], opacity: 0.7 });
});

test("custom scale en opacity worden doorgegeven", () => {
  const style = pressFx({ scale: 0.9, opacity: 0.5 })({ pressed: true });
  expect(style).toEqual({ transform: [{ scale: 0.9 }], opacity: 0.5 });
});

test("gedeeltelijk aangepaste opties gebruiken de rest als standaard", () => {
  const style = pressFx({ scale: 0.85 })({ pressed: true });
  expect(style).toEqual({ transform: [{ scale: 0.85 }], opacity: 0.7 });
});
