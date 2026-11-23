/**
 * Ranking de los juegos de estudio (Misión).
 * Guarda las marcas en la pestaña "Marcas" de esta hoja de Google.
 * Para borrar una marca: borra su fila en la hoja.
 */
const SHEET = 'Marcas';
// 23-nov: «vuelta» (plan hasta el examen). En la hoja que ya existe hay que escribir «vuelta» a mano en la celda J1.
const COLS = ['fecha', 'juego', 'nombre', 'nota', 'examen', 'xp', 'estrellas', 'racha', 'desglose', 'vuelta'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET);
  if (!s) {
    s = ss.insertSheet(SHEET);
    s.appendRow(COLS);
    s.setFrozenRows(1);
  }
  return s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function num_(v, min, max) {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(v);
  if (!isFinite(n) || n < min || n > max) throw new Error('valor fuera de rango');
  return Math.round(n * 10) / 10;
}

/** La página manda una marca. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    const juego = String(d.juego || '').replace(/[^a-z0-9-]/gi, '').slice(0, 30);
    const nombre = String(d.nombre || '').replace(/[<>]/g, '').trim().slice(0, 20);
    if (!juego || !nombre) throw new Error('faltan datos');
    const desglose = String(d.desglose || '').replace(/[^0-3]/g, '').slice(0, 20);
    sheet_().appendRow([
      new Date().toISOString(), juego, nombre,
      num_(d.nota, 0, 10), num_(d.examen, 0, 10),
      num_(d.xp, 0, 100000), num_(d.estrellas, 0, 60), num_(d.racha, 0, 1000),
      "'" + desglose,
      num_(d.vuelta || 1, 1, 99)
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

/** La página pide el ranking de un juego. */
function doGet(e) {
  const juego = String((e.parameter && e.parameter.juego) || '');
  const values = sheet_().getDataRange().getValues();
  const head = values.shift();
  const rows = values
    .map(r => Object.fromEntries(head.map((h, i) => [h, r[i] instanceof Date ? r[i].toISOString() : r[i]])))
    .filter(r => !juego || r.juego === juego);
  return json_({ ok: true, rows: rows });
}
