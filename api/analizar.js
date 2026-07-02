// api/analizar.js
// Esta función corre en el servidor de Vercel (Node.js), nunca en el navegador del usuario.
// Por eso la API key (en la variable de entorno GEMINI_API_KEY) nunca queda expuesta.

const MODELOS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

async function llamarGemini(apiKey, modelo, promptSistema, promptUsuario) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: promptSistema }] },
      contents: [{ role: "user", parts: [{ text: promptUsuario }] }],
      tools: [{ google_search: {} }]
    })
  });
  return resp;
}

export default async function handler(req, res) {
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

  // Intentar con cada modelo en orden hasta que uno funcione
  for (const modelo of MODELOS) {
    try {
      const respuestaGemini = await llamarGemini(apiKey, modelo, promptSistema, promptUsuario);

      if (!respuestaGemini.ok) {
        const textoError = await respuestaGemini.text();
        console.warn(`Modelo ${modelo} falló (${respuestaGemini.status}):`, textoError.slice(0, 200));
        continue; // Intenta el siguiente modelo
      }

      const data = await respuestaGemini.json();
      const candidato = data.candidates && data.candidates[0];
      const partes = (candidato && candidato.content && candidato.content.parts) || [];
      const texto = partes.map(p => p.text || "").join("\n\n").trim();

      if (!texto) {
        console.warn(`Modelo ${modelo} devolvió respuesta sin texto.`);
        continue; // Intenta el siguiente modelo
      }

      console.log(`Éxito con modelo: ${modelo}`);
      return res.status(200).json({ texto });

    } catch (err) {
      console.warn(`Error con modelo ${modelo}:`, err.message);
      continue; // Intenta el siguiente modelo
    }
  }

  // Si todos los modelos fallaron
  return res.status(502).json({ error: "Todos los modelos de Gemini están saturados en este momento. Intenta en unos minutos." });
}
