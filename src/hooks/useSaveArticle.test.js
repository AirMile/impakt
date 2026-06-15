import { renderHook, act, waitFor } from "@testing-library/react-native";

import { useSaveArticle } from "./useSaveArticle";
import { saveArticle, unsaveArticle } from "../lib/saves";
import { toast } from "../lib/toast";

jest.mock("../lib/saves", () => ({
  saveArticle: jest.fn(),
  unsaveArticle: jest.fn(),
}));
jest.mock("../lib/toast", () => ({ toast: { show: jest.fn() } }));

const STORY = { id: 7 };

beforeEach(() => {
  jest.clearAllMocks();
});

test("begin-status komt uit savedIds", () => {
  const { result } = renderHook(() =>
    useSaveArticle({ story: STORY, token: "tok", savedIds: new Set([7]) })
  );
  expect(result.current.saved).toBe(true);
});

test("toggle bewaart via saveArticle en synct (story, true) terug", async () => {
  saveArticle.mockResolvedValueOnce({ saved: true });
  const onSavedChange = jest.fn();
  const { result } = renderHook(() =>
    useSaveArticle({
      story: STORY,
      token: "tok",
      savedIds: new Set(),
      onSavedChange,
    })
  );

  await act(async () => {
    await result.current.toggleSaved();
  });

  expect(saveArticle).toHaveBeenCalledWith("tok", 7);
  // Optimistic-lokaal: hangt niet af van de respons-shape ({ saved: true }).
  expect(onSavedChange).toHaveBeenCalledWith(STORY, true);
  expect(result.current.saved).toBe(true);
});

test("toggle verwijdert via unsaveArticle wanneer al bewaard", async () => {
  unsaveArticle.mockResolvedValueOnce({ user: { savedArticles: [] } });
  const { result } = renderHook(() =>
    useSaveArticle({ story: STORY, token: "tok", savedIds: new Set([7]) })
  );

  await act(async () => {
    await result.current.toggleSaved();
  });

  expect(unsaveArticle).toHaveBeenCalledWith("tok", 7);
});

test("rollback en toast bij serverfout", async () => {
  saveArticle.mockRejectedValueOnce(new Error("Niet toegestaan"));
  const { result } = renderHook(() =>
    useSaveArticle({ story: STORY, token: "tok", savedIds: new Set() })
  );

  await act(async () => {
    await result.current.toggleSaved();
  });

  expect(result.current.saved).toBe(false);
  expect(toast.show).toHaveBeenCalledWith("Niet toegestaan");
});

test("gast (onRequireAuth false) bewaart niet", async () => {
  const { result } = renderHook(() =>
    useSaveArticle({
      story: STORY,
      token: "tok",
      savedIds: new Set(),
      onRequireAuth: () => false,
    })
  );

  await act(async () => {
    await result.current.toggleSaved();
  });

  expect(saveArticle).not.toHaveBeenCalled();
  expect(result.current.saved).toBe(false);
});

test("zonder token gebeurt er niets", async () => {
  const { result } = renderHook(() =>
    useSaveArticle({ story: STORY, token: null, savedIds: new Set() })
  );

  await act(async () => {
    await result.current.toggleSaved();
  });

  expect(saveArticle).not.toHaveBeenCalled();
});

test("synct met externe savedIds-wijziging", async () => {
  const { result, rerender } = renderHook(
    ({ ids }) => useSaveArticle({ story: STORY, token: "tok", savedIds: ids }),
    { initialProps: { ids: new Set() } }
  );
  expect(result.current.saved).toBe(false);

  rerender({ ids: new Set([7]) });
  await waitFor(() => expect(result.current.saved).toBe(true));
});
