import { InteractionManager } from "react-native";
import { render, waitFor } from "@testing-library/react-native";
import { DetailScreen } from "../../src/screens/DetailScreen";

jest.mock("../../src/components/BottomNav", () => ({
  BottomNav: ({ active }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: "bottom-nav-active" }, active);
  },
}));

jest.mock("../../src/screens/FeedScreen", () => ({
  FeedScreen: ({ activeTab }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(
      Text,
      { testID: "embedded-feed-active" },
      activeTab
    );
  },
}));

jest.mock("../../src/lib/share", () => ({ shareStory: jest.fn() }));
jest.mock("../../src/lib/saves", () => ({
  saveArticle: jest.fn(),
  unsaveArticle: jest.fn(),
}));

const story = {
  id: 102,
  title: "Artikel uit humor",
  sub: "Samenvatting",
  img: "",
  body: ["Alinea"],
  views: "1k",
  reactions: { smile: 0, meh: 0, frown: 0 },
  poll: null,
  sources: null,
  actions: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .spyOn(InteractionManager, "runAfterInteractions")
    .mockImplementation((fn) => {
      fn();
      return { cancel: jest.fn() };
    });
});

afterEach(() => {
  InteractionManager.runAfterInteractions.mockRestore();
});

test("embedded feed in artikel markeert Feed actief, ook wanneer artikel vanuit Humor komt", async () => {
  const { getByTestId } = render(
    <DetailScreen
      story={story}
      activeTab="humor"
      tab="humor"
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onRequireAuth={jest.fn()}
    />
  );

  expect(getByTestId("bottom-nav-active").props.children).toBe("feed");
  await waitFor(() =>
    expect(getByTestId("embedded-feed-active").props.children).toBe("feed")
  );
});
