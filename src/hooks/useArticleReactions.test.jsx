import { renderHook, act, waitFor } from "@testing-library/react-native";

import { ReactionsProvider, useArticleReaction } from "./useArticleReactions";
import {
  submitArticleReaction,
  removeArticleReaction,
  fetchArticleMyReaction,
} from "../lib/reactions";
import { toast } from "../lib/toast";

jest.mock("../lib/reactions", () => ({
  submitArticleReaction: jest.fn(),
  removeArticleReaction: jest.fn(),
  fetchArticleMyReaction: jest.fn(),
}));
jest.mock("../lib/toast", () => ({ toast: { show: jest.fn() } }));

const STORY = {
  id: 7,
  reactions: { smile: 1, meh: 0, frown: 0 },
  myReaction: null,
};

function wrapperWith(props = {}) {
  return ({ children }) => (
    <ReactionsProvider token="tok" {...props}>
      {children}
    </ReactionsProvider>
  );
}

// Twee consumers van hetzelfde artikel staan voor "feed-kaart" en "detail".
function useTwoConsumers(story) {
  const feed = useArticleReaction(story);
  const detail = useArticleReaction(story);
  return { feed, detail };
}

beforeEach(() => {
  jest.clearAllMocks();
  fetchArticleMyReaction.mockResolvedValue(null);
  submitArticleReaction.mockResolvedValue({});
  removeArticleReaction.mockResolvedValue({});
});

test("seedt counts en eigen stem uit de story-snapshot", () => {
  const { result } = renderHook(() => useArticleReaction(STORY), {
    wrapper: wrapperWith(),
  });
  expect(result.current.counts).toEqual({ smile: 1, meh: 0, frown: 0 });
  expect(result.current.reaction).toBeNull();
});

test("stemmen op feed synct counts en eigen stem naar detail", async () => {
  const { result } = renderHook(() => useTwoConsumers(STORY), {
    wrapper: wrapperWith(),
  });

  await act(async () => {
    await result.current.feed.react("smile");
  });

  // Beide consumers delen dezelfde gestemde state.
  expect(result.current.feed.reaction).toBe("smile");
  expect(result.current.detail.reaction).toBe("smile");
  expect(result.current.detail.counts).toEqual({ smile: 2, meh: 0, frown: 0 });
  expect(submitArticleReaction).toHaveBeenCalledWith("tok", 7, "smile");
});

test("switchen verwijdert eerst de oude stem en herrekent counts", async () => {
  const { result } = renderHook(() => useArticleReaction(STORY), {
    wrapper: wrapperWith(),
  });

  await act(async () => {
    await result.current.react("smile");
  });
  await act(async () => {
    await result.current.react("frown");
  });

  expect(removeArticleReaction).toHaveBeenCalledWith("tok", 7);
  expect(result.current.reaction).toBe("frown");
  expect(result.current.counts).toEqual({ smile: 1, meh: 0, frown: 1 });
});

test("serverfout draait de optimistische stem terug en toont een toast", async () => {
  submitArticleReaction.mockRejectedValueOnce(new Error("Mislukt"));
  const { result } = renderHook(() => useArticleReaction(STORY), {
    wrapper: wrapperWith(),
  });

  await act(async () => {
    await result.current.react("meh");
  });

  expect(result.current.reaction).toBeNull();
  expect(result.current.counts).toEqual({ smile: 1, meh: 0, frown: 0 });
  expect(toast.show).toHaveBeenCalledWith("Mislukt");
});

test("gast (onRequireAuth false) stemt niet", async () => {
  const { result } = renderHook(() => useArticleReaction(STORY), {
    wrapper: wrapperWith({ onRequireAuth: () => false }),
  });

  await act(async () => {
    await result.current.react("smile");
  });

  expect(submitArticleReaction).not.toHaveBeenCalled();
  expect(result.current.reaction).toBeNull();
});

test("eigen stem uit de aparte route vult een lege stem aan", async () => {
  fetchArticleMyReaction.mockResolvedValue("meh");
  const { result } = renderHook(() => useArticleReaction(STORY), {
    wrapper: wrapperWith(),
  });

  await waitFor(() => expect(result.current.reaction).toBe("meh"));
});
