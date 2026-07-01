// api/analizar.js
// Esta función corre en el servidor de Vercel (Node.js), nunca en el navegador del usuario.
// Por eso la API key (en la variable de entorno GEMINI_API_KEY) nunca queda expuesta.

export default async function handler(req, res) {
  // Solo aceptamos peticiones POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido. Usa POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "El servidor no tiene configurada la API key (GEMINI_API_KEY)." });
  }

  const { promptSistema, promptUsuario } = req.body || {};

  if (!promptSistema || !promptUsuario) {
    return res.status(400).json({ error: "Faltan promptSistema o promptUsuario en el body." });
  }

  try {
    const modelo = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;

    const respuestaGemini = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        // Gemini no tiene un campo "system" separado en este endpoint clásico;
        // lo más confiable es usar systemInstruction.
        systemInstruction: {
          parts: [{ text: promptSistema }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: promptUsuario }]
          }
        ],
        tools: [
          { google_search: {} }
        ]
      })
    });

    if (!respuestaGemini.ok) {
      const textoError = await respuestaGemini.text();
      console.error("Error de Gemini:", respuestaGemini.status, textoError);
      return res.status(502).json({ error: `Error al llamar a Gemini (${respuestaGemini.status})` });
    }

    const data = await respuestaGemini.json();

    // Extraemos el texto de la respuesta (puede venir en varias "parts")
    const candidato = data.candidates && data.candidates[0];
    const partes = (candidato && candidato.content && candidato.content.parts) || [];
    const texto = partes.map(p => p.text || "").join("\n\n").trim();

    if (!texto) {
      console.error("Respuesta de Gemini sin texto:", JSON.stringify(data));
      return res.status(502).json({ error: "Gemini no devolvió texto en la respuesta." });
    }

    return res.status(200).json({ texto });

  } catch (err) {
    console.error("Error inesperado en /api/analizar:", err);
    return res.status(500).json({ error: "Error inesperado en el servidor." });
  }
}
