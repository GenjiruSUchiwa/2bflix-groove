// Génère mockup/icons.js : sprite Heroicons Micro (16 px), solid, version 2.2.0.
import { writeFileSync } from 'node:fs';
const OUT = process.argv[2];
const NAMES = 'heart film tv squares-2x2 users magnifying-glass play pause plus check check-circle x-mark chevron-left chevron-right chevron-down chevron-up ellipsis-vertical ellipsis-horizontal star language clock calendar calendar-days arrows-right-left arrow-path adjustments-horizontal bars-arrow-down funnel list-bullet queue-list rectangle-stack user user-circle cog-6-tooth arrow-right-start-on-rectangle video-camera signal bell home building-library information-circle arrow-uturn-left arrow-uturn-right forward backward speaker-wave speaker-x-mark chat-bubble-bottom-center-text arrows-pointing-out arrows-pointing-in window lock-closed pencil-square trash arrow-down-tray link globe-alt bars-3 eye eye-slash table-cells chart-bar sparkles fire squares-plus scissors photo musical-note sun moon computer-desktop device-phone-mobile key qr-code shield-check server-stack forward-step backward-step rewind'.split(' ');
const out = {}, missing = [];
for (const n of NAMES) {
  const r = await fetch(`https://cdn.jsdelivr.net/npm/heroicons@2.2.0/16/solid/${n}.svg`);
  if (!r.ok) { missing.push(n); continue; }
  const t = await r.text();
  out[n] = t.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s*\n\s*/g, '').replace(/ (fill|aria-hidden|data-slot)="[^"]*"/g, '');
}
const sprite = Object.entries(out).map(([n, p]) => `<symbol id="i-${n}" viewBox="0 0 16 16">${p}</symbol>`).join('');
writeFileSync(OUT, `/* Heroicons Micro 2.2.0 (MIT) — sprite injecté au chargement. */\ndocument.body.insertAdjacentHTML('afterbegin', ${JSON.stringify(`<svg hidden>${sprite}</svg>`)});\n`);
console.log('ok', Object.keys(out).length, 'missing:', missing.join(', ') || '-');
