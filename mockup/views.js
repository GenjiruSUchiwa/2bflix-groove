/* 2BFlix Groove — écrans. Chaque vue renvoie { html, title, sticky?, tintItem?, after? }. */

/* ========== Petits composants de vue ========== */
const pad = html => `<div class="px-4 sm:px-6">${html}</div>`;
const h1Cls = 'text-3xl font-semibold tracking-tight text-balance sm:text-4xl';
const sectionTitle = (id, t, extra = '') => `<div class="flex items-end justify-between gap-4"><h2 id="${id}" class="text-xl font-semibold text-balance">${esc(t)}</h2>${extra}</div>`;
const star = r => r ? `<span class="inline-flex items-center gap-1">${ic('star', 'text-white')}${String(r).replace('.', ',')}</span>` : '';
const certBadge = c => c ? `<span class="rounded-sm px-1.5 py-px text-xs font-semibold inset-ring inset-ring-white/40">${esc(c === 'Tous publics' ? 'TP' : c)}</span>` : '';
const dot = '<span aria-hidden="true">·</span>';
const metaRow = parts => `<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-white/85 sm:text-sm">${parts.filter(Boolean).join(dot)}</div>`;
const tabs = (items, current, label) => `<nav aria-label="${esc(label)}" class="-mx-4 overflow-x-auto px-4 scrollbar-none sm:-mx-6 sm:px-6"><ul role="list" class="flex gap-2">${items.map(([k, l, h]) => `<li><a href="${h}" ${current === k ? 'aria-current="page"' : ''} class="${btn.chip} block">${esc(l)}</a></li>`).join('')}</ul></nav>`;
const empty = (title, text, action = '') => `<div class="flex flex-col items-start gap-3 rounded-lg py-10"><h2 class="text-xl font-semibold">${esc(title)}</h2><p class="max-w-[56ch] text-base text-pretty text-muted sm:text-sm">${esc(text)}</p>${action}</div>`;
const selectCtl = (id, label, options, value, { hideLabel = false, attrs = '' } = {}) => `<div class="flex min-w-0 flex-col gap-1.5">
  <label for="${id}" class="text-sm font-medium text-muted ${hideLabel ? 'sr-only' : ''}">${esc(label)}</label>
  <div class="grid grid-cols-[minmax(0,1fr)_--spacing(8)]">
    <select id="${id}" name="${id}" ${attrs} class="col-span-full row-start-1 w-full appearance-none truncate rounded-md bg-white/7 py-2.5 pr-8 pl-3 text-base text-white inset-ring inset-ring-white/10 hover:bg-white/10 sm:py-2 sm:text-sm">${options.map(o => { const v = o.v ?? o, l = o.l ?? o; return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select>
    <svg viewBox="0 0 8 5" width="8" height="5" fill="none" class="pointer-events-none col-start-2 row-start-1 place-self-center text-muted" aria-hidden="true"><path d="M.5.5 4 4 7.5.5" stroke="currentcolor"/></svg>
  </div></div>`;
const toggleCtl = (id, label, checked, hint = '') => `<div class="flex items-start justify-between gap-6 py-3">
  <div class="min-w-0"><label for="${id}" class="text-base font-medium sm:text-sm">${esc(label)}</label>${hint ? `<p class="text-sm text-muted">${esc(hint)}</p>` : ''}</div>
  <div class="group relative inline-flex w-11 shrink-0 rounded-full bg-white/5 p-0.5 inset-ring inset-ring-white/10 outline-offset-2 outline-accent transition-colors duration-200 ease-in-out has-checked:bg-accent has-focus-visible:outline-2 sm:w-9">
    <span class="aspect-square w-1/2 rounded-full bg-white shadow-xs ring-1 ring-black/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-full"></span>
    <input id="${id}" name="${id}" type="checkbox" ${checked ? 'checked' : ''} class="absolute inset-0 size-full appearance-none focus:outline-hidden">
  </div></div>`;
const checkCtl = (id, label, checked, attrs = '') => `<div class="flex items-center gap-3 py-1.5"><div class="flex h-lh items-center text-base sm:text-sm"><span class="group inline-grid size-5 grid-cols-1 sm:size-4">
  <input id="${id}" name="${id}" type="checkbox" ${checked ? 'checked' : ''} ${attrs} class="col-start-1 row-start-1 appearance-none rounded-sm border border-white/10 bg-white/5 checked:border-accent checked:bg-accent indeterminate:border-accent indeterminate:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto">
  <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-7/8 self-center justify-self-center stroke-black group-has-disabled:stroke-white/25"><path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-not-has-checked:opacity-0"/><path d="M3 7H11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-not-has-indeterminate:opacity-0"/></svg>
  </span></div><label for="${id}" class="text-base sm:text-sm">${esc(label)}</label></div>`;
const radioCtl = (name, id, label, checked) => `<div class="flex items-center gap-3 py-1.5"><div class="flex h-lh items-center text-base sm:text-sm"><span class="group inline-grid size-5 grid-cols-1 sm:size-4">
  <input id="${id}" name="${name}" type="radio" value="${esc(id)}" ${checked ? 'checked' : ''} class="col-start-1 row-start-1 appearance-none rounded-full border border-white/10 bg-white/5 checked:border-accent checked:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:border-white/5 disabled:bg-white/10 disabled:checked:bg-white/10 forced-colors:appearance-auto">
  <span class="pointer-events-none col-start-1 row-start-1 size-[round(down,40%,1px)] self-center justify-self-center rounded-full bg-black group-not-has-checked:opacity-0 group-has-disabled:bg-white/25"></span>
  </span></div><label for="${id}" class="text-base sm:text-sm">${esc(label)}</label></div>`;
const dl = rows => `<dl class="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[max-content_1fr]">${rows.filter(r => r[1]).map(([k, v]) => `<dt class="text-sm font-medium text-white">${esc(k)}</dt><dd class="-mt-2 text-base text-muted sm:mt-0 sm:text-sm">${v}</dd>`).join('')}</dl>`;
const peopleLinks = ids => ids.map(id => { const p = byId(id); return `<a href="${href(p)}" class="text-white hover:underline">${esc(p.name)}</a>`; }).join(', ');
const extLinks = links => `<ul role="list" class="flex flex-wrap gap-2">${links.map(([l, u]) => `<li><a href="${u}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 rounded-full bg-white/7 py-1.5 pr-3 pl-2.5 text-sm font-medium hover:bg-white/12">${ic('globe-alt', 'text-muted')}${esc(l)}</a></li>`).join('')}</ul>`;
const similarTo = (it, n = 12) => [...ITEMS.values()].filter(x => x.Type === it.Type && x.id !== it.id && x.genres).map(x => ({ x, s: x.genres.filter(g => it.genres?.includes(g)).length + (x.lib === it.lib ? 0.5 : 0) })).filter(o => o.s >= 1).sort((a, b) => b.s - a.s).slice(0, n).map(o => o.x);

/* Lignes de tableau façon playlist Spotify (collections, listes de lecture) */
function trackTable(items, { playlist } = {}) {
  return `<table class="w-full text-left text-base sm:text-sm">
    <thead><tr class="border-b border-white/10 text-muted">
      <th scope="col" class="w-10 py-2 pr-3 pl-2 text-right font-normal whitespace-nowrap">#</th>
      <th scope="col" class="py-2 font-normal whitespace-nowrap">Titre</th>
      <th scope="col" class="py-2 pr-4 font-normal whitespace-nowrap max-md:hidden">Année</th>
      <th scope="col" class="py-2 pr-4 font-normal whitespace-nowrap max-lg:hidden">Note</th>
      <th scope="col" class="py-2 pr-4 font-normal whitespace-nowrap"><span class="sr-only">Durée</span><span class="flex justify-end">${ic('clock')}</span></th>
      ${playlist ? '<th scope="col" class="w-10 py-2"><span class="sr-only">Actions</span></th>' : ''}
    </tr></thead>
    <tbody>${items.map((x, n) => {
      const series = x.Type === 'Episode' ? byId(x.seriesId) : null;
      return `<tr class="group" ${playlist ? `draggable="true" data-drag="${n}"` : ''}>
        <td class="w-10 rounded-l-md py-2 pr-3 pl-2 text-right text-muted tabular-nums group-hover:bg-white/10">
          <div class="relative flex h-12 items-center justify-end"><span class="group-focus-within:opacity-0 group-hover:opacity-0">${n + 1}</span>
          <button type="button" data-act="play" data-id="${x.id}" aria-label="Lire ${esc(titleOf(x))}" class="absolute inset-y-0 right-0 flex items-center text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100">${ic('play')}</button></div>
        </td>
        <td class="w-full max-w-0 py-2 pr-4 group-hover:bg-white/10"><div class="flex items-center gap-3">
          ${imgOrPlaceholder(x.Type === 'Episode' ? img.thumb(x) : img.poster(x), titleOf(x), `${x.Type === 'Episode' ? 'aspect-video w-20' : 'aspect-[2/3] w-8'} shrink-0 rounded-sm`)}
          <div class="min-w-0"><div class="truncate"><a href="${href(x)}" class="text-white hover:underline">${esc(x.Type === 'Episode' ? x.name : x.name)}</a>${isPlayed(x) ? `<span class="ml-2 inline-flex translate-y-0.5 text-accent">${ic('check-circle')}<span class="sr-only">Vu</span></span>` : ''}</div>
          <div class="truncate text-muted">${series ? `<a href="${href(series)}" class="hover:text-white hover:underline">${esc(series.name)}</a> · ${epCode(x)}` : `${typeLabel(x)} · ${esc((x.genres || []).join(', '))}`}</div></div>
        </div></td>
        <td class="py-2 pr-4 whitespace-nowrap text-muted tabular-nums group-hover:bg-white/10 max-md:hidden">${x.year || (x.date || '').slice(0, 4)}</td>
        <td class="py-2 pr-4 whitespace-nowrap text-muted tabular-nums group-hover:bg-white/10 max-lg:hidden">${x.rating ? String(x.rating).replace('.', ',') : '–'}</td>
        <td class="${playlist ? '' : 'rounded-r-md'} py-2 pr-4 text-right whitespace-nowrap text-muted tabular-nums group-hover:bg-white/10">${x.Type === 'Series' ? plural(x.seasons.length, 'saison') : fmtMin(x.runtime)}</td>
        ${playlist ? `<td class="rounded-r-md py-2 pr-2 group-hover:bg-white/10">${iconBtn('ellipsis-horizontal', `Options pour ${titleOf(x)}`, `data-pl-row="${n}" aria-haspopup="menu"`, btn.iconSm)}</td>` : ''}
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

/* ========== Accueil ========== */
const SPOT_IDS = () => ['Shōgun', 'Severance', 'Arcane', 'The Last of Us', 'Fallout', 'Andor', 'Frieren', 'The Penguin'].map(findShow).filter(s => s?.backdrop);
let spotIndex = 0, spotTimer = null;
function spotlight() {
  const list = SPOT_IDS();
  return `<section id="spot" aria-roledescription="carrousel" aria-label="À la une" class="relative isolate overflow-hidden">
    ${list.map((s, k) => {
      const ep = nextUpOf(s);
      return `<div data-slide="${k}" ${k === spotIndex ? '' : 'hidden'} aria-roledescription="diapositive" aria-label="${k + 1} sur ${list.length}" class="relative">
        <img src="${esc(s.backdrop)}" alt="" class="absolute inset-0 -z-20 size-full object-cover object-[50%_25%]">
        <div class="absolute inset-0 -z-10 scrim-left max-md:hidden"></div><div class="absolute inset-0 -z-10 scrim-bottom"></div>
        <div class="flex min-h-[26rem] flex-col justify-end gap-4 px-4 pt-20 pb-14 sm:min-h-[30rem] sm:px-6 lg:min-h-[34rem] xl:min-h-[38rem]">
          <p class="text-sm font-medium text-white/85">${esc(byId(s.lib).name)} · Série</p>
          ${`<h2 class="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">${esc(s.name)}</h2>`}
          ${metaRow([yearSpan(s), plural(s.seasons.length, 'saison'), star(s.rating), esc(s.genres.slice(0, 2).join(', '))])}
          <p class="line-clamp-3 max-w-[56ch] text-base/7 text-pretty text-white/90">${esc(s.overview)}</p>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" data-act="play" data-id="${(ep || firstEpisode(s)).id}" class="${btn.primary}">${ic('play')}${ep ? (U.resume.has(ep.id) ? `Reprendre ${epCode(ep)}` : `Lire ${epCode(ep)}`) : 'Lecture'}</button>
            <a href="${href(s)}" class="${btn.secondary}">${ic('information-circle')}Plus d'infos</a>
            ${favBtn(s)}
          </div>
        </div>
      </div>`;
    }).join('')}
    <div class="absolute right-4 bottom-5 flex items-center gap-2 sm:right-6">
      ${iconBtn(spotTimer === 'paused' ? 'play' : 'pause', spotTimer === 'paused' ? 'Reprendre le défilement' : 'Mettre en pause le défilement', 'data-spot="toggle"', 'relative grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60')}
      ${iconBtn('chevron-left', 'Diapositive précédente', 'data-spot="-1"', 'relative grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60')}
      ${iconBtn('chevron-right', 'Diapositive suivante', 'data-spot="1"', 'relative grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60')}
    </div>
    <div class="absolute bottom-6 left-4 flex gap-1.5 sm:left-6" role="group" aria-label="Choisir une diapositive">
      ${list.map((s, k) => `<button type="button" data-spot-go="${k}" aria-label="${esc(s.name)}" ${k === spotIndex ? 'aria-current="true"' : ''} class="relative h-1 w-6 overflow-hidden rounded-full bg-white/30 aria-[current=true]:w-10">${k === spotIndex ? '<span class="spot-progress absolute inset-0 bg-white"></span>' : ''}</button>`).join('')}
    </div>
  </section>`;
}
function spotGo(k) {
  const list = SPOT_IDS(); spotIndex = (k + list.length) % list.length;
  $$('[data-slide]').forEach(s => { s.hidden = +s.dataset.slide !== spotIndex; });
  $$('[data-spot-go]').forEach((b, n) => { b.toggleAttribute('aria-current', n === spotIndex); b.setAttribute('aria-current', n === spotIndex ? 'true' : 'false'); b.innerHTML = n === spotIndex && spotTimer !== 'paused' ? '<span class="spot-progress absolute inset-0 bg-white"></span>' : ''; });
}
function spotStart() { clearInterval(spotTimer); if (spotTimer === 'paused' || reduceMotion()) return; spotTimer = setInterval(() => { if (!$('#spot') || document.hidden) return; if ($('#spot').matches(':hover, :focus-within')) return; spotGo(spotIndex + 1); }, 8000); }

const HOME_FILTERS = [['all', 'Tout'], ['Movie', 'Films'], ['Series', 'Séries']];
let homeFilter = 'all';
var VIEWS = {};
VIEWS.home = () => {
  const ok = it => homeFilter === 'all' || (it.Type === 'Episode' ? 'Series' : it.Type) === homeFilter;
  const recentShows = LIBS.filter(l => l.kind === 'tvshows').flatMap(l => l.items).map(byId).sort((a, b) => b.year - a.year).slice(0, 16);
  const lastSeen = resumeItems()[0];
  const becauseOf = lastSeen ? (lastSeen.Type === 'Episode' ? byId(lastSeen.seriesId) : lastSeen) : null;
  const top10 = ['Shōgun', 'Dune : Deuxième partie', 'Severance', 'Arcane', 'The Last of Us', 'Oppenheimer', 'Frieren', 'The Bear', 'Interstellar', 'Squid Game'].map(n => findShow(n) || findFilm(n)).filter(Boolean);
  const now = Date.now();
  const onAir = CHANNELS.map(c => PROGRAMS.find(p => p.channel === c.id && p.start <= now && p.end > now)).filter(Boolean);
  const S = {
    spotlight: () => '',
    resume: () => row('h-resume', 'Reprendre', resumeItems().filter(ok), { shape: 'wide', sub: undefined }),
    nextup: () => row('h-next', 'Prochains épisodes', nextUpItems().filter(ok), { shape: 'wide' }),
    top10: () => row('h-top', 'Top 10 sur 2BFlix cette semaine', top10.filter(ok), { rank: true }),
    latest: () => [
      ...LIBS.filter(l => l.kind === 'movies').map(l => homeFilter === 'Series' ? '' : row(`h-l-${l.key}`, `Ajoutés récemment dans ${l.name}`, l.items.map(byId).sort((a, b) => b.year - a.year), { link: href(l) })),
      homeFilter === 'Movie' ? '' : row('h-l-tv', 'Séries ajoutées récemment', recentShows, {}),
    ].join(''),
    platforms: () => homeFilter === 'Movie' ? '' : COLLECTIONS.filter(c => !c.name.includes('Saga')).map(c => row(`h-p-${c.id}`, c.name, c.items.map(byId), { link: href(c) })).join(''),
    because: () => becauseOf ? row('h-because', `Parce que vous avez regardé ${becauseOf.name}`, similarTo(becauseOf).filter(ok)) : '',
    upcoming: () => homeFilter === 'Movie' ? '' : row('h-up', 'À venir', upcomingItems(), { shape: 'wide', showProgress: false }).replace(/<p class="truncate text-sm text-muted">([^<]*)<\/p>/g, (m, t) => m),
    livetv: () => homeFilter !== 'all' ? '' : `<section aria-labelledby="h-live" class="flex flex-col gap-1">
      <div class="flex items-end justify-between gap-4 px-4 sm:px-6"><h2 id="h-live" class="text-xl font-semibold"><a href="#/livetv" class="hover:underline">En ce moment à la TV</a></h2><div class="text-sm font-semibold text-muted max-sm:hidden"><a href="#/livetv?tab=guide" class="hover:underline">Guide des programmes</a></div></div>
      <ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${onAir.map(liveCard).join('')}</ul></section>`,
  };
  const upcomingRow = homeFilter === 'Movie' ? '' : (() => {
    const list = upcomingItems(); if (!list.length) return '';
    return `<section aria-labelledby="h-up" class="flex flex-col gap-1">
      <div class="flex items-end justify-between gap-4 px-4 sm:px-6"><h2 id="h-up" class="text-xl font-semibold">À venir <span class="ml-2 text-sm font-normal text-muted">Calendrier Sonarr</span></h2></div>
      <ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${list.map(e => card(e, { shape: 'wide', showProgress: false, sub: `${fmtDate(e.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${epCode(e)} · ${e.name}` })).join('')}</ul></section>`;
  })();
  S.upcoming = () => upcomingRow;
  return {
    title: 'Accueil',
    html: `${spotlight()}
      <div class="relative flex flex-col gap-8 pt-2 pb-16">
        <h1 class="sr-only">Accueil</h1>
        <div role="group" aria-label="Filtrer l'accueil" class="flex gap-2 overflow-x-auto px-4 scrollbar-none sm:px-6">${HOME_FILTERS.map(([k, l]) => `<button type="button" data-home-filter="${k}" aria-pressed="${homeFilter === k}" class="${btn.chip}">${l}</button>`).join('')}</div>
        ${U.prefs.homeSections.map(k => S[k]?.() || '').join('')}
      </div>`,
    after: () => {
      spotStart();
      $$('[data-home-filter]').forEach(b => b.onclick = () => { homeFilter = b.dataset.homeFilter; rerender(); });
      $$('[data-spot]').forEach(b => b.onclick = () => { const v = b.dataset.spot; if (v === 'toggle') { spotTimer = spotTimer === 'paused' ? null : 'paused'; clearInterval(spotTimer); rerender(); return; } spotGo(spotIndex + +v); });
      $$('[data-spot-go]').forEach(b => b.onclick = () => spotGo(+b.dataset.spotGo));
    },
  };
};
function liveCard(p) {
  const ch = byId(p.channel), pct = Math.round(((Date.now() - p.start) / (p.end - p.start)) * 100);
  return `<li class="w-64 shrink-0 snap-start sm:w-72"><article class="group relative flex flex-col gap-2 rounded-md p-2 hover:bg-white/7 sm:p-3">
    <div class="relative grid aspect-video place-items-center overflow-hidden rounded-md bg-linear-to-br from-elevated to-raised">
      ${ch.logo ? `<img src="${esc(ch.logo)}" alt="" class="max-h-14 max-w-[60%] object-contain">` : `<span class="text-2xl font-extrabold tracking-tight">${esc(ch.name)}</span>`}
      <span class="absolute top-2 left-2 inline-flex items-center gap-1 rounded-sm bg-danger px-1.5 py-0.5 text-xs font-semibold text-black">${ic('signal')}En direct</span>
      <div class="absolute inset-x-2 bottom-2">${progressBar(pct)}</div>
      <button type="button" data-act="play-live" data-id="${p.id}" aria-label="Regarder ${esc(ch.name)}" class="absolute right-2 bottom-5 z-10 grid size-11 place-items-center rounded-full bg-accent text-black opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:hidden">${ic('play')}</button>
    </div>
    <div class="min-w-0"><h3 class="truncate text-base font-medium sm:text-sm"><button type="button" data-program="${p.id}" class="text-left after:absolute after:inset-0">${esc(p.name)}</button></h3>
    <p class="truncate text-sm text-muted">${esc(ch.name)} · ${fmtClock(new Date(p.start))} – ${fmtClock(new Date(p.end))}</p></div>
  </article></li>`;
}

/* ========== Médiathèques ========== */
const LIBSTATE = {};
const libState = id => (LIBSTATE[id] ||= { sort: 'name', order: 'asc', view: 'poster', letter: null, f: { unplayed: false, played: false, resume: false, fav: false, uhd: false, genres: [], network: null } });
const sortName = i => i.name.replace(/^(le |la |les |l'|the )/i, '');
const SORTS = [['name', 'Nom', 'asc'], ['rating', 'Note de la communauté', 'desc'], ['year', 'Date de sortie', 'desc'], ['added', "Date d'ajout", 'desc'], ['runtime', 'Durée', 'desc'], ['random', 'Aléatoire', 'asc']];
function libFilterItems(list, st) {
  const f = st.f;
  if (f.unplayed) list = list.filter(i => !isPlayed(i));
  if (f.played) list = list.filter(isPlayed);
  if (f.resume) list = list.filter(i => U.resume.has(i.id) || (i.Type === 'Series' && episodesOf(i).some(e => U.resume.has(e.id))));
  if (f.fav) list = list.filter(i => U.fav.has(i.id));
  if (f.uhd) list = list.filter(i => mediaInfo(i).versions[0].short.includes('4K'));
  if (f.genres.length) list = list.filter(i => i.genres?.some(g => f.genres.includes(g)));
  if (f.network) list = list.filter(i => i.network === f.network);
  if (st.letter) list = list.filter(i => st.letter === '#' ? !/^[a-zà-ÿ]/i.test(sortName(i)) : sortName(i).normalize('NFD').toUpperCase().startsWith(st.letter));
  const key = { name: sortName, rating: i => i.rating || 0, year: i => i.year || 0, added: i => hash(i.id) % 1000, runtime: i => i.runtime || 0, random: i => hash(i.id + Date.now()) }[st.sort];
  list = [...list].sort((a, b) => { const x = key(a), y = key(b); return typeof x === 'string' ? x.localeCompare(y, 'fr') : x - y; });
  return st.order === 'desc' ? list.reverse() : list;
}
const activeFilters = st => Object.entries(st.f).filter(([k, v]) => Array.isArray(v) ? v.length : v).length;

function libraryView(libId, title, ids, kind, tab, extraHeader = '') {
  const st = libState(libId), base = `#/${libId.startsWith('lib-') ? `library?id=${libId}&` : `${libId}?`}`;
  const items = ids.map(byId);
  const isMovies = kind === 'movies';
  const TABS = isMovies ? [['items', 'Films'], ['suggestions', 'Suggestions'], ['favorites', 'Favoris'], ['collections', 'Collections'], ['genres', 'Genres']]
    : [['items', 'Séries'], ['suggestions', 'Suggestions'], ['upcoming', 'À venir'], ['genres', 'Genres'], ['networks', 'Diffuseurs'], ['episodes', 'Épisodes']];
  const first = items[0];
  let body = '';
  if (tab === 'items') {
    const list = libFilterItems(items, st);
    const nf = activeFilters(st);
    const letters = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    const toolbar = `<div class="flex flex-wrap items-center gap-2">
      <p class="mr-auto text-base text-muted tabular-nums sm:text-sm">${plural(list.length, 'élément')}${st.letter ? ` · lettre ${st.letter}` : ''}</p>
      <button type="button" data-lib-shuffle class="${btn.secondary}">${ic('arrows-right-left')}Lecture aléatoire</button>
      <button type="button" data-lib-sort aria-haspopup="menu" class="${btn.secondary}">${ic('bars-arrow-down')}${SORTS.find(s => s[0] === st.sort)[1]}</button>
      <button type="button" data-lib-filter class="${btn.secondary}">${ic('funnel')}Filtres${nf ? `<span class="grid size-5 place-items-center rounded-full bg-accent text-xs text-black tabular-nums">${nf}</span>` : ''}</button>
      <button type="button" data-lib-view aria-haspopup="menu" aria-label="Affichage" class="${btn.iconSm} bg-white/10">${ic(st.view === 'list' ? 'list-bullet' : st.view === 'thumb' ? 'rectangle-stack' : 'squares-2x2')}</button>
    </div>`;
    const alpha = `<nav aria-label="Aller à la lettre" class="max-lg:-mx-4 max-lg:overflow-x-auto max-lg:px-4 max-lg:scrollbar-none lg:sticky lg:top-20 lg:self-start"><ul role="list" class="flex gap-0.5 lg:flex-col">${letters.map(l => `<li><button type="button" data-letter="${l}" aria-pressed="${st.letter === l}" class="grid size-8 place-items-center rounded-full text-xs font-semibold text-muted hover:bg-white/10 hover:text-white aria-pressed:bg-accent aria-pressed:text-black lg:size-6">${l}</button></li>`).join('')}</ul></nav>`;
    const content = !list.length ? empty('Aucun élément', 'Aucun titre ne correspond à ces filtres. Retirez un filtre ou choisissez une autre lettre.', `<button type="button" data-lib-reset class="${btn.secondary}">Réinitialiser les filtres</button>`)
      : st.view === 'list' ? trackTable(list) : grid(list, { shape: st.view === 'thumb' ? 'wide' : 'poster' });
    body = `<div class="flex flex-col gap-4">${toolbar}<div class="flex flex-col gap-4 lg:flex-row-reverse lg:gap-6">${alpha}<div class="min-w-0 flex-1 lg:-ml-3">${content}</div></div></div>`;
  } else if (tab === 'suggestions') {
    const resume = items.flatMap(i => i.Type === 'Series' ? episodesOf(i).filter(e => U.resume.has(e.id)) : U.resume.has(i.id) ? [i] : []);
    const rated = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12);
    const latest = [...items].sort((a, b) => b.year - a.year).slice(0, 12);
    const watched = items.find(i => isPlayed(i) || (i.Type === 'Series' && episodesOf(i).some(e => U.played.has(e.id))));
    body = `<div class="-mx-4 flex flex-col gap-8 sm:-mx-6">${row('s-resume', 'Reprendre', resume, { shape: 'wide' })}${row('s-latest', 'Dernières sorties', latest)}${row('s-rated', 'Les mieux notés', rated)}${watched ? row('s-because', `Parce que vous avez regardé ${watched.name}`, similarTo(watched)) : ''}</div>`;
  } else if (tab === 'favorites') {
    const fav = items.filter(i => U.fav.has(i.id));
    body = fav.length ? `<div class="-mx-3">${grid(fav)}</div>` : empty('Aucun favori ici', 'Ajoutez un titre à vos favoris avec le bouton cœur de sa fiche.');
  } else if (tab === 'collections') {
    const cols = COLLECTIONS.filter(c => c.items.some(x => ids.includes(x)));
    body = cols.length ? `<div class="-mx-3">${grid(cols, { shape: 'square' })}</div>` : empty('Aucune collection', 'Les collections TMDB apparaissent ici quand au moins deux films d’une saga sont présents.');
  } else if (tab === 'genres') {
    const genres = [...new Set(items.flatMap(i => i.genres || []))].sort((a, b) => a.localeCompare(b, 'fr'));
    body = `<div class="-mx-4 flex flex-col gap-8 sm:-mx-6">${genres.map(g => row(`g-${hash(g)}`, g, items.filter(i => i.genres?.includes(g)))).join('')}</div>`;
  } else if (tab === 'upcoming') {
    const up = upcomingItems().filter(e => ids.includes(e.seriesId));
    const byDay = up.reduce((m, e) => ((m[e.date] ||= []).push(e), m), {});
    body = up.length ? `<div class="flex flex-col gap-8">${Object.entries(byDay).map(([d, eps]) => `<section class="flex flex-col gap-2"><h2 class="text-lg font-semibold first-letter:uppercase">${fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' })}</h2><ul role="list" class="-mx-3 flex flex-wrap">${eps.map(e => card(e, { shape: 'wide', showProgress: false, sub: `${epCode(e)} · ${e.name}` })).join('')}</ul></section>`).join('')}</div>`
      : empty('Rien de prévu', 'Aucun nouvel épisode annoncé pour les séries de cette médiathèque.');
  } else if (tab === 'networks') {
    const nets = Object.entries(items.reduce((m, i) => ((m[i.network || 'Inconnu'] ||= 0), m[i.network || 'Inconnu']++, m), {}));
    body = `<ul role="list" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">${nets.map(([n, c]) => `<li><button type="button" data-network="${esc(n)}" class="flex aspect-[16/9] w-full flex-col justify-between rounded-lg bg-linear-to-br from-elevated to-raised p-4 text-left hover:from-[#333]"><span class="text-xl font-semibold tracking-tight">${esc(n)}</span><span class="text-sm text-muted">${plural(c, 'série')}</span></button></li>`).join('')}</ul>`;
  } else if (tab === 'episodes') {
    const eps = items.flatMap(episodesOf).filter(aired).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 30);
    body = `<div class="-mx-3">${grid(eps, { shape: 'wide' })}</div>`;
  }
  return {
    title,
    tintItem: first,
    html: `<div id="lib-head" class="tint-bar">
      <header class="flex flex-col gap-4 px-4 pt-8 pb-4 sm:px-6 sm:pt-10">
        <p class="text-sm font-medium text-white/80">${isMovies ? 'Médiathèque · Films' : 'Médiathèque · Séries'}</p>
        <h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">${esc(title)}</h1>
        ${extraHeader}
        ${tabs(TABS.map(([k, l]) => [k, l, `${base}tab=${k}`]), tab, 'Sections de la médiathèque')}
      </header>
      <div class="px-4 pb-16 sm:px-6">${body}</div>
    </div>`,
    after: () => {
      applyTint($('#lib-head'), first || { id: libId });
      const st = libState(libId);
      $('[data-lib-shuffle]')?.addEventListener('click', () => { const pool = libFilterItems(items, st); const pick = pool[Math.floor(Math.random() * pool.length)]; if (pick) play(pick.Type === 'Series' ? firstEpisode(pick) : pick, { from: 0 }); });
      $('[data-lib-sort]')?.addEventListener('click', ev => openMenu(ev.currentTarget, [{ heading: 'Trier par' }, ...SORTS.map(([k, l, o]) => ({ label: l, checked: st.sort === k, run: () => { st.sort = k; st.order = o; rerender(); } })), '-', { heading: 'Ordre' }, { label: 'Croissant', checked: st.order === 'asc', run: () => { st.order = 'asc'; rerender(); } }, { label: 'Décroissant', checked: st.order === 'desc', run: () => { st.order = 'desc'; rerender(); } }]));
      $('[data-lib-view]')?.addEventListener('click', ev => openMenu(ev.currentTarget, [{ heading: 'Affichage' }, ...[['poster', 'Affiches'], ['thumb', 'Vignettes'], ['list', 'Liste']].map(([k, l]) => ({ label: l, checked: st.view === k, run: () => { st.view = k; rerender(); } }))], { align: 'end' }));
      $('[data-lib-filter]')?.addEventListener('click', () => filterDialog(libId, items, kind));
      $('[data-lib-reset]')?.addEventListener('click', () => { LIBSTATE[libId] = null; delete LIBSTATE[libId]; rerender(); });
      $$('[data-letter]').forEach(b => b.onclick = () => { st.letter = st.letter === b.dataset.letter ? null : b.dataset.letter; rerender(); });
      $$('[data-network]').forEach(b => b.onclick = () => { st.f.network = b.dataset.network; location.hash = `${base}tab=items`; });
    },
  };
}
function filterDialog(libId, items, kind) {
  const st = libState(libId), f = st.f;
  const genres = [...new Set(items.flatMap(i => i.genres || []))].sort((a, b) => a.localeCompare(b, 'fr'));
  openModal(`${modalHead('flt-t', 'Filtres', 'Les filtres s’appliquent immédiatement.')}
    <form id="flt" class="flex flex-col gap-6 p-5">
      <fieldset><legend class="pb-2 text-sm font-semibold">Statut</legend>
        ${checkCtl('f-unplayed', 'Non vus', f.unplayed)}${checkCtl('f-played', 'Vus', f.played)}${checkCtl('f-resume', 'En cours', f.resume)}${checkCtl('f-fav', 'Favoris', f.fav)}
      </fieldset>
      <fieldset><legend class="pb-2 text-sm font-semibold">Caractéristiques</legend>${checkCtl('f-uhd', '4K (2160p)', f.uhd)}</fieldset>
      <fieldset><legend class="pb-2 text-sm font-semibold">Genres</legend><div class="grid grid-cols-2 gap-x-4">${genres.map(g => checkCtl(`f-g-${hash(g)}`, g, f.genres.includes(g), `data-genre="${esc(g)}"`)).join('')}</div></fieldset>
      ${kind === 'tvshows' && f.network ? `<p class="flex items-center justify-between gap-3 rounded-md bg-white/7 px-3 py-2 text-sm">Diffuseur : ${esc(f.network)}<button type="button" data-clear-net class="font-semibold text-accent hover:underline">Retirer</button></p>` : ''}
      <div class="flex justify-between gap-2"><button type="button" data-reset class="${btn.plain}">Tout effacer</button><button type="button" data-close class="inline-flex items-center rounded-full bg-accent px-4 py-2.25 text-sm/5 font-semibold text-black hover:bg-accent-strong">Afficher les résultats</button></div>
    </form>`, { labelledby: 'flt-t' });
  const form = $('#flt');
  form.onchange = ev => {
    const t = ev.target;
    if (t.dataset.genre) { f.genres = t.checked ? [...f.genres, t.dataset.genre] : f.genres.filter(g => g !== t.dataset.genre); }
    else { const k = t.id.replace('f-', ''); f[k] = t.checked; if (k === 'played' && t.checked) { f.unplayed = false; $('#f-unplayed').checked = false; } if (k === 'unplayed' && t.checked) { f.played = false; $('#f-played').checked = false; } }
    rerender();
  };
  $('[data-reset]', form).onclick = () => { Object.assign(f, { unplayed: false, played: false, resume: false, fav: false, uhd: false, genres: [], network: null }); st.letter = null; $$('input', form).forEach(i => { i.checked = false; }); rerender(); };
  $('[data-clear-net]', form)?.addEventListener('click', () => { f.network = null; modal.close(); rerender(); });
}
VIEWS.library = p => { const lib = byId(p.id); return lib ? libraryView(lib.id, lib.name, lib.items, lib.kind, p.tab || 'items') : VIEWS.notfound(); };
VIEWS.movies = p => libraryView('movies', 'Films', LIBS.filter(l => l.kind === 'movies').flatMap(l => l.items), 'movies', p.tab || 'items', `<p class="text-base text-muted sm:text-sm">Toutes les médiathèques de films : ${LIBS.filter(l => l.kind === 'movies').map(l => `<a href="${href(l)}" class="text-white hover:underline">${esc(l.name)}</a>`).join(', ')}.</p>`);
VIEWS.tvshows = p => libraryView('tvshows', 'Séries', LIBS.filter(l => l.kind === 'tvshows').flatMap(l => l.items), 'tvshows', p.tab || 'items', `<p class="text-base text-muted sm:text-sm">${LIBS.filter(l => l.kind === 'tvshows').length} médiathèques de séries, regroupées.</p>`);

/* ========== Fiches ========== */
function heroBlock(it, { eyebrow, title, logo, meta, poster, posterRatio = 'aspect-[2/3]', backdrop, tagline }) {
  return `<header id="hero" class="relative isolate overflow-hidden">
    ${backdrop
      ? `<img src="${esc(backdrop)}" alt="" class="absolute inset-0 -z-20 size-full object-cover object-[50%_20%]"><div class="absolute inset-0 -z-10 scrim-left max-md:hidden"></div><div class="absolute inset-0 -z-10 scrim-bottom"></div>`
      : `${poster ? `<img src="${esc(poster)}" alt="" class="absolute inset-0 -z-20 size-full scale-125 object-cover opacity-55 blur-3xl">` : ''}<div class="tint-hero absolute inset-0 -z-10"></div>`}
    <div class="flex min-h-[22rem] flex-col justify-end gap-6 px-4 pt-20 pb-6 sm:px-6 md:flex-row md:items-end md:justify-start md:gap-8 lg:min-h-[28rem] xl:min-h-[32rem]">
      ${poster ? `<div class="${posterRatio} w-36 shrink-0 overflow-hidden rounded-lg shadow-2xl outline-1 -outline-offset-1 outline-white/10 ${backdrop ? 'max-md:hidden' : 'max-md:self-center'} sm:w-44 lg:w-56"><img src="${esc(poster)}" alt="" class="size-full object-cover"></div>` : ''}
      <div class="flex min-w-0 flex-col gap-3">
        <p class="text-sm font-medium text-white/85">${eyebrow}</p>
        ${logo ? `<h1><img src="${esc(logo)}" alt="${esc(title)}" class="max-h-24 max-w-[min(28rem,100%)] object-contain object-left lg:max-h-32"></h1>` : `<h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">${esc(title)}</h1>`}
        ${meta}
        ${tagline ? `<p class="text-base text-white/80">${esc(tagline)}</p>` : ''}
      </div>
    </div>
  </header>`;
}
const stickyFor = (it, title) => `<div class="tint-solid absolute inset-0 -z-10"></div>${playBtnRound(it, `Lire ${title}`, 'size-10')}<p class="min-w-0 truncate text-lg font-semibold">${esc(title)}</p>`;
function mediaSelectors(it) {
  const mi = mediaInfo(it);
  return `<section aria-label="Pistes de lecture" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    ${selectCtl('sel-version', 'Version', mi.versions.map(v => ({ v: v.name, l: `${v.name} · ${v.size}` })), mi.versions[0].name)}
    <div class="flex min-w-0 flex-col gap-1.5"><p class="text-sm font-medium text-muted">Vidéo</p><p class="truncate rounded-md bg-white/4 px-3 py-2.5 text-base sm:py-2 sm:text-sm">${esc(mi.versions[0].name)} · ${esc(mi.versions[0].bitrate)}</p></div>
    ${selectCtl('sel-audio', 'Audio', mi.audio.map(a => a.label + (a.def ? ' (par défaut)' : '')), mi.audio[0].label + ' (par défaut)')}
    ${selectCtl('sel-subs', 'Sous-titres', ['Désactivés', ...mi.subs.map(s => s.label)], mi.orig === 'Français' ? 'Désactivés' : mi.subs[0].label)}
  </section>`;
}
function detailsSection(rows, links) {
  return `<section aria-labelledby="d-info" class="flex flex-col gap-4">${sectionTitle('d-info', 'Détails')}${dl(rows)}${links?.length ? extLinks(links) : ''}</section>`;
}
function actionBar(it, primaryLabel, { trailer = true, shuffle = false, play: target = it } = {}) {
  return `<div class="flex flex-wrap items-center gap-3 py-5 sm:gap-4">
    <button type="button" data-act="play" data-id="${target.id}" class="${btn.primary}">${ic('play')}${esc(primaryLabel)}</button>
    ${trailer ? iconBtn('film', 'Bande-annonce', `data-act="trailer" data-id="${it.id}"`) : ''}
    ${shuffle ? iconBtn('arrows-right-left', 'Lecture aléatoire', `data-act="shuffle" data-id="${it.id}"`) : ''}
    ${playedBtn(it)}${favBtn(it)}${moreBtn(it)}
  </div>`;
}
function resumeLabel(it) {
  if (!U.resume.has(it.id)) return 'Lecture';
  return `Reprendre · ${fmtMin(Math.max(1, Math.round((durationSec(it) - U.resume.get(it.id)) / 60)))} restantes`;
}

function movieView(it) {
  const col = COLLECTIONS.find(c => c.Type === 'BoxSet' && c.items.includes(it.id) && c.name.includes('Saga'));
  const remaining = durationSec(it) - (U.resume.get(it.id) || 0);
  const chapters = chaptersOf(it);
  const people = it.people;
  const extras = [['Bande-annonce officielle', 2], ['Making-of', 18], ['Scènes coupées', 9]];
  return {
    title: it.name, tintItem: it, sticky: stickyFor(it, it.name),
    html: `${heroBlock(it, { eyebrow: `Film · <a href="${href(byId(it.lib))}" class="hover:underline">${esc(byId(it.lib).name)}</a>`, title: it.name, poster: it.poster,
      meta: metaRow([String(it.year), fmtMin(it.runtime), certBadge(it.cert), star(it.rating), esc(it.genres.join(', ')), `<span class="text-white/70">${endsAt(remaining)}</span>`]), tagline: it.tagline })}
      <div id="bar" class="tint-bar">
        ${pad(`${actionBar(it, resumeLabel(it))}${U.resume.has(it.id) ? `<div class="-mt-2 mb-5 max-w-sm">${progressBar(progressPct(it))}</div>` : ''}`)}
        <div class="flex flex-col gap-10 pb-16">
          ${pad(`<div class="flex flex-col gap-8"><p class="max-w-[70ch] text-base/7 text-pretty text-white/90">${esc(it.overview)}</p>${mediaSelectors(it)}</div>`)}
          ${col ? row('d-col', `Dans la collection ${col.name}`, col.items.map(byId), { link: href(col) }) : ''}
          ${row('d-cast', 'Distribution et équipe', [], {}) || `<section aria-labelledby="d-cast" class="flex flex-col gap-1">${pad(sectionTitle('d-cast', 'Distribution et équipe'))}<ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${people.map(p => personCircle(p.id, p.role)).join('')}</ul></section>`}
          <section aria-labelledby="d-chap" class="flex flex-col gap-1">${pad(sectionTitle('d-chap', 'Chapitres'))}
            <ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${chapters.map((c, k) => `<li class="w-52 shrink-0 snap-start sm:w-60"><button type="button" data-act="play" data-id="${it.id}" data-from="${c.start}" class="group flex w-full flex-col gap-2 rounded-md p-2 text-left hover:bg-white/7 sm:p-3">
              <div class="relative aspect-video overflow-hidden rounded-md"><img src="${esc(it.poster)}" alt="" loading="lazy" class="size-full object-cover" style="object-position:50% ${10 + k * 9}%"><span class="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"><span class="grid size-10 place-items-center rounded-full bg-accent text-black">${ic('play')}</span></span></div>
              <span class="truncate text-sm font-medium">${esc(c.name)}</span><span class="-mt-1 text-sm text-muted tabular-nums">${fmtTime(c.start)}</span></button></li>`).join('')}</ul></section>
          <section aria-labelledby="d-extra" class="flex flex-col gap-1">${pad(sectionTitle('d-extra', 'Bonus'))}
            <ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${extras.map(([n, m], k) => `<li class="w-52 shrink-0 snap-start sm:w-60"><button type="button" data-act="trailer" data-id="${it.id}" class="group flex w-full flex-col gap-2 rounded-md p-2 text-left hover:bg-white/7 sm:p-3">
              <div class="relative aspect-video overflow-hidden rounded-md"><img src="${esc(it.poster)}" alt="" loading="lazy" class="size-full scale-110 object-cover blur-[2px]" style="object-position:50% ${30 + k * 20}%"><span class="absolute bottom-2 left-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-xs font-semibold tabular-nums">${m} min</span></div>
              <span class="truncate text-sm font-medium">${esc(n)}</span></button></li>`).join('')}</ul></section>
          ${pad(detailsSection([['Réalisation', peopleLinks(people.filter(p => p.kind === 'Director').map(p => p.id))], ['Genres', esc(it.genres.join(', '))], ['Studios', esc(it.studios.join(', '))], ['Classification', esc(it.cert)], ['Langue originale', esc(mediaInfo(it).orig)], ['Ajouté le', fmtDate(`2025-${String(1 + (hash(it.id) % 12)).padStart(2, '0')}-${String(1 + (hash(it.name) % 27)).padStart(2, '0')}`)]],
            [['TMDB', `https://www.themoviedb.org/search?query=${encodeURIComponent(it.name)}`], ['IMDb', `https://www.imdb.com/find/?q=${encodeURIComponent(it.name)}`], ['Trakt', `https://trakt.tv/search?query=${encodeURIComponent(it.name)}`]]))}
          ${row('d-similar', 'Plus comme ça', similarTo(it))}
        </div>
      </div>`,
    after: () => { applyTint($('#hero'), it); applyTint($('#bar'), it); },
  };
}

function episodeList(series, season, { compactActions = false } = {}) {
  const next = nextUpOf(series);
  return `<ol role="list" class="flex flex-col">${season.episodes.map(byId).map(e => {
    const pct = progressPct(e), isNext = next?.id === e.id, future = !aired(e);
    return `<li class="border-b border-white/7 last:border-0"><div class="group grid grid-cols-[8rem_minmax(0,1fr)] gap-3 rounded-md p-2 hover:bg-white/7 sm:grid-cols-[2rem_11rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-3 ${isNext ? 'bg-white/5' : ''}">
      <span class="text-center text-xl text-muted tabular-nums max-sm:hidden">${e.n}</span>
      <div class="relative aspect-video overflow-hidden rounded-md">
        ${imgOrPlaceholder(e.img, e.name, 'size-full', 'tv')}
        ${future ? '' : `<button type="button" data-act="play" data-id="${e.id}" aria-label="Lire ${epCode(e)}, ${esc(e.name)}" class="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"><span class="grid size-10 place-items-center rounded-full bg-accent text-black">${ic('play')}</span></button>`}
        ${pct ? `<div class="absolute inset-x-2 bottom-2">${progressBar(pct)}</div>` : ''}
        ${U.played.has(e.id) ? `<span class="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-accent text-black">${ic('check')}<span class="sr-only">Vu</span></span>` : ''}
      </div>
      <div class="flex min-w-0 flex-col gap-1">
        <h3 class="text-base font-medium sm:text-sm"><a href="${href(e)}" class="hover:underline ${isNext ? 'text-accent' : ''}"><span class="sm:hidden">${e.n}. </span>${esc(e.name)}</a></h3>
        <p class="flex flex-wrap gap-x-2 text-sm text-muted">${[future ? `Diffusion le ${fmtDate(e.date, { day: 'numeric', month: 'short', year: 'numeric' })}` : fmtDate(e.date, { day: 'numeric', month: 'short', year: 'numeric' }), `${e.runtime} min`, e.rating ? `★ ${String(e.rating).replace('.', ',')}` : '', isNext ? (pct ? `${100 - pct} % restants` : 'À regarder ensuite') : ''].filter(Boolean).join(' · ')}</p>
        ${e.overview ? `<p lang="en" class="line-clamp-2 text-sm text-pretty text-muted max-sm:hidden">${esc(e.overview)}</p>` : ''}
      </div>
      <div class="flex items-center gap-1 max-sm:col-start-2 max-sm:-mt-1">${future ? '' : playedBtn(e, btn.iconSm)}${favBtn(e, btn.iconSm)}${moreBtn(e, btn.iconSm)}</div>
    </div></li>`;
  }).join('')}</ol>`;
}

function seriesView(it, seasonN) {
  const next = nextUpOf(it), first = firstEpisode(it);
  const target = next || first;
  const label = !target ? 'Lecture' : U.resume.has(target.id) ? `Reprendre ${epCode(target)}` : next ? `Lire ${epCode(target)}` : 'Lire S1:E1';
  const season = byId(seasonN ? `${it.id}-s${seasonN}` : target ? target.seasonId : it.seasons[0]);
  const statusFr = { Running: 'En cours', Ended: 'Terminée', 'To Be Determined': 'En suspens', 'In Development': 'En développement' }[it.status] || it.status;
  return {
    title: it.name, tintItem: it, sticky: stickyFor(target || it, it.name),
    html: `${heroBlock(it, { eyebrow: `Série · <a href="${href(byId(it.lib))}" class="hover:underline">${esc(byId(it.lib).name)}</a>${it.network ? ` · ${esc(it.network)}` : ''}`, title: it.name, poster: it.poster, backdrop: it.backdrop,
      meta: metaRow([yearSpan(it), plural(it.seasons.length, 'saison'), star(it.rating), esc(it.genres.join(', ')), `<span class="rounded-full ${it.status === 'Running' ? 'bg-accent/15 text-accent' : 'bg-white/10 text-white/80'} px-2 py-0.5 text-xs font-semibold">${esc(statusFr)}</span>`]) })}
      <div id="bar" class="tint-bar">
        ${pad(actionBar(it, label, { shuffle: true, play: target || it }))}
        <div class="flex flex-col gap-10 pb-16">
          ${pad(`<p class="max-w-[70ch] text-base/7 text-pretty text-white/90">${esc(it.overview)}</p>`)}
          ${next ? pad(`<section aria-labelledby="d-next" class="flex flex-col gap-3">${sectionTitle('d-next', U.resume.has(next.id) ? 'Reprendre' : 'Prochain épisode')}
            <article class="group relative grid gap-4 rounded-lg bg-white/5 p-3 hover:bg-white/8 sm:grid-cols-[16rem_minmax(0,1fr)] sm:items-center">
              <div class="relative aspect-video overflow-hidden rounded-md">${imgOrPlaceholder(next.img, next.name, 'size-full', 'tv')}${progressPct(next) ? `<div class="absolute inset-x-2 bottom-2">${progressBar(progressPct(next))}</div>` : ''}</div>
              <div class="flex min-w-0 flex-col gap-2"><p class="text-sm text-muted">${epCode(next)} · ${next.runtime} min</p><h3 class="text-lg font-semibold"><a href="${href(next)}" class="hover:underline">${esc(next.name)}</a></h3>${next.overview ? `<p lang="en" class="line-clamp-3 text-sm text-pretty text-muted">${esc(next.overview)}</p>` : ''}
              <div><button type="button" data-act="play" data-id="${next.id}" class="${btn.primary}">${ic('play')}${U.resume.has(next.id) ? 'Reprendre' : 'Lecture'}</button></div></div>
            </article></section>`) : ''}
          <section aria-labelledby="d-seasons" class="flex flex-col gap-1">${pad(sectionTitle('d-seasons', 'Saisons'))}
            <ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${it.seasons.map(id => card(byId(id), { sub: `${plural(byId(id).episodes.length, 'épisode')}${byId(id).premiere ? ` · ${byId(id).premiere.slice(0, 4)}` : ''}` })).join('')}</ul></section>
          ${pad(`<section aria-labelledby="d-eps" class="flex flex-col gap-3">
            <div class="flex flex-wrap items-end justify-between gap-4"><h2 id="d-eps" class="text-xl font-semibold">Épisodes</h2>
            ${it.seasons.length > 1 ? `<div class="w-56">${selectCtl('sel-season', 'Saison', it.seasons.map(id => ({ v: byId(id).n, l: `${byId(id).name} · ${plural(byId(id).episodes.length, 'épisode')}` })), season.n, { hideLabel: true })}</div>` : ''}</div>
            ${episodeList(it, season)}</section>`)}
          ${it.people.some(p => p.kind === 'Actor') ? `<section aria-labelledby="d-cast" class="flex flex-col gap-1">${pad(sectionTitle('d-cast', 'Distribution'))}<ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${it.people.filter(p => p.kind === 'Actor').map(p => personCircle(p.id, p.role)).join('')}</ul></section>` : ''}
          ${pad(detailsSection([['Création', it.people.some(p => p.kind === 'Creator') ? peopleLinks(it.people.filter(p => p.kind === 'Creator').map(p => p.id)) : ''], ['Diffuseur', esc(it.network || '')], ['Genres', esc(it.genres.join(', '))], ['Statut', esc(statusFr)], ['Langue originale', esc(LANG_FR[it.lang] || it.lang || '')], ['Épisodes', plural(episodesOf(it).length, 'épisode')]],
            [...(it.imdb ? [['IMDb', `https://www.imdb.com/title/${it.imdb}/`]] : []), ...(it.tvdb ? [['TheTVDB', `https://thetvdb.com/dereferrer/series/${it.tvdb}`]] : []), ['TMDB', `https://www.themoviedb.org/search/tv?query=${encodeURIComponent(it.origName || it.name)}`]]))}
          ${row('d-similar', 'Plus comme ça', similarTo(it))}
        </div>
      </div>`,
    after: () => {
      applyTint($('#hero'), it); applyTint($('#bar'), it);
      $('#sel-season')?.addEventListener('change', ev => { history.replaceState(null, '', `#/details?id=${it.id}&season=${ev.target.value}`); rerender(); });
    },
  };
}

function seasonView(season) {
  const series = byId(season.seriesId);
  const target = season.episodes.map(byId).find(e => U.resume.has(e.id)) || season.episodes.map(byId).find(e => aired(e) && !U.played.has(e.id)) || byId(season.episodes[0]);
  return {
    title: `${series.name} · ${season.name}`, tintItem: series, sticky: stickyFor(target, `${series.name} · ${season.name}`),
    html: `${heroBlock(season, { eyebrow: `<a href="${href(series)}" class="hover:underline">${esc(series.name)}</a> · Saison`, title: season.name, poster: img.poster(season), backdrop: series.backdrop,
      meta: metaRow([season.premiere ? season.premiere.slice(0, 4) : '', plural(season.episodes.length, 'épisode'), unplayedCount(season) ? plural(unplayedCount(season), 'épisode non vu', 'épisodes non vus') : 'Saison vue'].map(esc)) })}
      <div id="bar" class="tint-bar">
        ${pad(actionBar(season, U.resume.has(target.id) ? `Reprendre ${epCode(target)}` : `Lire ${epCode(target)}`, { trailer: false, shuffle: true, play: target }))}
        <div class="flex flex-col gap-10 pb-16">
          ${pad(episodeList(series, season))}
          ${row('d-other', 'Autres saisons', series.seasons.filter(id => id !== season.id).map(byId))}
        </div>
      </div>`,
    after: () => { applyTint($('#hero'), series); applyTint($('#bar'), series); },
  };
}

function episodeView(e) {
  const series = byId(e.seriesId), season = byId(e.seasonId);
  const remaining = durationSec(e) - (U.resume.get(e.id) || 0);
  const others = season.episodes.map(byId);
  const idx = others.findIndex(x => x.id === e.id);
  return {
    title: `${series.name} · ${epCode(e)}`, tintItem: series, sticky: stickyFor(e, `${epCode(e)} · ${e.name}`),
    html: `${heroBlock(e, { eyebrow: `<a href="${href(series)}" class="hover:underline">${esc(series.name)}</a> · <a href="${href(season)}" class="hover:underline">${esc(season.name)}</a> · Épisode ${e.n}`, title: e.name, backdrop: e.imgLg || e.img || series.backdrop, poster: series.poster,
      meta: metaRow([fmtDate(e.date), `${e.runtime} min`, star(e.rating), aired(e) ? `<span class="text-white/70">${endsAt(remaining)}</span>` : '<span class="text-accent">Pas encore diffusé</span>']) })}
      <div id="bar" class="tint-bar">
        ${pad(`${aired(e) ? actionBar(e, resumeLabel(e), { trailer: false }) : `<div class="py-5"><p class="text-base text-muted sm:text-sm">Disponible le ${fmtDate(e.date)} selon Sonarr.</p></div>`}${U.resume.has(e.id) ? `<div class="-mt-2 mb-5 max-w-sm">${progressBar(progressPct(e))}</div>` : ''}`)}
        <div class="flex flex-col gap-10 pb-16">
          ${pad(`<div class="flex flex-col gap-8">${e.overview ? `<p lang="en" class="max-w-[70ch] text-base/7 text-pretty text-white/90">${esc(e.overview)}</p>` : '<p class="text-base text-muted sm:text-sm">Aucun résumé disponible.</p>'}${aired(e) ? mediaSelectors(e) : ''}
            <nav aria-label="Épisodes voisins" class="flex flex-wrap gap-2">${idx > 0 ? `<a href="${href(others[idx - 1])}" class="${btn.secondary}">${ic('chevron-left')}Précédent : ${epCode(others[idx - 1])}</a>` : ''}${others[idx + 1] ? `<a href="${href(others[idx + 1])}" class="${btn.secondary}">Suivant : ${epCode(others[idx + 1])}${ic('chevron-right')}</a>` : ''}</nav></div>`)}
          ${row('d-season', `Autres épisodes de la ${season.name.toLowerCase()}`, others.filter(x => x.id !== e.id), { shape: 'wide' })}
          ${series.people.some(p => p.kind === 'Actor') ? `<section aria-labelledby="d-cast" class="flex flex-col gap-1">${pad(sectionTitle('d-cast', 'Distribution de la série'))}<ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${series.people.filter(p => p.kind === 'Actor').map(p => personCircle(p.id, p.role)).join('')}</ul></section>` : ''}
        </div>
      </div>`,
    after: () => { applyTint($('#hero'), series); applyTint($('#bar'), series); },
  };
}

function listView(it) {
  const items = it.items.map(byId).filter(Boolean);
  const isPl = it.Type === 'Playlist';
  const total = items.reduce((m, x) => m + (x.Type === 'Series' ? 0 : x.runtime || 0), 0);
  return {
    title: it.name, sticky: `<div class="absolute inset-0 -z-10 bg-elevated"></div>${items[0] ? playBtnRound(items[0], `Lire ${it.name}`, 'size-10') : ''}<p class="min-w-0 truncate text-lg font-semibold">${esc(it.name)}</p>`,
    html: `<header id="hero" class="tint-hero flex flex-col gap-6 px-4 pt-16 pb-6 sm:flex-row sm:items-end sm:px-6 lg:pt-20">
        ${collage(it, 'w-40 shrink-0 rounded-lg shadow-2xl max-sm:self-center sm:w-48 xl:w-56')}
        <div class="flex min-w-0 flex-col gap-3">
          <p class="text-sm font-medium">${typeLabel(it)}</p>
          <h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-6xl xl:text-7xl">${esc(it.name)}</h1>
          ${it.overview ? `<p class="max-w-[60ch] text-base text-pretty text-white/80 sm:text-sm">${esc(it.overview)}</p>` : ''}
          <p class="flex flex-wrap items-center gap-x-2 text-base text-white/85 sm:text-sm">${avatar(U.user, 'size-6 text-xs')}<span class="font-semibold text-white">${isPl ? esc(U.user.name) : '2BFlix'}</span>${dot}${plural(items.length, 'élément')}${total ? `${dot}${fmtMin(total)}` : ''}</p>
        </div>
      </header>
      <div id="bar" class="tint-bar">
        ${pad(`<div class="flex flex-wrap items-center gap-4 py-5">${items[0] ? playBtnRound(items[0], `Lire ${it.name}`, 'size-14') : ''}${iconBtn('arrows-right-left', 'Lecture aléatoire', `data-act="shuffle" data-id="${it.id}"`)}${playedBtn(it)}${isPl ? '' : favBtn(it)}${isPl ? iconBtn('pencil-square', 'Renommer la liste', 'data-pl-rename') : ''}${isPl ? iconBtn('trash', 'Supprimer la liste', 'data-pl-delete') : moreBtn(it)}</div>`)}
        ${pad(items.length ? trackTable(items, { playlist: isPl }) : empty('Liste vide', 'Ajoutez des films ou des épisodes avec « Ajouter à une liste de lecture » dans le menu … d’un titre.'))}
        ${isPl ? '' : `<div class="pt-10 pb-16">${row('d-similar', 'Vous aimerez aussi', similarTo(items[0] || {}, 12))}</div>`}
        <div class="h-16"></div>
      </div>`,
    after: () => {
      const tintSrc = items[0] || it; applyTint($('#hero'), tintSrc); applyTint($('#bar'), tintSrc); applyTint(stickybar, tintSrc);
      if (!isPl) return;
      $$('[data-pl-row]').forEach(b => b.onclick = () => {
        const n = +b.dataset.plRow, x = items[n];
        openMenu(b, [{ label: 'Lecture', icon: 'play', run: () => play(x) }, { label: 'Monter', icon: 'chevron-up', disabled: n === 0, run: () => { it.items.splice(n - 1, 0, it.items.splice(n, 1)[0]); rerender(); } }, { label: 'Descendre', icon: 'chevron-down', disabled: n === items.length - 1, run: () => { it.items.splice(n + 1, 0, it.items.splice(n, 1)[0]); rerender(); } }, '-', { label: 'Retirer de la liste', icon: 'x-mark', run: () => { it.items.splice(n, 1); toast(`Retiré de « ${it.name} ».`); rerender(); renderSidebar(); } }], { align: 'end' });
      });
      let dragFrom = null;
      $$('[data-drag]').forEach(tr => {
        tr.addEventListener('dragstart', () => { dragFrom = +tr.dataset.drag; tr.classList.add('opacity-50'); });
        tr.addEventListener('dragend', () => tr.classList.remove('opacity-50'));
        tr.addEventListener('dragover', ev => ev.preventDefault());
        tr.addEventListener('drop', ev => { ev.preventDefault(); const to = +tr.dataset.drag; if (dragFrom === null || dragFrom === to) return; it.items.splice(to, 0, it.items.splice(dragFrom, 1)[0]); dragFrom = null; rerender(); });
      });
      $('[data-pl-rename]')?.addEventListener('click', () => {
        openModal(`${modalHead('rn-t', 'Renommer la liste')}<form id="rn" class="flex flex-col gap-4 p-5"><div class="flex flex-col gap-2"><label for="rn-name" class="text-sm font-medium">Nom</label><input id="rn-name" name="rn-name" type="text" value="${esc(it.name)}" autofocus class="rounded-md bg-white/7 px-3 py-2.5 text-base inset-ring inset-ring-white/10 focus:inset-ring-2 focus:inset-ring-white focus:outline-none sm:py-2 sm:text-sm"></div><div class="flex justify-end gap-2"><button type="button" data-close class="${btn.secondary}">Annuler</button><button type="submit" class="inline-flex items-center rounded-full bg-accent px-4 py-2.25 text-sm/5 font-semibold text-black">Enregistrer</button></div></form>`, { labelledby: 'rn-t' });
        $('#rn').onsubmit = ev => { ev.preventDefault(); it.name = $('#rn-name').value.trim() || it.name; modal.close(); toast('Liste renommée.'); rerender(); };
      });
      $('[data-pl-delete]')?.addEventListener('click', () => confirmDialog(`Supprimer « ${it.name} » ?`, 'La liste sera supprimée. Les films et épisodes restent dans vos médiathèques.', 'Supprimer', () => { U.playlists = U.playlists.filter(p => p.id !== it.id); ITEMS.delete(it.id); toast('Liste supprimée.'); location.hash = '#/playlists'; }));
    },
  };
}

VIEWS.details = p => {
  const it = byId(p.id);
  if (!it) return VIEWS.notfound();
  return it.Type === 'Movie' ? movieView(it) : it.Type === 'Series' ? seriesView(it, p.season ? +p.season : null) : it.Type === 'Season' ? seasonView(it) : it.Type === 'Episode' ? episodeView(it) : ['BoxSet', 'Playlist'].includes(it.Type) ? listView(it) : VIEWS.notfound();
};

/* ========== Personne ========== */
VIEWS.person = p => {
  const pr = byId(p.id); if (!pr) return VIEWS.notfound();
  const roles = pr.roles.map(r => ({ it: byId(r.item), role: r.role })).filter(r => r.it);
  const films = roles.filter(r => r.it.Type === 'Movie'), shows = roles.filter(r => r.it.Type === 'Series');
  const age = pr.born ? Math.floor((Date.now() - new Date(pr.born)) / 31557600000) : null;
  return {
    title: pr.name,
    html: `<header id="hero" class="tint-hero flex flex-col gap-6 px-4 pt-16 pb-8 sm:flex-row sm:items-end sm:px-6 lg:pt-20">
        ${imgOrPlaceholder(pr.img, pr.name, 'aspect-square w-40 shrink-0 rounded-full shadow-2xl max-sm:self-center sm:w-52', 'user')}
        <div class="flex min-w-0 flex-col gap-3">
          <p class="text-sm font-medium">Personne</p>
          <h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">${esc(pr.name)}</h1>
          ${metaRow([pr.born ? `Né(e) le ${fmtDate(pr.born)}${age ? ` (${age} ans)` : ''}` : '', esc(pr.place || ''), plural(roles.length, 'titre dans votre bibliothèque', 'titres dans votre bibliothèque')])}
        </div>
      </header>
      <div id="bar" class="tint-bar">
        ${pad(`<div class="flex items-center gap-3 py-5">${favBtn(pr)}${moreBtn(pr)}</div>`)}
        <div class="flex flex-col gap-10 pb-16">
          ${pad(`<p class="max-w-[70ch] text-base text-pretty text-muted sm:text-sm">Biographie fournie par TMDB sur ton serveur. Elle n'est pas incluse dans cette maquette.</p>`)}
          ${films.length ? `<section aria-labelledby="pf" class="flex flex-col gap-2">${pad(sectionTitle('pf', 'Films'))}<div class="px-1 sm:px-3">${grid(films.map(r => r.it), {}).replace(/<p class="truncate text-sm text-muted">[^<]*<\/p>/g, (m, k) => m)}</div></section>` : ''}
          ${shows.length ? `<section aria-labelledby="ps" class="flex flex-col gap-2">${pad(sectionTitle('ps', 'Séries'))}<div class="px-1 sm:px-3">${grid(shows.map(r => r.it))}</div></section>` : ''}
          ${pad(`<section aria-labelledby="pr" class="flex flex-col gap-3">${sectionTitle('pr', 'Rôles')}<ul role="list" class="flex flex-col divide-y divide-white/7">${roles.map(r => `<li class="flex items-center justify-between gap-4 py-2.5"><a href="${href(r.it)}" class="min-w-0 truncate text-base hover:underline sm:text-sm">${esc(r.it.name)}</a><span class="shrink-0 text-sm text-muted">${esc(r.role)}</span></li>`).join('')}</ul></section>`)}
        </div>
      </div>`,
    after: () => { const t = { id: pr.id, poster: pr.img }; applyTint($('#hero'), t); applyTint($('#bar'), t); },
  };
};

/* ========== Favoris, collections, listes de lecture ========== */
VIEWS.favorites = () => {
  const fav = [...U.fav].map(byId).filter(Boolean);
  const by = t => fav.filter(i => i.Type === t);
  const sections = [['Movie', 'Films'], ['Series', 'Séries'], ['Episode', 'Épisodes', 'wide'], ['Person', 'Personnes'], ['BoxSet', 'Collections', 'square']];
  return {
    title: 'Favoris',
    html: `<header id="hero" class="flex flex-col gap-6 bg-linear-to-b from-[oklch(0.45_0.2_285)] via-[oklch(0.3_0.12_285)] to-panel px-4 pt-16 pb-8 sm:flex-row sm:items-end sm:px-6 lg:pt-20">
        <div class="grid aspect-square w-40 shrink-0 place-items-center rounded-lg bg-linear-to-br from-[oklch(0.45_0.2_285)] to-[oklch(0.75_0.1_200)] shadow-2xl max-sm:self-center sm:w-52">${ic('heart', 'scale-[3]')}</div>
        <div class="flex min-w-0 flex-col gap-3"><p class="text-sm font-medium">Liste</p><h1 class="text-5xl font-semibold tracking-tight sm:text-7xl">Favoris</h1><p class="text-base text-white/85 sm:text-sm">${avatar(U.user, 'size-6 text-xs inline-grid align-middle mr-1')} <span class="font-semibold">${esc(U.user.name)}</span> · ${plural(fav.length, 'élément')}</p></div>
      </header>
      <div class="flex flex-col gap-10 pt-6 pb-16">
        ${fav.length ? sections.map(([t, l, shape]) => row(`fav-${t}`, l, by(t), { shape })).join('') : pad(empty('Aucun favori', 'Touchez le cœur sur la fiche d’un film, d’une série, d’un épisode ou d’une personne pour le retrouver ici.'))}
      </div>`,
  };
};
VIEWS.collections = () => ({
  title: 'Collections',
  html: `<div class="flex flex-col gap-6 px-4 pt-8 pb-16 sm:px-6">
    <header class="flex flex-wrap items-end justify-between gap-4"><div class="flex flex-col gap-2"><p class="text-sm font-medium text-muted">Bibliothèque</p><h1 class="${h1Cls}">Collections</h1><p class="text-base text-muted sm:text-sm">${plural(COLLECTIONS.length, 'collection')} : sagas TMDB et collections par plateforme.</p></div>
    ${U.user.admin ? `<button type="button" data-act="create" class="${btn.secondary}">${ic('plus')}Nouvelle collection</button>` : ''}</header>
    <div class="-mx-3">${grid(COLLECTIONS, { shape: 'square' })}</div></div>`,
});
VIEWS.playlists = () => ({
  title: 'Listes de lecture',
  html: `<div class="flex flex-col gap-6 px-4 pt-8 pb-16 sm:px-6">
    <header class="flex flex-wrap items-end justify-between gap-4"><div class="flex flex-col gap-2"><p class="text-sm font-medium text-muted">Bibliothèque</p><h1 class="${h1Cls}">Listes de lecture</h1></div>
    <button type="button" data-new-playlist class="${btn.secondary}">${ic('plus')}Nouvelle liste</button></header>
    ${U.playlists.length ? `<div class="-mx-3">${grid(U.playlists, { shape: 'square' })}</div>` : empty('Aucune liste de lecture', 'Créez une liste pour enchaîner des films et des épisodes dans l’ordre de votre choix.')}</div>`,
  after: () => $('[data-new-playlist]')?.addEventListener('click', () => addToPlaylistDialog({ id: 'none', name: 'Nouvelle liste', Type: 'Playlist', items: [] })),
});

/* ========== TV en direct ========== */
const RECORDINGS = [['Koh-Lanta', 'TF1', 'Hier · 21:10', 112, 'Jeu'], ['Top Chef', 'M6', 'Mercredi · 21:10', 118, 'Jeu'], ['Envoyé spécial', 'France 2', 'Jeudi · 21:10', 104, 'Magazine'], ['La Grande Librairie', 'France 5', 'Mercredi · 20:55', 88, 'Magazine']];
let TIMERS = [['Koh-Lanta', 'TF1', 'Mardi · 21:10', true], ['Top Chef', 'M6', 'Mercredi · 21:10', true], ['Le Voyage de Chihiro', 'Arte', 'Ce soir', false]];
const chLogo = (ch, cls = 'max-h-8 max-w-16') => ch.logo ? `<img src="${esc(ch.logo)}" alt="${esc(ch.name)}" class="${cls} object-contain">` : `<span class="text-sm font-extrabold tracking-tight">${esc(ch.name)}</span>`;
function programDialog(pid) {
  const p = byId(pid), ch = byId(p.channel), live = p.start <= Date.now() && p.end > Date.now(), rec = TIMERS.some(t => t[0] === p.name && t[1] === ch.name);
  openModal(`${modalHead('pg-t', p.name, `${ch.name} · ${fmtClock(new Date(p.start))} – ${fmtClock(new Date(p.end))} · ${p.genre}`)}
    <div class="flex flex-col gap-4 p-5">
      ${live ? `<div class="flex items-center gap-3"><span class="inline-flex items-center gap-1 rounded-sm bg-danger px-1.5 py-0.5 text-xs font-semibold text-black">${ic('signal')}En direct</span><div class="flex-1">${progressBar(Math.round(((Date.now() - p.start) / (p.end - p.start)) * 100))}</div></div>` : ''}
      <p class="text-base text-pretty text-muted sm:text-sm">Programme du guide (XMLTV). Les résumés détaillés viennent de ton fournisseur de guide.</p>
      <div class="flex flex-wrap gap-2">
        ${live ? `<button type="button" data-act="play-live" data-id="${p.id}" class="${btn.primary}">${ic('play')}Regarder</button>` : ''}
        <button type="button" data-record="${p.id}" aria-pressed="${rec}" class="${btn.secondary} aria-pressed:text-danger">${ic('video-camera')}${rec ? 'Annuler l’enregistrement' : 'Enregistrer'}</button>
        <button type="button" data-record-series="${p.id}" class="${btn.secondary}">${ic('calendar-days')}Enregistrer la série</button>
      </div>
    </div>`, { labelledby: 'pg-t' });
  $('[data-record]', modal).onclick = () => { if (rec) TIMERS = TIMERS.filter(t => !(t[0] === p.name && t[1] === ch.name)); else TIMERS.push([p.name, ch.name, `Aujourd'hui · ${fmtClock(new Date(p.start))}`, false]); modal.close(); toast(rec ? 'Enregistrement annulé.' : `Enregistrement programmé : ${p.name}.`); rerender(); };
  $('[data-record-series]', modal).onclick = () => { TIMERS.push([p.name, ch.name, 'Chaque diffusion', true]); modal.close(); toast(`Tous les épisodes de « ${p.name} » seront enregistrés.`); rerender(); };
}
VIEWS.livetv = params => {
  const tab = params.tab || 'programs', now = Date.now();
  const onAir = CHANNELS.map(c => PROGRAMS.find(p => p.channel === c.id && p.start <= now && p.end > now)).filter(Boolean);
  const upNext = CHANNELS.map(c => PROGRAMS.find(p => p.channel === c.id && p.start > now)).filter(Boolean);
  const byGenre = g => PROGRAMS.filter(p => p.genre === g && p.end > now).slice(0, 12);
  const progCard = p => { const ch = byId(p.channel); return `<li class="w-56 shrink-0 snap-start sm:w-64"><button type="button" data-program="${p.id}" class="flex w-full flex-col gap-2 rounded-md p-2 text-left hover:bg-white/7 sm:p-3"><div class="grid aspect-video place-items-center rounded-md bg-linear-to-br from-elevated to-raised">${chLogo(ch, 'max-h-12 max-w-[55%]')}</div><span class="truncate text-base font-medium sm:text-sm">${esc(p.name)}</span><span class="-mt-1 truncate text-sm text-muted">${esc(ch.name)} · ${fmtClock(new Date(p.start))}</span></button></li>`; };
  const progRow = (id, t, list) => list.length ? `<section aria-labelledby="${id}" class="flex flex-col gap-1">${pad(sectionTitle(id, t))}<ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${list.map(progCard).join('')}</ul></section>` : '';
  let body = '';
  if (tab === 'programs') {
    body = `<div class="flex flex-col gap-10">
      <section aria-labelledby="lt-now" class="flex flex-col gap-1">${pad(sectionTitle('lt-now', 'En ce moment'))}<ul role="list" class="flex snap-x overflow-x-auto px-2 scrollbar-none sm:px-3">${onAir.map(liveCard).join('')}</ul></section>
      ${progRow('lt-next', 'À suivre', upNext)}${progRow('lt-film', 'Films', byGenre('Film'))}${progRow('lt-sport', 'Sport', byGenre('Sport'))}${progRow('lt-news', 'Actualités', byGenre('Actualités'))}${progRow('lt-mag', 'Magazines', byGenre('Magazine'))}</div>`;
  } else if (tab === 'guide') {
    const MIN = 0.4, slots = 12, start = GUIDE_START.getTime(), end = start + slots * 1800000;
    const nowLeft = ((now - start) / 60000) * MIN;
    body = pad(`<div class="flex flex-col gap-3"><p class="text-base text-muted sm:text-sm">${fmtDate(TODAY, { weekday: 'long', day: 'numeric', month: 'long' })} · défilez horizontalement pour voir la suite de la soirée.</p>
      <div class="-mx-4 overflow-x-auto scrollbar-thin sm:-mx-6"><div class="relative inline-block min-w-full px-4 sm:px-6">
        <div class="sticky top-0 z-10 flex bg-panel pl-28"><div class="relative flex" style="width:${slots * 30 * MIN}rem">${Array.from({ length: slots }, (_, k) => `<div class="w-48 shrink-0 border-l border-white/10 px-2 py-2 text-sm text-muted tabular-nums">${fmtClock(new Date(start + k * 1800000))}</div>`).join('')}</div></div>
        <ul role="list" class="relative flex flex-col gap-1">
          ${CHANNELS.map(ch => `<li class="flex h-16">
            <div class="sticky left-0 z-10 flex w-28 shrink-0 items-center gap-2 bg-panel pr-2"><span class="w-5 text-right text-sm text-muted tabular-nums">${ch.number}</span><div class="grid h-12 flex-1 place-items-center rounded-md bg-white/5 px-1">${chLogo(ch)}</div></div>
            <div class="relative h-full" style="width:${slots * 30 * MIN}rem">${PROGRAMS.filter(p => p.channel === ch.id && p.end > start && p.start < end).map(p => {
              const l = Math.max(0, ((p.start - start) / 60000) * MIN), w = ((Math.min(p.end, end) - Math.max(p.start, start)) / 60000) * MIN, live = p.start <= now && p.end > now, past = p.end <= now;
              return `<button type="button" data-program="${p.id}" class="absolute inset-y-0.5 flex flex-col justify-center overflow-hidden rounded-md px-3 text-left ${live ? 'bg-white/14 hover:bg-white/20' : past ? 'bg-white/3 text-subtle hover:bg-white/7' : 'bg-white/7 hover:bg-white/12'}" style="left:${l + 0.125}rem;width:${Math.max(w - 0.25, 1)}rem"><span class="truncate text-sm font-medium">${esc(p.name)}</span><span class="truncate text-xs text-muted tabular-nums">${fmtClock(new Date(p.start))} · ${esc(p.genre)}</span></button>`;
            }).join('')}</div></li>`).join('')}
          <div aria-hidden="true" class="pointer-events-none absolute inset-y-0 w-0.5 bg-accent" style="left:calc(7rem + ${nowLeft}rem)"><span class="absolute -top-1 -left-1 size-2.5 rounded-full bg-accent"></span></div>
        </ul>
      </div></div></div>`);
  } else if (tab === 'channels') {
    body = pad(`<ul role="list" class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">${CHANNELS.map(ch => { const p = onAir.find(x => x.channel === ch.id), n = upNext.find(x => x.channel === ch.id); return `<li><div class="group flex items-center gap-4 rounded-lg bg-white/4 p-3 hover:bg-white/8">
      <div class="grid size-16 shrink-0 place-items-center rounded-md bg-white/5">${chLogo(ch, 'max-h-10 max-w-14')}</div>
      <div class="min-w-0 flex-1"><p class="text-sm text-muted tabular-nums">${ch.number} · ${esc(ch.name)}</p><p class="truncate text-base font-medium sm:text-sm">${esc(p?.name || '—')}</p>${p ? `<div class="mt-1.5">${progressBar(Math.round(((now - p.start) / (p.end - p.start)) * 100))}</div>` : ''}<p class="mt-1 truncate text-sm text-muted">Ensuite : ${esc(n?.name || '—')}</p></div>
      ${p ? playBtnRound(p, `Regarder ${ch.name}`, 'size-10').replace('data-act="play"', 'data-act="play-live"') : ''}
      ${iconBtn('heart', `Chaîne favorite : ${ch.name}`, `data-act="fav" data-id="${ch.id}" aria-pressed="${U.fav.has(ch.id)}"`, btn.iconSm)}</div></li>`; }).join('')}</ul>`);
  } else if (tab === 'recordings') {
    body = pad(`<div class="flex flex-col gap-8">
      <section aria-labelledby="rc-now" class="flex flex-col gap-3">${sectionTitle('rc-now', 'En cours d’enregistrement')}
        <div class="flex items-center gap-4 rounded-lg bg-white/4 p-3"><span class="relative flex size-3 shrink-0"><span class="absolute inline-flex size-full rounded-full bg-danger opacity-75 motion-safe:animate-ping"></span><span class="relative inline-flex size-3 rounded-full bg-danger"></span></span><div class="min-w-0 flex-1"><p class="truncate font-medium">${esc(onAir[0]?.name || '')}</p><p class="text-sm text-muted">${esc(byId(onAir[0]?.channel)?.name || '')} · jusqu'à ${onAir[0] ? fmtClock(new Date(onAir[0].end)) : ''}</p></div><button type="button" data-toast="Enregistrement arrêté." class="${btn.secondary}">Arrêter</button></div>
      </section>
      <section aria-labelledby="rc-list" class="flex flex-col gap-3">${sectionTitle('rc-list', 'Enregistrements')}
        <ul role="list" class="flex flex-col divide-y divide-white/7">${RECORDINGS.map(([n, ch, when, min, g]) => `<li class="flex items-center gap-4 py-3"><div class="grid aspect-video w-28 shrink-0 place-items-center rounded-md bg-linear-to-br from-elevated to-raised">${chLogo(CHANNELS.find(c => c.name === ch) || { name: ch })}</div><div class="min-w-0 flex-1"><p class="truncate text-base font-medium sm:text-sm">${esc(n)}</p><p class="truncate text-sm text-muted">${esc(ch)} · ${esc(when)} · ${fmtMin(min)} · ${esc(g)}</p></div><button type="button" data-toast="Lecture de l’enregistrement : ${esc(n)}." aria-label="Lire ${esc(n)}" class="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-black hover:bg-accent-strong">${ic('play')}</button>${iconBtn('trash', `Supprimer ${n}`, `data-toast="Enregistrement supprimé : ${esc(n)}."`, btn.iconSm)}</li>`).join('')}</ul>
      </section></div>`);
  } else if (tab === 'schedule') {
    body = pad(`<section aria-labelledby="sc" class="flex flex-col gap-3">${sectionTitle('sc', 'Enregistrements programmés')}
      ${TIMERS.length ? `<ul role="list" class="flex flex-col divide-y divide-white/7">${TIMERS.map(([n, ch, when, series], k) => `<li class="flex items-center gap-4 py-3"><div class="grid size-12 shrink-0 place-items-center rounded-md bg-white/5 text-danger">${ic(series ? 'calendar-days' : 'video-camera')}</div><div class="min-w-0 flex-1"><p class="truncate text-base font-medium sm:text-sm">${esc(n)}</p><p class="truncate text-sm text-muted">${esc(ch)} · ${esc(when)}${series ? ' · Série' : ''}</p></div><button type="button" data-cancel-timer="${k}" class="${btn.plain}">Annuler</button></li>`).join('')}</ul>` : empty('Rien de programmé', 'Ouvrez un programme du guide et choisissez « Enregistrer ».')}</section>`);
  }
  return {
    title: 'TV en direct',
    html: `<div class="flex flex-col gap-6 pt-8 pb-16">
      ${pad(`<header class="flex flex-col gap-4"><p class="text-sm font-medium text-muted">${plural(CHANNELS.length, 'chaîne')} · tuner HDHomeRun</p><h1 class="${h1Cls}">TV en direct</h1>
      ${tabs([['programs', 'Programmes'], ['guide', 'Guide'], ['channels', 'Chaînes'], ['recordings', 'Enregistrements'], ['schedule', 'Planifications']].map(([k, l]) => [k, l, `#/livetv?tab=${k}`]), tab, 'Sections de la TV en direct')}</header>`)}
      ${body}</div>`,
    after: () => {
      $$('[data-program]').forEach(b => b.onclick = ev => { ev.preventDefault(); programDialog(b.dataset.program); });
      $$('[data-cancel-timer]').forEach(b => b.onclick = () => { const t = TIMERS.splice(+b.dataset.cancelTimer, 1)[0]; toast(`Programmation annulée : ${t[0]}.`); rerender(); });
    },
  };
};

/* ========== Recherche ========== */
const BROWSE = [['Science-fiction', 250], ['Drame', 20], ['Thriller', 0], ['Action', 30], ['Comédie', 60], ['Animation', 150], ['Anime', 320], ['Fantastique', 280], ['Policier', 210], ['Romance', 350], ['Histoire', 45], ['Jeunesse', 110]];
VIEWS.search = p => {
  const q = (p.q || '').trim(), ql = q.toLowerCase();
  const input = `<form role="search" data-search-form class="relative xl:hidden"><label for="s-q" class="sr-only">Rechercher</label>${ic('magnifying-glass', 'pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-black')}<input id="s-q" name="s-q" type="search" value="${esc(q)}" autocomplete="off" placeholder="Que voulez-vous regarder ?" class="h-12 w-full rounded-full bg-white pr-4 pl-11 text-base text-black placeholder:text-zinc-600 focus:outline-2 focus:outline-offset-2 focus:outline-white"></form>`;
  if (!q) {
    const suggestions = [...ITEMS.values()].filter(i => (i.Type === 'Movie' || i.Type === 'Series') && !isPlayed(i)).sort((a, b) => hash(a.id + TODAY) - hash(b.id + TODAY)).slice(0, 12);
    return {
      title: 'Rechercher',
      html: `<div class="flex flex-col gap-8 pt-6 pb-16">
        ${pad(input)}
        ${row('s-sugg', 'Suggestions', suggestions)}
        ${pad(`<section aria-labelledby="s-browse" class="flex flex-col gap-4">${sectionTitle('s-browse', 'Parcourir tout')}
          <ul role="list" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">${BROWSE.map(([g, h]) => { const cover = [...ITEMS.values()].find(i => i.genres?.includes(g) && img.poster(i)); return `<li><a href="#/search?q=${encodeURIComponent(g)}" class="relative isolate flex aspect-[16/10] overflow-hidden rounded-lg p-4 hover:brightness-110" style="background:oklch(0.55 0.15 ${h})"><span class="text-lg font-semibold tracking-tight text-balance sm:text-xl">${esc(g)}</span>${cover ? `<img src="${esc(img.poster(cover))}" alt="" loading="lazy" class="absolute -right-4 -bottom-2 -z-10 aspect-[2/3] w-[38%] rotate-[25deg] rounded-md object-cover shadow-xl">` : ''}</a></li>`; }).join('')}</ul></section>`)}
      </div>`,
    };
  }
  const all = [...ITEMS.values(), ...PEOPLE.values()];
  const match = i => (i.name || '').toLowerCase().includes(ql) || (i.origName || '').toLowerCase().includes(ql) || (i.genres || []).some(g => g.toLowerCase().includes(ql));
  const res = t => all.filter(i => i.Type === t && match(i));
  const films = res('Movie'), series = res('Series'), eps = res('Episode').slice(0, 20), people = [...PEOPLE.values()].filter(match), cols = res('BoxSet'), progs = PROGRAMS.filter(match).filter((x, k, a) => a.findIndex(y => y.name === x.name) === k);
  const top = films[0] || series[0] || people[0] || eps[0];
  const total = films.length + series.length + eps.length + people.length + cols.length + progs.length;
  return {
    title: `Recherche : ${q}`,
    html: `<div class="flex flex-col gap-8 pt-6 pb-16">
      ${pad(`${input}<h1 class="mt-6 text-2xl font-semibold tracking-tight text-balance xl:mt-0">Résultats pour « ${esc(q)} »</h1><p class="text-base text-muted sm:text-sm">${plural(total, 'résultat')}</p>`)}
      ${!total ? pad(empty('Aucun résultat', `Aucun titre, épisode ou personne ne correspond à « ${q} ». Vérifiez l’orthographe ou essayez un genre, par exemple « Thriller ».`)) : ''}
      ${top ? pad(`<div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section aria-labelledby="s-top" class="flex flex-col gap-3">${sectionTitle('s-top', 'Meilleur résultat')}
          <article class="group relative flex flex-col gap-4 rounded-lg bg-white/5 p-5 hover:bg-white/10">
            ${top.Type === 'Person' ? imgOrPlaceholder(top.img, top.name, 'aspect-square w-24 rounded-full', 'user') : imgOrPlaceholder(top.Type === 'Episode' ? img.thumb(top) : img.poster(top), top.name, top.Type === 'Episode' ? 'aspect-video w-40 rounded-md' : 'aspect-[2/3] w-24 rounded-md')}
            <div class="flex flex-col gap-1"><h3 class="text-3xl font-semibold tracking-tight"><a href="${href(top)}" class="after:absolute after:inset-0">${esc(top.name)}</a></h3><p class="text-sm text-muted"><span class="mr-2 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white">${typeLabel(top)}</span>${esc(subOf(top))}</p></div>
            ${top.Type !== 'Person' ? `<button type="button" data-act="play" data-id="${top.id}" aria-label="Lire ${esc(top.name)}" class="absolute right-5 bottom-5 z-10 grid size-12 place-items-center rounded-full bg-accent text-black opacity-0 shadow-lg group-hover:opacity-100 hover:scale-105 focus-visible:opacity-100 pointer-coarse:opacity-100">${ic('play')}</button>` : ''}
          </article></section>
        ${eps.length ? `<section aria-labelledby="s-eps" class="flex flex-col gap-3">${sectionTitle('s-eps', 'Épisodes')}<div class="-mx-2">${trackTable(eps.slice(0, 4)).replace(/<thead>[\s\S]*?<\/thead>/, '')}</div></section>` : ''}
      </div>`) : ''}
      ${row('s-films', 'Films', films)}${row('s-series', 'Séries', series)}${row('s-eps-all', 'Tous les épisodes', eps.slice(4), { shape: 'wide' })}${row('s-people', 'Personnes', people)}${row('s-cols', 'Collections', cols, { shape: 'square' })}
      ${progs.length ? `<section aria-labelledby="s-tv" class="flex flex-col gap-3">${pad(sectionTitle('s-tv', 'Programmes TV'))}${pad(`<ul role="list" class="flex flex-col divide-y divide-white/7">${progs.map(x => `<li><button type="button" data-program="${x.id}" class="flex w-full items-center justify-between gap-4 py-3 text-left hover:text-accent"><span class="truncate text-base font-medium sm:text-sm">${esc(x.name)}</span><span class="shrink-0 text-sm text-muted">${esc(byId(x.channel).name)} · ${fmtClock(new Date(x.start))}</span></button></li>`).join('')}</ul>`)}</section>` : ''}
    </div>`,
    after: () => $$('[data-program]').forEach(b => b.onclick = () => programDialog(b.dataset.program)),
  };
};

/* ========== Préférences (pages « Préférences » de Jellyfin) ========== */
const PREF_SECTIONS = [['profile', 'Profil', 'user-circle'], ['display', 'Affichage', 'sun'], ['home', "Écran d'accueil", 'home'], ['playback', 'Lecture', 'play'], ['subtitles', 'Sous-titres', 'chat-bubble-bottom-center-text'], ['controls', 'Contrôles', 'adjustments-horizontal'], ['quickconnect', 'Quick Connect', 'qr-code']];
const HOME_SECTION_LABELS = { spotlight: 'À la une (Spotlight)', resume: 'Reprendre', nextup: 'Prochains épisodes', top10: 'Top 10', latest: 'Ajouts récents', platforms: 'Plateformes (collections)', because: 'Parce que vous avez regardé', upcoming: 'À venir (Sonarr)', livetv: 'TV en direct', none: 'Aucune' };
VIEWS.preferences = p => {
  const sec = p.section || 'profile', P = U.prefs;
  const forms = {
    profile: `<div class="flex items-center gap-4">${avatar(U.user, 'size-20 text-3xl')}<div class="flex flex-col gap-2"><p class="text-xl font-semibold">${esc(U.user.name)}</p><button type="button" data-toast="Choisissez une image : PNG ou JPG, 1 Mo maximum." class="${btn.secondary} self-start">${ic('photo')}Changer l'image</button></div></div>
      <fieldset class="flex flex-col gap-4"><legend class="pb-2 text-base font-semibold">Mot de passe</legend>
        ${[['pw-cur', 'Mot de passe actuel', 'current-password'], ['pw-new', 'Nouveau mot de passe', 'new-password'], ['pw-conf', 'Confirmer le nouveau mot de passe', 'new-password']].map(([id, l, ac]) => `<div class="flex max-w-sm flex-col gap-1.5"><label for="${id}" class="text-sm font-medium text-muted">${l}</label><input id="${id}" name="${id}" type="password" autocomplete="${ac}" class="rounded-md bg-white/7 px-3 py-2.5 text-base inset-ring inset-ring-white/10 focus:inset-ring-2 focus:inset-ring-white focus:outline-none sm:py-2 sm:text-sm"></div>`).join('')}
      </fieldset>`,
    display: `<div class="grid gap-4 sm:grid-cols-2">${selectCtl('p-lang', "Langue d'affichage", ['Français', 'English', 'Deutsch', 'Español'], 'Français')}${selectCtl('p-datefmt', 'Format de date', ['Auto (fr-FR)', 'JJ/MM/AAAA', 'AAAA-MM-JJ'], 'Auto (fr-FR)')}${selectCtl('p-theme', 'Thème', ['2BFlix Groove', 'Sombre', 'Clair', 'Apple TV', 'Bleu radiance', 'Violet haze', 'WMC'], '2BFlix Groove')}${selectCtl('p-screensaver', 'Écran de veille', ['Aucun', 'Fonds d’écran', 'Logo', 'Photos'], 'Fonds d’écran')}</div>
      <div class="divide-y divide-white/7">${toggleCtl('p-backdrops', "Afficher les fonds d'écran", P.backdrops, 'Image du titre derrière les pages de détails.')}${toggleCtl('p-thememusic', 'Thème musical', P.themeMusic, 'Joue le générique en fond sur la fiche des séries.')}${toggleCtl('p-missing', 'Afficher les épisodes manquants', false, 'Épisodes connus mais absents de vos fichiers.')}${toggleCtl('p-details', 'Afficher les notes', true, 'Note de la communauté et classification sur les fiches.')}</div>`,
    home: `<p class="text-base text-pretty text-muted sm:text-sm">L'ordre des sections de l'accueil, comme dans Home Screen Sections.</p><ol class="grid gap-3 sm:grid-cols-2">${P.homeSections.concat(Array(Math.max(0, 10 - P.homeSections.length)).fill('none')).slice(0, 10).map((k, n) => `<li>${selectCtl(`p-home-${n}`, `Section ${n + 1}`, Object.entries(HOME_SECTION_LABELS).map(([v, l]) => ({ v, l })), k, { attrs: `data-home-slot="${n}"` })}</li>`).join('')}</ol>
      <fieldset><legend class="pb-2 text-base font-semibold">Ajouts récents</legend><p class="pb-2 text-sm text-muted">Médiathèques affichées dans « Ajoutés récemment ».</p><div class="grid sm:grid-cols-2">${LIBS.map(l => checkCtl(`p-latest-${l.key}`, l.name, l.kind === 'movies')).join('')}</div></fieldset>`,
    playback: `<div class="grid gap-4 sm:grid-cols-2">${selectCtl('p-audiolang', 'Langue audio préférée', ['Français', 'Version originale', 'Anglais', 'Japonais'], P.audioLang)}${selectCtl('p-quality-lan', 'Qualité maximale (réseau local)', ['Auto', '120 Mb/s', '60 Mb/s', '20 Mb/s', '8 Mb/s'], 'Auto')}${selectCtl('p-quality-wan', 'Qualité maximale (Internet)', ['Auto', '20 Mb/s', '10 Mb/s', '4 Mb/s', '1,5 Mb/s'], '20 Mb/s')}${selectCtl('p-intro', "Segment « Intro »", [{ v: 'ask', l: 'Proposer de passer' }, { v: 'skip', l: 'Passer automatiquement' }, { v: 'none', l: 'Ne rien faire' }], P.skipIntro)}${selectCtl('p-back', 'Recul rapide', [5, 10, 15, 30].map(v => ({ v, l: `${v} secondes` })), P.backSec)}${selectCtl('p-fwd', 'Avance rapide', [10, 15, 30, 60].map(v => ({ v, l: `${v} secondes` })), P.fwdSec)}</div>
      <div class="divide-y divide-white/7">${toggleCtl('p-autonext', "Lire l'épisode suivant automatiquement", P.autoNext, 'Affiche un compte à rebours à la fin de chaque épisode.')}${toggleCtl('p-default-audio', 'Lire la piste audio par défaut', true, 'Quelle que soit la langue préférée.')}${toggleCtl('p-cinema', 'Mode cinéma', false, 'Bandes-annonces avant les films.')}</div>`,
    subtitles: `<div class="grid gap-4 sm:grid-cols-2">${selectCtl('p-sublang', 'Langue des sous-titres', ['Français', 'Anglais', 'Aucune préférence'], P.subLang)}${selectCtl('p-submode', 'Mode des sous-titres', [{ v: 'default', l: 'Par défaut' }, { v: 'smart', l: 'Intelligent' }, { v: 'forced', l: 'Seulement forcés' }, { v: 'always', l: 'Toujours' }, { v: 'none', l: 'Aucun' }], P.subMode)}</div>
      <fieldset class="flex flex-col gap-4"><legend class="pb-2 text-base font-semibold">Apparence</legend>
        <div class="grid gap-4 sm:grid-cols-3">${selectCtl('p-subsize', 'Taille du texte', [{ v: 'small', l: 'Petite' }, { v: 'normal', l: 'Normale' }, { v: 'large', l: 'Grande' }, { v: 'xl', l: 'Très grande' }], P.subSize)}${selectCtl('p-subbg', 'Fond', [{ v: 'none', l: 'Aucun (contour)' }, { v: 'shadow', l: 'Ombre portée' }, { v: 'box', l: 'Bandeau noir' }], P.subBg)}${selectCtl('p-subcolor', 'Couleur', [{ v: '#ffffff', l: 'Blanc' }, { v: '#ffe14d', l: 'Jaune' }, { v: '#7fdbff', l: 'Cyan' }], P.subColor)}</div>
        <figure class="relative isolate aspect-video max-w-xl overflow-hidden rounded-lg"><img src="${esc(findShow('Shōgun')?.backdrop || '')}" alt="" class="absolute inset-0 -z-10 size-full object-cover"><figcaption id="sub-preview" class="absolute inset-x-0 bottom-[8%] px-6 text-center font-semibold"></figcaption></figure>
      </fieldset>`,
    controls: `<p class="text-base text-pretty text-muted sm:text-sm">Raccourcis clavier du lecteur.</p>${dl([['Espace ou K', 'Lecture / pause'], ['← / →', `Reculer de ${P.backSec} s / avancer de ${P.fwdSec} s`], ['↑ / ↓', 'Volume'], ['F', 'Plein écran'], ['M', 'Couper le son'], ['C', 'Sous-titres'], ['N', 'Épisode suivant'], ['Échap', 'Quitter le lecteur']].map(([k, v]) => [k, esc(v)]))}${toggleCtl('p-swipe', 'Gestes sur écran tactile', true, 'Balayer pour avancer, glisser verticalement pour le volume.')}`,
    quickconnect: `<p class="max-w-[56ch] text-base text-pretty text-muted sm:text-sm">Saisissez le code affiché sur l'appareil à connecter (TV, téléphone). Il sera connecté à votre compte sans mot de passe.</p><div class="flex max-w-xs flex-col gap-1.5"><label for="qc-code" class="text-sm font-medium text-muted">Code Quick Connect</label><input id="qc-code" name="qc-code" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="123456" class="rounded-md bg-white/7 px-3 py-2.5 text-center text-2xl font-semibold tracking-[0.4em] tabular-nums inset-ring inset-ring-white/10 focus:inset-ring-2 focus:inset-ring-white focus:outline-none"></div>`,
  };
  return {
    title: 'Préférences',
    html: `<div class="flex flex-col gap-6 px-4 pt-8 pb-16 sm:px-6">
      <header class="flex flex-col gap-2"><p class="text-sm font-medium text-muted">${esc(U.user.name)}</p><h1 class="${h1Cls}">Préférences</h1></header>
      <div class="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <nav aria-label="Sections des préférences" class="lg:w-56 lg:shrink-0"><ul role="list" class="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col lg:gap-1">${PREF_SECTIONS.map(([k, l, i]) => `<li><a href="#/preferences?section=${k}" ${sec === k ? 'aria-current="page"' : ''} class="flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-muted hover:text-white aria-[current=page]:bg-white/10 aria-[current=page]:text-white lg:rounded-md">${ic(i)}${l}</a></li>`).join('')}</ul></nav>
        <form id="prefs" class="flex min-w-0 max-w-3xl flex-1 flex-col gap-8">
          <h2 class="text-xl font-semibold">${PREF_SECTIONS.find(s => s[0] === sec)[1]}</h2>
          ${forms[sec]}
          <div class="flex gap-2 border-t border-white/10 pt-6"><button type="submit" class="inline-flex items-center rounded-full bg-accent px-5 py-2.25 text-sm/5 font-semibold text-black hover:bg-accent-strong">${sec === 'quickconnect' ? 'Autoriser' : 'Enregistrer'}</button></div>
        </form>
      </div></div>`,
    after: () => {
      const form = $('#prefs');
      const preview = () => { const el = $('#sub-preview'); if (!el) return; const size = { small: '1rem', normal: '1.375rem', large: '1.75rem', xl: '2.25rem' }[$('#p-subsize').value]; const bg = $('#p-subbg').value; el.innerHTML = `<span style="font-size:${size};color:${$('#p-subcolor').value};${bg === 'box' ? 'background:rgb(0 0 0 / .75);padding:.1em .4em;' : bg === 'shadow' ? 'text-shadow:0 2px 6px #000;' : '-webkit-text-stroke:.6px #000;text-shadow:0 0 3px #000;'}">Le navire anglais a été aperçu au large d'Ajiro.</span>`; };
      preview(); form.addEventListener('change', preview);
      form.onsubmit = ev => {
        ev.preventDefault();
        if (sec === 'quickconnect') { const c = $('#qc-code'); if (!/^\d{6}$/.test(c.value)) { c.setCustomValidity('Le code contient 6 chiffres.'); c.reportValidity(); c.oninput = () => c.setCustomValidity(''); return; } toast('Appareil autorisé. Il est maintenant connecté à votre compte.'); return; }
        if (sec === 'profile') { const a = $('#pw-new').value, b = $('#pw-conf').value; if (a || b) { if (a !== b) { $('#pw-conf').setCustomValidity('Les deux mots de passe ne correspondent pas.'); $('#pw-conf').reportValidity(); $('#pw-conf').oninput = () => $('#pw-conf').setCustomValidity(''); return; } } }
        if (sec === 'home') P.homeSections = $$('[data-home-slot]').map(s => s.value).filter(v => v !== 'none');
        if (sec === 'playback') Object.assign(P, { autoNext: $('#p-autonext').checked, skipIntro: $('#p-intro').value, backSec: +$('#p-back').value, fwdSec: +$('#p-fwd').value, audioLang: $('#p-audiolang').value });
        if (sec === 'subtitles') Object.assign(P, { subLang: $('#p-sublang').value, subMode: $('#p-submode').value, subSize: $('#p-subsize').value, subBg: $('#p-subbg').value, subColor: $('#p-subcolor').value });
        if (sec === 'display') Object.assign(P, { backdrops: $('#p-backdrops').checked, themeMusic: $('#p-thememusic').checked });
        toast('Préférences enregistrées.');
      };
    },
  };
};

/* ========== Administration (hors thème : reste l'interface Jellyfin, simplement re-stylée) ========== */
VIEWS.dashboard = () => ({ title: 'Tableau de bord', html: pad(`<div class="flex flex-col gap-4 pt-8 pb-16"><p class="text-sm font-medium text-muted">Administration</p><h1 class="${h1Cls}">Tableau de bord</h1><p class="max-w-[60ch] text-base text-pretty text-muted sm:text-sm">Le tableau de bord de Jellyfin (serveur, utilisateurs, médiathèques, lecture, plugins, tâches planifiées) garde sa structure. Le thème ne change que ses couleurs, sa typographie et ses arrondis : les mêmes jetons que le reste de 2BFlix.</p>
  <ul role="list" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">${[['Serveur', 'Nagare · 10.10.7 · 3 sessions actives'], ['Médiathèques', `${LIBS.length} médiathèques · analyse planifiée à 3:00`], ['Utilisateurs', `${USERS.length} profils · Quick Connect activé`], ['Lecture', 'Transcodage matériel VAAPI · 2 flux max'], ['Plugins', 'Home Screen Sections, Intro Skipper, TMDB, OpenSubtitles'], ['Tâches planifiées', 'Extraction des images de trickplay : 64 %']].map(([t, d]) => `<li class="rounded-lg bg-white/4 p-4"><p class="font-semibold">${t}</p><p class="mt-1 text-sm text-muted">${esc(d)}</p></li>`).join('')}</ul></div>`) });
VIEWS.metadata = () => ({ title: 'Gestionnaire de métadonnées', html: pad(`<div class="flex flex-col gap-4 pt-8 pb-16"><p class="text-sm font-medium text-muted">Administration</p><h1 class="${h1Cls}">Gestionnaire de métadonnées</h1><p class="max-w-[60ch] text-base text-pretty text-muted sm:text-sm">Arborescence des médiathèques et formulaire d'édition de Jellyfin, re-stylés par le thème. Depuis une fiche, « … » > « Modifier les métadonnées » ouvre l'éditeur.</p></div>`) });
VIEWS.notfound = () => ({ title: 'Page introuvable', html: pad(`<div class="pt-12">${empty('Page introuvable', 'Ce lien ne mène à aucun élément de vos médiathèques.', `<a href="#/home" class="${btn.secondary}">Retour à l'accueil</a>`)}</div>`) });

/* ========== Connexion ========== */
let loginStep = 'users', loginUser = null;
function showLogin() {
  const el = $('#login'); el.hidden = false; $('#app').inert = true;
  const posters = [...ITEMS.values()].filter(i => (i.Type === 'Movie' || i.Type === 'Series') && img.poster(i)).slice(0, 24);
  const wall = `<div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 grid grid-cols-4 gap-2 opacity-35 sm:grid-cols-6 lg:grid-cols-8">${posters.map(p => `<img src="${esc(img.poster(p))}" alt="" class="aspect-[2/3] w-full object-cover">`).join('')}</div><div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 bg-linear-to-b from-black/70 via-black/85 to-black"></div>`;
  let body = '';
  if (loginStep === 'users') {
    body = `<h1 class="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Qui regarde ?</h1>
      <ul role="list" class="flex flex-wrap justify-center gap-6 sm:gap-8">${USERS.map(u => `<li><button type="button" data-login-user="${u.id}" class="group flex w-28 flex-col items-center gap-3 rounded-xl p-2 sm:w-32"><span class="grid aspect-square w-full place-items-center rounded-full text-5xl font-semibold text-black outline-offset-4 group-hover:outline-2 group-hover:outline-white" style="background:${u.color}">${esc(u.name[0])}</span><span class="text-base font-medium text-muted group-hover:text-white">${esc(u.name)}</span></button></li>`).join('')}</ul>
      <div class="flex flex-wrap justify-center gap-3"><button type="button" data-login-step="manual" class="${btn.secondary}">Connexion manuelle</button><button type="button" data-login-step="quick" class="${btn.secondary}">${ic('qr-code')}Quick Connect</button></div>`;
  } else if (loginStep === 'password' || loginStep === 'manual') {
    body = `<form id="login-form" class="mx-auto flex w-full max-w-xs flex-col gap-4">
      ${loginUser ? `<div class="flex flex-col items-center gap-3">${avatar(loginUser, 'size-20 text-3xl')}<h1 class="text-2xl font-semibold">${esc(loginUser.name)}</h1></div>` : '<h1 class="text-center text-2xl font-semibold">Connexion</h1>'}
      ${loginUser ? '' : `<div class="flex flex-col gap-1.5"><label for="lg-user" class="text-sm font-medium text-muted">Nom d'utilisateur</label><input id="lg-user" name="lg-user" autocomplete="username" required class="rounded-md bg-white/7 px-3 py-2.5 text-base inset-ring inset-ring-white/10 focus:inset-ring-2 focus:inset-ring-white focus:outline-none"></div>`}
      <div class="flex flex-col gap-1.5"><label for="lg-pw" class="text-sm font-medium text-muted">Mot de passe</label><input id="lg-pw" name="lg-pw" type="password" autocomplete="current-password" class="rounded-md bg-white/7 px-3 py-2.5 text-base inset-ring inset-ring-white/10 focus:inset-ring-2 focus:inset-ring-white focus:outline-none"></div>
      ${checkCtl('lg-remember', 'Se souvenir de moi', true)}
      <p id="lg-err" hidden role="alert" class="text-sm text-danger"></p>
      <button type="submit" class="inline-flex justify-center rounded-full bg-accent px-4 py-2.25 text-sm/5 font-semibold text-black hover:bg-accent-strong">Se connecter</button>
      <button type="button" data-login-step="users" class="${btn.plain} justify-center">Retour</button>
    </form>`;
  } else if (loginStep === 'quick') {
    const code = String(100000 + (hash(TODAY) % 900000));
    body = `<div class="mx-auto flex max-w-sm flex-col items-center gap-4 text-center"><h1 class="text-2xl font-semibold">Quick Connect</h1><p class="text-base text-pretty text-muted">Sur un appareil déjà connecté, ouvrez Préférences > Quick Connect et saisissez ce code.</p><p class="rounded-lg bg-white/7 px-6 py-4 text-4xl font-semibold tracking-[0.3em] tabular-nums">${code}</p><p class="text-sm text-muted">Le code expire dans 10 minutes.</p><button type="button" data-login-step="users" class="${btn.plain}">Retour</button></div>`;
  }
  el.innerHTML = `<div class="relative isolate flex min-h-full flex-col items-center justify-center gap-10 px-4 py-16">${wall}<div class="flex items-center gap-3">${LOGO}</div>${body}<p class="text-sm text-subtle">Serveur Nagare · Jellyfin 10.10</p></div>`;
  $$('[data-login-user]', el).forEach(b => b.onclick = () => { const u = USERS.find(x => x.id === b.dataset.loginUser); if (u.kids || u.name === 'Invité') return finishLogin(u); loginUser = u; loginStep = 'password'; showLogin(); $('#lg-pw')?.focus(); });
  $$('[data-login-step]', el).forEach(b => b.onclick = () => { loginStep = b.dataset.loginStep; loginUser = null; showLogin(); });
  $('#login-form', el)?.addEventListener('submit', ev => {
    ev.preventDefault();
    const name = loginUser?.name || $('#lg-user').value.trim();
    const u = USERS.find(x => x.name.toLowerCase() === name.toLowerCase());
    const err = $('#lg-err');
    if (!u) { err.hidden = false; err.textContent = `Aucun compte « ${name} » sur ce serveur. Vérifiez le nom d'utilisateur.`; return; }
    if (!$('#lg-pw').value) { err.hidden = false; err.textContent = 'Saisissez votre mot de passe. Dans cette maquette, n’importe quel mot de passe fonctionne.'; return; }
    finishLogin(u);
  });
  el.querySelector('#lg-user, #lg-pw')?.focus();
}
function finishLogin(u) { U.user = u; loginStep = 'users'; loginUser = null; toast(`Bienvenue, ${u.name}.`); location.hash = '#/home'; }

/* ========== Télécommande ========== */
VIEWS.remote = () => ({
  title: 'Télécommande',
  html: pad(`<div class="flex flex-col gap-6 pt-8 pb-16"><p class="text-sm font-medium text-muted">Lecture à distance</p><h1 class="${h1Cls}">Télécommande</h1>
    ${U.cast && NP.item ? remoteHtml() : empty('Aucun appareil contrôlé', 'Choisissez un appareil dans « Lire sur » (icône écran en haut à droite), puis lancez une lecture : vous la piloterez d’ici.', `<button type="button" data-act="cast" class="${btn.secondary}">${ic('tv')}Choisir un appareil</button>`)}</div>`),
});
