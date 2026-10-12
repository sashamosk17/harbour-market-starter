// Никакого импорта data.js — данные приходят из API

export const state = {
  tag: "all",
  query: "",
  saved: new Set(),
  status: "loading",
  error: null,
  stalls: [],
};

export function visibleStalls() {
  const q = state.query.trim().toLowerCase();
  return state.stalls
    .filter((stall) => state.tag === "all" || stall.tag === state.tag)
    .filter((stall) => stall.name.toLowerCase().includes(q));
}

export function toggleSaved(id) {
  if (state.saved.has(id)) state.saved.delete(id);
  else state.saved.add(id);
}