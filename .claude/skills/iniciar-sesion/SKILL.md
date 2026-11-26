---
name: iniciar-sesion
description: "Apertura de sesión de Misión Estudio: baja los cambios, mira los turnos, cuenta el estado de lo esencial y lo pendiente, y espera a que el padre elija. Úsala al empezar a trabajar en este proyecto: '/iniciar-sesion', 'empezamos', 'seguimos con Misión Estudio', 'buenos días', o cualquier variante de inicio. Es la pareja de cerrar-sesion."
---

# Abrir sesión — Misión Estudio

Solo lectura: no cambies código ni hagas commits hasta que el padre elija qué hacer.

1. **Fecha y cambios.** Lee la fecha del sistema (nunca la deduzcas de la última sesión). `git pull`. Mira `git log --oneline -8` para ver lo que subió el Claude de la app desde la última vez.
2. **Turnos.** Lee `TRABAJO.md`. Si el otro Claude tiene un juego cogido, dilo: ese juego no se toca.
3. **Lo esencial primero.** Lee `ESTADO.md` y cuenta el estado de «Lo esencial» antes que nada; luego «Abierto» y «Pendiente del padre».
3b. **Su TO DO** (`M.ESTUDIO TO DO.md`, en la raíz y fuera de git; el padre, 20-nov: ahí deja notas para la sesión siguiente). Compáralo con lo leído la última vez: `git diff --no-index -- .claude/todo-visto.md "M.ESTUDIO TO DO.md"` (si no existe la copia, todo es nuevo). Lleva al resumen solo lo nuevo o cambiado y, de cada punto, di si ya está hecho (con su commit) o en qué punto del plan de `ESTADO.md` entraría, y si es esencial o extra. No apuntes nada todavía: lo decide él. Si algo trae nombres de niños o del colegio, no lo copies tal cual a ningún archivo del repo.
4. **Fechas.** Si hay un examen en los próximos 3 días (campo `examen` de cada `<juego>/temario.json`), dilo arriba del todo.
4b. **Encargos de MAAT para Claude Code** (26 nov, `Documents\JARVIS\docs\agenda-automatica.md`): el hook de inicio ya mete en el contexto los encargos activos de este proyecto (cola en la bóveda de MAAT, `memoria
otas\Encargos a Code`). Lanza además en segundo plano (Bash con `run_in_background`) `node C:/Users/alvar/Documents/JARVIS/jarvis-adewaskar/scripts/oir-encargos-code.mjs --hasta-aviso`: no dice nada mientras no hay nada y termina con el primer aviso de MAAT (encargo nuevo, su sí por voz, un cambio que pide), que te llega al acabar; atiéndelo y vuelve a lanzarla. Nunca un `Monitor` (caduca a los 30 min y despierta sin nada; su decisión del 26 nov). Si hay uno activo de este proyecto, va en el resumen con su estado. El ciclo, de uno en uno: «nuevo» → preguntarle lo que falte (ronda corta, con las respuestas recomendadas) → el plan en la nota y `estado: plan` → su sí (aquí o por voz) → construir, probar, git → `estado: construido`. Nada se construye sin su sí.
5. **Propuesta.** Termina con una propuesta corta: lo esencial abierto primero. Si lo que él suele pedir es extra, dilo en una frase.

El 🔊 final: cómo está lo esencial, qué ha subido el otro Claude, lo nuevo de su TO DO si lo hay y una pregunta que se pueda contestar hablando.
