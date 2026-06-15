import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const OVERLAYS = {
  // Feed card: donker boven + onderaan, licht midden
  card: {
    colors: [
      "rgba(15,17,26,0.72)",
      "rgba(15,17,26,0.22)",
      "rgba(15,17,26,0.10)",
      "rgba(15,17,26,0.90)",
    ],
    locations: [0, 0.34, 0.58, 1],
  },
  // Meme (humor-feed): zware vignette aan alle kanten
  meme: {
    colors: [
      "rgba(15,17,26,0.55)",
      "rgba(15,17,26,0.05)",
      "rgba(15,17,26,0.05)",
      "rgba(15,17,26,0.92)",
    ],
    locations: [0, 0.26, 0.55, 1],
  },
  // Detail hero: licht verloop, geen harde onderrand
  hero: {
    colors: ["rgba(15,17,26,0.30)", "transparent", "rgba(15,17,26,0.40)"],
    locations: [0, 0.3, 1],
  },
};

export function HeroOverlay({ variant = "card" }) {
  const cfg = OVERLAYS[variant];
  return (
    <LinearGradient
      colors={cfg.colors}
      locations={cfg.locations}
      style={StyleSheet.absoluteFill}
    />
  );
}
