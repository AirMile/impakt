import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import {
  submitArticleReaction,
  removeArticleReaction,
  fetchArticleMyReaction,
} from "../lib/reactions";
import { castVote, revertVote } from "../lib/reactionVote";
import { toast } from "../lib/toast";

const EMPTY_COUNTS = { smile: 0, meh: 0, frown: 0 };

const ReactionsContext = createContext(null);

// App-brede bron van waarheid voor artikel-reacties (counts + eigen stem),
// gedeeld door feed/happy/search/saved en de detailpagina. Zonder dit hield elk
// scherm een eigen useState-kopie, waardoor percentages en eigen stem tussen
// feed en detail uiteenliepen. De stem-logica (optimistisch + rollback) leeft
// hier nog maar één keer i.p.v. gedupliceerd in FeedCard én DetailScreen.
export function ReactionsProvider({ token, onRequireAuth, children }) {
  // { [articleId]: { counts: {smile,meh,frown}, reaction: key|null } }
  const [byId, setById] = useState({});
  // Mirror voor synchrone reads van de vorige stem in react() (een event-handler
  // draait na render + effect, dus de ref is dan up-to-date).
  const byIdRef = useRef(byId);
  useEffect(() => {
    byIdRef.current = byId;
  }, [byId]);

  // Seed counts/eigen stem uit de lijst-snapshot — alleen de eerste keer per
  // artikel. Daarna wint de gedeelde (optimistische) state, dus een verse
  // fetch klopt een net uitgebrachte stem nooit weg.
  const seed = useCallback((id, reactions, myReaction) => {
    if (id == null) return;
    setById((cur) => {
      if (cur[id]) return cur;
      return {
        ...cur,
        [id]: {
          counts: reactions ?? EMPTY_COUNTS,
          reaction: myReaction ?? null,
        },
      };
    });
  }, []);

  // Eigen stem ophalen via de aparte backend-route. Overschrijft een bestaande
  // (lokale) stem nooit. Recreëert bij token-wissel zodat de hook-effect die
  // ervan afhangt opnieuw draait zodra je inlogt.
  const fetchMine = useCallback(
    (id) => {
      if (id == null || !token) return;
      fetchArticleMyReaction(token, id)
        .then((mine) => {
          if (!mine) return;
          setById((cur) => {
            const entry = cur[id];
            if (entry?.reaction) return cur;
            return {
              ...cur,
              [id]: { counts: entry?.counts ?? EMPTY_COUNTS, reaction: mine },
            };
          });
        })
        .catch(() => {});
    },
    [token]
  );

  // Optimistisch (her)stemmen: zet reactie + count direct, draai terug bij
  // serverfout. Switchen verlaagt de oude stem en verhoogt de nieuwe.
  const react = useCallback(
    async (id, key) => {
      if (id == null) return;
      if (onRequireAuth && onRequireAuth() === false) return;
      if (!token) return;

      const prev = byIdRef.current[id]?.reaction ?? null;
      if (prev === key) return;

      setById((cur) => {
        const counts = cur[id]?.counts ?? EMPTY_COUNTS;
        return {
          ...cur,
          [id]: { counts: castVote(counts, prev, key), reaction: key },
        };
      });

      try {
        // Switchen: verwijder eerst de oude stem, anders telt de backend beide.
        if (prev != null) await removeArticleReaction(token, id);
        await submitArticleReaction(token, id, key);
      } catch (err) {
        setById((cur) => {
          const counts = cur[id]?.counts ?? EMPTY_COUNTS;
          return {
            ...cur,
            [id]: { counts: revertVote(counts, prev, key), reaction: prev },
          };
        });
        toast.show(err.message || "Reactie opslaan mislukt.");
      }
    },
    [token, onRequireAuth]
  );

  const value = useMemo(
    () => ({ byId, seed, fetchMine, react }),
    [byId, seed, fetchMine, react]
  );

  return (
    <ReactionsContext.Provider value={value}>
      {children}
    </ReactionsContext.Provider>
  );
}

// Per-artikel reactie-state uit de gedeelde store. Seedt de snapshot en haalt
// de eigen stem op; geeft { reaction, counts, react } terug — drop-in voor wat
// FeedCard/DetailScreen eerst lokaal in useState bijhielden.
export function useArticleReaction(story) {
  const ctx = useContext(ReactionsContext);
  if (!ctx) {
    throw new Error("useArticleReaction moet binnen een ReactionsProvider");
  }
  const { byId, seed, fetchMine, react } = ctx;
  const id = story?.id;

  // Snapshot bewust eenmalig seeden: story.reactions niet als dep, anders zou
  // een verse lijst-fetch de gedeelde (optimistische) state overschrijven.
  useEffect(() => {
    seed(id, story?.reactions, story?.myReaction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, seed]);

  useEffect(() => {
    fetchMine(id);
  }, [id, fetchMine]);

  const entry = id != null ? byId[id] : null;
  const onReact = useCallback((key) => react(id, key), [id, react]);

  return {
    reaction: entry?.reaction ?? null,
    counts: entry?.counts ?? EMPTY_COUNTS,
    react: onReact,
  };
}
