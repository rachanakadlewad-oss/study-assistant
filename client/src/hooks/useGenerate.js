import { useCallback, useRef, useState } from 'react';
import { generateStudyMaterial } from '../api.js';

export function useGenerate() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Tracks which request is the "current" one. If a response comes back
  // for a request that's no longer current, we throw it away instead of
  // letting it clobber newer state (the "stale response" requirement).
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  const generate = useCallback(async (text) => {
    // If a request is already in flight, cancel it — its result is now irrelevant.
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++requestIdRef.current;
    setStatus('loading');
    setError('');

    try {
      const result = await generateStudyMaterial(text, controller.signal);
      if (requestId !== requestIdRef.current) return null; // superseded — ignore
      setData(result);
      setStatus('success');
      return result; // let the caller decide what to do with a fresh result (e.g. save it)
    } catch (err) {
      if (err.name === 'AbortError') return null; // we cancelled it ourselves, not a real error
      if (requestId !== requestIdRef.current) return null; // superseded — ignore
      setError(err.message || 'Something went wrong.');
      setStatus('error');
      return null;
    }
  }, []);

  // Load a previously-saved session straight into state — no API call.
  const loadSession = useCallback((sessionData) => {
    if (abortRef.current) abortRef.current.abort();
    requestIdRef.current += 1; // invalidate any in-flight request so it can't overwrite this
    setError('');
    setData(sessionData);
    setStatus('success');
  }, []);

  return { status, data, error, generate, loadSession };
}
