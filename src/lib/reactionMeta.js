import { colors } from "../theme/tokens";
import { REACTION_TYPES } from "./reactions";

// Single source of truth voor de presentatie van reacties.
// Pas hier de emoji's, labels en kleuren aan — één plek voor de hele app
// (feed-rail, detail, Humor-screen, sandbox). De lookup-maps eronder leiden
// zich automatisch af. De key moet overeenkomen met REACTION_TYPES (backend-enum).
export const REACTIONS = [
  { key: "smile", emoji: "😊", label: "Blij", color: "#52BD70" },
  { key: "meh", emoji: "😐", label: "Neutraal", color: "#F0B429" },
  { key: "frown", emoji: "☹️", label: "Verdrietig", color: colors.red },
];

// Afgeleide lookup-maps (key -> waarde) voor bestaande call-sites.
export const REACTION_EMOJI = Object.fromEntries(
  REACTIONS.map((r) => [r.key, r.emoji])
);
export const REACTION_LABELS = Object.fromEntries(
  REACTIONS.map((r) => [r.key, r.label])
);
export const REACTION_COLORS = Object.fromEntries(
  REACTIONS.map((r) => [r.key, r.color])
);

// Dev-only sanity check: elk backend-type moet presentatie-meta hebben.
// Defensief: in tests kan `reactions` gemockt zijn zonder REACTION_TYPES — dan
// is de check zinloos en mag het module-load niet crashen.
if (__DEV__) {
  const missing = (REACTION_TYPES ?? []).filter((t) => !REACTION_EMOJI[t]);
  if (missing.length) {
    console.warn(`reactionMeta: ontbrekende meta voor: ${missing.join(", ")}`);
  }
}
