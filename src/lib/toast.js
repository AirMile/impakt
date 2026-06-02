const listeners = new Set();

export const toast = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  show(message) {
    listeners.forEach((fn) => fn(message));
  },

  _clearAll() {
    listeners.clear();
  },
};
