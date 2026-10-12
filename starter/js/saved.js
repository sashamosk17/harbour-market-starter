import { state } from "./state.js";
import { deleteJSON, describe, getJSON, putJSON } from "./api.js";
import { render } from "./render.js";

const message = document.querySelector(".save-status");
const queues = new Map();

export async function loadSaved() {
  const saved = await getJSON("/saved");
  state.saved = new Set(saved);
  state.savedAvailable = true;
  render();
}

export function showSavedError(id, error) {
  const stall = state.stalls.find((item) => item.id === id);
  const name = stall?.name || id;
  message.textContent = `Couldn't save ${name}. Try again. (${describe(error)})`;
  message.hidden = false;
}

async function sync(id, desired) {
  try {
    if (desired) await putJSON(`/saved/${id}`);
    else await deleteJSON(`/saved/${id}`);
    return null;
  } catch (error) {
    return error;
  }
}

async function drain(id) {
  const queue = queues.get(id);
  if (!queue || queue.running) return;

  queue.running = true;
  state.pendingSaved.add(id);
  render();
  while (queue.desired !== queue.synced) {
    const requested = queue.desired;
    const error = await sync(id, requested);
    if (error) {
      if (queue.desired === requested) {
        queue.desired = !requested;
        queue.synced = !requested;
        state.saved[requested ? "add" : "delete"](id);
        render();
        showSavedError(id, error);
      }
      break;
    }
    queue.synced = requested;
  }
  queue.running = false;
  state.pendingSaved.delete(id);
  render();
  if (queue.desired === queue.synced) queues.delete(id);
}

export function toggleSavedOnServer(id) {
  const previous = state.saved.has(id);
  const desired = !previous;
  state.saved[desired ? "add" : "delete"](id);
  message.hidden = true;
  render();

  const queue = queues.get(id) || {
    desired: previous,
    synced: previous,
    running: false,
  };
  queue.desired = desired;
  queues.set(id, queue);
  drain(id);
}
