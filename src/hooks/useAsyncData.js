import { useCallback, useEffect, useState } from "react";

// Gedeelde data-fetch hook: beheert loading/error/data + cancelled-cleanup,
// zodat schermen niet elk hun eigen useEffect-boilerplate herhalen.
//
//   const { data, loading, error, reload } = useAsyncData(
//     () => fetchArticles(),
//     [],
//   );
//
// fetcher: () => Promise<T>  — wordt opnieuw aangeroepen bij elke deps-wijziging
//                              of na reload().
// deps:    dependency-array die een refetch triggert (default []).
export function useAsyncData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    // Bewust synchroon: bij een refetch (deps-wijziging of reload) terug naar de
    // laadstatus voordat de nieuwe fetch start.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    // Promise.resolve().then(fetcher) vangt ook een synchrone throw in fetcher.
    Promise.resolve()
      .then(fetcher)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // fetcher bewust niet in deps: de aanroeper bepaalt de refetch-trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { data, loading, error, reload };
}
