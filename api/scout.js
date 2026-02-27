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

  const MODEL_URL = "[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent)";

  const systemPrompt = 
    `Du bist GiftingScout AI. Finde 5 ECHTE Amazon.de Produkte. ` +
    `Antworte NUR mit reinem JSON-Code. KEIN Markdown, KEINE Backticks. ` +
    `Format: { "summary": "...", "recommendations": [{ "name": "...", "brand": "...", "reason": "...", "price": "...", "search": "..." }] }`;

  try {
    const response = await fetch(`${MODEL_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Profil: ${input}. Anlass: ${occasion}. Budget: ${budget}.` }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    let jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) throw new Error("No text from AI");

    // FIX FÜR 502: Säubere den String von eventuellen Markdown-Resten
    jsonText = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(jsonText);
    return res.status(200).json(parsed);
  } catch (e) {
    console.error("Gemini Error:", e.message);
    return res.status(502).json({ error: "Die KI-Anfrage ist fehlgeschlagen. Bitte versuche es erneut." });
  }
}