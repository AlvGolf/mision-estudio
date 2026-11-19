# Estado de Misión Estudio

Se actualiza al cerrar cada sesión. Lo esencial manda sobre lo demás: lo extra espera mientras quede algo esencial abierto, salvo que el padre lo pida.

## Lo esencial

> Borrador del 19-nov-2026, pendiente de confirmar con el padre.

| Pieza | Estado | Nota |
|---|---|---|
| Menú con una tarjeta por juego | ✅ hecho | `index.html` |
| Inglés Unit 2 (5º) | ✅ en producción | Examen el 20-nov-2026. Ver «Abierto» |
| Ranking compartido de la clase | ✅ hecho | Apps Script; copia en `apps-script/Code.gs` |
| Pruebas automáticas (`npm run verificar`) | ✅ hecho | Ruta entera a 390/820/1440 px, cobertura y examen |
| Guarda de nombres antes de subir | 🟡 montada | Falta que el padre rellene la lista privada |
| Turnos entre los dos Claudes (`TRABAJO.md`) | ✅ hecho | |
| Juego de 2º | ⚪ sin empezar | Falta el temario (fotos) |

## Abierto

- **Inglés Unit 2: arreglos en la beta, esperando el visto bueno del padre** (19-nov, verificador sin fallos en 390/820/1440). Prueba: https://alvgolf.github.io/mision-estudio/ingles-u2-beta/
  - Cazaerrores en el móvil: la tarjeta ya no ensancha la página al deslizarla.
  - «Trae tu progreso»: letra de 20 px (antes 13: el iPhone hacía zoom).
  - Corrector apagado en los campos de nombre y de código.
  - Gramática escrita: nuevo ejercicio «escribe la respuesta». En Adverbios, uno del adverbio y otro de la frase con el adverbio en su sitio; en Do you like / Would you like, uno de «to + verbo» y otro de las respuestas del libro. Los 36 posibles comprobados uno a uno.
  - Al aprobar: copiar `ingles-u2-beta/index.html` y `temario.json` a `ingles-u2/` y volver a poner la redirección en la beta.
- `ingles-u2/temario.json` se sacó del propio juego: hay que cotejarlo con las fotos del libro.

## Pendiente del padre

- Rellenar la lista de nombres prohibidos (`~/.claude/mision-estudio/nombres-prohibidos.txt`, en su PC).
- Confirmar «Lo esencial».
- Probar la beta de Inglés y aprobar (o no) que pase a la versión normal.

## Para el segundo juego (decidido el 19-nov)

- Separar el motor común de los datos de cada juego.
- Skill «juego nuevo» con el flujo desde las fotos hasta la beta.
