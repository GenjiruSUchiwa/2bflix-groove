// Assemble le script à coller dans JavaScript Injector : CSS embarqué + liste des comptes + groove.js.
// node tools/build.mjs [idUtilisateur…]   (sans argument : thème pour tout le monde)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const users = process.argv.slice(2);
const css = readFileSync(`${root}theme/groove.css`, 'utf8');
const js = readFileSync(`${root}theme/groove.js`, 'utf8');
mkdirSync(`${root}dist`, { recursive: true });
const out = `/* 2BFlix Groove — version assemblée, générée par tools/build.mjs. Ne pas modifier à la main. */\nwindow.__GROOVE_USERS = ${JSON.stringify(users)};\nwindow.__GROOVE_CSS = ${JSON.stringify(css)};\n${js}`;
writeFileSync(`${root}dist/groove.injector.js`, out);
console.log(`dist/groove.injector.js : ${(out.length / 1024).toFixed(1)} Ko, comptes : ${users.length ? users.join(', ') : 'tous'}`);
