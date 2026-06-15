import { useEffect, useState } from "react";

import { saveArticle, unsaveArticle } from "../lib/saves";
import { toast } from "../lib/toast";

// Gedeelde bewaar-logica voor artikelen: optimistic toggle → endpoint →
// terug-sync naar App.jsx (savedArticles) → rollback bij serverfout.
// Gebruikt door FeedCard (FeedScreen) en DetailScreen, zodat beide exact
// hetzelfde gedrag delen i.p.v. de logica te dupliceren.
//
//   const { saved, toggleSaved } = useSaveArticle({
//     story, token, savedIds, onSavedChange, onRequireAuth,
//   });
//
// savedIds:      Set<id> uit App.jsx — bepaalt de begin-status en houdt de kaart
//                in sync als dezelfde story elders wordt ge(un)saved.
// onSavedChange: krijgt (story, nextSaved) — App.jsx voegt de story optimistisch
//                toe of verwijdert 'm. Hangt NIET af van de save-respons-shape
//                (het endpoint geeft { saved: true }, geen savedArticles-lijst),
//                net als de meme-flow.
// onRequireAuth: gast → toont de auth-prompt i.p.v. te bewaren.
export function useSaveArticle({
  story,
  token,
  savedIds,
  onSavedChange,
  onRequireAuth,
}) {
  const isSaved = savedIds?.has(story.id) ?? false;
  const [saved, setSaved] = useState(isSaved);

  // Houd de lokale status gelijk aan de centrale savedIds. Een optimistic toggle
  // schrijft savedIds via onSavedChange, dus deze effect bevestigt diezelfde
  // waarde (geen conflict) en vangt saves die elders gebeuren.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(isSaved);
  }, [isSaved]);

  const toggleSaved = async () => {
    // Gast → toon de auth-prompt (requireAuth) i.p.v. een toast.
    if (onRequireAuth?.() === false) return;
    if (!token) return;
    const next = !saved;
    setSaved(next);
    try {
      if (next) await saveArticle(token, story.id);
      else await unsaveArticle(token, story.id);
      onSavedChange?.(story, next);
    } catch (err) {
      setSaved(!next);
      toast.show(err.message || "Bewaren mislukt.");
    }
  };

  return { saved, toggleSaved };
}
