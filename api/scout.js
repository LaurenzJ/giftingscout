export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input, occasion, budget } = req.body || {};

  if (!input || typeof input !== "string" || input.length > 280) {
    return res.status(400).json({ error: "Invalid input size" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Backend configuration error (API Key missing)." });
  }

  // DEFINITION HINZUFÜGEN:
  const systemPrompt = 
    "Du bist GiftingScout AI. Finde 5 ECHTE Amazon.de Produkte. " +
    "Antworte AUSSCHLIESSLICH mit gültigem JSON. " +
    "Format: { \"summary\": \"...\", \"recommendations\": [{ \"name\": \"...\", \"brand\": \"...\", \"reason\": \"...\", \"price\": \"...\", \"img_tag\": \"...\", \"search\": \"...\" }] }";

  const MODEL_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  try {
    const response = await fetch(`${MODEL_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nSuche Geschenke für: ${input}. Anlass: ${occasion}. Budget: ${budget}.` }]
          }
        ],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return res.status(502).json({ error: "Google API rejected the request." });
    }

    const data = await response.json();
    let jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) throw new Error("No data received from Gemini model.");

    /**
     * FIX FÜR 502: Gemini liefert oft Markdown-Wrapper mit.
     * Wir säubern den String, damit JSON.parse nicht abstürzt.
     */
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(jsonText);
      return res.status(200).json(parsed);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw Text:", jsonText);
      return res.status(502).json({ error: "AI returned malformed data. Please try again." });
    }
  } catch (e) {
    console.error("Vercel Function Crash:", e.message);
    return res.status(502).json({ error: "Critical Backend Failure." });
  }
}