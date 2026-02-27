export default async function handler(req, res) {
  // Verhindert falsche Request-Methoden
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input, occasion, budget } = req.body || {};

  // Validierung
  if (!input || typeof input !== "string" || input.length > 280) {
    return res.status(400).json({ error: "Invalid input size" });
  }

  // API Key Check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Vercel Error: GEMINI_API_KEY environment variable is missing.");
    return res.status(500).json({ error: "Backend configuration error (API Key missing)." });
  }

  const MODEL_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  try {
    const response = await fetch(`${MODEL_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Suche 5 Geschenke für: ${input}. Anlass: ${occasion}. Budget: ${budget}.` }] }],
        systemInstruction: { 
          parts: [{ 
            text: "Du bist GiftingScout AI. Antworte NUR mit reinem JSON-Code. KEIN Markdown, KEINE Backticks. Format: { \"summary\": \"...\", \"recommendations\": [{ \"name\": \"...\", \"brand\": \"...\", \"reason\": \"...\", \"price\": \"...\", \"search\": \"...\" }] }" 
          }] 
        },
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