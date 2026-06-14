import { InteractionManager } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { DetailScreen } from "../../src/screens/DetailScreen";

jest.mock("../../src/components/BottomNav", () => ({
  BottomNav: ({ active }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: "bottom-nav-active" }, active);
  },
}));

jest.mock("../../src/screens/FeedScreen", () => ({
  FeedScreen: ({ activeTab, goodNewsOnly }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Text, { testID: "embedded-feed-active" }, activeTab),
      React.createElement(
        Text,
        { testID: "embedded-feed-good-news" },
        String(Boolean(goodNewsOnly))
      )
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
  date: "14 juni 2026",
  time: "19:34",
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
  const { getByTestId, getByText, queryByText } = render(
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

  expect(getByText("14 juni 2026 - 19:34")).toBeTruthy();
  expect(getByText("1k")).toBeTruthy();
  expect(queryByText(/min geleden/)).toBeNull();
  expect(queryByText(/leestijd/)).toBeNull();
  expect(queryByText(/lezers/)).toBeNull();
  expect(getByTestId("bottom-nav-active").props.children).toBe("feed");
  await waitFor(() =>
    expect(getByTestId("embedded-feed-active").props.children).toBe("feed")
  );
  expect(getByTestId("embedded-feed-good-news").props.children).toBe("false");
});

test("detail vanuit Happy Feed houdt Happy Feed actief en toont alleen happy artikelen", async () => {
  const { getByTestId } = render(
    <DetailScreen
      story={story}
      sourceTab="good"
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

  expect(getByTestId("bottom-nav-active").props.children).toBe("good");
  await waitFor(() =>
    expect(getByTestId("embedded-feed-active").props.children).toBe("good")
  );
  expect(getByTestId("embedded-feed-good-news").props.children).toBe("true");
});

test("meme-card opent de exacte bijbehorende meme, niet alleen het artikel", async () => {
  const onOpenMeme = jest.fn();
  const { getByText } = render(
    <DetailScreen
      story={story}
      memes={[
        { id: "m1", storyId: 999, img: "" },
        { id: "m2", storyId: 102, img: "" },
        { id: "m3", storyId: 102, img: "" },
      ]}
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onOpenMeme={onOpenMeme}
      onRequireAuth={jest.fn()}
    />
  );

  fireEvent.press(getByText("Naar humor"));

  expect(onOpenMeme).toHaveBeenCalledWith("m2", 102);
});
