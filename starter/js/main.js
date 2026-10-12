// The only file the HTML loads. It wires events to state and starts the page.
import { state } from "./state.js";
import { save, load } from "./storage.js";
import { render } from "./render.js";
import { setupMenu } from "./menu.js";
import { setupTickets } from "./tickets.js";
import { getJSON } from "./api.js";
import { loadSaved, toggleSavedOnServer } from "./saved.js";

const filters = document.querySelector(".filters");
const list = document.querySelector(".vendor-list");
const status = document.querySelector(".load-status");
const retry = document.querySelector(".retry");

// Every change goes through here: draw, then remember
function update() {
  render();
  save();
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  state.tag = button.dataset.filter;
  update();
});

document.querySelector("#vendor-search").addEventListener("input", (event) => {
  state.query = event.target.value;
  update();
});

// The cards are redrawn all the time: one listener on the list hears every ♡
list.addEventListener("click", (event) => {
  const button = event.target.closest(".save");
  if (!button) return;
  toggleSavedOnServer(button.closest(".stall").dataset.id);
});

export async function loadStalls() {
  state.status = "loading";
  state.error = null;
  render();

  try {
    state.stalls = await getJSON("/stalls");
    state.status = "ready";
  } catch (error) {
    state.error = error;
    state.status = "error";
  }

  render();
}

retry.addEventListener("click", () => {
  status.focus();
  loadStalls();
});

setupMenu();
setupTickets();
load();
await loadStalls();
try {
  await loadSaved();
} catch (error) {
  state.savedAvailable = false;
  render();
}
