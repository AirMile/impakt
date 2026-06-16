import { InteractionManager, Linking } from "react-native";
import {
  render as rtlRender,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { DetailScreen } from "../../src/screens/DetailScreen";
import { ReactionsProvider } from "../../src/hooks/useArticleReactions";

// Schermen draaien in productie altijd binnen de ReactionsProvider. We spiegelen
// token/onRequireAuth van het gerenderde scherm zodat de gedeelde reactie-store
// dezelfde auth-context heeft als de schermen zelf.
function render(ui, options) {
  const wrap = (node) => (
    <ReactionsProvider
      token={node.props?.token}
      onRequireAuth={node.props?.onRequireAuth}
    >
      {node}
    </ReactionsProvider>
  );
  // rerender omzeilt anders de provider-wrapper; behoud die expliciet zodat
  // schermen die useArticleReaction gebruiken ook na een rerender werken.
  const result = rtlRender(wrap(ui), options);
  return {
    ...result,
    rerender: (node) => result.rerender(wrap(node)),
  };
}

jest.mock("../../src/components/BottomNav", () => ({
  BottomNav: ({ active }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, { testID: "bottom-nav-active" }, active);
  },
}));

jest.mock("../../src/screens/FeedScreen", () => ({
  FeedScreen: ({ activeTab, goodNewsOnly, myTags }) => {
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
      ),
      React.createElement(
        Text,
        { testID: "embedded-feed-tag-count" },
        String(myTags?.length ?? 0)
      )
    );
  },
}));

jest.mock("../../src/lib/share", () => ({ shareStory: jest.fn() }));
jest.mock("../../src/lib/sources", () => ({
  fetchSources: jest.fn(() => new Promise(() => {})),
}));
jest.mock("../../src/lib/saves", () => ({
  saveArticle: jest.fn(),
  unsaveArticle: jest.fn(),
}));
jest.mock("../../src/lib/polls", () => ({
  fetchPollForArticle: jest.fn(() => Promise.resolve(null)),
  fetchPollResults: jest.fn((token, pollId, poll) => Promise.resolve(poll)),
  removePollVote: jest.fn(() => Promise.resolve({ ok: true })),
  submitPollVote: jest.fn(() => Promise.resolve({ id: 18 })),
}));
jest.mock("../../src/storage/prefs", () => ({
  getPollVote: jest.fn(() => Promise.resolve(null)),
  setPollVote: jest.fn(() => Promise.resolve()),
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
  const { getPollVote } = require("../../src/storage/prefs");
  getPollVote.mockResolvedValue(null);
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
      myTags={[{ id: 6, name: "Natuur", category: "topic" }]}
      onRequireAuth={jest.fn()}
    />
  );

  expect(getByTestId("bottom-nav-active").props.children).toBe("good");
  await waitFor(() =>
    expect(getByTestId("embedded-feed-active").props.children).toBe("good")
  );
  expect(getByTestId("embedded-feed-good-news").props.children).toBe("true");
  expect(getByTestId("embedded-feed-tag-count").props.children).toBe("1");
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

test("bronrij opent de bron-url", async () => {
  Linking.canOpenURL.mockResolvedValueOnce(true);
  const { getByText } = render(
    <DetailScreen
      story={{
        ...story,
        sources: [
          {
            label: "NOS",
            sub: "https://nos.nl/artikel/aangepaste-bron-url",
            url: "https://nos.nl/artikel/aangepaste-bron-url",
          },
        ],
      }}
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

  fireEvent.press(getByText("NOS"));

  await waitFor(() =>
    expect(Linking.openURL).toHaveBeenCalledWith(
      "https://nos.nl/artikel/aangepaste-bron-url"
    )
  );
});

test("call-to-action rij opent de actie-url onder bronnen", async () => {
  Linking.canOpenURL.mockResolvedValueOnce(true);
  const { getByText } = render(
    <DetailScreen
      story={{
        ...story,
        sources: [
          {
            label: "NOS",
            sub: "https://nos.nl/artikel/aangepaste-bron-url",
            url: "https://nos.nl/artikel/aangepaste-bron-url",
          },
        ],
        actions: [
          {
            label: "Doneer aan Giro555",
            sub: "1 min - veilig via iDEAL",
            url: "https://example.test/doneer",
          },
        ],
      }}
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

  expect(getByText("Bronnen")).toBeTruthy();
  expect(getByText("Wat kan jij doen?")).toBeTruthy();

  fireEvent.press(getByText("Doneer aan Giro555"));

  await waitFor(() =>
    expect(Linking.openURL).toHaveBeenCalledWith("https://example.test/doneer")
  );
});

test("call-to-action zonder url opent geen externe link", () => {
  const { getByText } = render(
    <DetailScreen
      story={{
        ...story,
        actions: [
          {
            label: "Verantwoordelijkheid in de entertainmentwereld.",
            sub: "Ga het gesprek aan over verantwoordelijkheid in de entertainmentwereld.",
            url: null,
          },
        ],
      }}
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

  fireEvent.press(getByText("Verantwoordelijkheid in de entertainmentwereld."));

  expect(Linking.openURL).not.toHaveBeenCalled();
});

test("peiling in detailpagina post een stem en toont percentages", async () => {
  const { fetchPollResults, submitPollVote } = require("../../src/lib/polls");
  const { setPollVote } = require("../../src/storage/prefs");
  fetchPollResults.mockResolvedValueOnce({
    id: 7,
    q: "Wat vind je?",
    options: [
      { id: 31, label: "Ja", votes: 2 },
      { id: 32, label: "Nee", votes: 1 },
    ],
  });
  const onRequireAuth = jest.fn();
  const { getByText } = render(
    <DetailScreen
      story={{
        ...story,
        poll: {
          id: 7,
          q: "Wat vind je?",
          options: [
            { id: 31, label: "Ja", votes: 1 },
            { id: 32, label: "Nee", votes: 1 },
          ],
        },
      }}
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onRequireAuth={onRequireAuth}
      token="tok123"
      user={{ id: 15 }}
    />
  );

  fireEvent.press(getByText("Ja"));

  await waitFor(() =>
    expect(submitPollVote).toHaveBeenCalledWith("tok123", {
      pollId: 7,
      userId: 15,
      optionId: 31,
    })
  );
  expect(setPollVote).toHaveBeenCalledWith(15, 7, 31);
  expect(onRequireAuth).toHaveBeenCalled();
  expect(getByText("67%")).toBeTruthy();
  expect(getByText("33%")).toBeTruthy();
});

test("peiling toont voor stemmen nog geen percentages, ook als counts bestaan", () => {
  const { queryByText } = render(
    <DetailScreen
      story={{
        ...story,
        poll: {
          id: 7,
          q: "Wat vind je?",
          options: [
            { id: 31, label: "Ja", votes: 10 },
            { id: 32, label: "Nee", votes: 5 },
          ],
        },
      }}
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onRequireAuth={jest.fn()}
      token="tok123"
      user={{ id: 15 }}
    />
  );

  expect(queryByText("67%")).toBeNull();
  expect(queryByText("33%")).toBeNull();
  expect(queryByText("15 mensen stemden mee")).toBeNull();
});

test("peiling herstelt opgeslagen keuze ook als option ids een ander type hebben", async () => {
  const { getPollVote } = require("../../src/storage/prefs");
  getPollVote.mockResolvedValueOnce(33);

  const { getAllByText, getByText } = render(
    <DetailScreen
      story={{
        ...story,
        poll: {
          id: 7,
          q: "Wat vind je?",
          options: [
            { id: "31", label: "Ja", votes: 1 },
            { id: "33", label: "Nee", votes: 0 },
          ],
        },
      }}
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onRequireAuth={jest.fn()}
      token="tok123"
      user={{ id: 15 }}
    />
  );

  await waitFor(() => expect(getPollVote).toHaveBeenCalledWith(15, 7));
  expect(getAllByText("50%")).toHaveLength(2);
  expect(getByText("2 mensen stemden mee")).toBeTruthy();
});

test("peiling gebruikt percentages uit de backend results", async () => {
  const { getPollVote } = require("../../src/storage/prefs");
  getPollVote.mockResolvedValueOnce(33);

  const { getAllByText, getByText } = render(
    <DetailScreen
      story={{
        ...story,
        poll: {
          id: 7,
          q: "Wat vind je?",
          options: [
            { id: 31, label: "Ja, absoluut", votes: 1, percentage: 50 },
            {
              id: 32,
              label: "Alleen bij grote inkomsten",
              votes: 0,
              percentage: 0,
            },
            { id: 33, label: "Nee", votes: 1, percentage: 50 },
          ],
        },
      }}
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onRequireAuth={jest.fn()}
      token="tok123"
      user={{ id: 15 }}
    />
  );

  await waitFor(() => expect(getPollVote).toHaveBeenCalledWith(15, 7));
  expect(getAllByText("50%")).toHaveLength(2);
  expect(getByText("0%")).toBeTruthy();
  expect(getByText("2 mensen stemden mee")).toBeTruthy();
});

test("peiling herstelt opgeslagen keuze bij terugkomen op artikel", async () => {
  const { getPollVote } = require("../../src/storage/prefs");
  const { submitPollVote } = require("../../src/lib/polls");
  getPollVote.mockResolvedValueOnce(33);

  const { getAllByText, getByText } = render(
    <DetailScreen
      story={{
        ...story,
        poll: {
          id: 7,
          q: "Wat vind je?",
          options: [
            { id: 31, label: "Ja", votes: 1 },
            { id: 32, label: "Soms", votes: 0 },
            { id: 33, label: "Nee", votes: 1 },
          ],
        },
      }}
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onRequireAuth={jest.fn()}
      token="tok123"
      user={{ id: 15 }}
    />
  );

  await waitFor(() => expect(getPollVote).toHaveBeenCalledWith(15, 7));
  await waitFor(() => expect(getAllByText("50%")).toHaveLength(2));

  fireEvent.press(getByText("Ja"));

  expect(submitPollVote).not.toHaveBeenCalled();
});

test("peiling herstelt resultaatmodus als backend zegt dat gebruiker al gestemd heeft", async () => {
  const { fetchPollResults, submitPollVote } = require("../../src/lib/polls");
  const { setPollVote } = require("../../src/storage/prefs");
  submitPollVote.mockRejectedValueOnce(new Error("User has already voted"));
  fetchPollResults.mockResolvedValueOnce({
    id: 7,
    q: "Wat vind je?",
    options: [
      { id: 31, label: "Ja", votes: 1 },
      { id: 32, label: "Nee", votes: 1 },
    ],
  });

  const { getAllByText, getByText } = render(
    <DetailScreen
      story={{
        ...story,
        poll: {
          id: 7,
          q: "Wat vind je?",
          options: [
            { id: 31, label: "Ja", votes: 1 },
            { id: 32, label: "Nee", votes: 1 },
          ],
        },
      }}
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onRequireAuth={jest.fn()}
      token="tok123"
      user={{ id: 15 }}
    />
  );

  fireEvent.press(getByText("Nee"));

  await waitFor(() => expect(setPollVote).toHaveBeenCalledWith(15, 7, 32));
  expect(getAllByText("50%")).toHaveLength(2);
  expect(getByText("2 mensen stemden mee")).toBeTruthy();
});

test("peiling blijft in resultaatmodus als dezelfde story wordt ververst", async () => {
  const { fetchPollResults } = require("../../src/lib/polls");
  fetchPollResults.mockResolvedValueOnce({
    id: 7,
    q: "Wat vind je?",
    options: [
      { id: 31, label: "Ja", votes: 1 },
      { id: 32, label: "Soms", votes: 1 },
      { id: 33, label: "Nee", votes: 0 },
    ],
  });

  const baseProps = {
    story: {
      ...story,
      poll: {
        id: 7,
        q: "Wat vind je?",
        options: [
          { id: 31, label: "Ja", votes: 1 },
          { id: 32, label: "Soms", votes: 0 },
          { id: 33, label: "Nee", votes: 0 },
        ],
      },
    },
    feedCat: "Voor jou",
    onCatChange: jest.fn(),
    onNav: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onClose: jest.fn(),
    onSwapStory: jest.fn(),
    onRequireAuth: jest.fn(),
    token: "tok123",
    user: { id: 15 },
  };

  const { getAllByText, getByText, rerender } = render(
    <DetailScreen {...baseProps} />
  );

  fireEvent.press(getByText("Soms"));

  await waitFor(() => expect(getAllByText("50%")).toHaveLength(2));

  rerender(
    <DetailScreen
      {...baseProps}
      story={{
        ...baseProps.story,
        title: "Artikel uit humor - vers",
        poll: {
          ...baseProps.story.poll,
          options: [
            { id: 31, label: "Ja", votes: 1 },
            { id: 32, label: "Soms", votes: 1 },
            { id: 33, label: "Nee", votes: 0 },
          ],
        },
      }}
    />
  );

  expect(getAllByText("50%")).toHaveLength(2);
});

test("peiling houdt optimistische balk vast als result-refresh geen counts bevat", async () => {
  const { fetchPollResults } = require("../../src/lib/polls");
  fetchPollResults.mockResolvedValueOnce({
    id: 7,
    q: "Wat vind je?",
    options: [
      { id: 31, label: "Ja", votes: 0 },
      { id: 32, label: "Nee", votes: 0 },
    ],
  });
  const { getByText, queryByText } = render(
    <DetailScreen
      story={{
        ...story,
        poll: {
          id: 7,
          q: "Wat vind je?",
          options: [
            { id: 31, label: "Ja", votes: 0 },
            { id: 32, label: "Nee", votes: 0 },
          ],
        },
      }}
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onRequireAuth={jest.fn()}
      token="tok123"
      user={{ id: 15 }}
    />
  );

  fireEvent.press(getByText("Ja"));

  await waitFor(() => expect(fetchPollResults).toHaveBeenCalled());
  expect(getByText("100%")).toBeTruthy();
  expect(queryByText("0 mensen stemden mee")).toBeNull();
});

test("peiling houdt optimistische keuze vast als result-refresh oude counts teruggeeft", async () => {
  const { fetchPollResults } = require("../../src/lib/polls");
  fetchPollResults.mockResolvedValueOnce({
    id: 7,
    q: "Wat vind je?",
    options: [
      { id: 31, label: "Ja", votes: 1 },
      { id: 32, label: "Soms", votes: 0 },
      { id: 33, label: "Nee", votes: 0 },
    ],
  });
  const { getAllByText, getByText } = render(
    <DetailScreen
      story={{
        ...story,
        poll: {
          id: 7,
          q: "Wat vind je?",
          options: [
            { id: 31, label: "Ja", votes: 1 },
            { id: 32, label: "Soms", votes: 0 },
            { id: 33, label: "Nee", votes: 0 },
          ],
        },
      }}
      feedCat="Voor jou"
      onCatChange={jest.fn()}
      onNav={jest.fn()}
      onSearch={jest.fn()}
      onProfile={jest.fn()}
      onClose={jest.fn()}
      onSwapStory={jest.fn()}
      onRequireAuth={jest.fn()}
      token="tok123"
      user={{ id: 15 }}
    />
  );

  fireEvent.press(getByText("Nee"));

  await waitFor(() => expect(fetchPollResults).toHaveBeenCalled());
  expect(getAllByText("50%")).toHaveLength(2);
  expect(getByText("0%")).toBeTruthy();
  expect(getByText("2 mensen stemden mee")).toBeTruthy();
});
