import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const native = Platform.OS === "ios" || Platform.OS === "android";

export const pressFx =
  ({ scale = 0.96, opacity = 0.7 } = {}) =>
  ({ pressed }) =>
    pressed ? { transform: [{ scale }], opacity } : {};

export function tapHaptic() {
  if (!native) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function selectHaptic() {
  if (!native) return;
  Haptics.selectionAsync().catch(() => {});
}
