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
| Juego de 2º | ⚪ sin empezar | Sin examen a la vista: el padre mandará temario la semana del 23-nov. Hasta entonces, tampoco hay examen nuevo de 5º: tiempo para mejorar la app |

## Abierto

- **Motor común en beta (19-nov).** `motor-beta/` y `ingles-u2-beta/` (solo datos y misiones). Verificador sin fallos y 32 pantallas idénticas a la normal. Se pasa a la normal **después del examen del 20-nov**, cuando el padre lo apruebe: copiar `motor-beta/` a `motor/` y la beta a `ingles-u2/` cambiando los enlaces.
- Siguiente: aspecto visual del motor, con un artefacto de opciones (el padre pidió que puede cambiar el aspecto de Inglés).
- (`ingles-u2/temario.json` se sacó del propio juego y el padre decidió no cotejarlo.)

## Pendiente del padre

- Nada pendiente. (19-nov: el nombre de la marca de prueba sigue en el commit antiguo 32d677d; el padre decidió dejarlo así.)

## Para el segundo juego (decidido el 19-nov)

- ~~Separar el motor común de los datos de cada juego.~~ Hecho en beta el 19-nov.
- Skill «juego nuevo» con el flujo desde las fotos hasta la beta.
