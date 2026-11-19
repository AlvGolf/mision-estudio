# Misión Estudio — reglas del proyecto

Juegos de estudio para primaria (5º y 2º), hechos con el temario del colegio.
Objetivo: que los niños estudien de forma fácil, rápida, dinámica y gamificada.

> Repositorio PÚBLICO. Nunca escribas aquí nombres de niños, del colegio ni datos personales.

## Cómo trabajamos (dos Claudes, un solo repositorio)

- **Claude Code** (en el ordenador del padre) programa: juegos nuevos, temas, cambios grandes.
- **Claude en la app** (en el proyecto "El profesor de primaria") revisa: juega la beta en un navegador real, comprueba la cobertura del temario, mejora y sube a la misma beta. También pasa las fotos del temario a contenido ordenado.
- **El padre** prueba la beta y aprueba el paso a la versión normal.

Reglas:
1. La única fuente de verdad es GitHub (`AlvGolf/mision-estudio`, rama `main`). Nada de copiar código a mano entre sitios.
2. Siempre `git pull` antes de empezar y `git push` al terminar.
3. Trabaja uno cada vez. Si el otro Claude tiene trabajo a medias, no se toca el mismo juego.
4. Todo cambio grande va primero a una carpeta beta (`<juego>-beta/`). Solo se pasa a la normal cuando el padre lo aprueba; después la beta redirige a la normal.
5. Mensajes de commit en español, cortos y que digan qué cambia para el niño.

### Flujo de un juego nuevo
1. El padre manda fotos del temario → se saca la lista de contenidos (vocabulario, verbos, gramática…).
2. Claude Code crea `<juego>-beta/index.html` (p. ej. `mates-t3-beta/`), con su `GAME_ID` propio, y lo sube.
3. Revisión: cobertura del temario, prueba a 390 / 820 / 1440 px y la ruta entera jugada en navegador real.
4. El padre lo prueba en `https://alvgolf.github.io/mision-estudio/<juego>-beta/`.
5. Aprobado → se copia a `<juego>/`, se añade la tarjeta en el `index.html` de la raíz y la beta redirige.

## Estructura

- `index.html` — menú con una tarjeta por juego.
- `<juego>/index.html` — cada juego es un único archivo HTML autocontenido.
- `apps-script/Code.gs` — copia de referencia del script del ranking. El que funciona está en Google Apps Script; si cambias este, avisa al padre para que lo pegue y redespliegue.
- Web: https://alvgolf.github.io/mision-estudio/ (GitHub Pages, rama `main`, raíz).

## Ranking compartido

- Hoja de Google "Ranking Misión", pestaña "Marcas", con Apps Script desplegado como aplicación web (acceso: cualquier usuario).
- URL: `https://script.google.com/macros/s/AKfycbw7rxTYPt-c99ucT8Rxjcwj1_gMRJkSq0mmjagZlZjuOnpyWtTjAFE299CbkA2MViuwaQ/exec`
- `GET ?juego=<id>` devuelve las filas. `POST` con JSON `{juego, nombre, nota, examen, xp, estrellas, racha, desglose}` añade una fila.
- Cada juego tiene su `GAME_ID` (p. ej. `ingles-u2`). La beta comparte el `GAME_ID` y el progreso de la normal.
- El ranking muestra la última marca de cada nombre. La marca de prueba del padre se llama "Mr. Martin".

## Juegos sin personalizar

- Se comparten con otros niños de la clase. Ningún nombre ni dato de un niño en el código.
- La primera vez el juego pregunta el nombre y lo guarda en el dispositivo; botón "no soy yo" para cambiarlo.
- Los ejercicios se basan en el temario, nunca en "lo que escribiste en tu libro".

## Cobertura: todo lo que entra tiene su ejercicio

- Lo que sale en las fotos es lo que entra en el examen.
- Cada palabra del vocabulario: traducción y frase con hueco. Listas largas en partes de ~17 palabras, más una opción con todas.
- Cada verbo: sus formas escritas y una frase.
- Cada punto de gramática sale al menos una vez en cada partida.
- La gramática se practica de tres formas: test, escribir la respuesta y ordenar frases.
- En las frases con hueco, las opciones falsas son de otro tipo de palabra, para que solo encaje una.

## Interacción (para mantener la atención ~30 min)

- Solo cambian de formato los bloques que se hacen largos o repetitivos.
- Formatos (dedo o ratón): arrastrar al hueco · unir con líneas (5 parejas por pantalla) · fichas de letras (2 intentos y luego la solución) · deslizar tarjeta (derecha = bien, izquierda = mal) · clasificar en cajas (incluido "termómetro").
- Lo más parecido al examen se queda escrito a mano (p. ej. las 3 formas de los verbos y los verbos en frases).
- Solo cuenta la primera respuesta. En líneas y cajas cuenta cada pareja o ficha.
- 🧭 Ruta de estudio: todas las misiones seguidas, de lo más difícil a lo más ligero, con mapa de estaciones y tiempo restante. +20 XP por estación. Se puede seguir donde se dejó. El vocabulario rota por partes.

## Dos marcadores separados

1. **Nota de dominio (0–10)**: ¿lo sabe?
   - Nota por bloque = media de las 3 últimas partidas (solo primera respuesta).
   - Lo más parecido al examen vale doble.
   - Nota final = media ponderada; solo se muestra cuando se han jugado todos los bloques.
   - <5 Insuficiente · 5 Suficiente · 6 Bien · 7–8,9 Notable · 9–10 Sobresaliente.
2. **XP y rachas 🔥**: ¿ha estudiado? Premian el esfuerzo, no afectan a la nota.

Semáforo: 🟢 ≥8 · 🟡 5–7,9 · 🔴 <5 · ⚪ sin jugar. "Hoy toca" propone el bloque sin jugar o el de nota más baja.

## Examen final

- 20 preguntas mezcladas, con tiempo límite y sin pistas; correcciones al final.
- "Nota prevista" = media de los 3 últimos exámenes, para comparar con la nota real del colegio.

## Rankings

- 🏫 Ranking de la clase (compartido): por nota y, si empatan, por XP. Estrellas por apartado.
- 🏅 Mis partidas (en el dispositivo): historial con 🗑️ de doble confirmación.
- Nunca ranking entre hermanos: tienen temarios distintos.

## Arcade

- Sección "🎮 Arcade" al final del menú: ⚡ Contrarreloj (60 s, combos ×2/×3/×4) · 🐉 Batalla contra el jefe (3 vidas) · 🎈 Explota globos (velocidad base 0,72, +0,065 por ronda, tope +1,45) · 🚀 Rescate letra a letra.
- Se desbloquea al haber jugado todos los bloques con nota. Suma XP (1 moneda = 5 XP), no cuenta para la nota.
- Una sola estrella: vencer a un jefe. Total = misiones × 3 + 1.
- Estilo para 10 años, nada infantil: tarjetas oscuras con borde y brillo por modo, etiqueta "MODO 01…04".
- **Aparcado**: no se cambia el arcade hasta que el padre lo pida.

## Adaptado a ordenador, tablet y móvil (obligatorio)

- Móvil (≤600 px): cabecera corta, misiones en 2 columnas con títulos de sección, nombre y botón uno debajo del otro, ranking en tarjetas (nunca tablas anchas).
- Tablet (601–1024 px): misiones en 3 columnas.
- Ordenador: ancho máximo ~820 px, centrado.
- Campos de texto: autocorrect, autocapitalize y spellcheck desactivados; letra ≥16 px.
- Antes de subir: probar a 390, 820 y 1440 px sin desbordes horizontales, y jugar la ruta entera de forma automática en un navegador real, arrastrando de verdad.

## Juegos hechos

- **Inglés Unit 2, 5º** (`ingles-u2/`, examen 20-nov-2026): 5 adverbios de frecuencia, Do you like / Would you like, 20 verbos irregulares (be → feel), 52 palabras (actor → worried). 10 bloques con nota + ruta + arcade (40 estrellas).
