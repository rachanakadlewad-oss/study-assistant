export async function generateStudyMaterial(text, signal) {
  const API_URL = import.meta.env.VITE_API_URL;
  const res = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal,
  });

  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error("The server sent back something that wasn't valid JSON.");
  }

  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status}).`);
  }

  return body;
}
