# Catálogo de modalidades de juego

Decidido con el padre el 20-nov-2026, a partir del informe `Material de apoyo/Investigacion_Mision_Estudio.md`. El informe es una opinión que se puede rebatir, no una verdad absoluta. El arcade queda fuera de este catálogo.

## Cómo se elige una modalidad

- **La pregunta:** «¿Qué aprendizaje no puede demostrar todavía el niño con lo que tenemos?». No se añaden juegos solo por novedad.
- **Tipo de respuesta:** cada modalidad dice qué pide: *reconocer* (elige entre opciones), *producir con apoyo* (fichas, primera letra), *producir solo* (escribe sin opciones), *detectar* (ve el error) o *aplicar* (usa lo que sabe en una situación).
- **Pregunta de control:** ¿puede resolverse sin saber el contenido, por colores, posiciones o una pista sin querer? Si es así, se rehace.

## Reglas de calidad (valen para todas)

1. **Ninguna opción falsa puede ser correcta**, salvo que el enunciado lo restrinja («con -ing, como en el libro»). Se revisa antes de subir.
2. **Cada punto del temario se practica al menos una vez sin opciones** (escribir, dictado, crucigrama…).
3. **Todo lo que se arrastra también se hace tocando** origen y destino. Deslizar siempre tiene botones.
4. **Solo cuenta la primera respuesta.** Los reintentos sirven para aprender, pero no suben la nota.

## Hechas (en el motor común)

| # | Familia | En el juego | Tipo de respuesta |
|---|---|---|---|
| 1 | Elegir respuesta | test (`mc`) | reconocer |
| 2 | Completar el hueco con fichas | arrastrar al hueco (`gap`) | reconocer en contexto |
| 3 | Emparejar | unir con líneas (`lines`) | reconocer |
| 4 | Clasificar | cajas y termómetro (`bins`) | reconocer |
| 5 | Ordenar | ordena la frase o la pregunta (`orderGame`) | producir con apoyo |
| 6 | Construir la palabra | fichas de letras (`tiles`) | producir con apoyo |
| 7 | Juicio bien/mal | Cazaerrores (`swipe`) | detectar |
| 8 | Escribir sin opciones | escribe la respuesta, las 3 formas, verbos en frases (`type`, `typeGame`) | producir solo |
| 9 | Estudiar | tarjetas | sin nota |
| 10 | Parejas ocultas | Memory | solo XP |

Condiciones de juego, no modalidades: **examen** (sin pistas, con tiempo) y **ruta** (orden de las misiones).

## Decisiones del padre (20-nov, artefacto [Modalidades nuevas](https://claude.ai/artifact/FfjxVWGYQJwPv4fBk5y4F8))

| Modalidad | Decisión | Detalles |
|---|---|---|
| Escuchar y elegir | Adelante | |
| Dictado | Adelante con cambios | Se perdonan siempre mayúsculas y puntos. Las tildes las decide cada juego: en Inglés no existen, en Lengua de 5º cuentan |
| Detectar y reparar | Adelante | Encontrar y arreglar cuentan por separado |
| Crucigrama | Adelante | |
| Hueco con la primera letra | Adelante | |
| Responder con un número | Espera | Se construye con el primer temario de Matemáticas |
| Historia ramificada | Al motor | Mejor con imágenes o animación: comparar antes emojis mejorados y dibujos SVG animados |
| Construir una escena | Al motor | «Tiene que representar mucho mejor la escena»: misma comparación visual |
| Miniinvestigación (5º) | Al motor | |

**Orden:** primero las cinco sencillas en `motor-beta/`; mientras, la comparación visual de las escenas en el artefacto.

**Hechas en `motor-beta/` (20-nov)**, como tipos de paso de `runSteps`: `listen` (escucha y elige), `dictado`, `repair` (detecta y repara), `cross` (crucigrama) y `first` (primera letra). Ningún juego las usa todavía: se estrenan en el próximo temario. Las juega el verificador en `pruebas-motor/`. Para usarlas en un juego: `JUEGO.voz` (idioma de la voz, por defecto `en-GB`) y `JUEGO.tildesCuentan` (por defecto no). Los datos de cada paso están comentados en `motor-beta/motor.js`.

## Para hacer ya en el motor (antes del juego de 2º)

Primero se ven en maquetas jugables en un artefacto; después van a `motor-beta/`.

| Modalidad | Qué hace el niño | Tipo | Sobre todo para |
|---|---|---|---|
| Escuchar y elegir | Oye (voz del navegador, gratis) y elige lo que ha oído | reconocer | 2º, Inglés, Lengua |
| Dictado | Oye y escribe; puede repetir el audio | producir solo | Lengua, Inglés |
| Detectar y reparar | Toca la palabra mal y escribe la buena (*She enjoy* → *enjoys*) | detectar + producir | todas |
| Crucigrama | Cuadrícula pequeña con pistas | producir solo | vocabulario, verbos |
| Responder con un número | Teclado de números grande | producir solo | Matemáticas |
| Hueco con la primera letra | Escribe con pista (`t _ _ _ _ g`) | producir con apoyo | 2º, vocabulario |

## A evaluar con maquetas jugables

| Modalidad | Versión viable | Riesgo |
|---|---|---|
| Historia ramificada | Misión con historia de 4 a 6 decisiones; cada decisión es un ejercicio del temario; si falla, un desvío corto de repaso y vuelve al camino (las ramas se juntan) | decisiones de adorno que no exigen saber |
| Construir una escena | Cuadrícula con emojis: toca el objeto y luego la casilla (*the cat under the table*); casillas fijas, corrección fiable | que dependa de la habilidad con el dedo (por eso, casillas) |
| Miniinvestigación (5º) | Ficha visible de un personaje (gustos, agenda) y una pregunta («¿qué plan le propones?») | demasiada lectura |

## Para cuando un temario las pida

- **Generales:**
  - marcar palabras en un texto;
  - ordenar un diálogo o un proceso (también viñetas con emojis);
  - completar tablas;
  - escena con emojis (encontrar o etiquetar);
  - elegir y justificar;
  - clasificar con dos criterios (cajas en 2×2);
  - adivinanza con pistas;
  - diálogo corto con decisiones.
- **Con audio:**
  - bingo de escucha;
  - Memory con audio;
  - escucha y ordena;
  - escucha y toca en la escena;
  - dictado de números.
- **Matemáticas:**
  - colocar en la recta numérica;
  - contar grupos de emojis;
  - poner la hora en un reloj;
  - pagar con monedas;
  - cálculo en cadena.
- **Lengua:** separar en sílabas.
- **Ciencias o Sociales:** situar en un mapa o esquema.

## Descartadas (con el motivo, por si cambian las cosas)

| Modalidad | Motivo |
|---|---|
| Vídeo con pausas | Hay que producir vídeo y tiene derechos de uso |
| Grabación de voz | No se puede corregir bien de forma automática |
| Explicar a un personaje | Respuesta abierta: necesita que la corrija un adulto |
| Sopa de letras | Encontrar una palabra no demuestra saberla |
| Dominó de asociaciones | Es otra forma de unir con líneas |
| Imagen revelada por partes | Es lo mismo que la adivinanza con pistas |
| Repaso de mis fallos | Propuesta de Claude (repaso espaciado), no elegida el 20-nov; se puede reabrir |

## Del informe, lo que no se adopta

- Registrar cada intento con diez campos, el boletín de cuatro dimensiones y la arquitectura de seis capas. Es demasiado para una herramienta familiar; el motor común ya cubre lo razonable.
- La «nota prevista» validada estadísticamente: basta con apuntar la nota real del colegio y compararla.
