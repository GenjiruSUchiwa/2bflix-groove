/* 2BFlix Groove — cœur : données au format Jellyfin, état utilisateur, routeur, coque (barre du haut, médiathèques, onglets), composants. */

/* ========== Utilitaires ========== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const ic = (n, c = '') => `<svg class="size-4 shrink-0 fill-current ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const TT = '<span class="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden" aria-hidden="true"></span>';
const hash = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7) >>> 0;
const plural = (n, one, many = one + 's') => `${n.toLocaleString('fr-FR')} ${n > 1 ? many : one}`;
const fmtMin = m => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`);
const fmtTime = t => { t = Math.max(0, Math.floor(t)); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`; };
const fmtClock = d => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso, opts = { day: 'numeric', month: 'long', year: 'numeric' }) => iso ? new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('fr-FR', opts) : '';
const TODAY = new Date().toISOString().slice(0, 10);
const endsAt = remainingSec => `Se termine à ${fmtClock(new Date(Date.now() + remainingSec * 1000))}`;
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ========== Données (format proche de l'API Jellyfin) ========== */
const LIBS = [
  ['films', 'FILMS', 'movies'], ['anim', "FILMS D'ANIMATION", 'movies'], ['sex', 'SEX APPEAL', 'movies'],
  ['amazon', 'AMAZON', 'tvshows'], ['appletv', 'APPLE TV+', 'tvshows'], ['crunchy', 'CRUNCHYROLL / ADN', 'tvshows'],
  ['disney', 'DISNEY+', 'tvshows'], ['kids', 'ENFANTS', 'tvshows'], ['hbo', 'HBO MAX', 'tvshows'],
  ['netflix', 'NETFLIX', 'tvshows'], ['ocs', 'OCS / PARAMOUNT+ / HBO', 'tvshows'], ['viki', 'VIKI DRAMA', 'tvshows'],
].map(([key, name, kind]) => ({ id: `lib-${key}`, key, Type: 'CollectionFolder', name, kind, items: [] }));

const SHOW_FR = {
  'Stranger Things': ['Stranger Things', "À Hawkins, en 1983, la disparition d'un garçon révèle des expériences secrètes, des forces surnaturelles et une fillette aux pouvoirs étranges."],
  'Squid Game': ['Squid Game', "Criblés de dettes, 456 joueurs acceptent de participer à des jeux d'enfants à l'issue mortelle, avec une fortune à la clé."],
  'Lupin': ['Lupin', "Inspiré par Arsène Lupin, Assane Diop entreprend de venger son père, accusé à tort d'un vol par une riche famille."],
  'Arcane: League of Legends': ['Arcane', "Dans les villes jumelles de Piltover et Zaun, deux sœurs se retrouvent dans des camps opposés d'une guerre entre technologie magique et révolte."],
  'Dark': ['Dark', "Dans une petite ville allemande, la disparition de deux enfants révèle les secrets de quatre familles liées par le voyage dans le temps."],
  'Wednesday': ['Mercredi', "Mercredi Addams enquête sur une série de meurtres tout en s'adaptant à sa nouvelle école, l'académie Nevermore."],
  'Severance': ['Severance', "Les employés de Lumon ont accepté une opération qui sépare leurs souvenirs de travail de leur vie privée. Mark découvre ce que cache l'entreprise."],
  'Slow Horses': ['Slow Horses', "Relégués à l'Étable, le service où le MI5 range ses agents en disgrâce, des espions ratés se retrouvent mêlés à des affaires bien réelles."],
  'Ted Lasso': ['Ted Lasso', "Un entraîneur de football américain, sans aucune expérience du football, est engagé pour diriger un club anglais en difficulté."],
  'The Boys': ['The Boys', "Dans un monde où les super-héros sont des célébrités corrompues, un groupe de justiciers décide de les faire tomber."],
  'Reacher': ['Reacher', "Ancien enquêteur de la police militaire, Jack Reacher est arrêté pour meurtre dans une petite ville de Géorgie et met au jour un complot."],
  'Fallout': ['Fallout', "Deux cents ans après l'apocalypse, une habitante d'un abri antiatomique découvre la surface de Los Angeles, peuplée de survivants et de goules."],
  'Shōgun': ['Shōgun', "Japon, 1600. Un navigateur anglais échoue sur les côtes et se retrouve mêlé à la lutte pour le pouvoir du seigneur Toranaga."],
  'The Bear': ['The Bear', "Jeune chef de la haute gastronomie, Carmy revient à Chicago reprendre la sandwicherie familiale après la mort de son frère."],
  'Andor': ['Andor', "Cassian Andor, voleur sans cause, devient peu à peu un pilier de la Rébellion contre l'Empire."],
  'The Mandalorian': ['The Mandalorian', "Après la chute de l'Empire, un chasseur de primes mandalorien prend sous sa protection un mystérieux enfant."],
  'The Last of Us': ['The Last of Us', "Vingt ans après l'effondrement de la civilisation, Joel doit faire traverser les États-Unis à Ellie, une adolescente immunisée."],
  'House of the Dragon': ['House of the Dragon', "Deux siècles avant Game of Thrones, la maison Targaryen se déchire autour de la succession au Trône de fer."],
  'Succession': ['Succession', "Les quatre enfants de Logan Roy se disputent le contrôle de l'empire médiatique familial."],
  'The Penguin': ['The Penguin', "Après les événements de The Batman, Oz Cobb tente de prendre le contrôle de la pègre de Gotham."],
  "Frieren: Beyond Journey's End": ['Frieren', "Après avoir vaincu le roi des démons, l'elfe Frieren entreprend un voyage pour comprendre les humains qu'elle a accompagnés."],
  'Attack on Titan': ["L'Attaque des Titans", "L'humanité survit derrière d'immenses murs pour se protéger des Titans. Quand le mur tombe, Eren jure de les exterminer."],
  'Solo Leveling': ['Solo Leveling', "Chasseur de rang E, le plus faible de tous, Sung Jinwoo obtient un pouvoir mystérieux qui lui permet de progresser sans limite."],
  'Bluey': ['Bluey', "Bluey, une petite chienne bouvier australien, transforme le quotidien de sa famille en jeux inventifs."],
  'Avatar: The Last Airbender': ["Avatar, le dernier maître de l'air", "Aang, dernier maître de l'air, doit maîtriser les quatre éléments pour mettre fin à la guerre menée par la Nation du Feu."],
  'Yellowstone': ['Yellowstone', "John Dutton défend le plus grand ranch du Montana contre les promoteurs, la réserve voisine et le parc national."],
  'Tulsa King': ['Tulsa King', "Libéré après 25 ans de prison, un capo de la mafia new-yorkaise est envoyé à Tulsa pour y bâtir un nouvel empire."],
  'Game of Thrones': ['Game of Thrones', "Neuf familles nobles se disputent le contrôle des Sept Couronnes de Westeros, tandis qu'une ancienne menace revient du Nord."],
  'Business Proposal': ['Business Proposal', "Pour rendre service à une amie, Ha-ri se rend à un rendez-vous arrangé à sa place. L'homme en face est son patron."],
  'Queen of Tears': ['Queen of Tears', "Héritière d'un grand groupe, Hong Hae-in traverse une crise avec son mari Baek Hyun-woo, issu d'un village rural."],
  'Crash Landing on You': ['Crash Landing on You', "Une héritière sud-coréenne atterrit en Corée du Nord après un accident de parapente et y rencontre un officier."],
};
const LANG_FR = { English: 'Anglais', Japanese: 'Japonais', Korean: 'Coréen', French: 'Français', German: 'Allemand', Spanish: 'Espagnol' };
const NETWORK_COLLECTION = { Netflix: 'Netflix', 'Apple TV': 'Apple TV+', 'Prime Video': 'Prime Video', Hulu: 'Disney+', 'Disney+': 'Disney+', HBO: 'HBO Max', 'Paramount+': 'Paramount+', 'Paramount Network': 'Paramount+' };

const ITEMS = new Map();
const PEOPLE = new Map();
const byId = id => ITEMS.get(id) || PEOPLE.get(id) || LIBS.find(l => l.id === id);
const personFor = (name, img, extra = {}) => {
  const id = `p-${name.normalize('NFD').replace(/[^A-Za-z0-9]/g, '').toLowerCase()}`;
  const p = PEOPLE.get(id) || { id, Type: 'Person', name, img: null, roles: [] };
  p.img ||= img; Object.entries(extra).forEach(([k, v]) => { p[k] ||= v; });
  PEOPLE.set(id, p);
  return p;
};

for (const f of DATA.films) {
  const it = { ...f, Type: 'Movie', people: [] };
  const lib = LIBS.find(l => l.key === f.lib); it.lib = lib.id; lib.items.push(it.id);
  f.director.split(', ').forEach((n, k) => { const p = personFor(n, k ? null : f.directorImg); p.roles.push({ item: it.id, role: 'Réalisation' }); it.people.push({ id: p.id, role: 'Réalisation', kind: 'Director' }); });
  f.cast.forEach(c => { const p = personFor(c.name, c.img); p.roles.push({ item: it.id, role: c.role }); it.people.push({ id: p.id, role: c.role, kind: 'Actor' }); });
  ITEMS.set(it.id, it);
}
for (const s of DATA.shows) {
  const [name, overview] = SHOW_FR[s.name] || [s.name, s.summaryEn];
  const it = { ...s, Type: 'Series', name, origName: s.name !== name ? s.name : null, overview, seasons: [], people: [] };
  const lib = LIBS.find(l => l.key === s.lib); it.lib = lib.id; lib.items.push(it.id);
  delete it.episodes;
  s.creators.forEach(n => { const p = personFor(n, null); p.roles.push({ item: it.id, role: 'Création' }); it.people.push({ id: p.id, role: 'Création', kind: 'Creator' }); });
  s.cast.forEach(c => { const p = personFor(c.name, c.img, { born: c.born, place: c.place }); p.roles.push({ item: it.id, role: c.role }); it.people.push({ id: p.id, role: c.role, kind: 'Actor' }); });
  for (const sn of s.seasons) {
    const season = { id: `${s.id}-s${sn.n}`, Type: 'Season', seriesId: it.id, n: sn.n, name: `Saison ${sn.n}`, img: sn.img, premiere: sn.premiere, episodes: [] };
    it.seasons.push(season.id); ITEMS.set(season.id, season);
  }
  for (const e of s.episodes) {
    const season = ITEMS.get(`${s.id}-s${e.s}`); if (!season) continue;
    const ep = { ...e, Type: 'Episode', seriesId: it.id, seasonId: season.id, runtime: e.runtime || s.runtime || 45, overview: e.summaryEn };
    season.episodes.push(ep.id); ITEMS.set(ep.id, ep);
  }
  ITEMS.set(it.id, it);
}

/* Collections (BoxSet) : sagas TMDB + collections par plateforme, comme sur ton serveur */
const COLLECTIONS = [];
const addCollection = (name, items, overview) => { const c = { id: `bs-${hash(name)}`, Type: 'BoxSet', name, items, overview }; ITEMS.set(c.id, c); COLLECTIONS.push(c); return c; };
[...new Set(DATA.films.map(f => f.collection).filter(Boolean))].forEach(n => addCollection(n, [...ITEMS.values()].filter(i => i.Type === 'Movie' && i.collection === n).sort((a, b) => a.year - b.year).map(i => i.id), `Tous les films de la ${n.replace(' - Saga', '')} saga, dans l'ordre.`));
Object.values(NETWORK_COLLECTION).filter((v, k, a) => a.indexOf(v) === k).forEach(n => {
  const items = [...ITEMS.values()].filter(i => i.Type === 'Series' && NETWORK_COLLECTION[i.network] === n).map(i => i.id);
  if (items.length) addCollection(n, items, `Séries originales ${n}.`);
});

/* Chaînes TV et guide des programmes (fictif, ce soir) */
const CHANNELS = DATA.channels.map((c, k) => ({ ...c, Type: 'TvChannel', number: k + 1 }));
const PROGRAM_POOL = {
  TF1: [['Le journal', 'Actualités', 40], ['Koh-Lanta', 'Jeu', 110], ['Esprits criminels', 'Série', 50], ['Esprits criminels', 'Série', 50]],
  'France 2': [['Le journal', 'Actualités', 45], ['Envoyé spécial', 'Magazine', 105], ['Complément d\'enquête', 'Magazine', 70]],
  'France 3': [['Plus belle la vie', 'Série', 30], ['Des chiffres et des lettres', 'Jeu', 35], ['Meurtres à Collioure', 'Téléfilm', 95], ['Soir/3', 'Actualités', 30]],
  'Canal+': [['Clique', 'Talk-show', 45], ['Dune : Deuxième partie', 'Film', 166], ['Canal Football Club', 'Sport', 60]],
  'France 5': [['C à vous', 'Talk-show', 60], ['La Grande Librairie', 'Magazine', 90], ['C dans l\'air', 'Magazine', 65]],
  M6: [['Le 19.45', 'Actualités', 35], ['Top Chef', 'Jeu', 120], ['Top Chef : les grands duels', 'Jeu', 70]],
  Arte: [['Arte Journal', 'Actualités', 20], ['Les Mystères de l\'Univers', 'Documentaire', 55], ['Le Voyage de Chihiro', 'Film', 125], ['Court-circuit', 'Magazine', 50]],
  TMC: [['Quotidien', 'Talk-show', 90], ['Les Experts', 'Série', 45], ['Les Experts', 'Série', 45]],
  W9: [['Les Marseillais', 'Téléréalité', 50], ['Enquête d\'action', 'Magazine', 120], ['Ligue Europa', 'Sport', 115]],
  franceinfo: [['Le journal de franceinfo', 'Actualités', 60], ['Les informés', 'Débat', 60], ['Le journal de la nuit', 'Actualités', 30]],
};
const GUIDE_START = (() => { const d = new Date(); d.setMinutes(d.getMinutes() < 30 ? 0 : 30, 0, 0); d.setHours(d.getHours() - 1); return d; })();
const PROGRAMS = CHANNELS.flatMap(ch => {
  const pool = PROGRAM_POOL[ch.name] || PROGRAM_POOL.TF1; let t = GUIDE_START.getTime() - (hash(ch.name) % 4) * 10 * 60000; const out = [];
  for (let k = 0; t < GUIDE_START.getTime() + 6 * 3600000; k++) { const [name, genre, min] = pool[k % pool.length]; out.push({ id: `pg-${ch.id}-${k}`, Type: 'Program', channel: ch.id, name, genre, start: t, end: t + min * 60000 }); t += min * 60000; }
  return out;
});
PROGRAMS.forEach(p => ITEMS.set(p.id, p));
CHANNELS.forEach(c => ITEMS.set(c.id, c));

/* ========== Utilisateur et état de lecture (côté serveur dans Jellyfin) ========== */
const USERS = [{ id: 'u1', name: 'Gaby', admin: true, color: 'oklch(0.62 0.17 295)' }, { id: 'u2', name: 'Camille', color: 'oklch(0.72 0.13 60)' }, { id: 'u3', name: 'Enfants', color: 'oklch(0.75 0.14 150)', kids: true }, { id: 'u4', name: 'Invité', color: 'oklch(0.6 0.02 260)' }];
const U = { user: USERS[0], played: new Set(), resume: new Map(), fav: new Set(), last: new Map(), playlists: [], sidebarCollapsed: false, libFilter: 'all', libSort: 'custom', prefs: { autoNext: true, skipIntro: 'ask', backSec: 10, fwdSec: 30, quality: 'auto', audioLang: 'Français', subMode: 'default', subLang: 'Français', subSize: 'normal', subBg: 'none', subColor: '#ffffff', backdrops: true, themeMusic: false, maxBitrate: 'Auto', homeSections: ['spotlight', 'resume', 'nextup', 'top10', 'latest', 'platforms', 'because', 'upcoming', 'livetv'] }, syncplay: null, cast: null };

const findShow = name => [...ITEMS.values()].find(i => i.Type === 'Series' && (i.name === name || i.origName === name));
const findFilm = name => [...ITEMS.values()].find(i => i.Type === 'Movie' && i.name === name);
const epOf = (show, s, n) => { const season = ITEMS.get(`${show.id}-s${s}`); return season && season.episodes.map(byId).find(e => e.n === n); };
const episodesOf = series => series.seasons.flatMap(s => byId(s).episodes.map(byId));
const aired = e => !e.date || e.date <= TODAY;
const durationSec = it => (it.Type === 'Movie' ? it.runtime : it.runtime || 45) * 60;

// Historique fictif de Gaby
(() => {
  let ts = Date.now();
  const watchUntil = (name, s, n, pct) => {
    const show = findShow(name); if (!show) return;
    for (const e of episodesOf(show)) { if (e.s < s || (e.s === s && e.n < n)) U.played.add(e.id); }
    const ep = epOf(show, s, n); if (ep && pct) { U.resume.set(ep.id, Math.round(durationSec(ep) * pct)); U.last.set(ep.id, ts -= 3600000); }
    else if (ep) U.last.set(epOf(show, s, Math.max(1, n - 1))?.id || ep.id, ts -= 3600000);
  };
  watchUntil('Shōgun', 1, 6, 0.42); watchUntil('Severance', 2, 4, 0.3); watchUntil('The Bear', 1, 3, 0.65);
  watchUntil('Arcane', 2, 1, 0.12); watchUntil('The Last of Us', 1, 5, 0); watchUntil('Frieren', 1, 9, 0); watchUntil('Slow Horses', 2, 1, 0);
  const film = (name, pct) => { const f = findFilm(name); if (!f) return; if (pct) { U.resume.set(f.id, Math.round(durationSec(f) * pct)); U.last.set(f.id, ts -= 3600000); } else U.played.add(f.id); };
  film('Interstellar', 0.63); film('Dune : Deuxième partie', 0.2); film('Inception'); film('Parasite'); film('Whiplash'); film('Dune'); film('Le Voyage de Chihiro');
  ['Dune : Deuxième partie', 'Le Voyage de Chihiro', 'Parasite'].forEach(n => U.fav.add(findFilm(n)?.id));
  ['Shōgun', 'Severance', 'Arcane', 'Frieren'].forEach(n => U.fav.add(findShow(n)?.id));
  U.fav.add(epOf(findShow('The Bear'), 1, 7)?.id);
  U.fav.add(personFor('Timothée Chalamet').id); U.fav.add(personFor('Zendaya').id);
  U.fav.add(COLLECTIONS.find(c => c.name === 'Dune - Saga')?.id);
  U.fav.delete(undefined);
  const mk = (name, items) => { const p = { id: `pl-${hash(name)}`, Type: 'Playlist', name, items: items.filter(Boolean) }; ITEMS.set(p.id, p); U.playlists.push(p); };
  mk('Marathon Nolan', ['Inception', 'Interstellar', 'Oppenheimer'].map(n => findFilm(n)?.id));
  mk('Soirée SF', ['Dune', 'Dune : Deuxième partie', 'Premier Contact', 'Blade Runner 2049'].map(n => findFilm(n)?.id));
  mk('Épisodes cultes', [epOf(findShow('The Bear'), 1, 7), epOf(findShow('The Last of Us'), 1, 3), epOf(findShow('Shōgun'), 1, 10), epOf(findShow('Severance'), 1, 9)].map(e => e?.id));
})();

const isPlayed = it => it.Type === 'Series' ? episodesOf(it).filter(aired).every(e => U.played.has(e.id)) : it.Type === 'Season' ? it.episodes.map(byId).filter(aired).every(e => U.played.has(e.id)) : U.played.has(it.id);
const unplayedCount = it => (it.Type === 'Series' ? episodesOf(it) : it.Type === 'Season' ? it.episodes.map(byId) : []).filter(e => aired(e) && !U.played.has(e.id)).length;
const progressPct = it => U.resume.has(it.id) ? Math.round((U.resume.get(it.id) / durationSec(it)) * 100) : 0;
const nextUpOf = series => {
  const eps = episodesOf(series).filter(aired);
  const lastIdx = eps.map(e => U.played.has(e.id)).lastIndexOf(true);
  const resumeEp = eps.find(e => U.resume.has(e.id));
  if (resumeEp) return resumeEp;
  if (lastIdx < 0) return null;
  return eps[lastIdx + 1] || null;
};
const firstEpisode = series => episodesOf(series).find(aired);
const resumeItems = () => [...U.resume.keys()].map(byId).sort((a, b) => (U.last.get(b.id) || 0) - (U.last.get(a.id) || 0));
const nextUpItems = () => [...ITEMS.values()].filter(i => i.Type === 'Series').map(s => ({ s, e: nextUpOf(s) })).filter(x => x.e && !U.resume.has(x.e.id)).map(x => x.e);
const upcomingItems = () => [...ITEMS.values()].filter(i => i.Type === 'Episode' && i.date && i.date > TODAY).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 16);

/* Infos média (versions, pistes) : simulées mais au format affiché par Jellyfin */
function mediaInfo(it) {
  const base = it.Type === 'Episode' ? byId(it.seriesId) : it;
  const orig = it.Type === 'Movie' ? (/(Parasite)/.test(it.name) ? 'Coréen' : it.lib === 'lib-anim' && /Chihiro|Your Name|Héron/.test(it.name) ? 'Japonais' : /Amélie|Intouchables|Flow/.test(it.name) ? 'Français' : 'Anglais') : LANG_FR[base.lang] || 'Anglais';
  const uhd = hash(it.id) % 3 !== 0;
  const versions = uhd ? [{ name: '2160p · HEVC · Dolby Vision', short: '4K DV', size: it.Type === 'Movie' ? '21,8 Go' : '4,2 Go', bitrate: '24,6 Mb/s' }, { name: '1080p · H.264 · SDR', short: '1080p', size: it.Type === 'Movie' ? '9,4 Go' : '1,9 Go', bitrate: '10,1 Mb/s' }] : [{ name: '1080p · HEVC · SDR', short: '1080p', size: it.Type === 'Movie' ? '7,1 Go' : '1,4 Go', bitrate: '8,3 Mb/s' }];
  const audio = orig === 'Français' ? [{ label: 'Français · E-AC3 5.1', def: true }, { label: 'Français · Audiodescription · AAC 2.0' }] : [{ label: 'Français · E-AC3 5.1', def: true }, { label: `${orig} (VO) · ${uhd ? 'TrueHD Atmos 7.1' : 'E-AC3 5.1'}` }];
  const subs = orig === 'Français' ? [{ label: 'Français (SDH)' }, { label: 'Anglais' }] : [{ label: 'Français (forcés)', forced: true }, { label: 'Français' }, { label: `${orig === 'Anglais' ? 'Anglais (SDH)' : orig}` }, ...(orig !== 'Anglais' ? [{ label: 'Anglais' }] : [])];
  return { versions, audio, subs, container: 'MKV', orig };
}
function chaptersOf(it) {
  const dur = durationSec(it), n = it.Type === 'Movie' ? 10 : 6;
  return Array.from({ length: n }, (_, k) => ({ name: it.Type === 'Episode' && k === 0 ? 'Générique de début' : `Chapitre ${k + 1}`, start: Math.round((dur / n) * k) }));
}
const introOf = it => it.Type === 'Episode' ? { start: 40 + (hash(it.id) % 50), end: 40 + (hash(it.id) % 50) + 75 } : null;

/* ========== Images ========== */
const img = {
  poster: it => it.Type === 'Episode' ? byId(it.seriesId).poster : it.Type === 'Season' ? it.img || byId(it.seriesId).poster : it.poster || it.img || null,
  backdrop: it => it.Type === 'Episode' ? it.imgLg || it.img || byId(it.seriesId).backdrop : it.Type === 'Season' ? byId(it.seriesId).backdrop : it.backdrop || null,
  thumb: it => it.Type === 'Episode' ? it.img || byId(it.seriesId).backdrop : it.backdrop || null,
};
const tints = new Map();
const fallbackTint = it => `oklch(0.42 0.09 ${hash(it.id) % 360})`;
function tintOf(it, cb) {
  const src = img.poster(it) || img.backdrop(it);
  if (tints.has(it.id)) return cb(tints.get(it.id));
  if (!src) return cb(fallbackTint(it));
  const im = new Image(); im.crossOrigin = 'anonymous';
  im.onload = () => {
    try {
      const c = document.createElement('canvas'); c.width = 24; c.height = 36;
      const x = c.getContext('2d'); x.drawImage(im, 0, 0, 24, 36);
      const d = x.getImageData(0, 0, 24, 36).data; let r = 0, g = 0, b = 0, w = 0;
      for (let k = 0; k < d.length; k += 4) { const mx = Math.max(d[k], d[k + 1], d[k + 2]), mn = Math.min(d[k], d[k + 1], d[k + 2]); const wt = (mx ? (mx - mn) / mx : 0) ** 2 * (mx / 255) + 0.01; r += d[k] * wt; g += d[k + 1] * wt; b += d[k + 2] * wt; w += wt; }
      tints.set(it.id, `rgb(${Math.round(r / w)} ${Math.round(g / w)} ${Math.round(b / w)})`);
    } catch { tints.set(it.id, fallbackTint(it)); }
    cb(tints.get(it.id));
  };
  im.onerror = () => { tints.set(it.id, fallbackTint(it)); cb(tints.get(it.id)); };
  im.src = src;
}
const tintNow = it => tints.get(it.id) || fallbackTint(it);
function applyTint(el, it) { if (!el) return; el.style.setProperty('--tint', tintNow(it)); tintOf(it, t => el.style.setProperty('--tint', t)); }

/* ========== Libellés ========== */
const href = it => it.Type === 'Person' ? `#/person?id=${it.id}` : it.Type === 'CollectionFolder' ? `#/library?id=${it.id}` : it.Type === 'TvChannel' || it.Type === 'Program' ? `#/livetv?tab=guide` : `#/details?id=${it.id}`;
const titleOf = it => it.Type === 'Episode' ? byId(it.seriesId).name : it.name;
const epCode = e => `S${e.s}:E${e.n}`;
const typeLabel = it => ({ Movie: 'Film', Series: 'Série', Season: 'Saison', Episode: 'Épisode', BoxSet: 'Collection', Playlist: 'Liste de lecture', Person: 'Personne', CollectionFolder: 'Médiathèque', TvChannel: 'Chaîne', Program: 'Programme' })[it.Type];
const yearSpan = s => s.end && s.end !== s.year ? `${s.year}–${s.end}` : s.status === 'Running' ? `${s.year}–` : String(s.year);
const subOf = it => {
  switch (it.Type) {
    case 'Movie': return `${it.year} · ${fmtMin(it.runtime)}`;
    case 'Series': return `${yearSpan(it)} · ${plural(it.seasons.length, 'saison')}`;
    case 'Season': return plural(it.episodes.length, 'épisode');
    case 'Episode': return `${epCode(it)} · ${it.name}`;
    case 'BoxSet': return plural(it.items.length, 'titre');
    case 'Playlist': return plural(it.items.length, 'élément');
    case 'Person': return plural(it.roles.length, 'titre');
    default: return '';
  }
};

/* ========== Composants ========== */
const btn = {
  primary: 'inline-flex items-center gap-2 rounded-full bg-accent py-2.25 pr-5 pl-3.5 text-sm/5 font-semibold text-black hover:scale-[1.03] hover:bg-accent-strong motion-safe:transition-transform',
  secondary: 'inline-flex items-center gap-2 rounded-full bg-white/10 py-2.25 pr-4 pl-3.5 text-sm/5 font-semibold text-white hover:bg-white/15',
  plain: 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-muted hover:text-white',
  icon: 'relative grid size-9.5 shrink-0 place-items-center rounded-full text-muted hover:text-white hover:scale-105 aria-pressed:text-accent motion-safe:transition-transform',
  iconSm: 'relative grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-white aria-pressed:text-accent',
  chip: 'shrink-0 whitespace-nowrap rounded-full bg-white/7 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/12 aria-pressed:bg-white aria-pressed:text-black aria-[current=page]:bg-white aria-[current=page]:text-black',
};
const iconBtn = (name, label, attrs = '', cls = btn.icon) => `<button type="button" ${attrs} aria-label="${esc(label)}" class="${cls}">${ic(name)}${TT}</button>`;
const favBtn = (it, cls = btn.icon) => iconBtn('heart', U.fav.has(it.id) ? 'Retirer des favoris' : 'Ajouter aux favoris', `data-act="fav" data-id="${it.id}" aria-pressed="${U.fav.has(it.id)}"`, cls);
const playedBtn = (it, cls = btn.icon) => iconBtn('check-circle', isPlayed(it) ? 'Marquer comme non vu' : 'Marquer comme vu', `data-act="played" data-id="${it.id}" aria-pressed="${isPlayed(it)}"`, cls);
const moreBtn = (it, cls = btn.icon) => iconBtn('ellipsis-horizontal', `Plus d'options pour ${titleOf(it)}`, `data-act="more" data-id="${it.id}" aria-haspopup="menu"`, cls);
const playBtnRound = (it, label, size = 'size-12') => `<button type="button" data-act="play" data-id="${it.id}" aria-label="${esc(label)}" class="grid ${size} shrink-0 place-items-center rounded-full bg-accent text-black hover:scale-105 hover:bg-accent-strong motion-safe:transition-transform">${ic('play')}</button>`;

const progressBar = (pct, cls = '') => pct ? `<div class="h-1 overflow-hidden rounded-full bg-white/25 ${cls}" role="progressbar" aria-label="Progression" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div class="h-full w-(--p) rounded-full bg-accent" style="--p:${pct}%"></div></div>` : '';
function badges(it) {
  const n = it.Type === 'Series' || it.Type === 'Season' ? unplayedCount(it) : 0;
  if (isPlayed(it) && it.Type !== 'Person') return `<span class="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-accent text-black" title="Vu">${ic('check')}<span class="sr-only">Vu</span></span>`;
  if (n) return `<span class="absolute top-2 right-2 grid h-6 min-w-6 place-items-center rounded-full bg-black/80 px-1.5 text-xs font-semibold tabular-nums" title="${plural(n, 'épisode non vu', 'épisodes non vus')}">${n}<span class="sr-only"> ${n > 1 ? 'épisodes non vus' : 'épisode non vu'}</span></span>`;
  return '';
}
function imgOrPlaceholder(src, label, cls, icon = 'film') {
  return src
    ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" class="${cls} bg-white/5 object-cover">`
    : `<div class="${cls} grid place-items-center bg-linear-to-br from-elevated to-raised p-3 text-center"><div class="flex flex-col items-center gap-2 text-subtle">${ic(icon)}<span class="line-clamp-3 text-sm font-semibold text-muted">${esc(label)}</span></div></div>`;
}
const collage = (it, cls) => {
  const ids = (it.items || []).slice(0, 4).map(byId).filter(Boolean);
  if (ids.length < 4) return imgOrPlaceholder(ids[0] && img.poster(ids[0]), it.name, `${cls} aspect-square`, 'rectangle-stack');
  return `<div class="${cls} grid aspect-square grid-cols-2 overflow-hidden">${ids.map(x => `<img src="${esc(img.poster(x))}" alt="" loading="lazy" class="aspect-square size-full object-cover">`).join('')}</div>`;
};

/* Carte façon Spotify (fond au survol + bouton vert) dans une rangée façon Netflix */
function card(it, { shape = 'poster', sub, showProgress = true, width } = {}) {
  const ratio = shape === 'wide' ? 'aspect-video' : shape === 'square' ? 'aspect-square' : 'aspect-[2/3]';
  const w = width || (shape === 'wide' ? 'w-60 sm:w-72' : shape === 'square' ? 'w-36 sm:w-44' : 'w-32 sm:w-40 xl:w-44');
  const src = it.Type === 'BoxSet' || it.Type === 'Playlist' ? null : shape === 'wide' ? img.thumb(it) : img.poster(it);
  const media = it.Type === 'BoxSet' || it.Type === 'Playlist' ? collage(it, 'w-full rounded-md')
    : it.Type === 'Person' ? imgOrPlaceholder(it.img, it.name, `aspect-square w-full rounded-full`, 'user')
    : imgOrPlaceholder(src, titleOf(it), `${ratio} w-full rounded-md`, it.Type === 'Movie' ? 'film' : 'tv');
  const pct = showProgress ? progressPct(it) : 0;
  const playable = !['Person', 'Program'].includes(it.Type);
  const title = it.Type === 'Episode' && shape === 'wide' ? titleOf(it) : it.name;
  return `<li class="${w} shrink-0 snap-start">
    <article class="group relative flex flex-col gap-2 rounded-md p-2 hover:bg-white/7 sm:p-3">
      <div class="relative">
        ${media}
        ${it.Type !== 'Person' ? badges(it) : ''}
        ${pct ? `<div class="absolute inset-x-2 bottom-2">${progressBar(pct)}</div>` : ''}
        ${playable ? `<button type="button" data-act="play" data-id="${it.id}" aria-label="Lire ${esc(title)}" class="absolute right-2 ${pct ? 'bottom-5' : 'bottom-2'} z-10 grid size-11 place-items-center rounded-full bg-accent text-black opacity-0 shadow-lg group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 hover:bg-accent-strong focus-visible:translate-y-0 focus-visible:opacity-100 motion-safe:translate-y-2 motion-safe:transition pointer-coarse:hidden">${ic('play')}</button>` : ''}
      </div>
      <div class="min-w-0 ${it.Type === 'Person' ? 'text-center' : ''}">
        <h3 class="truncate text-base font-medium sm:text-sm"><a href="${href(it)}" class="after:absolute after:inset-0">${esc(title)}</a></h3>
        <p class="truncate text-sm text-muted">${esc(sub ?? subOf(it))}</p>
      </div>
    </article>
  </li>`;
}

function row(id, title, items, opts = {}) {
  if (!items.length) return '';
  const head = opts.link ? `<a href="${opts.link}" class="hover:underline">${esc(title)}</a>` : esc(title);
  const cards = items.map((it, n) => opts.rank ? rankCard(it, n + 1) : card(it, opts)).join('');
  return `<section aria-labelledby="${id}" class="flex flex-col gap-1">
    <div class="flex items-end justify-between gap-4 px-4 sm:px-6">
      <h2 id="${id}" class="text-xl font-semibold text-balance">${head}${opts.note ? `<span class="ml-2 text-sm font-normal text-muted">${esc(opts.note)}</span>` : ''}</h2>
      <div class="flex shrink-0 items-center gap-1">
        ${opts.link ? `<div class="text-sm font-semibold text-muted max-sm:hidden"><a href="${opts.link}" class="hover:underline">Tout afficher</a></div>` : ''}
        <div class="flex items-center gap-1 pointer-coarse:hidden">
          ${iconBtn('chevron-left', 'Défiler vers la gauche', `data-act="scroll" data-row="${id}" data-dir="-1"`, 'grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-white/10')}
          ${iconBtn('chevron-right', 'Défiler vers la droite', `data-act="scroll" data-row="${id}" data-dir="1"`, 'grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-white/10')}
        </div>
      </div>
    </div>
    <ul role="list" data-row-of="${id}" class="flex snap-x overflow-x-auto scroll-px-2 px-2 scrollbar-none sm:scroll-px-3 sm:px-3">${cards}</ul>
  </section>`;
}
function rankCard(it, n) {
  return `<li class="flex w-48 shrink-0 snap-start items-end sm:w-56">
    <div class="rank -mr-6 shrink-0 text-[7rem] leading-[0.8] font-extrabold tracking-tighter sm:text-[8.5rem]" aria-hidden="true">${n}</div>
    <ul role="list" class="relative w-32 shrink-0 sm:w-36"><span class="sr-only">Numéro ${n} :</span>${card(it, { width: 'w-full' })}</ul>
  </li>`;
}
const grid = (items, opts = {}) => `<div class="@container"><ul role="list" class="grid grid-cols-2 @md:grid-cols-3 @2xl:grid-cols-4 @4xl:grid-cols-5 @6xl:grid-cols-6 @7xl:grid-cols-7 [&>li]:w-auto">${items.map(it => card(it, opts)).join('')}</ul></div>`;
const personCircle = (pid, role) => { const p = byId(pid); return `<li class="w-28 shrink-0 snap-start sm:w-32"><a href="${href(p)}" class="group flex flex-col items-center gap-2 rounded-md p-2 text-center hover:bg-white/7">${imgOrPlaceholder(p.img, p.name.split(' ').map(w => w[0]).join('').slice(0, 2), 'aspect-square w-full rounded-full', 'user')}<div class="w-full min-w-0"><div class="truncate text-sm font-medium">${esc(p.name)}</div><div class="truncate text-sm text-muted">${esc(role)}</div></div></a></li>`; };

/* ========== Menus contextuels ========== */
const menuEl = $('#menu');
let menuAnchor = null;
function openMenu(anchor, items, { align = 'start' } = {}) {
  closeMenu();
  menuEl.innerHTML = items.map(m => m === '-' ? '<div role="separator" class="my-1 h-px bg-white/10"></div>'
    : m.heading ? `<div class="px-3 pt-2 pb-1 text-xs font-semibold text-muted">${esc(m.heading)}</div>`
    : `<button type="button" role="${m.checked !== undefined ? 'menuitemradio' : 'menuitem'}" ${m.checked !== undefined ? `aria-checked="${!!m.checked}"` : ''} ${m.disabled ? 'disabled' : ''} class="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-white hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none disabled:text-subtle sm:py-2 ${m.danger ? 'text-danger' : ''}">${m.icon ? ic(m.icon, 'text-muted') : ''}<span class="min-w-0 flex-1 truncate">${esc(m.label)}</span>${m.checked ? ic('check', 'text-accent') : m.hint ? `<span class="text-muted">${esc(m.hint)}</span>` : m.sub ? ic('chevron-right', 'text-muted') : ''}</button>`).join('');
  const actions = items.filter(m => m !== '-' && !m.heading);
  $$('button', menuEl).forEach((b, k) => b.addEventListener('click', () => { const m = actions[k]; if (!m.keepOpen) closeMenu(); m.run?.(b); }));
  menuEl.hidden = false; menuAnchor = anchor; anchor?.setAttribute('aria-expanded', 'true');
  const r = anchor.getBoundingClientRect(), mw = menuEl.offsetWidth, mh = menuEl.offsetHeight;
  let left = align === 'end' ? r.right - mw : r.left; left = Math.max(8, Math.min(left, innerWidth - mw - 8));
  let top = r.bottom + 6; if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 6);
  menuEl.style.left = `${left}px`; menuEl.style.top = `${top}px`;
  $('button:not([disabled])', menuEl)?.focus();
}
function closeMenu() { if (menuEl.hidden) return; menuEl.hidden = true; menuAnchor?.setAttribute('aria-expanded', 'false'); menuAnchor?.focus?.({ preventScroll: true }); menuAnchor = null; }
menuEl.addEventListener('keydown', ev => {
  const bs = $$('button:not([disabled])', menuEl), k = bs.indexOf(document.activeElement);
  if (ev.key === 'ArrowDown') { ev.preventDefault(); bs[(k + 1) % bs.length]?.focus(); }
  if (ev.key === 'ArrowUp') { ev.preventDefault(); bs[(k - 1 + bs.length) % bs.length]?.focus(); }
  if (ev.key === 'Escape' || ev.key === 'Tab') { ev.preventDefault(); closeMenu(); }
});
document.addEventListener('pointerdown', ev => { if (!menuEl.hidden && !menuEl.contains(ev.target) && ev.target.closest('[aria-expanded="true"]') !== menuAnchor) closeMenu(); });

/* Menu « … » d'un élément : actions de Jellyfin */
function itemMenu(anchor, it) {
  const m = [];
  const resumable = U.resume.has(it.id);
  if (!['Person', 'CollectionFolder'].includes(it.Type)) {
    m.push({ label: resumable ? 'Reprendre' : 'Lecture', icon: 'play', run: () => play(it) });
    if (resumable) m.push({ label: 'Lire depuis le début', icon: 'arrow-uturn-left', run: () => play(it, { from: 0 }) });
    if (['Series', 'Season', 'BoxSet', 'Playlist'].includes(it.Type)) m.push({ label: 'Lecture aléatoire', icon: 'arrows-right-left', run: () => shuffle(it) });
    if (['Series', 'Season', 'Movie', 'Episode'].includes(it.Type)) m.push({ label: 'Lire ensuite', icon: 'queue-list', run: () => toast(`${titleOf(it)} sera lu ensuite.`) }, { label: "Ajouter à la file d'attente", icon: 'list-bullet', run: () => toast(`Ajouté à la file d'attente : ${titleOf(it)}.`) });
    m.push('-');
    m.push({ label: 'Ajouter à une liste de lecture', icon: 'squares-plus', run: () => addToPlaylistDialog(it) });
    if (['Movie', 'Series'].includes(it.Type)) m.push({ label: 'Ajouter à une collection', icon: 'rectangle-stack', run: () => addToCollectionDialog(it) });
    m.push({ label: isPlayed(it) ? 'Marquer comme non vu' : 'Marquer comme vu', icon: 'check-circle', run: () => togglePlayed(it) });
    m.push({ label: U.fav.has(it.id) ? 'Retirer des favoris' : 'Ajouter aux favoris', icon: 'heart', run: () => toggleFav(it) });
    if (['Movie', 'Episode'].includes(it.Type)) m.push({ label: 'Télécharger', icon: 'arrow-down-tray', run: () => toast('Téléchargement du fichier original lancé.') });
    m.push({ label: 'Copier le lien', icon: 'link', run: () => copyText(location.href.split('#')[0] + href(it), 'Lien copié.') });
    if (U.user.admin) {
      m.push('-', { heading: 'Administration' });
      m.push({ label: 'Modifier les métadonnées', icon: 'pencil-square', run: () => metadataDialog(it) });
      m.push({ label: 'Modifier les images', icon: 'photo', run: () => toast("L'éditeur d'images s'ouvre dans Jellyfin.") });
      if (['Movie', 'Episode'].includes(it.Type)) m.push({ label: 'Modifier les sous-titres', icon: 'chat-bubble-bottom-center-text', run: () => toast('Recherche de sous-titres OpenSubtitles…') });
      m.push({ label: 'Identifier', icon: 'magnifying-glass', run: () => toast('Identification : correspondance TMDB trouvée.') });
      m.push({ label: 'Actualiser les métadonnées', icon: 'arrow-path', run: () => toast(`Actualisation de ${titleOf(it)} en cours.`) });
      m.push({ label: 'Informations sur le média', icon: 'information-circle', run: () => mediaInfoDialog(it) });
      if (['Movie', 'Episode', 'Series', 'Season'].includes(it.Type)) m.push({ label: 'Supprimer le média', icon: 'trash', danger: true, run: () => confirmDialog(`Supprimer « ${titleOf(it)} » ?`, 'Le fichier sera supprimé du disque et de la médiathèque. Cette action est définitive.', 'Supprimer', () => toast('Suppression annulée dans la maquette.')) });
    }
  } else if (it.Type === 'Person') {
    m.push({ label: U.fav.has(it.id) ? 'Retirer des favoris' : 'Ajouter aux favoris', icon: 'heart', run: () => toggleFav(it) });
  }
  openMenu(anchor, m);
}

/* ========== Fenêtres ========== */
const modal = $('#modal');
function openModal(html, { labelledby } = {}) {
  modal.innerHTML = html;
  labelledby ? modal.setAttribute('aria-labelledby', labelledby) : modal.removeAttribute('aria-labelledby');
  if (!modal.open) modal.showModal();
  $('[autofocus]', modal)?.focus();
}
modal.addEventListener('click', ev => { if (ev.target === modal || ev.target.closest('[data-close]')) modal.close(); });
const modalHead = (id, title, sub = '') => `<div class="flex items-start justify-between gap-4 border-b border-white/10 p-5"><div class="min-w-0"><h2 id="${id}" class="text-lg font-semibold text-balance">${esc(title)}</h2>${sub ? `<p class="mt-1 text-sm text-muted">${esc(sub)}</p>` : ''}</div>${iconBtn('x-mark', 'Fermer', 'data-close', btn.iconSm)}</div>`;
function confirmDialog(title, text, okLabel, onOk) {
  openModal(`${modalHead('cf-t', title)}<p class="p-5 text-base text-pretty text-muted sm:text-sm">${esc(text)}</p><div class="flex justify-end gap-2 p-5 pt-0"><button type="button" data-close class="${btn.secondary}">Annuler</button><button type="button" id="cf-ok" class="inline-flex items-center rounded-full bg-danger px-4 py-2.25 text-sm/5 font-semibold text-black">${esc(okLabel)}</button></div>`, { labelledby: 'cf-t' });
  $('#cf-ok').onclick = () => { modal.close(); onOk(); };
}
function addToPlaylistDialog(it) {
  openModal(`${modalHead('pl-t', 'Ajouter à une liste de lecture', titleOf(it))}
    <form id="pl-form" class="flex flex-col gap-4 p-5">
      <div class="flex flex-col gap-2">
        <label for="pl-select" class="text-sm font-medium">Liste de lecture</label>
        <div class="grid grid-cols-[1fr_--spacing(8)]">
          <select id="pl-select" name="pl-select" class="col-span-full row-start-1 appearance-none rounded-md bg-white/7 py-2.5 pr-8 pl-3 text-base inset-ring inset-ring-white/10 sm:py-2 sm:text-sm">
            ${U.playlists.map(p => `<option value="${p.id}">${esc(p.name)} (${p.items.length})</option>`).join('')}<option value="new">Nouvelle liste de lecture…</option>
          </select>
          <svg viewBox="0 0 8 5" width="8" height="5" fill="none" class="pointer-events-none col-start-2 row-start-1 place-self-center text-muted" aria-hidden="true"><path d="M.5.5 4 4 7.5.5" stroke="currentcolor"/></svg>
        </div>
      </div>
      <div id="pl-new" hidden class="flex flex-col gap-2"><label for="pl-name" class="text-sm font-medium">Nom de la nouvelle liste</label><input id="pl-name" name="pl-name" type="text" class="rounded-md bg-white/7 px-3 py-2.5 text-base inset-ring inset-ring-white/10 focus:inset-ring-2 focus:inset-ring-white focus:outline-none sm:py-2 sm:text-sm" placeholder="Ex. : Soirée frissons"></div>
      <div class="flex justify-end gap-2"><button type="button" data-close class="${btn.secondary}">Annuler</button><button type="submit" class="inline-flex items-center rounded-full bg-accent px-4 py-2.25 text-sm/5 font-semibold text-black hover:bg-accent-strong">Ajouter</button></div>
    </form>`, { labelledby: 'pl-t' });
  const sel = $('#pl-select'); sel.onchange = () => { $('#pl-new').hidden = sel.value !== 'new'; if (sel.value === 'new') $('#pl-name').focus(); };
  $('#pl-form').onsubmit = ev => {
    ev.preventDefault();
    let p = U.playlists.find(x => x.id === sel.value);
    if (!p) { const name = $('#pl-name').value.trim(); if (!name) { $('#pl-name').setCustomValidity('Donnez un nom à la liste.'); $('#pl-name').reportValidity(); return; } p = { id: `pl-${hash(name + Date.now())}`, Type: 'Playlist', name, items: [] }; ITEMS.set(p.id, p); U.playlists.push(p); }
    const add = it.Type === 'Series' ? episodesOf(it).filter(aired).map(e => e.id) : it.Type === 'Season' ? it.episodes : [it.id];
    p.items.push(...add.filter(x => !p.items.includes(x)));
    modal.close(); toast(`Ajouté à « ${p.name} ».`); renderSidebar(); rerender();
  };
}
function addToCollectionDialog(it) {
  openModal(`${modalHead('co-t', 'Ajouter à une collection', titleOf(it))}<ul role="list" class="flex flex-col p-2">${COLLECTIONS.map(c => `<li><button type="button" data-col="${c.id}" class="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-white/7">${collage(c, 'w-12 shrink-0 rounded')}<span class="min-w-0 flex-1"><span class="block truncate font-medium">${esc(c.name)}</span><span class="block text-sm text-muted">${plural(c.items.length, 'titre')}</span></span>${c.items.includes(it.id) ? ic('check', 'text-accent') : ''}</button></li>`).join('')}</ul>`, { labelledby: 'co-t' });
  $$('[data-col]', modal).forEach(b => b.onclick = () => { const c = byId(b.dataset.col); if (!c.items.includes(it.id)) c.items.push(it.id); modal.close(); toast(`Ajouté à la collection « ${c.name} ».`); rerender(); });
}
function mediaInfoDialog(it) {
  const mi = mediaInfo(it), v = mi.versions[0];
  const dl = rows => `<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">${rows.map(([k, val]) => `<dt class="font-medium text-white">${k}</dt><dd class="text-muted">${esc(val)}</dd>`).join('')}</dl>`;
  openModal(`${modalHead('mi-t', 'Informations sur le média', `${titleOf(it)}${it.Type === 'Episode' ? ` · ${epCode(it)}` : ''}`)}
    <div class="flex flex-col gap-5 p-5">
      <section class="flex flex-col gap-2"><h3 class="font-semibold">Général</h3>${dl([['Conteneur', mi.container], ['Taille', v.size], ['Débit', v.bitrate], ['Durée', fmtTime(durationSec(it))], ['Chemin', `/media/${(byId(it.lib) || byId(byId(it.seriesId)?.lib))?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${titleOf(it)}/…`]])}</section>
      <section class="flex flex-col gap-2"><h3 class="font-semibold">Vidéo</h3>${dl([['Version', v.name], ['Images/s', '23,976'], ['Profondeur', v.short.includes('4K') ? '10 bits' : '8 bits']])}</section>
      <section class="flex flex-col gap-2"><h3 class="font-semibold">Audio</h3>${dl(mi.audio.map((a, k) => [`Piste ${k + 1}`, a.label + (a.def ? ' (par défaut)' : '')]))}</section>
      <section class="flex flex-col gap-2"><h3 class="font-semibold">Sous-titres</h3>${dl(mi.subs.map((s, k) => [`Piste ${k + 1}`, `${s.label} · SRT`]))}</section>
    </div>`, { labelledby: 'mi-t' });
}
function metadataDialog(it) {
  openModal(`${modalHead('md-t', 'Modifier les métadonnées', titleOf(it))}
    <form id="md-form" class="flex flex-col gap-4 p-5">
      ${[['md-name', 'Titre', it.name], ['md-orig', 'Titre original', it.origName || it.name], ['md-year', 'Année', it.year || (it.date || '').slice(0, 4)]].map(([id, l, v]) => `<div class="flex flex-col gap-2"><label for="${id}" class="text-sm font-medium">${l}</label><input id="${id}" name="${id}" type="text" value="${esc(v)}" class="rounded-md bg-white/7 px-3 py-2.5 text-base inset-ring inset-ring-white/10 focus:inset-ring-2 focus:inset-ring-white focus:outline-none sm:py-2 sm:text-sm"></div>`).join('')}
      <div class="flex flex-col gap-2"><label for="md-ov" class="text-sm font-medium">Résumé</label><textarea id="md-ov" name="md-ov" rows="4" class="rounded-md bg-white/7 px-3 py-2 text-base inset-ring inset-ring-white/10 focus:inset-ring-2 focus:inset-ring-white focus:outline-none sm:text-sm">${esc(it.overview || '')}</textarea></div>
      <div class="flex justify-end gap-2"><button type="button" data-close class="${btn.secondary}">Annuler</button><button type="submit" class="inline-flex items-center rounded-full bg-accent px-4 py-2.25 text-sm/5 font-semibold text-black hover:bg-accent-strong">Enregistrer</button></div>
    </form>`, { labelledby: 'md-t' });
  $('#md-form').onsubmit = ev => { ev.preventDefault(); it.name = $('#md-name').value.trim() || it.name; it.overview = $('#md-ov').value; modal.close(); toast('Métadonnées enregistrées.'); rerender(); };
}

/* ========== Actions ========== */
const toastEl = $('#toast'); let toastT;
function toast(msg) { toastEl.textContent = msg; toastEl.setAttribute('data-show', ''); clearTimeout(toastT); toastT = setTimeout(() => toastEl.removeAttribute('data-show'), 2800); }
function copyText(text, ok) { navigator.clipboard?.writeText(text).then(() => toast(ok), () => toast(text)); }
function toggleFav(it) { U.fav.has(it.id) ? U.fav.delete(it.id) : U.fav.add(it.id); toast(U.fav.has(it.id) ? `Ajouté aux favoris : ${titleOf(it)}.` : `Retiré des favoris : ${titleOf(it)}.`); rerender(); }
function togglePlayed(it) {
  const targets = it.Type === 'Series' ? episodesOf(it).filter(aired) : it.Type === 'Season' ? it.episodes.map(byId).filter(aired) : it.Type === 'BoxSet' || it.Type === 'Playlist' ? it.items.map(byId) : [it];
  const now = !isPlayed(it);
  targets.forEach(t => { now ? U.played.add(t.id) : U.played.delete(t.id); if (now) U.resume.delete(t.id); });
  toast(now ? `Marqué comme vu : ${titleOf(it)}.` : `Marqué comme non vu : ${titleOf(it)}.`); rerender();
}
function shuffle(it) {
  const pool = it.Type === 'Series' ? episodesOf(it).filter(aired) : it.Type === 'Season' ? it.episodes.map(byId) : it.Type === 'CollectionFolder' ? it.items.map(byId) : (it.items || []).map(byId);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick) play(pick.Type === 'Series' ? firstEpisode(pick) : pick, { from: 0, shuffle: true });
}
/* play() est défini dans player.js */

/* ========== Routeur ========== */
const main = $('#main'), view = $('#view'), stickybar = $('#stickybar');
function route() {
  const [path, qs] = (location.hash.slice(1) || '/home').split('?');
  return { path: path.replace(/^\//, '') || 'home', params: Object.fromEntries(new URLSearchParams(qs || '')) };
}
let lastPath = '';
function render(resetScroll = true) {
  const r = route();
  if (r.path === 'login') { showLogin(); return; }
  $('#login').hidden = true; $('#app').inert = false;
  const v = (VIEWS[r.path] || VIEWS.notfound)(r.params);
  view.innerHTML = v.html;
  document.title = v.title ? `${v.title} · 2BFlix` : '2BFlix';
  stickybar.innerHTML = v.sticky || ''; stickybar.removeAttribute('data-show'); stickybar.style.removeProperty('--tint');
  if (v.tintItem) applyTint(stickybar, v.tintItem);
  v.after?.();
  renderTopbar(); renderSidebar(); renderTabbar();
  const key = location.hash;
  if (resetScroll && key !== lastPath) { main.scrollTop = 0; $('h1', view)?.setAttribute('tabindex', '-1'); if (lastPath) $('h1', view)?.focus({ preventScroll: true }); }
  lastPath = key;
}
function rerender() { const y = main.scrollTop; render(false); main.scrollTop = y; }
addEventListener('hashchange', () => { closeMenu(); if ($('#drawer').open) $('#drawer').close(); render(); });
main.addEventListener('scroll', () => { if (stickybar.innerHTML) stickybar.toggleAttribute('data-show', main.scrollTop > 280); }, { passive: true });

/* ========== Coque ========== */
const NAV = [['home', 'Accueil', '#/home'], ['favorites', 'Favoris', '#/favorites'], ['collections', 'Collections', '#/collections'], ['movies', 'Films', '#/movies'], ['tvshows', 'Séries', '#/tvshows'], ['livetv', 'TV en direct', '#/livetv']];
const avatar = (u, cls = 'size-8 text-sm') => `<span class="grid ${cls} shrink-0 place-items-center rounded-full font-semibold text-black" style="background:${u.color}">${esc(u.name[0])}</span>`;
const LOGO = `<svg viewBox="0 0 116.94 32" class="h-7 w-auto" aria-hidden="true"><g transform="translate(2 2)"><path class="fill-accent" d="M8 0H16L8 20H0L8 0Z"/><path class="fill-accent" d="M18 8H26L18 28H10L18 8Z"/></g><path class="fill-white" d="M52.6016 26.7461L38.1914 26.7461L38.1914 23.7383L45.4102 16.9707Q46.3398 16.0684 46.9756 15.3369Q47.6113 14.6055 47.9463 13.9014Q48.2813 13.1973 48.2813 12.3770L48.2813 12.3770Q48.2813 11.4609 47.8711 10.8047Q47.4609 10.1484 46.7500 9.7930Q46.0391 9.4375 45.1230 9.4375L45.1230 9.4375Q44.1797 9.4375 43.4688 9.8203Q42.7578 10.2031 42.3750 10.9141Q41.9922 11.6250 41.9922 12.6230L41.9922 12.6230L38 12.6230Q38 10.6406 38.9092 9.1709Q39.8184 7.7012 41.4316 6.9014Q43.0449 6.1016 45.1504 6.1016L45.1504 6.1016Q47.3105 6.1016 48.9238 6.8740Q50.5371 7.6465 51.4326 9Q52.3281 10.3535 52.3281 12.1172L52.3281 12.1172Q52.3281 13.2520 51.8838 14.3594Q51.4395 15.4668 50.2979 16.8408Q49.1563 18.2148 47.0645 20.1289L47.0645 20.1289L43.9883 23.1641L43.9883 23.3145L52.6016 23.3145L52.6016 26.7461ZM63.5781 26.7461L54.9785 26.7461L54.9785 6.3750L63.0586 6.3750Q65.3008 6.3750 66.7979 7.0518Q68.2949 7.7285 69.0400 8.9043Q69.7852 10.0801 69.7852 11.6113L69.7852 11.6113Q69.7852 12.8145 69.3066 13.7100Q68.8281 14.6055 68.0010 15.1729Q67.1738 15.7402 66.1211 15.9863L66.1211 15.9863L66.1211 16.1914Q67.2695 16.2324 68.2881 16.8408Q69.3066 17.4492 69.9424 18.5361Q70.5781 19.6230 70.5781 21.1270L70.5781 21.1270Q70.5781 22.7402 69.7852 24.0117Q68.9922 25.2832 67.4404 26.0146Q65.8887 26.7461 63.5781 26.7461L63.5781 26.7461ZM59.1484 17.7910L59.1484 23.3145L62.7578 23.3145Q64.5898 23.3145 65.4375 22.6035Q66.2852 21.8926 66.2852 20.7305L66.2852 20.7305Q66.2852 19.8691 65.8682 19.2061Q65.4512 18.5430 64.6855 18.1670Q63.9199 17.7910 62.8672 17.7910L62.8672 17.7910L59.1484 17.7910ZM59.1484 9.7793L59.1484 14.9336L62.4434 14.9336Q63.3320 14.9336 64.0430 14.6123Q64.7539 14.2910 65.1572 13.6963Q65.5605 13.1016 65.5605 12.2813L65.5605 12.2813Q65.5605 11.1738 64.7744 10.4766Q63.9883 9.7793 62.5254 9.7793L62.5254 9.7793L59.1484 9.7793ZM76.6738 26.7461L72.5039 26.7461L72.5039 6.3750L85.9023 6.3750L85.9023 9.8340L76.6738 9.8340L76.6738 15.5215L85 15.5215L85 18.9258L76.6738 18.9258L76.6738 26.7461ZM87.8418 6.3750L91.9434 6.3750L91.9434 26.7461L87.8418 26.7461L87.8418 6.3750ZM98.5313 26.7461L94.4297 26.7461L94.4297 11.4609L98.5313 11.4609L98.5313 26.7461ZM96.4805 9.4648L96.4805 9.4648Q95.5508 9.4648 94.8945 8.8496Q94.2383 8.2344 94.2383 7.3594L94.2383 7.3594Q94.2383 6.4844 94.8945 5.8691Q95.5508 5.2539 96.4805 5.2539L96.4805 5.2539Q97.4102 5.2539 98.0732 5.8623Q98.7363 6.4707 98.7363 7.3594L98.7363 7.3594Q98.7363 8.2344 98.0732 8.8496Q97.4102 9.4648 96.4805 9.4648ZM104.1895 26.7461L99.8418 26.7461L105.7617 17.2988L105.7480 20.4980L100.1426 11.4609L104.5723 11.4609L105.9531 13.8672Q106.6094 15.0566 107.1357 16.2119Q107.6621 17.3672 108.2090 18.4609L108.2090 18.4609L106.6504 18.4609Q107.2109 17.3809 107.7305 16.2188Q108.2500 15.0566 108.9336 13.8672L108.9336 13.8672L110.3691 11.4609L114.7168 11.4609L109.0020 20.5391L109.0020 17.3809L114.9355 26.7461L110.5332 26.7461L108.8379 23.8750Q108.1680 22.6992 107.6279 21.5371Q107.0879 20.3750 106.5273 19.3086L106.5273 19.3086L108.0996 19.3086Q107.5664 20.3750 107.0537 21.5371Q106.5410 22.6992 105.8848 23.8750L105.8848 23.8750L104.1895 26.7461Z"/></svg>`;

function renderTopbar() {
  const r = route();
  const active = r.path === 'library' ? (byId(r.params.id)?.kind === 'movies' ? 'movies' : 'tvshows') : r.path;
  $('#topbar').innerHTML = `
    <div class="flex items-center gap-1 lg:w-76 lg:shrink-0 lg:pl-3">
      ${iconBtn('bars-3', 'Ouvrir les médiathèques', 'data-act="drawer" aria-controls="drawer"', 'relative grid size-10 place-items-center rounded-full text-white hover:bg-white/10 lg:hidden')}
      <a href="#/home" aria-label="Homepage" class="shrink-0 rounded-md p-1">${LOGO}</a>
    </div>
    <nav aria-label="Navigation principale" class="min-w-0 flex-1 max-lg:hidden">
      <ul role="list" class="flex items-center gap-1 overflow-x-auto scrollbar-none">
        ${NAV.map(([k, l, h]) => `<li><a href="${h}" ${active === k ? 'aria-current="page"' : ''} class="block rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap text-muted hover:text-white aria-[current=page]:bg-white/10 aria-[current=page]:text-white">${l}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="flex flex-1 items-center justify-end gap-1 lg:flex-none">
      <form role="search" data-search-form class="relative max-xl:hidden">
        <label for="top-q" class="sr-only">Rechercher</label>
        ${ic('magnifying-glass', 'pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted')}
        <input id="top-q" name="top-q" type="search" autocomplete="off" value="${esc(r.path === 'search' ? r.params.q || '' : '')}" placeholder="Que voulez-vous regarder ?" class="h-10 w-72 rounded-full bg-raised pr-4 pl-10 text-sm text-white placeholder:text-muted hover:bg-elevated hover:inset-ring hover:inset-ring-white/10 focus:inset-ring-2 focus:inset-ring-white focus:outline-none 2xl:w-80">
      </form>
      <a href="#/search" aria-label="Rechercher" class="relative grid size-10 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-white xl:hidden">${ic('magnifying-glass')}${TT}</a>
      ${iconBtn('users', U.syncplay ? `SyncPlay : ${U.syncplay}` : 'SyncPlay', `data-act="syncplay" aria-haspopup="menu" ${U.syncplay ? 'aria-pressed="true"' : ''}`, 'relative grid size-10 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-white aria-pressed:text-accent max-sm:hidden')}
      ${iconBtn('tv', U.cast ? `Lecture sur ${U.cast}` : 'Lire sur', `data-act="cast" aria-haspopup="menu" ${U.cast ? 'aria-pressed="true"' : ''}`, 'relative grid size-10 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-white aria-pressed:text-accent')}
      <button type="button" data-act="user" aria-haspopup="menu" aria-label="Menu de ${esc(U.user.name)}" class="relative grid size-10 place-items-center rounded-full hover:bg-white/10">${avatar(U.user)}${TT}</button>
    </div>`;
}

const SIDEBAR_FILTERS = [['movies', 'Films'], ['tvshows', 'Séries'], ['BoxSet', 'Collections'], ['Playlist', 'Listes de lecture']];
function sidebarEntries() {
  const favTile = { id: 'favorites', Type: 'Favorites', name: 'Favoris', sub: `Liste · ${plural(U.fav.size, 'élément')}`, href: '#/favorites' };
  let list = [
    ...LIBS.map(l => ({ it: l, sub: `Médiathèque · ${l.kind === 'movies' ? 'Films' : 'Séries'} · ${l.items.length}`, kind: l.kind })),
    ...U.playlists.map(p => ({ it: p, sub: `Liste de lecture · ${p.items.length}`, kind: 'Playlist' })),
    ...COLLECTIONS.map(c => ({ it: c, sub: `Collection · ${c.items.length}`, kind: 'BoxSet' })),
  ];
  if (U.libFilter !== 'all') list = list.filter(e => e.kind === U.libFilter);
  if (U.libSort === 'alpha') list.sort((a, b) => a.it.name.localeCompare(b.it.name, 'fr'));
  if (U.libSort === 'count') list.sort((a, b) => (b.it.items?.length || 0) - (a.it.items?.length || 0));
  return { favTile, list };
}
function sidebarHtml(compact) {
  const collapsed = !compact && U.sidebarCollapsed;
  const r = route(), cur = r.params.id || r.path;
  const { favTile, list } = sidebarEntries();
  const thumb = it => it.Type === 'CollectionFolder' ? collage({ ...it, items: it.items }, 'w-12 shrink-0 rounded-md') : collage(it, 'w-12 shrink-0 rounded-md');
  const entry = (it, sub, h, thumbHtml) => `<li><a href="${h}" ${cur === it.id ? 'aria-current="page"' : ''} ${collapsed ? `aria-label="${esc(it.name)}" title="${esc(it.name)}"` : ''} class="flex items-center gap-3 rounded-md p-2 hover:bg-white/7 aria-[current=page]:bg-white/10">
      ${thumbHtml}
      ${collapsed ? '' : `<div class="min-w-0 flex-1"><div class="truncate text-base/6 font-medium sm:text-sm/5">${esc(it.name)}</div><div class="truncate text-sm/5 text-muted">${esc(sub)}</div></div>`}
    </a></li>`;
  const favThumb = `<div class="grid size-12 shrink-0 place-items-center rounded-md bg-linear-to-br from-[oklch(0.45_0.2_285)] to-[oklch(0.75_0.1_200)] text-white">${ic('heart')}</div>`;
  return `
    <div class="flex items-center justify-between gap-2 ${collapsed ? 'flex-col py-3' : 'py-3 pr-2 pl-4'}">
      ${compact ? `<h2 class="text-base font-semibold">Médiathèques</h2>` : `<button type="button" data-act="collapse" aria-expanded="${!collapsed}" aria-label="${collapsed ? 'Déplier les médiathèques' : 'Réduire les médiathèques'}" class="flex items-center gap-3 rounded-md text-base font-semibold text-muted hover:text-white">${ic('building-library')}${collapsed ? '' : '<span>Médiathèques</span>'}</button>`}
      ${collapsed ? '' : `<div class="flex items-center gap-1">${iconBtn('plus', 'Créer', 'data-act="create" aria-haspopup="menu"', btn.iconSm)}${compact ? iconBtn('x-mark', 'Fermer', 'data-act="drawer-close"', btn.iconSm) : ''}</div>`}
    </div>
    ${collapsed ? '' : `<div role="group" aria-label="Filtrer" class="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
      ${U.libFilter !== 'all' ? iconBtn('x-mark', 'Retirer le filtre', 'data-act="libfilter" data-v="all"', 'relative grid size-8 shrink-0 place-items-center rounded-full bg-white/7 hover:bg-white/12') : ''}
      ${SIDEBAR_FILTERS.map(([k, l]) => `<button type="button" data-act="libfilter" data-v="${k}" aria-pressed="${U.libFilter === k}" class="${btn.chip}">${l}</button>`).join('')}
    </div>
    <div class="flex items-center justify-between px-4 pb-1">
      <a href="#/search" class="relative grid size-8 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-white" aria-label="Rechercher dans les médiathèques">${ic('magnifying-glass')}</a>
      <button type="button" data-act="libsort" aria-haspopup="menu" class="flex items-center gap-1 rounded-full px-2 py-1 text-sm text-muted hover:text-white">${{ custom: 'Ordre du serveur', alpha: 'Alphabétique', count: 'Nombre de titres' }[U.libSort]}${ic('list-bullet')}</button>
    </div>`}
    <ul role="list" class="min-h-0 flex-1 overflow-y-auto scrollbar-thin ${collapsed ? 'px-2' : 'px-2'} pb-2">
      ${U.libFilter === 'all' ? entry(favTile, favTile.sub, favTile.href, favThumb) : ''}
      ${list.map(e => entry(e.it, e.sub, href(e.it), thumb(e.it))).join('')}
    </ul>
    ${collapsed ? '' : `<details class="group border-t border-white/10 px-2 py-2">
      <summary class="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2 text-sm font-semibold text-muted hover:text-white">Plus${ic('chevron-right', 'group-open:rotate-90 motion-safe:transition-transform')}</summary>
      <ul role="list" class="flex flex-col pt-1 text-sm">
        ${[['#/livetv', 'TV en direct', 'signal'], ['#/remote', 'Télécommande', 'tv'], ['#/preferences', 'Préférences', 'cog-6-tooth'], ...(U.user.admin ? [['#/dashboard', 'Tableau de bord', 'server-stack'], ['#/metadata', 'Gestionnaire de métadonnées', 'pencil-square']] : [])].map(([h, l, i]) => `<li><a href="${h}" class="flex items-center gap-3 rounded-md px-2 py-2 text-muted hover:bg-white/7 hover:text-white">${ic(i)}${l}</a></li>`).join('')}
      </ul>
    </details>`}`;
}
function renderSidebar() {
  const sb = $('#sidebar'); sb.toggleAttribute('data-collapsed', U.sidebarCollapsed); sb.innerHTML = sidebarHtml(false);
  $('#drawer').innerHTML = `<div class="flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top,0px)]">${sidebarHtml(true)}</div>`;
}
function renderTabbar() {
  const r = route();
  const tabs = [['home', 'Accueil', 'home', '#/home'], ['search', 'Rechercher', 'magnifying-glass', '#/search'], ['library', 'Médiathèques', 'building-library', null], ['favorites', 'Favoris', 'heart', '#/favorites']];
  $('#tabbar').innerHTML = tabs.map(([k, l, i, h]) => h
    ? `<a href="${h}" ${r.path === k ? 'aria-current="page"' : ''} class="flex flex-col items-center gap-1 py-2 text-xs font-medium text-muted aria-[current=page]:text-white">${ic(i)}${l}</a>`
    : `<button type="button" data-act="drawer" aria-controls="drawer" class="flex flex-col items-center gap-1 py-2 text-xs font-medium text-muted">${ic(i)}${l}</button>`).join('');
}

/* ========== Menus de la barre du haut ========== */
function userMenu(anchor) {
  openMenu(anchor, [
    { heading: `${U.user.name}${U.user.admin ? ' · Administrateur' : ''}` },
    { label: 'Profil', icon: 'user-circle', run: () => (location.hash = '#/preferences?section=profile') },
    { label: 'Préférences', icon: 'cog-6-tooth', run: () => (location.hash = '#/preferences') },
    { label: 'Quick Connect', icon: 'qr-code', run: () => (location.hash = '#/preferences?section=quickconnect') },
    ...(U.user.admin ? ['-', { label: 'Tableau de bord', icon: 'server-stack', run: () => (location.hash = '#/dashboard') }, { label: 'Gestionnaire de métadonnées', icon: 'pencil-square', run: () => (location.hash = '#/metadata') }] : []),
    '-',
    { label: "Changer d'utilisateur", icon: 'users', run: () => (location.hash = '#/login') },
    { label: 'Se déconnecter', icon: 'arrow-right-start-on-rectangle', run: () => (location.hash = '#/login') },
  ], { align: 'end' });
}
const DEVICES = [['Ce navigateur', 'Firefox · macOS', 'computer-desktop'], ['TV du salon', 'Jellyfin Android TV', 'tv'], ['Chromecast chambre', 'Google Cast', 'tv'], ['iPhone de Camille', 'Swiftfin', 'device-phone-mobile']];
function castMenu(anchor) {
  openMenu(anchor, [{ heading: 'Lire sur' }, ...DEVICES.map(([n, d]) => ({ label: n, hint: d, checked: (U.cast || 'Ce navigateur') === n, run: () => setCast(n === 'Ce navigateur' ? null : n) }))], { align: 'end' });
}
function setCast(name) { U.cast = name; toast(name ? `Contrôle à distance : ${name}.` : 'Lecture sur ce navigateur.'); renderTopbar(); renderNowPlaying?.(); }
function syncplayMenu(anchor) {
  openMenu(anchor, U.syncplay
    ? [{ heading: `Groupe : ${U.syncplay}` }, { label: 'Membres : Gaby, Camille', icon: 'users', disabled: true }, { label: 'Quitter le groupe', icon: 'arrow-right-start-on-rectangle', run: () => { U.syncplay = null; toast('Vous avez quitté le groupe SyncPlay.'); renderTopbar(); } }]
    : [{ heading: 'SyncPlay' }, { label: 'Nouveau groupe', icon: 'plus', run: () => { U.syncplay = `Groupe de ${U.user.name}`; toast('Groupe SyncPlay créé. Invitez quelqu’un à le rejoindre.'); renderTopbar(); } }, { label: 'Rejoindre « Soirée film de Camille »', icon: 'users', run: () => { U.syncplay = 'Soirée film de Camille'; toast('Vous avez rejoint « Soirée film de Camille ».'); renderTopbar(); } }],
    { align: 'end' });
}

/* ========== Événements globaux ========== */
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-act]'); if (!t) return;
  const it = t.dataset.id ? byId(t.dataset.id) : null;
  switch (t.dataset.act) {
    case 'play': ev.preventDefault(); return play(it, { from: t.dataset.from !== undefined ? +t.dataset.from : undefined });
    case 'shuffle': return shuffle(it);
    case 'fav': return toggleFav(it);
    case 'played': return togglePlayed(it);
    case 'more': return itemMenu(t, it);
    case 'trailer': return toast(`Bande-annonce de ${titleOf(it)} (YouTube via TMDB).`);
    case 'scroll': { const r = $(`[data-row-of="${t.dataset.row}"]`); return r?.scrollBy({ left: +t.dataset.dir * r.clientWidth * 0.85, behavior: reduceMotion() ? 'auto' : 'smooth' }); }
    case 'drawer': return $('#drawer').showModal();
    case 'drawer-close': return $('#drawer').close();
    case 'collapse': U.sidebarCollapsed = !U.sidebarCollapsed; return renderSidebar();
    case 'libfilter': U.libFilter = t.dataset.v; return renderSidebar();
    case 'libsort': return openMenu(t, [{ heading: 'Trier par' }, ...[['custom', 'Ordre du serveur'], ['alpha', 'Alphabétique'], ['count', 'Nombre de titres']].map(([k, l]) => ({ label: l, checked: U.libSort === k, run: () => { U.libSort = k; renderSidebar(); } }))], { align: 'end' });
    case 'create': return openMenu(t, [{ label: 'Nouvelle liste de lecture', icon: 'squares-plus', run: () => addToPlaylistDialog({ id: 'none', name: 'Nouvelle liste', Type: 'Playlist', items: [] }) }, ...(U.user.admin ? [{ label: 'Nouvelle collection', icon: 'rectangle-stack', run: () => toast('Nouvelle collection créée : « Sans titre ».') }, { label: 'Ajouter une médiathèque', icon: 'building-library', run: () => toast('Ajout de médiathèque : Tableau de bord > Médiathèques.') }] : [])]);
    case 'user': return userMenu(t);
    case 'cast': return castMenu(t);
    case 'syncplay': return syncplayMenu(t);
  }
});
$('#drawer').addEventListener('click', ev => { if (ev.target === $('#drawer')) $('#drawer').close(); });
document.addEventListener('submit', ev => {
  if (!ev.target.matches('[data-search-form]')) return;
  ev.preventDefault();
  location.hash = `#/search?q=${encodeURIComponent($('input', ev.target).value.trim())}`;
});
document.addEventListener('input', ev => {
  if (ev.target.id === 'top-q') { const q = ev.target.value; clearTimeout(window.__qT); window.__qT = setTimeout(() => { history.replaceState(null, '', `#/search?q=${encodeURIComponent(q)}`); render(false); const inp = $('#top-q'); inp.focus(); inp.setSelectionRange(q.length, q.length); }, 250); }
});
