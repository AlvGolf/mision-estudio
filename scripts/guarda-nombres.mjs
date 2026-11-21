// Guarda de privacidad: este repositorio es PÚBLICO.
// No deja subir (git push) nada que contenga un nombre de la lista privada, ni fotos o PDF del temario.
//
// La lista NO está en el repo: vive en ~/.claude/mision-estudio/nombres-prohibidos.txt
// (un nombre o palabra por línea; las líneas con # se ignoran). Da igual mayúsculas o tildes.
//
//   Lo llama solo el gancho .githooks/pre-push (activar una vez: git config core.hooksPath .githooks)
//   node scripts/guarda-nombres.mjs --todo   → revisa ahora todos los archivos del repo

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const LISTA = process.env.MISION_NOMBRES || path.join(os.homedir(), '.claude', 'mision-estudio', 'nombres-prohibidos.txt');
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const plano = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const TODO = process.argv.includes('--todo');
// pre-push: por stdin llega «ref_local sha_local ref_remota sha_remota» por cada rama
const entrada = TODO ? '' : fs.readFileSync(0, 'utf8').trim();
const commitsNuevos = () => entrada.split(/\r?\n/).filter(Boolean).flatMap(linea => {
  const [, local] = linea.split(' ');
  return /^0+$/.test(local) ? [] : git('rev-list', local, '--not', '--remotes').split(/\s+/).filter(Boolean); // 0000…: borrar una rama remota
});

// Guarda del temario (el padre, 21-nov): ni fotos, ni escaneos, ni PDF, ni nada de las carpetas de curso (5º PRIM/…).
// Mira cada commit que se sube, no solo la versión final: un archivo añadido y luego borrado también queda publicado.
const TEMARIO = /(^|\/)[^/]*PRIM\/|\.(jpe?g|heic|heif|pdf|tiff?)$/i;
const prohibidos = TODO
  ? git('ls-files', '-z').split('\0').filter(f => TEMARIO.test(f))
  : commitsNuevos().flatMap(c => git('show', '--format=', '--name-only', '--diff-filter=AMR', '-z', c).split('\0').filter(f => f && TEMARIO.test(f)).map(f => `${f} (commit ${c.slice(0, 7)})`));
if (prohibidos.length) {
  console.error('\n⛔ Guarda del temario: NO se sube. El repositorio es público y el temario (fotos, escaneos, PDF) se queda en el PC:\n');
  [...new Set(prohibidos)].slice(0, 40).forEach(h => console.error('   ' + h));
  console.error('\nSácalo del commit (git rm --cached) y rehaz los commits que lo tengan antes de volver a subir.\n');
  process.exit(1);
}
console.error('✓ Guarda del temario: ninguna foto ni PDF.');

const nombres = fs.existsSync(LISTA)
  ? fs.readFileSync(LISTA, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  : [];
if (!nombres.length) {
  console.error(`⚠️  Guarda de nombres: la lista está vacía o no existe (${LISTA}). No se ha revisado nada.`);
  process.exit(0);
}
const reglas = nombres.map(n => ({ n, re: new RegExp(`(?<![\\p{L}\\p{N}])${plano(n).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'u') }));
const hallazgos = [];
const revisar = (texto, donde) => {
  const lineas = texto.split(/\r?\n/);
  lineas.forEach((l, i) => { const p = plano(l); for (const r of reglas) if (r.re.test(p)) hallazgos.push(`${donde}${lineas.length > 1 ? ':' + (i + 1) : ''} → «${r.n}»`); });
};

if (TODO) {
  for (const f of git('ls-files', '-z').split('\0').filter(Boolean)) {
    const buf = fs.readFileSync(f);
    if (buf.includes(0)) continue; // binario
    revisar(buf.toString('utf8'), f);
  }
} else {
  {
    for (const c of commitsNuevos()) {
      // Solo el mensaje: el autor (nombre y correo de git) ya es público en todos los commits.
      revisar(git('log', '-1', '--format=%B', c), `mensaje del commit ${c.slice(0, 7)}`);
      const parche = git('show', '--format=', '--unified=0', '--no-color', c);
      let archivo = '';
      for (const l of parche.split(/\r?\n/)) {
        if (l.startsWith('+++ ')) archivo = l.slice(6);
        else if (l.startsWith('+') && !l.startsWith('+++')) revisar(l.slice(1), `${archivo} (commit ${c.slice(0, 7)})`);
      }
    }
  }
}

if (hallazgos.length) {
  console.error('\n⛔ Guarda de nombres: NO se sube. El repositorio es público y aparece un nombre de la lista privada:\n');
  [...new Set(hallazgos)].slice(0, 40).forEach(h => console.error('   ' + h));
  console.error('\nQuítalo y rehaz el commit (git commit --amend o git rebase) antes de volver a subir.\n');
  process.exit(1);
}
console.error(`✓ Guarda de nombres: ${nombres.length} nombres revisados, ninguno aparece.`);
