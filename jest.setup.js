require("react-native-reanimated/mock");

// react-native/index.js doet require('./Libraries/Linking/Linking').default
jest.mock("react-native/Libraries/Linking/Linking", () => ({
  __esModule: true,
  default: {
    getInitialURL: jest.fn().mockResolvedValue(null),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    openURL: jest.fn(),
    canOpenURL: jest.fn().mockResolvedValue(true),
    openSettings: jest.fn(),
    sendIntent: jest.fn(),
  },
}));

jest.mock("expo-blur", () => {
  const { View } = require("react-native");
  return { BlurView: View };
});

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return { LinearGradient: View };
});

jest.mock("expo-font", () => ({
  useFonts: jest.fn(() => [true]),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
  setStatusBarStyle: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return {
    useSafeAreaInsets: jest.fn(() => ({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    })),
    SafeAreaView: View,
    SafeAreaProvider: ({ children }) => children,
  };
});

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("moti", () => {
  const { View, Text, ScrollView } = require("react-native");
  return {
    MotiView: View,
    MotiText: Text,
    MotiScrollView: ScrollView,
    AnimatePresence: ({ children }) => children,
    useAnimationState: jest.fn(() => ({})),
    useDynamicAnimation: jest.fn(() => [{}]),
  };
});

jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  const mock =
    (name) =>
    ({ children, ...rest }) =>
      React.createElement(View, { testID: name, ...rest }, children);
  return {
    __esModule: true,
    default: mock("Svg"),
    Svg: mock("Svg"),
    Path: () => null,
    G: mock("G"),
    Circle: () => null,
    Rect: () => null,
    Line: () => null,
    Polyline: () => null,
    ClipPath: mock("ClipPath"),
    Defs: mock("Defs"),
  };
});
