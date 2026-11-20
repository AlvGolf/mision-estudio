---
name: cerrar-sesion
description: "Cierre de sesión de Misión Estudio para no perder nada: verificación de los juegos tocados, ESTADO.md al día, turno liberado, memoria de lecciones, catálogo de artefactos y subida. Úsala cuando el padre diga 'cerramos', 'vamos a cerrar', 'hasta mañana', 'lo dejamos aquí', '/cerrar-sesion' o cualquier variante de fin de sesión."
---

# Cerrar sesión — Misión Estudio

1. **Verificar.** Si en la sesión se tocó algún juego: `npm run verificar -- <juego>` (o sin argumento, todos). Con un FALLO no se sube: se arregla o se le cuenta al padre.
2. **ESTADO.md.** Pon al día «Lo esencial» (estado de cada pieza), «Abierto» y «Pendiente del padre». Lo cerrado sale de «Abierto»; nada se pierde por estar «para más adelante»: o queda escrito o el padre lo descarta.
2b. **Su TO DO** (`M.ESTUDIO TO DO.md`, fuera de git). Vuelve a compararlo con `.claude/todo-visto.md` (puede haber escrito durante la sesión). Lo que él decidió hoy queda apuntado en el plan de `ESTADO.md` (sin nombres de niños ni del colegio); lo que no decidió se le recuerda en el resumen. Al final, guarda lo leído: `cp "M.ESTUDIO TO DO.md" .claude/todo-visto.md`. El TO DO no se edita: es suyo.
3. **Turno.** Borra tu fila de `TRABAJO.md`.
4. **Memoria.** Solo lecciones nuevas (correcciones del padre, cosas que no se deducen del código): un archivo por lección en la memoria de Claude Code de este proyecto y su línea en `MEMORY.md`. No repitas lo que ya dicen el repo o `git log`.
5. **Catálogo de artefactos.** Si en la sesión se creó o cambió algún artefacto, un solo lote de ArtifactData al catálogo, proyecto «Misión Estudio» (proyecto propio, un tema por juego).
   - **Los que faltan de otras sesiones** (el padre, 20 nov 2026: cuatro de Misión Estudio no estaban en el catálogo, y creía que el cierre los recogía): comparar la lista entera de sus artefactos (Artifact `list`, límite 200) con el catálogo (su copia del PC, `C:\Users\alvar\Documents\JARVIS\artefactos\catalogo.json`). Los que falten se le **enumeran** (título, proyecto y fecha) y él dice cuáles entran: no todos (ese día, los de Empleo no). Los que diga, en el mismo lote, cada uno con el proyecto al que pertenece.
   - **La copia del PC**, para que esa comparación no dé falsos: tras el lote, guardar esas mismas filas (con su `doc_id`) como JSON en `C:\Users\alvar\Documents\JARVIS\artefactos\filas\lote-AAAA-MM-DD-HHMM.json` y ejecutar `node C:\Users\alvar\Documents\JARVIS\jarvis-adewaskar\scripts\catalogo-local.mjs <ese archivo>`; su línea de salida va al resumen.
6. **Subir.** Commit en español, corto, que diga qué cambia para el niño. `git push` (el gancho revisa los nombres). Si la orden de cerrar llegó por voz, repite antes lo que vas a subir y espera un «sí».
7. **Resumen.** Qué se hizo, qué queda y qué le toca a él. El 🔊 final, en dos o tres frases.
