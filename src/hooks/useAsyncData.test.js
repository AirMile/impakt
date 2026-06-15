import { renderHook, waitFor, act } from "@testing-library/react-native";

import { useAsyncData } from "./useAsyncData";

test("levert data en zet loading op false na succes", async () => {
  const fetcher = jest.fn().mockResolvedValue(["a", "b"]);
  const { result } = renderHook(() => useAsyncData(fetcher, []));

  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBeNull();

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data).toEqual(["a", "b"]);
  expect(result.current.error).toBeNull();
});

test("vangt een fout en bewaart de error", async () => {
  const fetcher = jest.fn().mockRejectedValue(new Error("offline"));
  const { result } = renderHook(() => useAsyncData(fetcher, []));

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toEqual(new Error("offline"));
  expect(result.current.data).toBeNull();
});

test("reload roept de fetcher opnieuw aan", async () => {
  const fetcher = jest.fn().mockResolvedValue("ok");
  const { result } = renderHook(() => useAsyncData(fetcher, []));

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(fetcher).toHaveBeenCalledTimes(1);

  act(() => result.current.reload());

  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
});

test("refetcht wanneer een dependency wijzigt", async () => {
  const fetcher = jest.fn().mockResolvedValue("ok");
  const { rerender } = renderHook(
    ({ id }) => useAsyncData(() => fetcher(id), [id]),
    {
      initialProps: { id: 1 },
    }
  );

  await waitFor(() => expect(fetcher).toHaveBeenCalledWith(1));

  rerender({ id: 2 });

  await waitFor(() => expect(fetcher).toHaveBeenCalledWith(2));
});
