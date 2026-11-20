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
| Historia ramificada | Al motor | Con el aspecto de las escenas (abajo) |
| Construir una escena | Al motor | «Tiene que representar mucho mejor la escena»: de ahí salió el aspecto (abajo) |
| Miniinvestigación (5º) | Al motor | |

**Aspecto de las escenas (20-nov, tres rondas en el mismo artefacto):** dibujo SVG animado (no emojis); personajes de cómic con contorno, con proporciones de niño (no cabeza enorme: la primera versión recordaba a South Park); fondo con montañas en capas, colinas con contorno y un camino, **al atardecer por defecto**, con luz `dia` o `noche` cuando una historia lo pida. Los sitios dibujados viven en una **biblioteca del motor** y cada juego los elige por nombre.

**Orden:** primero las cinco sencillas en `motor-beta/` (hecho); después escena, historia y miniinvestigación, en ese orden. Las tres cuentan para la nota, solo la primera respuesta.

**Construir una escena, hecha en el motor (20-nov; en `motor/` desde el mismo día)** como paso `scene`: `{sitios:[{k, l}], gente:[{n, t, z, ropa?, pelo?, piel?, pein?, extra?}], luz?, q?}`.
- Sitios de la biblioteca (`ESC_SITIOS`): `cocina`, `teatro`, `campamento` y `campo`; de 2 a 4 por escena. Un sitio nuevo se dibuja una vez en el motor y sirve para todos los juegos.
- Personajes (`escPersona`): peinado `corto`, `coleta`, `rizos` o `melena`; objeto `gorro`, `mochila`, `mascara`, `camara`, `libro` o `balon`. Sin colores, toma unos por defecto: conviene darlos, para que pelo y nombre encajen.
- Para que el último no salga por descarte: más sitios que personas, o dos personas en el mismo sitio.
- Se toca, no se arrastra. Cuenta cada persona a la primera.

**Historia ramificada, hecha en el motor (20-nov; en `motor/` desde el mismo día)** como paso `story`: `{titulo?, sitios, luz?, reparto:[{n, aspecto…}], fin, nodos:[{relato, donde:{nombre: sitio}, luz?, q, opts+a | acc+show, repaso, bien?}]}`.
- La escena se queda arriba; entre decisiones los personajes caminan al sitio de `donde` (el que no sale, se esconde). Un nodo con otra `luz` cambia la hora (por ejemplo, la última decisión por la noche).
- Cada decisión es un ejercicio del temario: test (`opts`) o escrita sin opciones (`acc`). Al fallar, repaso corto y otra oportunidad, que ya no puntúa; al segundo fallo enseña la respuesta y la historia sigue. Las ramas se juntan siempre.
- Cuenta cada decisión a la primera. El verificador prueba en cada historia los tres caminos (a la primera, con repaso y con dos fallos).

**Miniinvestigación, hecha en el motor (20-nov; en `motor/` desde el mismo día)** como paso `probe`: `{quien:{n, aspecto…}, ficha:[[icono, texto]], agenda?:[[día, texto]], agendaT?, q, opts, a, ex?, sitios?, planes?:{opción: sitio}, luz?}`.
- Ficha de gustos y agenda del personaje, con su retrato; una pregunta de test por paso (varios pasos pueden compartir la misma ficha).
- Con `sitios` y `planes`, al elegir el personaje camina al sitio del plan elegido: salta si encaja y tiembla si no.
- Cuenta a la primera, como un test. Riesgo que vigilar: demasiada lectura (ficha corta, de 3 a 5 líneas).

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
| Historia ramificada | Hecha (paso `story`): de 4 a 6 decisiones con la escena animada; si falla, repaso corto y vuelve al camino | decisiones de adorno que no exigen saber |
| Construir una escena | Hecha (paso `scene`): lee la frase de cada persona y la lleva a su sitio en la escena dibujada | que el dibujo delate el sitio sin leer; que dependa del dedo (por eso se toca) |
| Miniinvestigación (5º) | Hecha (paso `probe`): ficha y agenda de un personaje y una pregunta («¿qué plan le propones?») | demasiada lectura |

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
