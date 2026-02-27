export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { input, occasion, budget } = req.body || {};

  // Validierung der Eingabe (Sicherheit & Kostenkontrolle)
  if (!input || typeof input !== "string" || input.trim().length < 3 || input.length > 280) {
    return res.status(400).json({ error: "Ungültige Eingabe. Max 280 Zeichen." });
  }

  // API Key aus den Vercel Environment Variables ziehen
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server Konfigurationsfehler: API Key fehlt." });
  }

  const MODEL_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

  const systemPrompt = 
    `Du bist GiftingScout AI. Finde 5 ECHTE Amazon.de Produkte basierend auf dem Nutzerprofil. ` +
    `Antworte AUSSCHLIESSLICH mit gültigem JSON in folgendem Format: ` +
    `{ "summary": "Kurze Analyse", "recommendations": [{ "name": "Produktname", "brand": "Marke", "reason": "Warum es passt", "price": "ca. XX€", "search": "Suchbegriff für Amazon" }] }`;

  try {
    const response = await fetch(`${MODEL_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Suche Geschenke für: ${input}. Anlass: ${occasion || "Geburtstag"}. Budget: ${budget || "bis 50 Euro"}.`
              }
            ]
          }
        ],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { 
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return res.status(502).json({ error: "Fehler von der KI-Schnittstelle", details: errorText.slice(0, 200) });
    }

    const data = await response.json();
    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) {
      return res.status(502).json({ error: "Keine Antwort von der KI erhalten." });
    }

    // Parsen des JSON-Strings von Gemini
    const parsed = JSON.parse(jsonText);

    // Rückgabe an das Frontend
    return res.status(200).json(parsed);
  } catch (e) {
    console.error("Gemini request failed:", e);
    return res.status(500).json({ error: "Die Anfrage an den Server ist fehlgeschlagen." });
  }
}