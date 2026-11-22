/* Los menús de la suite: uno por enlace y por curso (el padre, 22-nov: los de 5º solo ven 5º y los de 2º solo 2º).
   Todos salen de una sola plantilla, scripts/menu.html, para que no se separen. Para cambiar el menú se cambia la plantilla y:
     npm run menus              → escribe cada menú
     npm run menus -- --comprobar → solo dice si alguno no está al día (lo usa el verificador)
   Cada menú: su carpeta, su curso, dónde guarda el nombre y el curso elegido, su manifiesto (app con su icono y su nombre)
   y las betas que abre en lugar del juego normal. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const MENUS = [
  /* 5º: el enlace de siempre (la raíz). Para probar un cambio grande del menú: una entrada igual con dir 'menu-beta' y '../' en las rutas */
  { dir: '', curso: 5, nombre: 'mision_name', cursoK: 'mision_curso', manifest: 'manifest.webmanifest', icono: 'iconos/apple-touch-icon.png', titulo: 'Misión Estudio 5', betas: {} },
  /* 2º: su propio enlace, su app (el cohete del libro) y su propio nombre en la tablet */
  { dir: 'segundo', curso: 2, nombre: 'mision_name_2', cursoK: 'mision_curso_2', manifest: 'manifest.webmanifest', icono: '../iconos/cohete/apple-touch-icon.png', titulo: 'Misión Estudio 2', betas: {} },
];

export function pinta(m) {
  const raiz = m.dir ? '../' : '';
  const suite = JSON.stringify({ curso: m.curso, nombre: m.nombre, cursoK: m.cursoK }).replace(/"/g, "'");
  const betas = JSON.stringify(m.betas).replace(/"/g, "'");
  return fs.readFileSync(path.join(RAIZ, 'scripts', 'menu.html'), 'utf8')
    .replaceAll('{{RAIZ}}', raiz).replaceAll('{{MANIFEST}}', m.manifest).replaceAll('{{ICONO}}', m.icono)
    .replaceAll('{{TITULO_APP}}', m.titulo).replaceAll('{{SUITE}}', suite).replaceAll('{{BETAS}}', betas);
}

export const destino = m => path.join(RAIZ, m.dir, 'index.html');

/* Los menús que no están al día con la plantilla */
export const atrasados = () => MENUS.filter(m => !fs.existsSync(destino(m)) || fs.readFileSync(destino(m), 'utf8') !== pinta(m));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--comprobar')) {
    const a = atrasados();
    if (a.length) { console.log('Menús sin poner al día con scripts/menu.html: ' + a.map(m => m.dir || '(raíz)').join(', ') + '. Ejecuta npm run menus.'); process.exit(1); }
    console.log('Menús al día.');
  } else {
    for (const m of MENUS) { fs.mkdirSync(path.dirname(destino(m)), { recursive: true }); fs.writeFileSync(destino(m), pinta(m)); console.log('Escrito ' + path.relative(RAIZ, destino(m))); }
  }
}
