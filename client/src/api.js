export async function generateStudyMaterial(text, previousData, signal) {
  const actualSignal = signal !== undefined ? signal : (previousData instanceof AbortSignal ? previousData : undefined);
  const actualPreviousData = previousData instanceof AbortSignal ? null : previousData;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
  const res = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, previousData: actualPreviousData }),
    signal: actualSignal,
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
