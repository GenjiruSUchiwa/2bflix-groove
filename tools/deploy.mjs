// Publie dist/groove.injector.js dans le plugin JavaScript Injector (sans redémarrer Jellyfin).
// JELLYFIN_URL=https://… JELLYFIN_API_KEY=… node tools/deploy.mjs [--remove]
// La configuration précédente est sauvegardée dans dist/backup-jsinjector-<date>.json.
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const { JELLYFIN_URL: url, JELLYFIN_API_KEY: key } = process.env;
if (!url || !key) { console.error('Définissez JELLYFIN_URL et JELLYFIN_API_KEY.'); process.exit(1); }
const remove = process.argv.includes('--remove');
const H = { Authorization: `MediaBrowser Token="${key}"`, 'Content-Type': 'application/json' };
const plugins = await (await fetch(`${url}/Plugins`, { headers: H })).json();
const plugin = plugins.find(p => p.Name === 'JavaScript Injector' && p.Status === 'Active');
if (!plugin) { console.error('Plugin JavaScript Injector introuvable ou inactif.'); process.exit(1); }
const cfg = await (await fetch(`${url}/Plugins/${plugin.Id}/Configuration`, { headers: H })).json();
writeFileSync(`${root}dist/backup-jsinjector-${new Date().toISOString().replace(/[:.]/g, '-')}.json`, JSON.stringify(cfg, null, 2));
cfg.CustomJavaScripts = cfg.CustomJavaScripts.filter(s => s.Name !== '2BFlix Groove');
if (!remove) cfg.CustomJavaScripts.push({ Name: '2BFlix Groove', Script: readFileSync(`${root}dist/groove.injector.js`, 'utf8'), Enabled: true, RequiresAuthentication: true });
const r = await fetch(`${url}/Plugins/${plugin.Id}/Configuration`, { method: 'POST', headers: H, body: JSON.stringify(cfg) });
if (!r.ok) { console.error(`Échec : ${r.status}`); process.exit(1); }
console.log(remove ? 'Groove retiré de JavaScript Injector.' : 'Groove publié. Rechargez Jellyfin dans le navigateur.');
