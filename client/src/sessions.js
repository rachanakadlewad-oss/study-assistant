const STORAGE_KEY = 'study-assistant-sessions';
const MAX_SESSIONS = 10;

export function getSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt or blocked storage shouldn't crash the app — just start empty.
    return [];
  }
}

export function saveSession(session) {
  const sessions = [session, ...getSessions()].slice(0, MAX_SESSIONS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — fail silently,
    // the current study set still works, it just won't persist.
  }
  return sessions;
}

export function deleteSession(id) {
  const sessions = getSessions().filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
  return sessions;
}
