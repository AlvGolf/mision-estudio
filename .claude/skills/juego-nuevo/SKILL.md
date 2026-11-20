---
name: juego-nuevo
description: "Monta un juego nuevo de Misión Estudio desde las fotos del temario hasta la beta lista para que el padre la pruebe: temario.json, elección de modalidades, ronda de preguntas, datos y misiones sobre el motor común, verificador y paso a la normal cuando lo aprueba. Úsala cuando el padre diga 'juego nuevo', 'te paso el temario', 'aquí tienes las fotos del tema', 'monta el juego de…', 'hay examen de…', '/juego-nuevo' o mande fotos de un temario."
---

# Juego nuevo — Misión Estudio

De las fotos del temario a una beta que el padre pueda probar, sin saltarse nada. Las reglas de fondo están en `CLAUDE.md` (cobertura, marcadores, formatos, móvil) y `MODALIDADES.md` (catálogo de formatos). Esta guía es el orden.

> Repositorio PÚBLICO: ningún nombre de niño, del colegio ni del profesor en datos, frases de ejemplo ni commits. Los personajes de los ejercicios llevan nombres genéricos.

## 0. Antes de nada
- `git pull`. Lee `TRABAJO.md`: si alguien tiene ese juego, no se toca.
- Nombre de la carpeta: `<asignatura>-<tema>` en minúsculas y sin tildes (`ingles-u2`, `mates-t3`, `lengua-t4`, `ciencias-t2`). Comprueba que no existe: ni `<juego>/` ni `<juego>-beta/`.
- Pon tu fila en `TRABAJO.md` y súbela **antes** de cambiar nada.

## 1. El temario → `<juego>/temario.json`
Lo que sale en las fotos es lo que entra en el examen: ni más ni menos.
- Copia la forma de `ingles-u2/temario.json`: `juego`, `asignatura`, `curso`, `examen` (AAAA-MM-DD), `fuente` (de dónde sale y cuándo).
- **Inglés:** `vocabulario` (`{en, es}`), `verbos` (`{base, pasado:[], participio:[], es}`) y `gramatica`.
- **Cualquier otra asignatura:** `puntos`. Cada punto del temario es una línea `{id, punto, test, escribir, ordenar}`, donde cada forma es el nombre de la lista del juego que lo practica, o `"-"` si no aplica. El verificador comprueba que esas listas existen y no están vacías.
- Lo que no se lea bien en la foto **se pregunta**, nunca se adivina (una palabra borrosa, una cifra, una fecha).
- Enséñale al padre la lista de contenidos ya ordenada antes de seguir: es la base de todo.

## 2. Qué modalidades
Para cada punto del temario, la pregunta de `MODALIDADES.md`: **«¿qué aprendizaje no puede demostrar todavía el niño?»**.
- **Reglas de cobertura (de `CLAUDE.md`):**
  - cada punto se practica al menos una vez **sin opciones**;
  - la gramática, de tres formas (test, escribir y ordenar);
  - el vocabulario, en partes de unas 17 palabras más una opción con todas;
  - lo más parecido al examen vale doble y se escribe a mano.
- **Formatos del motor** (tipos de paso de `runSteps`):
  - de siempre: `mc`, `gap`, `lines`, `bins`, `tiles`, `swipe` y `type`;
  - de escucha y escritura: `listen`, `dictado`, `repair`, `cross` y `first`;
  - con escena animada: `scene`, `story` y `probe`.

  Cómo se usa cada uno: `MODALIDADES.md` y los comentarios de `motor/motor.js`.
- **Por curso:**
  - **2º:** sobre todo `listen`, `first`, `tiles`, `scene`, `lines` y `bins`, con poca lectura y frases cortas.
  - **5º:** además `dictado`, `repair`, `cross`, `story` y `probe`.
- **Escenas:**
  - Los sitios salen de la biblioteca del motor (`ESC_SITIOS`).
  - Si el tema pide uno que no está, se dibuja **una vez en `motor-beta/`**, con el estilo elegido (cómic con contorno, luz del atardecer), y se añade a `pruebas-motor/`.
  - Da a cada personaje su peinado y su ropa, para que pelo y nombre encajen.
- **Matemáticas:** el formato «responder con un número» aún no existe. Se construye con el primer temario de Mates (decisión del padre).
- Si un temario pide una modalidad que no está en el motor, se propone en el artefacto de modalidades antes de programarla. Nunca se cuela.

## 3. Ronda de preguntas con el padre (antes de programar)
Es algo importante, así que el plan tiene que estar completo antes de empezar.
- Unas diez preguntas, cada una con la respuesta que recomiendas ya puesta, para que conteste rápido («sí a todo salvo la 4»).
- **Qué preguntar:**
  - los bloques con nota y su peso;
  - qué formato lleva cada bloque;
  - la ruta, de lo más difícil a lo más ligero, con sus minutos: en total, de 15 a 20 en 2º y de 30 a 35 en 5º;
  - el examen: número de preguntas y fecha;
  - las dudas del temario;
  - si hay historia ramificada o miniinvestigación, y de qué trata.
- Cada pregunta nombra lo que pregunta. El padre escucha solo el 🔊.
- Lo que se puede comprobar en el código no se pregunta.

## 4. La beta → `<juego>-beta/index.html`
- Parte de `pruebas-motor/index.html` (lo más corto) o de `ingles-u2/index.html` (un juego completo). Solo lleva datos y misiones: nada de motor.
- **Enlaces:** `../motor-beta/motor.css?v=N` y `../motor-beta/motor.js?v=N`, con el mismo `N` que `pruebas-motor/`. El juego se carga **antes** que el motor.
- **`JUEGO`:**
  - `id` propio, igual que la carpeta sin `-beta`;
  - `codigo`;
  - `claves` de guardado propias (`estado`, `ruta`, `arcade`) y `nombre:'mision_name'`;
  - `saludo`, `notaBoletin`, `menu`, `chuleta`;
  - `examen` (`min`, `dia`, `preguntas()`), `ruta`, `arcade` (`bloques`, `jefes`, `test`, `deletreo`);
  - `voz` (`en-GB` en Inglés, `es-ES` en Lengua o Ciencias) y `tildesCuentan` (`true` en Lengua de 5º).
- **Además de `JUEGO`:** `BLOCKS` (con `w:2` en lo más parecido al examen), `MIC`, `ROUTE_ST` (de lo más difícil a lo más ligero; sus `min` suman de 15 a 20 en 2º y de 30 a 35 en 5º, y `JUEGO.ruta.minutos` lo dice: «15 a 20» o «30 a 35») y `R` (una función por misión).
- **Para que el verificador juegue:** en Inglés se mantienen los nombres `VOCAB`, `VERBS`, `VSENT`, `VPARTS` y `vocabSentQ`. En cualquier juego, las listas que nombre `temario.json`.
- **Revisa a mano antes de seguir:**
  - en las frases con hueco, las opciones falsas son de otro tipo de palabra;
  - ninguna opción falsa puede ser correcta, salvo que el enunciado lo restrinja.
- **Ranking:** la beta comparte `GAME_ID` y progreso con la normal. En las pruebas nunca se escribe en el ranking real.

## 5. Verificar
- `npm run verificar -- <juego>-beta`. Comprueba la cobertura contra el temario, los anchos de 390, 820 y 1440 px, la ruta entera jugada arrastrando en Chrome, el examen y la casilla de la nota del colegio. **Con un FALLO no se sube.** Los avisos se apuntan en `ESTADO.md`.
- Mira las capturas de `verificacion/`, sobre todo las de 390 px.
- Si añadiste algo nuevo al motor o al verificador, haz el **control positivo**: estrópealo a propósito, mira que el verificador lo caza y déjalo como estaba.

## 6. Subir y avisar
- Commit en español, corto, que diga qué cambia para el niño. `git push`: el gancho revisa los nombres.
- Quita tu fila de `TRABAJO.md` y pon al día `ESTADO.md`: pieza nueva en «Lo esencial» si lo es, y «Pendiente del padre: probar la beta».
- **Al padre, en el 🔊:**
  - qué tiene el juego;
  - que la beta está en `https://alvgolf.github.io/mision-estudio/<juego>-beta/`;
  - que necesitas que la pruebe.

## 7. Cuando el padre la aprueba
- Copia `<juego>-beta/index.html` a `<juego>/index.html` y cambia `motor-beta` por `motor` en sus dos enlaces. Si el motor beta tiene algo que el juego usa y `motor/` no, primero se pasa el motor, que también necesita su visto bueno.
- Añade la tarjeta en el `index.html` de la raíz, igual que la de `ingles-u2`: icono, nombre, curso y de qué trata.
- La beta pasa a redirigir a la normal: copia la forma de `ingles-u2-beta/index.html`.
- `npm run verificar` (todos) y comprueba en la web que la normal carga.
- Añade el juego a «Juegos hechos» de `CLAUDE.md` y a «Lo esencial» de `ESTADO.md`.
- Después del examen, pídele al padre la nota real para apuntarla en la casilla «Nota del colegio» del boletín.
