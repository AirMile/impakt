import { Easing } from "react-native-reanimated";

// Reanimated/Moti presets — ports van CSS @keyframes in index.html

const spring = (duration = 400) => ({
  type: "timing",
  duration,
});

export const fadeUp = {
  from: { opacity: 0, translateY: 10 },
  animate: { opacity: 1, translateY: 0 },
  transition: spring(500),
};

export const fadeIn = {
  from: { opacity: 0 },
  animate: { opacity: 1 },
  transition: spring(400),
};

export const pop = {
  from: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  transition: {
    type: "spring",
    stiffness: 260,
    damping: 18,
  },
};

export const bubbleIn = {
  from: { opacity: 0, scale: 0, rotate: "-15deg" },
  animate: { opacity: 1, scale: 1, rotate: "0deg" },
  transition: {
    type: "spring",
    stiffness: 220,
    damping: 14,
  },
};

export const slideInRight = {
  from: { opacity: 0, translateX: 40 },
  animate: { opacity: 1, translateX: 0 },
  transition: spring(350),
};

export const slideInLeft = {
  from: { opacity: 0, translateX: -40 },
  animate: { opacity: 1, translateX: 0 },
  transition: spring(350),
};

export const slideUpScreen = {
  from: { opacity: 0, translateY: 16 },
  animate: { opacity: 1, translateY: 0 },
  transition: { type: "timing", duration: 200 },
  exit: { opacity: 0, translateY: 40 },
  exitTransition: {
    type: "timing",
    duration: 220,
    easing: Easing.in(Easing.quad),
  },
};

export const delayedFadeUp = (delay) => ({
  from: { opacity: 0, translateY: 10 },
  animate: { opacity: 1, translateY: 0 },
  transition: { ...spring(500), delay },
});
