# Predictor del Mundial 2026 — Cómo publicarlo en internet (gratis)

Este paquete tiene todo lo necesario para subir tu predictor a internet con el
botón de "Analizar mi predicción" funcionando (usando Gemini, gratis).

## Lo que hay en esta carpeta

- `index.html` → tu predictor completo (lo que ya conoces)
- `api/analizar.js` → la función que esconde tu llave de Gemini y habla con la IA por ti
- `package.json` → archivo técnico que necesita Vercel
- `.gitignore` → evita que subas accidentalmente tu llave secreta

## Antes de empezar: consigue tu llave de Gemini (gratis, sin tarjeta)

1. Ve a **https://aistudio.google.com/apikey**
2. Inicia sesión con tu cuenta de Google
3. Da clic en **"Create API key"**
4. Copia la llave que te da (se ve como `AIzaSy...`) y guárdala en un lugar seguro
5. **Nunca la compartas ni la pongas dentro de ningún archivo que subas a GitHub**

## Paso 1: Crea una cuenta en GitHub (si no tienes)

Ve a **github.com** y crea una cuenta gratis.

## Paso 2: Sube esta carpeta a un repositorio de GitHub

**Opción fácil (sin usar comandos):**

1. En GitHub, da clic en el botón verde **"New"** (o el ícono "+" arriba a la derecha → "New repository")
2. Ponle un nombre, por ejemplo `mundial-predictor`
3. Déjalo en **Public** o **Private** (cualquiera funciona para esto)
4. Dale **"Create repository"**
5. En la página que se abre, busca el link que dice **"uploading an existing file"**
6. Arrastra y suelta TODOS los archivos de esta carpeta (incluyendo la carpeta `api` completa)
7. Dale **"Commit changes"**

## Paso 3: Conecta tu repositorio con Vercel

1. Ve a **vercel.com** y crea una cuenta — dale clic a **"Continue with GitHub"** para que se conecten automáticamente
2. Una vez dentro, da clic en **"Add New..." → "Project"**
3. Busca tu repositorio `mundial-predictor` en la lista y dale **"Import"**
4. Te va a mostrar opciones de configuración — **no cambies nada**, déjalo todo por default
5. **MUY IMPORTANTE — antes de darle "Deploy":** busca la sección que dice **"Environment Variables"**
   - En el campo de **Name** (o Key), escribe exactamente: `GEMINI_API_KEY`
   - En el campo de **Value**, pega tu llave de Gemini (la que copiaste antes)
   - Dale clic en **"Add"**
6. Ahora sí, dale clic en **"Deploy"**
7. Espera 1-2 minutos. Cuando termine, te va a dar una URL pública como
   `https://mundial-predictor-tunombre.vercel.app`

¡Listo! Esa es tu página, ya pública, con el botón de análisis funcionando con IA gratis.

## Cómo probar que quedó bien

1. Abre la URL que te dio Vercel
2. Completa tu predicción completa (los 31 partidos)
3. Dale clic a "Analizar mi predicción"
4. Si después de 15-30 segundos te sale el análisis con colores, **¡ya quedó!**

## Si algo no funciona

- **El botón de analizar da error:** revisa que la variable `GEMINI_API_KEY` esté
  bien escrita (exactamente así, en mayúsculas) en Vercel, en
  Settings → Environment Variables de tu proyecto. Si la agregaste después del
  primer deploy, tienes que ir a la pestaña "Deployments" y darle "Redeploy"
  para que tome el cambio.
- **Las banderas no se ven:** no debería pasar, están incrustadas en el archivo,
  pero si pasa, dímelo y lo revisamos.
- **Quiero cambiar algo del diseño o los equipos:** edita `index.html` directamente
  en GitHub (botón de lápiz ✏️ junto al archivo) y Vercel va a re-publicar
  automáticamente en 1-2 minutos.

## Sobre los límites gratis de Gemini

Tu llave gratis de Gemini te da una cantidad generosa de usos al día (cientos),
más que suficiente para que tú y tus amigos usen el predictor. Si algún día se
vuelve muy popular y se te acaban los usos gratis del día, simplemente vuelve a
funcionar al día siguiente — no se te cobra nada ni se rompe nada.

## Sobre seguridad de tu llave

Tu llave de Gemini **nunca** queda visible en el navegador ni en el código que
ve la gente — vive únicamente en la configuración privada de Vercel
("Environment Variables"), y solo la función `api/analizar.js` (que corre en
el servidor de Vercel, no en la computadora del usuario) puede usarla.
