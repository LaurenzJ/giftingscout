export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input, occasion, budget } = req.body || {};

  if (!input || typeof input !== "string" || input.trim().length < 3 || input.length > 280) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const MODEL_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

  const systemPrompt =
    `Du bist GiftingScout AI. Finde 5 ECHTE Amazon.de Produkte. ` +
    `Antworte NUR mit gültigem JSON im Format: ` +
    `{ "summary": "...", "recommendations": [{ "name": "...", "brand": "...", "reason": "...", "price": "...", "img_tag": "...", "search": "..." }] }`;

  try {
    const r = await fetch(`${MODEL_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  `Suche Geschenke für: ${input}. Anlass: ${occasion || "Geburtstag"}. Budget: ${budget || "bis 50 Euro"}.`
              }
            ]
          }
        ],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!r.ok) {
      const t = await r.text().catch(() => "");
      return res.status(502).json({ error: "Upstream error", details: t.slice(0, 500) });
    }

    const data = await r.json();

    // Gemini liefert JSON als String in candidates[0]...text
    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      return res.status(502).json({ error: "No model output" });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return res.status(502).json({ error: "Model returned invalid JSON" });
    }

    // Minimal validation
    if (!parsed?.recommendations || !Array.isArray(parsed.recommendations)) {
      return res.status(502).json({ error: "Unexpected response shape" });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "Gemini request failed" });
  }
}