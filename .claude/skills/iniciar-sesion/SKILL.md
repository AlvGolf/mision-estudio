---
name: iniciar-sesion
description: "Apertura de sesión de Misión Estudio: baja los cambios, mira los turnos, cuenta el estado de lo esencial y lo pendiente, y espera a que el padre elija. Úsala al empezar a trabajar en este proyecto: '/iniciar-sesion', 'empezamos', 'seguimos con Misión Estudio', 'buenos días', o cualquier variante de inicio. Es la pareja de cerrar-sesion."
---

# Abrir sesión — Misión Estudio

Solo lectura: no cambies código ni hagas commits hasta que el padre elija qué hacer.

1. **Fecha y cambios.** Lee la fecha del sistema (nunca la deduzcas de la última sesión). `git pull`. Mira `git log --oneline -8` para ver lo que subió el Claude de la app desde la última vez.
2. **Turnos.** Lee `TRABAJO.md`. Si el otro Claude tiene un juego cogido, dilo: ese juego no se toca.
3. **Lo esencial primero.** Lee `ESTADO.md` y cuenta el estado de «Lo esencial» antes que nada; luego «Abierto» y «Pendiente del padre».
4. **Fechas.** Si hay un examen en los próximos 3 días (campo `examen` de cada `<juego>/temario.json`), dilo arriba del todo.
5. **Propuesta.** Termina con una propuesta corta: lo esencial abierto primero. Si lo que él suele pedir es extra, dilo en una frase.

El 🔊 final: cómo está lo esencial, qué ha subido el otro Claude y una pregunta que se pueda contestar hablando.
