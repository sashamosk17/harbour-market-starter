// Никакого импорта data.js — данные приходят из API

export const state = {
  tag: "all",
  query: "",
  saved: new Set(),
  status: "loading",
  error: null,
  stalls: [],
  savedAvailable: true,
  pendingSaved: new Set(),
};

export function visibleStalls() {
  const q = state.query.trim().toLowerCase();
  return state.stalls
    .filter((stall) => state.tag === "all" || stall.tag === state.tag)
    .filter((stall) => stall.name.toLowerCase().includes(q));
}
