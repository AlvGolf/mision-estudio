# Turnos: quién está trabajando en qué

Claude Code y el Claude de la app trabajan en el mismo repositorio. Este archivo evita que se pisen.

> **21-nov: historial reescrito** para quitar unas fotos que se subieron por error. Si tienes una copia anterior al commit 5849c18, no la mezcles: bájate el proyecto de nuevo (o `git fetch` y `git reset --hard origin/main`).

**Cómo se usa**
1. Al empezar: `git pull` y mira la tabla. Si el juego que vas a tocar tiene a otro, **no lo toques**: elige otra cosa o avisa al padre.
2. Si está libre: añade tu fila, haz commit («Turno: Claude Code con ingles-u2») y `git push` **antes** de cambiar nada.
3. Al terminar: borra tu fila en el mismo commit que sube tu trabajo.
4. Una fila de más de 2 días sin commits del mismo autor se considera abandonada: pregunta al padre antes de quitarla.

| Juego (carpeta) | Quién | Desde | Qué está haciendo |
|---|---|---|---|
| motor, mates-u3, mates-u3-beta, juegos.js | Claude Code | 21-nov | Paso a producción del motor nuevo y de Mates Unidad 3 (aprobado por el padre) |
