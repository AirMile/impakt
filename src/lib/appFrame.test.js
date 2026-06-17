import { Platform, useWindowDimensions } from "react-native";

import { useAppFrame, APP_FRAME_W } from "./appFrame";

// appFrame leest enkel Platform.OS en useWindowDimensions; de rest van
// react-native is niet nodig. Door useWindowDimensions als gewone jest.fn te
// mocken is het geen echte React-hook meer, dus kan useAppFrame() direct
// aangeroepen worden zonder render-omgeving.
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
  useWindowDimensions: jest.fn(),
}));

const FRAME_MARGIN_Y = 20; // moet gelijk zijn aan de constante in appFrame.js

function mockViewport({ width, height, os }) {
  Platform.OS = os;
  useWindowDimensions.mockReturnValue({
    width,
    height,
    scale: 1,
    fontScale: 1,
  });
}

afterEach(() => {
  jest.clearAllMocks();
});

test("web met brede viewport: framed, breedte geclampt op frame, hoogte minus marges", () => {
  mockViewport({ width: 1200, height: 900, os: "web" });

  const frame = useAppFrame();

  expect(frame.framed).toBe(true);
  expect(frame.width).toBe(APP_FRAME_W);
  expect(frame.height).toBe(900 - FRAME_MARGIN_Y * 2);
});

test("web met smalle viewport (<= frame-breedte): full-screen, geen clamp", () => {
  mockViewport({ width: 390, height: 844, os: "web" });

  const frame = useAppFrame();

  expect(frame.framed).toBe(false);
  expect(frame.width).toBe(390);
  expect(frame.height).toBe(844);
});

test("native: nooit framed, volledige viewport ongeacht breedte", () => {
  mockViewport({ width: 1200, height: 900, os: "ios" });

  const frame = useAppFrame();

  expect(frame.framed).toBe(false);
  expect(frame.width).toBe(1200);
  expect(frame.height).toBe(900);
});
