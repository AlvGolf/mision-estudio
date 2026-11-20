# Estado de Misión Estudio

Se actualiza al cerrar cada sesión. Lo esencial manda sobre lo demás: lo extra espera mientras quede algo esencial abierto, salvo que el padre lo pida.

## Lo esencial

> Confirmado con el padre el 19-nov-2026.

| Pieza | Estado | Nota |
|---|---|---|
| Menú con una tarjeta por juego | ✅ hecho | `index.html` |
| Inglés Unit 2 (5º) | ✅ en producción | Examen el 20-nov-2026. El 19-nov pasaron a la normal los arreglos del verificador (gramática también escrita, tarjeta en el móvil, letra, corrector) |
| Ranking compartido de la clase | ✅ hecho | Apps Script; copia en `apps-script/Code.gs` |
| Pruebas automáticas (`npm run verificar`) | ✅ hecho | Ruta entera a 390/820/1440 px, cobertura y examen |
| Guarda de nombres antes de subir | ✅ hecho | Lista con 7 nombres (19-nov). Repaso de todo el repo: limpio |
| Turnos entre los dos Claudes (`TRABAJO.md`) | ✅ hecho | |
| Cada niño con su progreso en el mismo dispositivo | ✅ en producción | 20-nov, «no soy yo» aparta el progreso y lo recupera con el nombre |
| Juego de 2º | ⚪ sin empezar | Sin examen a la vista: el padre mandará temario la semana del 23-nov. Hasta entonces, tampoco hay examen nuevo de 5º: tiempo para mejorar la app |

## Abierto

- **Motor común en producción (20-nov).** `motor/` lo cargan los juegos normales y `motor-beta/` las betas y `pruebas-motor/`. Verificador sin fallos y 32 pantallas idénticas a la normal anterior.

### Plan de desarrollo (20-nov, tras el informe de investigación; catálogo en `MODALIDADES.md`)

1. **Después del examen de Inglés (20-nov), arreglos en la beta:**
   - ✅ (en beta, 20-nov) **[esencial]** «no soy yo» separa el progreso de cada niño en el mismo dispositivo. Hoy el siguiente hereda las notas del anterior y podría subirlas al ranking con su nombre.
   - ✅ (en beta) Las 4 preguntas de *Do you like ____?* que tienen *to play*, *to do*… como opción falsa piden «con -ing, como en el libro».
   - ✅ (en beta) Reanudar la ruta: al volver del menú dice «Seguir por la estación N» y deja empezar de cero.
   - ✅ (en beta) «Ordena la frase» y «escribe la frase» aceptan *sometimes* al principio.
   - ✅ (20-nov) Motor común y arreglos en la normal: el padre probó la beta y la aprobó. `motor/` = copia de `motor-beta/`; la beta redirige.
2. **Artefacto «Modalidades nuevas»** (https://claude.ai/artifact/FfjxVWGYQJwPv4fBk5y4F8, publicado el 20-nov; lo elegido se guarda en su almacén, colección `elecciones`) con maquetas jugables: las seis para hacer ya (escuchar, dictado, detectar y reparar, crucigrama, número, primera letra) y las tres a evaluar (historia ramificada, construir una escena, miniinvestigación).
3. **Construir en `motor-beta/`** las modalidades elegidas. ✅ (20-nov) Escuchar, dictado, reparar, crucigrama y primera letra, probadas en `pruebas-motor/` (el verificador las juega). Número: espera al primer temario de Mates. Aspecto de las escenas elegido en el artefacto (dibujo SVG animado, personajes de cómic, atardecer; ver MODALIDADES.md). ✅ (20-nov) Construir una escena (paso `scene`), con su biblioteca de sitios, en `pruebas-motor/`. ✅ (20-nov) Historia ramificada (paso `story`). ✅ (20-nov) Miniinvestigación (paso `probe`). Las tres se juegan en `pruebas-motor/`; ningún juego las usa todavía. ✅ (20-nov) Aprobadas por el padre y pasadas a `motor/`: los ocho formatos nuevos (escuchar, dictado, reparar, crucigrama, primera letra, escena, historia y miniinvestigación) ya están en el motor normal para el próximo juego.
4. **Extras de los puntos 6.1 y 6.4 del informe:** ✅ (20-nov, en `motor-beta/`) casilla «Nota del colegio» en el boletín, junto a la prevista: se apunta a mano, va con el progreso de cada niño y congela la prevista de ese momento (±0,5 = «el juego acertó»). ✅ En `motor/` desde el 20-nov (aprobada por el padre): sale ya en Inglés Unit 2; guardar en el dispositivo cuánto tarda de verdad cada estación de la ruta. ✅ (20-nov, en `motor-beta/`) Cada estación guarda sus 5 últimos tiempos reales (descarta menos de 20 s y pestañas olvidadas); el mapa dice «tú: N min» y «Quedan unos…» usa esos tiempos. ✅ En `motor/` desde el 20-nov (el padre dejó la decisión a Claude): ya mide en Inglés Unit 2. Duración de la ruta según el curso (el padre, 20-nov): **2º, de 15 a 20 minutos en total; 5º, de 30 a 35**. `JUEGO.ruta.minutos` (en `motor-beta/`) pone el texto, y el verificador avisa si los `min` de `ROUTE_ST` no suman eso. Aviso conocido: Inglés Unit 2 no tiene `JUEGO.ruta.minutos` (su ruta ya suma de 30 a 35; examen pasado, no se toca).
5. **Aspecto visual** del motor, con un artefacto de opciones. Plan decidido con el padre (20-nov, dos rondas):
   - Entran menú y boletín, ruta y su mapa, pantallas de ejercicio, y examen y resultados. El arcade sigue aparcado.
   - Fondo oscuro, renovado (más color y profundidad; casa con el atardecer de las escenas).
   - Personajes de cómic como guías (saludan en el menú, celebran al acabar, animan en la ruta); los ejercicios, limpios.
   - **Estilo distinto por curso:** 2º más colorido e infantil, con letra y botones grandes y poco texto; 5º más sobrio («para 10 años, nada infantil»).
   - Artefacto con 3 direcciones completas, cada una en las cuatro pantallas y en sus versiones de 2º y 5º; se elige dirección y luego se afina pantalla a pantalla. La letra la propone cada dirección.
   - Movimiento con propósito (acertar, fallar, avanzar, subir de nota), nada en bucle; se apaga si el dispositivo pide menos movimiento.
   - Al aprobarlo va al motor común: llega a todos los juegos, Inglés Unit 2 incluido (con el estilo de 5º).
   - Artefacto «Rediseño de Misión Estudio» (https://claude.ai/artifact/3bYCo7KGXvksweYVzc8QAa, 20-nov; elección en su almacén, colección `elecciones`, documento `direccion`): A · Atardecer, B · Cómic y C · Noche estrellada, cada una en menú, ruta, ejercicio y resultados, con versión de 5º y de 2º. Ronda 2 (20-nov, el padre): **se usan todos**, el juego cambia de estilo con la hora real (mañana de 7 a 15 de día, tarde de 15 a 20 al atardecer, noche de 20 a 7), igual que la luz de las escenas; se añade el bloque **D · Día** (claro, colores vivos, texto oscuro: cambia la regla de «fondo oscuro» solo para la mañana). Cada bloque tiene 3 variantes (A1–A3, B1–B3, C1–C3, D1–D3); Ronda 3 (20-nov, el padre): **no se elige una, se rota de un juego a otro**, para que el examen de Mates y el de Inglés de la semana siguiente no se vean iguales. Cada juego lleva su propio juego de estilos (uno de mañana, uno de tarde y uno de noche, `JUEGO.estilo`), fijo dentro del juego, y el siguiente juego toma el siguiente, sin repetir el del anterior. Por la mañana entran D1–D3 y B1–B3; por la tarde, A1–A3 y B1–B3; por la noche, C1–C3 y B1–B3 (el cómic entra en los tres momentos, decisión del padre aunque su fondo sea oscuro): seis juegos seguidos sin repetir. **En `motor-beta/` (20-nov):** los doce estilos, la elección por hora y por juego (`JUEGO.estilo`, `JUEGO.curso`), la versión de 2º y la luz de las escenas según la hora cuando el ejercicio no la fija; probado en los doce y en 2º y 5º a 390 px. Inglés Unit 2 no lo ve hasta pasar el motor a la normal (llevará el grupo 0: cielo azul, atardecer translúcido y constelación). El padre lo vio: «está perfecto». **Personajes guía (20-nov, en `motor-beta/`):** un personaje de las escenas con bocadillo, uno por juego (el del grupo de estilos o `JUEGO.guia`); saluda en el menú, anima al empezar la ruta y comenta los resultados de cada misión y del examen (salta si va bien). El ejercicio queda limpio. **En el motor normal (20-nov, aprobado por el padre):** Inglés Unit 2 ya cambia de estilo con la hora (grupo 0: D1 cielo azul, A1 atardecer translúcido, C1 constelación) y lleva el guía.
   - **Ronda 4 · movimiento (motion graphics), extra (20-nov, el padre):** animaciones en celebraciones, menú y boletín, mapa de la ruta y dentro del ejercicio; intensidad media (menos de un segundo, sin hacer esperar), más largas solo en la historia y las escenas; en 2º más alegres. En el artefacto del rediseño, sección «Que el juego se vea vivo»: tres opciones por momento (C1–C3, M1–M3, R1–R3, E1–E3, H1–H3) y cuatro extras (X1 transición entre pantallas, X2 XP y racha que suben, X3 cuenta atrás del examen, X4 el guía asoma); elección en el documento `movimiento`. **Elegido (20-nov):** C1 en secuencia (sube la nota y salen las estrellas; luego el guía habla, levanta los dos brazos y salta; después el sello con la nota en texto y al final el confeti), M1 con la nota que crece y su texto después, R1, E1 con el +10 de la E2 y la barra que crece con brillo, las tres H turnándose entre escenas, y los extras X2, X3 y X4. **En `motor-beta/` (20-nov):** todo hecho y verificado; el guía asoma en la ruta a mitad y en la última estación. **En el motor normal (20-nov, aprobado por el padre):** Inglés Unit 2 ya las tiene.
- (`ingles-u2/temario.json` se sacó del propio juego y el padre decidió no cotejarlo.)

## Pendiente del padre

- La nota real del examen de Inglés Unit 2 (20-nov), cuando la sepa, para compararla con la «nota prevista» del juego.
- Nada pendiente. (19-nov: el nombre de la marca de prueba sigue en el commit antiguo 32d677d; el padre decidió dejarlo así.)

## Para el segundo juego (decidido el 19-nov)

- ~~Separar el motor común de los datos de cada juego.~~ Hecho en beta el 19-nov.
- ~~Skill «juego nuevo» con el flujo desde las fotos hasta la beta.~~ Hecha el 20-nov: `.claude/skills/juego-nuevo/`. El temario de cualquier asignatura usa `puntos` en `temario.json` (el verificador comprueba sus listas; probado en `pruebas-motor/`).
