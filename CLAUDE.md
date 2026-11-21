# Misión Estudio — reglas del proyecto

Juegos de estudio para primaria (5º y 2º), hechos con el temario del colegio.
Objetivo: que los niños estudien de forma fácil, rápida, dinámica y gamificada.

> Repositorio PÚBLICO. Nunca escribas aquí nombres de niños, del colegio ni datos personales.
>
> **El temario no se sube nunca** (el padre, 21-nov): ni fotos, ni escaneos, ni PDF de libros o libretas. Se quedan en el PC (`5º PRIM/`, `2º PRIM/`, `Material de apoyo/`, todo fuera de git). Al repositorio solo va lo que sacamos de ellas: `<juego>/temario.json` y los datos del juego. Antes de cada commit, `git status` y los archivos añadidos uno a uno, nunca `git add -A` (21-nov: así se subieron 13 fotos por error y hubo que reescribir el historial).

## Cómo trabajamos (dos Claudes, un solo repositorio)

- **Claude Code** (en el ordenador del padre) programa: juegos nuevos, temas, cambios grandes.
- **Claude en la app** (en el proyecto "El profesor de primaria") revisa: juega la beta en un navegador real, comprueba la cobertura del temario, mejora y sube a la misma beta. También pasa las fotos del temario a contenido ordenado.
- **El padre** prueba la beta y aprueba el paso a la versión normal.

Reglas:
1. La única fuente de verdad es GitHub (`AlvGolf/mision-estudio`, rama `main`). Nada de copiar código a mano entre sitios.
2. Siempre `git pull` antes de empezar y `git push` al terminar.
3. Trabaja uno cada vez, con turnos en `TRABAJO.md`: antes de tocar un juego, pon tu fila y súbela; al terminar, quítala. Si el juego tiene a otro, no se toca.
4. Todo cambio grande va primero a una carpeta beta (`<juego>-beta/`). Solo se pasa a la normal cuando el padre lo aprueba; después la beta redirige a la normal.
   - El motor común funciona igual: los cambios van a `motor-beta/` (lo cargan las betas) y, al aprobarlos, se copian a `motor/` (lo cargan los juegos normales). Así llegan a todos los juegos a la vez.
5. Mensajes de commit en español, cortos y que digan qué cambia para el niño.

### Flujo de un juego nuevo
La guía paso a paso es la skill `juego-nuevo` (`.claude/skills/juego-nuevo/SKILL.md`).
1. El padre manda fotos del temario → se saca la lista de contenidos a `<juego>/temario.json` (vocabulario, verbos, gramática y fecha del examen; ver `ingles-u2/temario.json`).
2. Claude Code crea `<juego>-beta/index.html` (p. ej. `mates-t3-beta/`) con solo los datos y las misiones, y al final carga `../motor-beta/piel.js` y `../motor-beta/motor.js` (ver `pruebas-motor/`). Lleva su `JUEGO.id` propio y claves de guardado propias, y lo sube.
3. Revisión: `npm run verificar -- <juego>-beta` (cobertura contra el temario, 390 / 820 / 1440 px y la ruta entera jugada arrastrando en Chrome). El Claude de la app, que no puede ejecutarlo, juega la ruta en su navegador.

## Herramientas

- **`npm run verificar [-- <juego>]`** (`scripts/verificar.mjs`): cobertura, desbordes, campos de texto, ruta entera, examen y nota final. Claude Code lo pasa **antes de cada subida que toque un juego**; con un FALLO no se sube. Los avisos no bloquean, pero se apuntan en `ESTADO.md`. Capturas en `verificacion/` (fuera de git).
  - `pruebas-motor/` es un juego de pruebas (sin ranking ni tarjeta en el menú) con una misión por cada formato nuevo del motor: así el verificador los juega aunque ningún juego los use. Cada formato nuevo se añade ahí y a los jugadores de `scripts/verificar.mjs`.
  - Para que el verificador pueda jugar, cada juego mantiene los nombres de `ingles-u2`: listas `VOCAB`, `VERBS`, `VSENT`, `VPARTS`, `vocabSentQ`, y `window._S` / `window._O` con el ejercicio actual.
- **Guarda de nombres** (`scripts/guarda-nombres.mjs`, gancho `.githooks/pre-push`): no deja subir nada que contenga un nombre de la lista privada, que está fuera del repo, en el PC del padre. Tampoco deja subir fotos, escaneos ni PDF, ni nada de las carpetas de curso (`5º PRIM/`…), aunque se hayan borrado en un commit posterior. El Claude de la app no tiene el gancho: antes de subir, revisa a mano que no haya nombres de niños, del colegio ni del profesor.
- **`ESTADO.md`**: lo esencial de cada juego, lo abierto y lo pendiente del padre. Se lee al empezar y se pone al día al cerrar.
- Puesta en marcha en un PC nuevo: `npm install` y `git config core.hooksPath .githooks`.
4. El padre lo prueba en `https://alvgolf.github.io/mision-estudio/<juego>-beta/`.
5. Aprobado → se copia a `<juego>/` cambiando `motor-beta` por `motor` en sus tres enlaces, se añade su fila en `juegos.js` (el menú de la suite la pinta sola) y la beta redirige.

## Estructura

- `index.html` — menú de la suite (lo que abre la app): pregunta el curso y enseña los juegos de `juegos.js` por asignatura, con el próximo examen y la nota de cada uno.
- `motor/` y `motor-beta/` — motor común (`motor.js`, `motor.css`): formatos, notas, boletín, ruta, ranking, examen y arcade. Sin nada de ninguna asignatura. `piel.js` (estilo por hora, app, guía y sonidos) es común con el menú de la suite y se carga antes que `motor.js`.
- `juegos.js` — la lista de juegos del menú (una fila por juego) y las asignaturas con su icono y color.
- `<juego>/index.html` — cada juego: sus datos, sus misiones (`R`), `BLOCKS`, `MIC`, `ROUTE_ST` y la configuración `JUEGO` (textos, claves de guardado, examen, ruta y preguntas del arcade). El juego se carga antes que la piel y el motor.
- `apps-script/Code.gs` — copia de referencia del script del ranking. El que funciona está en Google Apps Script; si cambias este, avisa al padre para que lo pegue y redespliegue.
- Web: https://alvgolf.github.io/mision-estudio/ (GitHub Pages, rama `main`, raíz).

## Ranking compartido

- Hoja de Google "Ranking Misión", pestaña "Marcas", con Apps Script desplegado como aplicación web (acceso: cualquier usuario).
- URL: `https://script.google.com/macros/s/AKfycbw7rxTYPt-c99ucT8Rxjcwj1_gMRJkSq0mmjagZlZjuOnpyWtTjAFE299CbkA2MViuwaQ/exec`
- `GET ?juego=<id>` devuelve las filas. `POST` con JSON `{juego, nombre, nota, examen, xp, estrellas, racha, desglose}` añade una fila.
- Cada juego tiene su `GAME_ID` (p. ej. `ingles-u2`). La beta comparte el `GAME_ID` y el progreso de la normal.
- El ranking muestra la última marca de cada nombre. El padre tiene una marca de prueba; su nombre no se escribe aquí (está en la lista privada de nombres).

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
- Ninguna opción falsa puede ser correcta, salvo que el enunciado lo restrinja («con -ing, como en el libro»). Se revisa antes de subir.
- Cada punto del temario se practica al menos una vez sin opciones.

## Interacción (para mantener la atención: 2º, de 15 a 20 minutos en total; 5º, de 30 a 35)

- **Catálogo de modalidades:** `MODALIDADES.md` (hechas, para hacer ya, a evaluar, para más adelante y descartadas). Cada juego nuevo se elige con la pregunta «¿qué aprendizaje no puede demostrar todavía el niño?».
- **Matemáticas** (el padre, 21-nov): todo se hace en la tablet como en la hoja, sin cuaderno (divisiones en cuadrícula, cuentas montadas en los problemas, borrador en el examen); ningún ejercicio es copia del libro; la ruta va de lo más fácil a lo más difícil, repartida en dos días de unos 20 minutos, y el tercer día, el examen.
- Solo cambian de formato los bloques que se hacen largos o repetitivos.
- Formatos (dedo o ratón): arrastrar al hueco · unir con líneas (5 parejas por pantalla) · fichas de letras (2 intentos y luego la solución) · deslizar tarjeta (derecha = bien, izquierda = mal) · clasificar en cajas (incluido "termómetro").
- Lo más parecido al examen se queda escrito a mano (p. ej. las 3 formas de los verbos y los verbos en frases).
- Solo cuenta la primera respuesta. En líneas y cajas cuenta cada pareja o ficha.
- 🧭 Ruta de estudio: todas las misiones seguidas, de lo más difícil a lo más ligero, con mapa de estaciones y tiempo restante. Dura de 15 a 20 minutos en 2º y de 30 a 35 en 5º (en Mates, dos días de unos 20): los `min` de `ROUTE_ST` suman eso y `JUEGO.ruta.minutos` lo dice («15 a 20»). El mapa enseña además lo que tarda de verdad cada niño en cada estación. +20 XP por estación. Se puede seguir donde se dejó. El vocabulario rota por partes.

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
