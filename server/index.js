import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json({ limit: '200kb' }));

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are a study-material generator. Given the user's notes or a topic, produce study material as STRICT JSON only — no markdown fences, no commentary, no extra keys.

Return an object with exactly this shape:
{
  "topic": string,
  "flashcards": [
    { "front": string, "back": string }
  ],
  "quiz": [
    {
      "question": string,
      "options": [string, string, string, string],
      "answerIndex": number
    }
  ],
  "blocks": [
    {
      "type": "card" | "chart" | "checklist",
      "title": string,
      "content": string,           // required only if type is "card"
      "chartType": "bar" | "pie",  // required only if type is "chart"
      "labels": string[],          // required only if type is "chart" (must match values length)
      "values": number[],          // required only if type is "chart" (must match labels length, values representing percentages/scores/distribution between 0 and 100)
      "items": string[]            // required only if type is "checklist"
    }
  ]
}

Rules:
- "flashcards" must contain 6 to 12 items.
- "quiz" must contain 5 to 8 items, each with exactly 4 "options" and one correct "answerIndex" (0-3).
- "blocks" must contain 2 to 4 items. Provide a helpful mix of a card (summarizing key concepts or definitions), a chart (illustrating metrics, distribution, or relative breakdown), and a checklist (suggesting key action items or steps for studying).
- Base everything on the user's input: extract real facts from notes, or use your own knowledge if given just a topic.
- Do not repeat the same fact across multiple flashcards.
- Output ONLY the JSON object. No prose before or after it.`;

// Defense in depth: even though we ask for JSON mode, never trust the model.
// Every field is checked before it reaches the frontend.
function validateShape(data) {
  if (!data || typeof data !== 'object') return 'response was not a JSON object';
  if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
    return 'missing or empty "flashcards" array';
  }
  if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
    return 'missing or empty "quiz" array';
  }

  for (const [i, c] of data.flashcards.entries()) {
    if (typeof c?.front !== 'string' || !c.front.trim() || typeof c?.back !== 'string' || !c.back.trim()) {
      return `flashcard at index ${i} is missing "front" or "back"`;
    }
  }

  for (const [i, q] of data.quiz.entries()) {
    if (typeof q?.question !== 'string' || !q.question.trim()) {
      return `quiz question ${i} is missing text`;
    }
    if (
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      q.options.some((o) => typeof o !== 'string' || !o.trim())
    ) {
      return `quiz question ${i} does not have exactly 4 valid options`;
    }
    if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex > 3) {
      return `quiz question ${i} has an invalid answerIndex`;
    }
  }

  // Validate blocks optionally (for backward compatibility)
  if (data.blocks) {
    if (!Array.isArray(data.blocks)) return 'invalid "blocks" type';
    for (const [i, b] of data.blocks.entries()) {
      if (typeof b?.type !== 'string' || !['card', 'chart', 'checklist'].includes(b.type)) {
        return `block at index ${i} has an invalid type`;
      }
      if (typeof b?.title !== 'string' || !b.title.trim()) {
        return `block at index ${i} is missing a title`;
      }
      if (b.type === 'card' && (typeof b.content !== 'string' || !b.content.trim())) {
        return `card block at index ${i} is missing content`;
      }
      if (b.type === 'chart') {
        if (!Array.isArray(b.labels) || !Array.isArray(b.values) || b.labels.length !== b.values.length) {
          return `chart block at index ${i} has mismatched or missing labels and values`;
        }
        if (typeof b.chartType !== 'string' || !['bar', 'pie'].includes(b.chartType)) {
          return `chart block at index ${i} has an invalid chartType`;
        }
      }
      if (b.type === 'checklist') {
        if (!Array.isArray(b.items) || b.items.length === 0 || b.items.some(item => typeof item !== 'string' || !item.trim())) {
          return `checklist block at index ${i} has invalid string items`;
        }
      }
    }
  }

  return null;
}

function extractJson(raw) {
  // Groq's JSON mode should already return clean JSON, but strip code fences
  // defensively in case the model wraps it anyway.
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');
  return JSON.parse(cleaned);
}

app.post('/api/generate', async (req, res) => {
  const { text, previousData } = req.body || {};

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Please provide some notes or a topic.' });
  }
  if (text.length > 6000) {
    return res.status(400).json({ error: "That's a lot of text — please keep it under 6000 characters." });
  }
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server is missing GROQ_API_KEY. Add it to server/.env and restart.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  const messages = [];
  if (previousData) {
    const refineSystemPrompt = `You are a study-material editor. Given the user's refinement instructions and their previous study material, produce an updated study material as STRICT JSON only — no markdown fences, no commentary, no extra keys.

Return an object in the EXACT same JSON shape:
{
  "topic": string,
  "flashcards": [
    { "front": string, "back": string }
  ],
  "quiz": [
    {
      "question": string,
      "options": [string, string, string, string],
      "answerIndex": number
    }
  ],
  "blocks": [
    {
      "type": "card" | "chart" | "checklist",
      "title": string,
      "content": string,
      "chartType": "bar" | "pie",
      "labels": string[],
      "values": number[],
      "items": string[]
    }
  ]
}

Rules:
- Modify, add, delete, or refine the previous flashcards, quiz questions, or study blocks based on the user's request.
- Keep the number of items reasonable (e.g. 6 to 12 flashcards, 5 to 8 quiz questions, 2 to 4 blocks).
- Output ONLY the JSON object. No prose before or after it.`;

    messages.push({ role: 'system', content: refineSystemPrompt });
    messages.push({ role: 'user', content: `Here is the previous study material:\n${JSON.stringify(previousData)}\n\nRefinement request: ${text.trim()}` });
  } else {
    messages.push({ role: 'system', content: SYSTEM_PROMPT });
    messages.push({ role: 'user', content: text.trim() });
  }

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      const status = groqRes.status === 429 ? 429 : 502;
      return res.status(status).json({
        error:
          status === 429
            ? 'The AI service is rate-limiting requests right now. Please wait a moment and try again.'
            : 'The AI service failed to respond. Please try again.',
      });
    }

    const payload = await groqRes.json();
    const rawContent = payload?.choices?.[0]?.message?.content;

    if (!rawContent) {
      return res.status(502).json({ error: 'The AI returned an empty response. Please try again.' });
    }

    let data;
    try {
      data = extractJson(rawContent);
    } catch (e) {
      console.error('JSON parse failed:', e.message, '\nRaw content:', rawContent);
      return res.status(502).json({ error: 'The AI returned malformed data. Please try again.' });
    }

    const validationError = validateShape(data);
    if (validationError) {
      console.error('Validation failed:', validationError, '\nData:', JSON.stringify(data));
      return res.status(502).json({
        error: `The AI returned data in an unexpected shape (${validationError}). Please try again.`,
      });
    }

    return res.json(data);
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'The AI took too long to respond. Please try again.' });
    }
    console.error('Unexpected server error:', err);
    return res.status(500).json({ error: 'Something went wrong on the server. Please try again.' });
  }
});

app.get('/api/', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Study Assistant server running on http://localhost:${PORT}`);
});
