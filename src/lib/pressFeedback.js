export const pressFx =
  ({ scale = 0.96, opacity = 0.7 } = {}) =>
  ({ pressed }) =>
    pressed ? { transform: [{ scale }], opacity } : {};
