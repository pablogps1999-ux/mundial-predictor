const MODELOS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

async function llamarGemini(apiKey, modelo, sistema, usuario, conBusqueda) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: sistema }] },
    contents: [{ role: "user", parts: [{ text: usuario }] }]
  };
  if (conBusqueda) body.tools = [{ google_search: {} }];
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body)
  });
}

async function intentarModelos(apiKey, sistema, usuario, conBusqueda) {
  for (const modelo of MODELOS) {
    try {
      const resp = await llamarGemini(apiKey, modelo, sistema, usuario, conBusqueda);
      if (!resp.ok) { console.warn(`${modelo} falló (${resp.status})`); continue; }
      const data = await resp.json();
      const texto = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("\n\n").trim();
      if (texto) { console.log(`OK: ${modelo}`); return texto; }
    } catch(e) { console.warn(`Error ${modelo}:`, e.message); }
  }
  throw new Error("Todos los modelos fallaron");
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow","POST"); return res.status(405).json({error:"Usa POST"}); }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({error:"Falta GEMINI_API_KEY"});
  const { promptSistema, promptUsuario } = req.body || {};
  if (!promptSistema || !promptUsuario) return res.status(400).json({error:"Faltan prompts"});

  try {
    // PASO 1: análisis de texto con búsqueda web
    const textoAnalisis = await intentarModelos(apiKey, promptSistema, promptUsuario, true);

    // PASO 2: llamada separada solo para porcentajes (sin búsqueda, más rápido y confiable)
    const sistemaPct = "Eres un analista de fútbol. Responde ÚNICAMENTE con un objeto JSON puro y válido, sin texto, sin markdown, sin explicaciones. Solo el JSON.";
    const usuarioPct = `Dado este análisis:\n\n${textoAnalisis.slice(0, 2000)}\n\nY estas predicciones:\n${promptUsuario.slice(0, 800)}\n\nDevuelve probabilidades (1-99) de que cada equipo elegido gane. Arrays r1=16 números, r2=8, r3=4, r4=2, r5=1, tercer=1. Ejemplo con números reales:\n{"r1":[72,45,80,35,65,50,70,40,68,55,75,38,60,42,58,62],"r2":[60,55,65,50,58,62,70,45],"r3":[65,55,60,70],"r4":[55,60],"r5":[52],"tercer":[58]}`;

    let textoFinal = textoAnalisis;
    try {
      const textoPct = await intentarModelos(apiKey, sistemaPct, usuarioPct, false);
      const limpio = textoPct.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(limpio);
      if (Array.isArray(parsed.r1) && parsed.r1.length > 0 && typeof parsed.r1[0] === "number") {
        textoFinal += `\n\n[[[JSON_PROBABILIDADES]]]\n${JSON.stringify(parsed)}\n[[[FIN_JSON_PROBABILIDADES]]]`;
        console.log("Probabilidades obtenidas correctamente");
      }
    } catch(e) { console.warn("Sin probabilidades:", e.message); }

    return res.status(200).json({ texto: textoFinal });

  } catch(err) {
    console.error("Error:", err.message);
    return res.status(502).json({ error: "Gemini no disponible. Intenta en unos minutos." });
  }
}
