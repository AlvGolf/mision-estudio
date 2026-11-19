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

- **Inglés Unit 2**, encontrado por el verificador el 19-nov (sin arreglar a propósito: el examen es al día siguiente y el juego funciona):
  - Móvil (390 px), Cazaerrores: al deslizar la tarjeta, la página se ensancha unos 70 px y se puede mover de lado.
  - El cuadro «Trae tu progreso» tiene letra de 13 px: en el iPhone hace zoom al tocarlo.
  - Los campos de nombre no desactivan autocorrect, autocapitalize ni spellcheck.
  - Gramática sin la forma «escribir»: los adverbios (significado y posición), Would you like + to y las respuestas. Tiene test y ordenar.
- `ingles-u2/temario.json` se sacó del propio juego: hay que cotejarlo con las fotos del libro.

## Pendiente del padre

- Rellenar la lista de nombres prohibidos (`~/.claude/mision-estudio/nombres-prohibidos.txt`, en su PC).
- Confirmar «Lo esencial».
- Decidir qué hacer con lo «Abierto» de Inglés después del examen (o darlo por cerrado si ya no se va a usar).

## Para el segundo juego (decidido el 19-nov)

- Separar el motor común de los datos de cada juego.
- Skill «juego nuevo» con el flujo desde las fotos hasta la beta.
