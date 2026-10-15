/* 2BFlix Groove — lecteur vidéo (OSD Jellyfin), lecture à distance et démarrage. */

const player = $('#player');
const NP = { item: null, queue: [], pos: 0, dur: 0, playing: false, live: null, speed: 1, quality: 'Auto', aspect: 'auto', audio: 0, sub: -1, subOffset: 0, volume: 70, muted: false, stats: false, panel: null, remaining: false, upNextHidden: false, remote: false, preview: null };
const SUB_LINES = ['— Tu es sûr de vouloir continuer ?', "— On n'a plus le choix.", "Le navire arrivera avant l'aube.", "Je t'avais dit de ne pas revenir.", '— Qui t’a envoyé ici ?', "Écoute-moi bien, c'est important.", '— Et maintenant, on fait quoi ?', 'Personne ne doit le savoir.'];
const QUALITIES = ['Auto', '4K · 120 Mb/s', '1080p · 20 Mb/s', '1080p · 10 Mb/s', '720p · 4 Mb/s', '480p · 1,5 Mb/s'];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const ASPECTS = [['auto', 'Automatique'], ['cover', 'Recadrer'], ['fill', 'Étirer']];

/* ---------- Choix de ce qu'on lit (règles de Jellyfin) ---------- */
function resolvePlay(it) {
  switch (it.Type) {
    case 'Series': { const e = nextUpOf(it) || firstEpisode(it); return { item: e, queue: episodesOf(it).filter(aired) }; }
    case 'Season': { const eps = it.episodes.map(byId).filter(aired); return { item: eps.find(e => U.resume.has(e.id)) || eps.find(e => !U.played.has(e.id)) || eps[0], queue: eps }; }
    case 'BoxSet': case 'Playlist': { const list = it.items.map(byId).flatMap(x => x.Type === 'Series' ? [nextUpOf(x) || firstEpisode(x)] : [x]).filter(Boolean); return { item: list[0], queue: list }; }
    case 'Episode': return { item: it, queue: byId(it.seasonId).episodes.map(byId).filter(aired) };
    default: return { item: it, queue: [it] };
  }
}
function play(it, { from, shuffle: shuffled } = {}) {
  if (!it) return;
  const { item, queue } = resolvePlay(it);
  if (!item) return toast('Rien à lire pour l’instant.');
  if (item.Type === 'Episode' && !aired(item)) return toast(`Cet épisode sera disponible le ${fmtDate(item.date)}.`);
  Object.assign(NP, { item, queue: shuffled ? [...queue].sort(() => Math.random() - 0.5) : queue, dur: durationSec(item), pos: from ?? (U.resume.get(item.id) || 0), playing: true, live: null, upNextHidden: false, panel: null, audio: 0, sub: defaultSub(item), subOffset: 0 });
  U.last.set(item.id, Date.now());
  if (U.cast) { NP.remote = true; if (player.open) player.close(); renderNowPlaying(); toast(`Lecture sur ${U.cast} : ${titleOf(item)}${item.Type === 'Episode' ? `, ${epCode(item)}` : ''}.`); return; }
  NP.remote = false; openPlayer();
}
function playLive(p) {
  const ch = byId(p.channel);
  Object.assign(NP, { item: { id: p.id, Type: 'Program', name: p.name, channel: ch }, queue: [], live: p, pos: (Date.now() - p.start) / 1000, dur: (p.end - p.start) / 1000, playing: true, panel: null, sub: -1 });
  if (U.cast) { NP.remote = true; renderNowPlaying(); toast(`${ch.name} sur ${U.cast}.`); return; }
  NP.remote = false; openPlayer();
}
const defaultSub = it => { const mi = mediaInfo(it); return U.prefs.subMode === 'none' ? -1 : U.prefs.subMode === 'always' ? 1 : mi.orig === 'Français' ? -1 : mi.subs.findIndex(s => s.forced); };

/* ---------- Rendu du lecteur ---------- */
const plIcon = (name, label, attrs = '', cls = '') => `<button type="button" ${attrs} aria-label="${esc(label)}" class="relative grid size-10 shrink-0 place-items-center rounded-full text-white/90 hover:bg-white/10 hover:text-white aria-pressed:text-accent ${cls}">${ic(name)}${TT}</button>`;
function frameSrc(it) { return it.Type === 'Program' ? null : it.Type === 'Episode' ? (it.imgLg || it.img || byId(it.seriesId).backdrop) : (it.backdrop || it.poster); }
function openPlayer() {
  const it = NP.item, live = NP.live, series = it.Type === 'Episode' ? byId(it.seriesId) : null;
  const chapters = live ? [] : chaptersOf(it);
  const src = frameSrc(it), isPoster = it.Type === 'Movie';
  const nextItem = queueNext();
  player.innerHTML = `
    <div id="pl-video" class="absolute inset-0 overflow-hidden bg-black">
      ${live ? `<div class="grid size-full place-items-center bg-linear-to-br from-elevated to-black">${chLogo(it.channel, 'max-h-32 max-w-[40%]')}</div>`
        : isPoster ? `<img src="${esc(src)}" alt="" class="absolute inset-0 size-full scale-125 object-cover opacity-40 blur-3xl"><img id="pl-frame" src="${esc(src)}" alt="" class="relative mx-auto h-full object-contain motion-safe:transition-transform motion-safe:duration-[20s] motion-safe:ease-linear">`
        : `<img id="pl-frame" src="${esc(src)}" alt="" class="size-full ${NP.aspect === 'fill' ? 'object-fill' : NP.aspect === 'cover' ? 'object-cover' : 'object-contain'} motion-safe:transition-transform motion-safe:duration-[20s] motion-safe:ease-linear">`}
    </div>
    <p id="pl-sub" aria-live="off" class="pointer-events-none absolute inset-x-0 bottom-[14%] z-10 px-6 text-center font-semibold"></p>
    <div id="pl-ui" class="absolute inset-0 z-20 flex flex-col justify-between motion-safe:transition-opacity motion-safe:duration-300">
      <div class="flex items-start gap-3 bg-linear-to-b from-black/80 to-transparent pt-[max(16px,env(safe-area-inset-top,0px))] pr-[max(16px,env(safe-area-inset-right,0px))] pb-16 pl-[max(16px,env(safe-area-inset-left,0px))] sm:px-8 sm:pt-6">
        ${plIcon('chevron-left', 'Quitter la lecture', 'data-pl="close"', 'bg-white/10')}
        <div class="min-w-0 flex-1">
          ${live ? `<p class="flex items-center gap-2 text-sm text-white/80"><span class="inline-flex items-center gap-1 rounded-sm bg-danger px-1.5 py-0.5 text-xs font-semibold text-black">${ic('signal')}En direct</span>${esc(it.channel.name)}</p><p class="truncate text-lg font-semibold sm:text-xl">${esc(it.name)}</p>`
            : series ? `<p class="truncate text-sm text-white/80">${esc(series.name)}</p><p class="truncate text-lg font-semibold sm:text-xl">${epCode(it)} · ${esc(it.name)}</p>`
            : `<p class="truncate text-sm text-white/80">${esc(it.year)} · ${esc(it.genres.join(', '))}</p><p class="truncate text-lg font-semibold sm:text-xl">${esc(it.name)}</p>`}
        </div>
        <div class="flex shrink-0 items-center gap-1">
          ${U.syncplay ? `<span class="hidden items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-medium text-accent sm:inline-flex">${ic('users')}SyncPlay</span>` : ''}
          <p id="pl-ends" class="px-2 text-sm text-white/80 tabular-nums max-sm:hidden"></p>
          ${live ? '' : plIcon('heart', U.fav.has(it.id) ? 'Retirer des favoris' : 'Ajouter aux favoris', `data-pl="fav" aria-pressed="${U.fav.has(it.id)}"`)}
          ${plIcon('tv', 'Lire sur un autre appareil', 'data-pl="cast"')}
        </div>
      </div>

      <div id="pl-center" class="flex items-center justify-center gap-8 pointer-fine:hidden">
        ${live ? '' : plIcon('arrow-uturn-left', `Reculer de ${U.prefs.backSec} secondes`, 'data-pl="back"', 'size-14 bg-black/30')}
        <button type="button" data-pl="toggle" class="grid size-16 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm" aria-label="Pause">${ic('pause')}</button>
        ${live ? '' : plIcon('arrow-uturn-right', `Avancer de ${U.prefs.fwdSec} secondes`, 'data-pl="fwd"', 'size-14 bg-black/30')}
      </div>

      <div class="relative flex flex-col gap-2 bg-linear-to-t from-black/90 via-black/60 to-transparent pt-24 pr-[max(16px,env(safe-area-inset-right,0px))] pb-[max(12px,env(safe-area-inset-bottom,0px))] pl-[max(16px,env(safe-area-inset-left,0px))] sm:px-8 sm:pb-6">
        <button type="button" id="pl-skip" hidden data-pl="skip" class="absolute right-4 bottom-36 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.25 text-sm/5 font-semibold text-black hover:bg-white/90 sm:right-8">Passer l'intro${ic('forward')}</button>
        ${nextItem ? `<aside id="pl-next" hidden aria-label="Épisode suivant" class="absolute right-4 bottom-36 flex w-[min(22rem,calc(100%-2rem))] gap-3 rounded-lg bg-elevated/95 p-3 shadow-2xl backdrop-blur sm:right-8">
          <img src="${esc(nextItem.img || frameSrc(nextItem) || '')}" alt="" class="aspect-video w-28 shrink-0 rounded-md object-cover">
          <div class="flex min-w-0 flex-col gap-1"><p class="text-sm text-muted"><span id="pl-next-count"></span></p><p class="truncate text-sm font-semibold">${nextItem.Type === 'Episode' ? `${epCode(nextItem)} · ` : ''}${esc(nextItem.name)}</p>
          <div class="flex gap-2 pt-1"><button type="button" data-pl="next" class="inline-flex items-center gap-1.5 rounded-full bg-accent py-1.5 pr-3 pl-2 text-sm font-semibold text-black hover:bg-accent-strong">${ic('play')}Lire</button><button type="button" data-pl="hide-next" class="rounded-full px-3 py-1.5 text-sm font-semibold text-muted hover:text-white">Masquer</button></div></div>
        </aside>` : ''}
        ${live ? `<div class="flex items-center gap-3 text-sm text-white/80 tabular-nums"><span>${fmtClock(new Date(NP.live.start))}</span><div class="h-1 flex-1 overflow-hidden rounded-full bg-white/25"><div id="pl-live-bar" class="h-full w-(--p) bg-danger"></div></div><span>${fmtClock(new Date(NP.live.end))}</span></div>`
          : `<div class="relative flex items-center gap-3 text-sm text-white/85 tabular-nums">
            <span id="pl-pos" class="w-16 text-right">0:00</span>
            <div class="relative flex-1">
              <label for="pl-seek" class="sr-only">Position de lecture</label>
              <input id="pl-seek" name="pl-seek" type="range" min="0" max="${Math.round(NP.dur)}" step="1" value="0" class="slider relative z-10">
              <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-1 -translate-y-1/2">${chapters.slice(1).map(c => `<span class="absolute top-0 h-1 w-0.5 bg-black/70" style="left:${(c.start / NP.dur) * 100}%"></span>`).join('')}</div>
              <div id="pl-preview" hidden class="pointer-events-none absolute bottom-6 z-30 flex w-44 -translate-x-1/2 flex-col items-center gap-1">
                <div class="aspect-video w-full overflow-hidden rounded-md bg-black outline-2 outline-white"><img id="pl-preview-img" src="${esc(src || '')}" alt="" class="size-full object-cover"></div>
                <p class="rounded-sm bg-black/80 px-1.5 py-0.5 text-xs font-semibold"><span id="pl-preview-time"></span> · <span id="pl-preview-chap"></span></p>
              </div>
            </div>
            <button type="button" data-pl="remaining" class="w-16 rounded-sm text-left hover:text-white" aria-label="Basculer temps total / temps restant"><span id="pl-dur">0:00</span></button>
          </div>`}
        <div class="flex items-center gap-1 sm:gap-2">
          <button type="button" data-pl="toggle" class="relative grid size-11 shrink-0 place-items-center rounded-full bg-accent text-black hover:scale-105 hover:bg-accent-strong motion-safe:transition-transform max-sm:hidden" aria-label="Pause">${ic('pause')}</button>
          ${live ? '' : plIcon('backward', it.Type === 'Episode' ? 'Épisode précédent' : 'Chapitre précédent', 'data-pl="prev"')}
          ${live ? '' : plIcon('forward', it.Type === 'Episode' ? 'Épisode suivant' : 'Chapitre suivant', 'data-pl="next"')}
          ${live ? '' : plIcon('arrow-uturn-left', `Reculer de ${U.prefs.backSec} secondes`, 'data-pl="back"', 'max-md:hidden')}
          ${live ? '' : plIcon('arrow-uturn-right', `Avancer de ${U.prefs.fwdSec} secondes`, 'data-pl="fwd"', 'max-md:hidden')}
          <div class="flex items-center gap-1 max-sm:hidden">
            ${plIcon('speaker-wave', 'Couper le son', 'data-pl="mute" id="pl-mute"')}
            <label for="pl-vol" class="sr-only">Volume</label>
            <input id="pl-vol" name="pl-vol" type="range" min="0" max="100" value="${NP.muted ? 0 : NP.volume}" class="slider w-24">
          </div>
          <div class="ml-auto flex items-center gap-0.5 sm:gap-1">
            ${it.Type === 'Episode' ? plIcon('queue-list', 'Épisodes', 'data-pl="panel" data-panel="episodes" aria-haspopup="dialog"') : ''}
            ${live ? plIcon('table-cells', 'Guide des programmes', 'data-pl="guide"') : plIcon('list-bullet', 'Chapitres', 'data-pl="panel" data-panel="chapters" aria-haspopup="dialog"', 'max-sm:hidden')}
            ${live ? '' : plIcon('language', 'Audio', 'data-pl="panel" data-panel="audio" aria-haspopup="dialog"')}
            ${live ? '' : plIcon('chat-bubble-bottom-center-text', 'Sous-titres', `data-pl="panel" data-panel="subs" aria-haspopup="dialog" aria-pressed="${NP.sub >= 0}"`)}
            ${plIcon('cog-6-tooth', 'Paramètres de lecture', 'data-pl="panel" data-panel="settings" aria-haspopup="dialog"')}
            ${plIcon('window', 'Image dans l’image', 'data-pl="pip"', 'max-md:hidden')}
            ${plIcon('arrows-pointing-out', 'Plein écran', 'data-pl="full" id="pl-full"')}
          </div>
        </div>
      </div>
    </div>
    <aside id="pl-panel" hidden aria-labelledby="pl-panel-title" class="absolute inset-y-0 right-0 z-30 flex w-[min(24rem,100%)] flex-col bg-raised/95 shadow-2xl backdrop-blur"></aside>
    <div id="pl-stats" hidden class="absolute top-24 left-4 z-30 w-72 rounded-md bg-black/80 p-3 text-xs sm:left-8"></div>
    <p id="pl-toast" role="status" aria-live="polite" class="pointer-events-none absolute top-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black opacity-0 motion-safe:transition data-show:opacity-100"></p>`;
  if (!player.open) player.showModal();
  bindPlayer(); syncPlayer(); wake();
  $('[data-pl="toggle"]:not(.max-sm\\:hidden)', player)?.focus({ preventScroll: true });
  $$('[data-pl="toggle"]', player)[1]?.focus({ preventScroll: true });
}
const queueNext = () => { const k = NP.queue.findIndex(x => x.id === NP.item.id); return k >= 0 ? NP.queue[k + 1] : null; };
const queuePrev = () => { const k = NP.queue.findIndex(x => x.id === NP.item.id); return k > 0 ? NP.queue[k - 1] : null; };

function syncPlayer() {
  if (!player.open) return;
  const it = NP.item, live = NP.live;
  $$('[data-pl="toggle"]', player).forEach(b => { b.setAttribute('aria-label', NP.playing ? 'Pause' : 'Lecture'); b.innerHTML = ic(NP.playing ? 'pause' : 'play') + TT; });
  const frame = $('#pl-frame', player); if (frame) frame.style.transform = NP.playing && !reduceMotion() ? 'scale(1.06)' : 'scale(1)';
  const remain = NP.dur - NP.pos;
  $('#pl-ends', player).textContent = live ? `Fin à ${fmtClock(new Date(live.end))}` : endsAt(remain / NP.speed);
  if (live) { $('#pl-live-bar', player)?.style.setProperty('--p', `${Math.min(100, (NP.pos / NP.dur) * 100)}%`); }
  else {
    const seek = $('#pl-seek', player);
    if (document.activeElement !== seek || !seek.matches(':active')) seek.value = Math.round(NP.pos);
    seek.style.setProperty('--pct', `${(NP.pos / NP.dur) * 100}%`); seek.style.setProperty('--buf', `${Math.min(100, ((NP.pos + 180) / NP.dur) * 100)}%`);
    seek.setAttribute('aria-valuetext', `${fmtTime(NP.pos)} sur ${fmtTime(NP.dur)}`);
    $('#pl-pos', player).textContent = fmtTime(NP.pos);
    $('#pl-dur', player).textContent = NP.remaining ? `-${fmtTime(remain)}` : fmtTime(NP.dur);
    const intro = introOf(it), inIntro = intro && NP.pos >= intro.start && NP.pos < intro.end;
    if (inIntro && U.prefs.skipIntro === 'skip') { NP.pos = intro.end; plToast('Intro passée.'); }
    $('#pl-skip', player).hidden = !(inIntro && U.prefs.skipIntro === 'ask');
    const nx = $('#pl-next', player);
    if (nx) { const show = U.prefs.autoNext && !NP.upNextHidden && remain <= 25; nx.hidden = !show; if (show) $('#pl-next-count', player).textContent = `Épisode suivant dans ${Math.max(0, Math.ceil(remain))} s`; }
  }
  const v = NP.muted ? 0 : NP.volume, mute = $('#pl-mute', player), vol = $('#pl-vol', player);
  if (mute) { mute.setAttribute('aria-label', v === 0 ? 'Rétablir le son' : 'Couper le son'); mute.innerHTML = ic(v === 0 ? 'speaker-x-mark' : 'speaker-wave') + TT; }
  if (vol) { vol.value = v; vol.style.setProperty('--pct', `${v}%`); vol.setAttribute('aria-valuetext', `Volume ${v} %`); }
  const sub = $('#pl-sub', player);
  if (NP.sub >= 0 && !live) {
    const line = SUB_LINES[Math.floor((NP.pos + NP.subOffset) / 6) % SUB_LINES.length], P = U.prefs;
    const size = { small: '1rem', normal: '1.5rem', large: '1.875rem', xl: '2.375rem' }[P.subSize];
    sub.innerHTML = `<span style="font-size:${size};color:${P.subColor};${P.subBg === 'box' ? 'background:rgb(0 0 0 / .75);padding:.1em .4em;' : P.subBg === 'shadow' ? 'text-shadow:0 2px 6px #000;' : '-webkit-text-stroke:.6px #000;text-shadow:0 0 3px #000;'}">${esc(line)}</span>`;
  } else sub.innerHTML = '';
  $('[data-panel="subs"]', player)?.setAttribute('aria-pressed', NP.sub >= 0);
  if (NP.stats) renderStats();
}
function renderStats() {
  const it = NP.item, mi = NP.live ? null : mediaInfo(it), v = mi?.versions[0];
  const transcode = NP.quality !== 'Auto' && !NP.quality.startsWith('4K');
  const rows = NP.live ? [['Méthode', 'Transcodage (flux TV)'], ['Source', 'HDHomeRun · MPEG-TS'], ['Vidéo', 'H.264 1080i → 1080p'], ['Audio', 'AC3 5.1 → AAC 2.0']]
    : [['Lecteur', 'Lecteur vidéo HTML'], ['Méthode', transcode ? 'Transcodage' : 'Lecture directe'], ['Conteneur', transcode ? 'MP4 (HLS fMP4)' : mi.container], ['Débit', transcode ? NP.quality.split('· ')[1] : v.bitrate], ['Vidéo', transcode ? `H.264 · ${NP.quality.split(' ')[0]}` : v.name], ['Audio', mi.audio[NP.audio]?.label || ''], ['Images perdues', '0'], ...(transcode ? [['Raison', 'Débit supérieur à la limite choisie']] : [])];
  $('#pl-stats', player).innerHTML = `<p class="mb-2 font-semibold">Statistiques de lecture</p><dl class="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">${rows.map(([k, val]) => `<dt class="text-white/70">${k}</dt><dd class="truncate">${esc(val)}</dd>`).join('')}</dl>`;
}

/* ---------- Panneaux ---------- */
function panel(name) {
  const p = $('#pl-panel', player);
  if (!name || NP.panel === name) { NP.panel = null; p.hidden = true; return; }
  NP.panel = name;
  const it = NP.item, mi = NP.live ? null : mediaInfo(it);
  const radio = (group, list, cur) => `<ul role="list" class="flex flex-col">${list.map(([v, l, hint]) => `<li><button type="button" data-choose="${group}" data-v="${esc(v)}" aria-pressed="${String(v) === String(cur)}" class="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-base hover:bg-white/10 aria-pressed:text-accent sm:text-sm"><span class="min-w-0 flex-1"><span class="block truncate">${esc(l)}</span>${hint ? `<span class="block text-sm text-muted">${esc(hint)}</span>` : ''}</span>${String(v) === String(cur) ? ic('check') : ''}</button></li>`).join('')}</ul>`;
  const head = t => `<div class="flex items-center justify-between gap-3 border-b border-white/10 p-4"><h2 id="pl-panel-title" class="text-lg font-semibold">${esc(t)}</h2>${plIcon('x-mark', 'Fermer le panneau', 'data-pl="panel-close"')}</div>`;
  let html = '';
  if (name === 'episodes') {
    const season = byId(it.seasonId), series = byId(it.seriesId);
    html = head(`${series.name} · ${season.name}`) + `<ol role="list" class="flex-1 overflow-y-auto scrollbar-thin p-2">${season.episodes.map(byId).map(e => `<li><button type="button" data-pl-ep="${e.id}" ${e.id === it.id ? 'aria-current="true"' : ''} ${aired(e) ? '' : 'disabled'} class="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-white/10 disabled:opacity-50 aria-[current=true]:bg-white/10">
      <div class="relative w-28 shrink-0">${imgOrPlaceholder(e.img, e.name, 'aspect-video w-full rounded', 'tv')}${progressPct(e) ? `<div class="absolute inset-x-1 bottom-1">${progressBar(progressPct(e))}</div>` : ''}</div>
      <span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium ${e.id === it.id ? 'text-accent' : ''}">${e.n}. ${esc(e.name)}</span><span class="block text-sm text-muted">${e.runtime} min${U.played.has(e.id) ? ' · Vu' : ''}</span></span></button></li>`).join('')}</ol>`;
  } else if (name === 'chapters') {
    const src = frameSrc(it);
    html = head('Chapitres') + `<ol role="list" class="flex-1 overflow-y-auto scrollbar-thin p-2">${chaptersOf(it).map((c, k) => `<li><button type="button" data-pl-seek="${c.start}" class="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-white/10"><img src="${esc(src)}" alt="" class="aspect-video w-24 shrink-0 rounded object-cover" style="object-position:${(k * 37) % 100}% ${(k * 23) % 100}%"><span class="min-w-0 flex-1"><span class="block truncate text-sm font-medium">${esc(c.name)}</span><span class="block text-sm text-muted tabular-nums">${fmtTime(c.start)}</span></span></button></li>`).join('')}</ol>`;
  } else if (name === 'audio') {
    html = head('Audio') + `<div class="flex-1 overflow-y-auto p-2">${radio('audio', mi.audio.map((a, k) => [k, a.label, a.def ? 'Par défaut' : '']), NP.audio)}</div>`;
  } else if (name === 'subs') {
    html = head('Sous-titres') + `<div class="flex flex-1 flex-col gap-4 overflow-y-auto p-2">${radio('sub', [[-1, 'Désactivés'], ...mi.subs.map((s, k) => [k, s.label, s.forced ? 'Forcés · seulement les passages en langue étrangère' : 'SRT · externe'])], NP.sub)}
      <div class="flex flex-col gap-2 px-3"><label for="pl-suboff" class="flex justify-between text-sm font-medium">Décalage<span class="text-muted tabular-nums" id="pl-suboff-v">${NP.subOffset > 0 ? '+' : ''}${NP.subOffset.toFixed(1).replace('.', ',')} s</span></label><input id="pl-suboff" name="pl-suboff" type="range" min="-5" max="5" step="0.5" value="${NP.subOffset}" class="slider" style="--pct:${((NP.subOffset + 5) / 10) * 100}%"></div>
      <div class="px-3"><button type="button" data-pl="search-subs" class="${btn.secondary}">${ic('magnifying-glass')}Rechercher des sous-titres</button></div></div>`;
  } else if (name === 'settings') {
    html = head('Paramètres de lecture') + `<div class="flex flex-1 flex-col gap-4 overflow-y-auto p-2">
      <section><h3 class="px-3 pt-2 text-sm font-semibold text-muted">Qualité</h3>${radio('quality', QUALITIES.map(q => [q, q, q === 'Auto' ? 'Lecture directe si possible' : '']), NP.quality)}</section>
      ${NP.live ? '' : `<section><h3 class="px-3 pt-2 text-sm font-semibold text-muted">Vitesse de lecture</h3>${radio('speed', SPEEDS.map(s => [s, s === 1 ? 'Normale' : `${String(s).replace('.', ',')}×`]), NP.speed)}</section>`}
      <section><h3 class="px-3 pt-2 text-sm font-semibold text-muted">Format d'image</h3>${radio('aspect', ASPECTS, NP.aspect)}</section>
      <section class="px-3">${toggleCtl('pl-stats-t', 'Statistiques de lecture', NP.stats, 'Méthode de lecture, débit, codecs.')}</section></div>`;
  }
  p.innerHTML = html; p.hidden = false;
  $('button', p)?.focus();
  $$('[data-choose]', p).forEach(b => b.onclick = () => choose(b.dataset.choose, b.dataset.v));
  $$('[data-pl-ep]', p).forEach(b => b.onclick = () => play(byId(b.dataset.plEp)));
  $$('[data-pl-seek]', p).forEach(b => b.onclick = () => { NP.pos = +b.dataset.plSeek; panel(null); syncPlayer(); });
  $('#pl-suboff', p)?.addEventListener('input', ev => { NP.subOffset = +ev.target.value; ev.target.style.setProperty('--pct', `${((NP.subOffset + 5) / 10) * 100}%`); $('#pl-suboff-v', p).textContent = `${NP.subOffset > 0 ? '+' : ''}${NP.subOffset.toFixed(1).replace('.', ',')} s`; syncPlayer(); });
  $('#pl-stats-t', p)?.addEventListener('change', ev => { NP.stats = ev.target.checked; $('#pl-stats', player).hidden = !NP.stats; syncPlayer(); });
}
function choose(group, v) {
  const mi = NP.live ? null : mediaInfo(NP.item);
  if (group === 'audio') { NP.audio = +v; plToast(`Audio : ${mi.audio[NP.audio].label}.`); }
  if (group === 'sub') { NP.sub = +v; plToast(NP.sub < 0 ? 'Sous-titres désactivés.' : `Sous-titres : ${mi.subs[NP.sub].label}.`); }
  if (group === 'quality') { NP.quality = v; plToast(v === 'Auto' ? 'Qualité automatique.' : `Qualité : ${v}. Le serveur transcode le flux.`); }
  if (group === 'speed') { NP.speed = +v; plToast(`Vitesse : ${+v === 1 ? 'normale' : `${String(v).replace('.', ',')}×`}.`); }
  if (group === 'aspect') { NP.aspect = v; const f = $('#pl-frame', player); if (f && NP.item.Type !== 'Movie') f.className = f.className.replace(/object-(contain|cover|fill)/, `object-${v === 'fill' ? 'fill' : v === 'cover' ? 'cover' : 'contain'}`); plToast(`Format d'image : ${ASPECTS.find(a => a[0] === v)[1].toLowerCase()}.`); }
  panel(NP.panel); const keep = NP.panel; NP.panel = null; panel(keep); syncPlayer();
}

/* ---------- Interactions ---------- */
let idleT;
function wake() {
  const ui = $('#pl-ui', player); if (!ui) return;
  player.removeAttribute('data-idle'); ui.style.opacity = '';
  clearTimeout(idleT);
  idleT = setTimeout(() => { if (NP.playing && player.open && !NP.panel && !player.matches(':has(#pl-ui :focus-visible)')) { player.setAttribute('data-idle', ''); ui.style.opacity = '0'; } }, 3000);
}
function plToast(msg) { const t = $('#pl-toast', player); if (!t) return toast(msg); t.textContent = msg; t.setAttribute('data-show', ''); clearTimeout(plToast.t); plToast.t = setTimeout(() => t.removeAttribute('data-show'), 2200); }
function seekBy(s) { if (NP.live) return; NP.pos = Math.max(0, Math.min(NP.dur, NP.pos + s)); syncPlayer(); }
function bindPlayer() {
  const seek = $('#pl-seek', player), prev = $('#pl-preview', player);
  if (seek) {
    seek.addEventListener('input', () => { NP.pos = +seek.value; syncPlayer(); });
    const showPreview = x => {
      const r = seek.getBoundingClientRect(), f = Math.max(0, Math.min(1, (x - r.left) / r.width)), t = f * NP.dur;
      const ch = chaptersOf(NP.item).filter(c => c.start <= t).pop();
      prev.hidden = false; prev.style.left = `${Math.max(88, Math.min(r.width - 88, f * r.width))}px`;
      $('#pl-preview-time', player).textContent = fmtTime(t); $('#pl-preview-chap', player).textContent = ch?.name || '';
      $('#pl-preview-img', player).style.objectPosition = `${(f * 100).toFixed(0)}% ${(30 + f * 40).toFixed(0)}%`;
    };
    seek.addEventListener('pointermove', ev => { if (ev.pointerType === 'mouse') showPreview(ev.clientX); });
    seek.addEventListener('pointerleave', () => { prev.hidden = true; });
  }
  $('#pl-vol', player)?.addEventListener('input', ev => { NP.volume = +ev.target.value; NP.muted = NP.volume === 0; syncPlayer(); });
  $('#pl-video', player).addEventListener('click', () => { if (matchMedia('(pointer: fine)').matches) { NP.playing = !NP.playing; plToast(NP.playing ? 'Lecture' : 'Pause'); syncPlayer(); } else wake(); });
  $('#pl-video', player).addEventListener('dblclick', () => toggleFull());
}
function toggleFull() { const p = document.fullscreenElement ? document.exitFullscreen() : player.requestFullscreen?.(); p?.catch?.(() => plToast('Le plein écran est indisponible ici.')); }
document.addEventListener('fullscreenchange', () => { const b = $('#pl-full', player); if (b) { b.setAttribute('aria-label', document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran'); b.innerHTML = ic(document.fullscreenElement ? 'arrows-pointing-in' : 'arrows-pointing-out') + TT; } });
player.addEventListener('click', ev => {
  const b = ev.target.closest('[data-pl]'); if (!b) return;
  wake();
  switch (b.dataset.pl) {
    case 'close': return player.close();
    case 'toggle': NP.playing = !NP.playing; return syncPlayer();
    case 'back': return seekBy(-U.prefs.backSec);
    case 'fwd': return seekBy(U.prefs.fwdSec);
    case 'prev': {
      if (NP.item.Type === 'Episode') { if (NP.pos > 10 || !queuePrev()) { NP.pos = 0; return syncPlayer(); } return play(queuePrev(), { from: 0 }); }
      const ch = chaptersOf(NP.item).filter(c => c.start < NP.pos - 3).pop(); NP.pos = ch?.start || 0; return syncPlayer();
    }
    case 'next': {
      if (NP.item.Type === 'Episode' || NP.queue.length > 1) { const n = queueNext(); if (n) { markProgress(); return play(n, { from: 0 }); } return plToast('Dernier élément de la file.'); }
      const ch = chaptersOf(NP.item).find(c => c.start > NP.pos + 1); if (ch) { NP.pos = ch.start; syncPlayer(); } return;
    }
    case 'skip': { const i = introOf(NP.item); NP.pos = i.end; return syncPlayer(); }
    case 'hide-next': NP.upNextHidden = true; return syncPlayer();
    case 'remaining': NP.remaining = !NP.remaining; return syncPlayer();
    case 'mute': NP.muted = !NP.muted; if (!NP.muted && NP.volume === 0) NP.volume = 50; return syncPlayer();
    case 'panel': return panel(b.dataset.panel);
    case 'panel-close': panel(null); return $(`[data-panel]`, player)?.focus();
    case 'fav': toggleFav(NP.item); b.setAttribute('aria-pressed', U.fav.has(NP.item.id)); b.setAttribute('aria-label', U.fav.has(NP.item.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'); return plToast(U.fav.has(NP.item.id) ? 'Ajouté aux favoris.' : 'Retiré des favoris.');
    case 'cast': { const pos = NP.pos; player.close(); setCast('TV du salon'); NP.pos = pos; NP.playing = true; NP.remote = true; renderNowPlaying(); return; }
    case 'pip': return plToast("Image dans l'image : la vidéo continue dans une fenêtre flottante.");
    case 'full': return toggleFull();
    case 'guide': player.close(); location.hash = '#/livetv?tab=guide'; return;
    case 'search-subs': return plToast('OpenSubtitles : 12 résultats en français.');
  }
});
player.addEventListener('mousemove', wake);
player.addEventListener('touchstart', wake, { passive: true });
player.addEventListener('keydown', ev => {
  wake();
  if (ev.target.closest('input[type="range"]') && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(ev.key)) return;
  if (ev.target.closest('#pl-panel') && ev.key !== 'Escape') return;
  const k = ev.key.toLowerCase();
  if (ev.key === ' ' || k === 'k') { if (ev.target.closest('button')) return; ev.preventDefault(); NP.playing = !NP.playing; syncPlayer(); plToast(NP.playing ? 'Lecture' : 'Pause'); }
  else if (ev.key === 'ArrowLeft') { ev.preventDefault(); seekBy(-U.prefs.backSec); }
  else if (ev.key === 'ArrowRight') { ev.preventDefault(); seekBy(U.prefs.fwdSec); }
  else if (ev.key === 'ArrowUp') { ev.preventDefault(); NP.volume = Math.min(100, NP.volume + 5); NP.muted = false; syncPlayer(); plToast(`Volume ${NP.volume} %`); }
  else if (ev.key === 'ArrowDown') { ev.preventDefault(); NP.volume = Math.max(0, NP.volume - 5); syncPlayer(); plToast(`Volume ${NP.volume} %`); }
  else if (k === 'f') toggleFull();
  else if (k === 'm') { NP.muted = !NP.muted; syncPlayer(); plToast(NP.muted ? 'Son coupé' : 'Son rétabli'); }
  else if (k === 'c' && !NP.live) { const mi = mediaInfo(NP.item); NP.sub = NP.sub >= 0 ? -1 : Math.max(0, mi.subs.findIndex(s => !s.forced)); syncPlayer(); plToast(NP.sub < 0 ? 'Sous-titres désactivés.' : `Sous-titres : ${mi.subs[NP.sub].label}.`); }
  else if (k === 'n') { const n = queueNext(); if (n) play(n, { from: 0 }); }
});
player.addEventListener('cancel', ev => { if (NP.panel) { ev.preventDefault(); panel(null); } });
player.addEventListener('close', () => { markProgress(); NP.playing = NP.remote ? NP.playing : false; if (document.fullscreenElement) document.exitFullscreen?.(); player.innerHTML = ''; if (!NP.remote) rerender(); });
function markProgress() {
  const it = NP.item; if (!it || NP.live) return;
  const pct = NP.pos / NP.dur;
  if (pct >= 0.9) { U.played.add(it.id); U.resume.delete(it.id); }
  else if (NP.pos > 60) { U.resume.set(it.id, Math.round(NP.pos)); U.last.set(it.id, Date.now()); }
}

/* ---------- Horloge de lecture ---------- */
setInterval(() => {
  if (!NP.item || !NP.playing) return;
  if (!player.open && !NP.remote) return;
  NP.pos += NP.speed;
  if (!NP.live && NP.pos >= NP.dur) {
    NP.pos = NP.dur; markProgress();
    const n = queueNext();
    if (n && U.prefs.autoNext) { if (NP.remote) { Object.assign(NP, { item: n, pos: 0, dur: durationSec(n) }); renderNowPlaying(); } else play(n, { from: 0 }); return; }
    NP.playing = false;
  }
  if (NP.live && NP.pos >= NP.dur) NP.pos = NP.dur;
  if (player.open) syncPlayer(); else tickNowPlaying();
}, 1000);

/* ---------- Lecture à distance : barre « En cours de lecture » + télécommande ---------- */
const npEl = $('#nowplaying');
function renderNowPlaying() {
  if (!U.cast || !NP.item || !NP.remote) { npEl.hidden = true; npEl.innerHTML = ''; return; }
  const it = NP.item, series = it.Type === 'Episode' ? byId(it.seriesId) : null;
  npEl.hidden = false;
  npEl.innerHTML = `
    <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-2 pt-2 lg:h-18 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-4 lg:pt-0">
      <div class="flex min-w-0 items-center gap-3">
        ${imgOrPlaceholder(it.Type === 'Program' ? null : it.Type === 'Episode' ? it.img : img.poster(it), titleOf(it), `${it.Type === 'Movie' ? 'aspect-[2/3] w-9' : 'aspect-video w-20'} shrink-0 rounded`)}
        <div class="min-w-0"><div class="truncate text-sm font-medium"><a href="${it.Type === 'Program' ? '#/livetv' : href(it)}" class="hover:underline">${esc(series ? series.name : it.name)}</a></div><div class="truncate text-[0.8125rem] text-muted">${series ? `${epCode(it)} · ${esc(it.name)}` : it.Type === 'Program' ? esc(it.channel.name) : `${it.year} · ${esc(it.genres.join(', '))}`}</div></div>
        ${it.Type === 'Program' ? '' : favBtn(it, `${btn.iconSm} max-lg:hidden`)}
      </div>
      <div class="flex flex-col items-center gap-1 max-lg:hidden">
        <div class="flex items-center gap-2">
          ${iconBtn('backward', 'Précédent', 'data-np="prev"', btn.iconSm)}
          <button type="button" data-np="toggle" class="grid size-8 place-items-center rounded-full bg-white text-black hover:scale-105 motion-safe:transition-transform"></button>
          ${iconBtn('forward', 'Suivant', 'data-np="next"', btn.iconSm)}
        </div>
        <div class="flex w-full max-w-xl items-center gap-2 text-[0.8125rem] text-muted tabular-nums"><span data-np-pos class="w-12 text-right"></span><label for="np-seek" class="sr-only">Position de lecture</label><input id="np-seek" name="np-seek" type="range" min="0" max="${Math.round(NP.dur)}" value="${Math.round(NP.pos)}" class="slider"><span data-np-dur class="w-12"></span></div>
      </div>
      <div class="flex items-center justify-end gap-1">
        <a href="#/remote" aria-label="Télécommande" class="${btn.iconSm} max-lg:hidden">${ic('queue-list')}</a>
        ${iconBtn('tv', `Lecture sur ${U.cast}`, 'data-act="cast" aria-haspopup="menu" aria-pressed="true"', btn.iconSm)}
        <button type="button" data-np="toggle" class="grid size-10 place-items-center rounded-full text-white lg:hidden"></button>
        ${iconBtn('x-mark', 'Arrêter la lecture', 'data-np="stop"', btn.iconSm)}
      </div>
    </div>
    <div class="h-0.5 bg-white/15 lg:hidden"><div data-np-line class="h-full w-(--pct) bg-white"></div></div>
    <p class="flex items-center justify-end gap-2 bg-accent px-4 py-1 text-[0.8125rem] font-semibold text-black lg:-mx-2 lg:mt-2 lg:rounded-md">${ic('tv')}Lecture sur ${esc(U.cast)}</p>`;
  $('#np-seek', npEl).addEventListener('input', ev => { NP.pos = +ev.target.value; tickNowPlaying(); });
  tickNowPlaying();
}
function tickNowPlaying() {
  if (npEl.hidden) return;
  $$('[data-np="toggle"]', npEl).forEach(b => { b.setAttribute('aria-label', NP.playing ? 'Pause' : 'Lecture'); b.innerHTML = ic(NP.playing ? 'pause' : 'play'); });
  const pct = `${(NP.pos / NP.dur) * 100}%`, s = $('#np-seek', npEl);
  if (s && document.activeElement !== s) { s.value = Math.round(NP.pos); }
  s?.style.setProperty('--pct', pct); $('[data-np-line]', npEl)?.style.setProperty('--pct', pct);
  const pos = $('[data-np-pos]', npEl), dur = $('[data-np-dur]', npEl); if (pos) pos.textContent = fmtTime(NP.pos); if (dur) dur.textContent = fmtTime(NP.dur);
  const r = $('#remote-pos'); if (r) { r.textContent = `${fmtTime(NP.pos)} / ${fmtTime(NP.dur)}`; $('#remote-bar')?.style.setProperty('--p', pct); }
}
npEl.addEventListener('click', ev => {
  const b = ev.target.closest('[data-np]'); if (!b) return;
  if (b.dataset.np === 'toggle') NP.playing = !NP.playing;
  if (b.dataset.np === 'prev') { const p = queuePrev(); if (NP.pos > 10 || !p) NP.pos = 0; else Object.assign(NP, { item: p, pos: 0, dur: durationSec(p) }); renderNowPlaying(); }
  if (b.dataset.np === 'next') { const n = queueNext(); if (n) { markProgress(); Object.assign(NP, { item: n, pos: 0, dur: durationSec(n) }); renderNowPlaying(); } }
  if (b.dataset.np === 'stop') { markProgress(); NP.item = null; NP.playing = false; renderNowPlaying(); toast(`Lecture arrêtée sur ${U.cast}.`); if (route().path === 'remote') rerender(); return; }
  tickNowPlaying(); if (route().path === 'remote') rerender();
});
function remoteHtml() {
  const it = NP.item, series = it.Type === 'Episode' ? byId(it.seriesId) : null, q = NP.queue;
  return `<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section aria-label="Lecture en cours" class="flex flex-col gap-5">
      ${imgOrPlaceholder(it.Type === 'Episode' ? (it.imgLg || it.img) : img.backdrop(it) || img.poster(it), titleOf(it), `${it.Type === 'Movie' && !img.backdrop(it) ? 'aspect-[2/3] max-w-xs' : 'aspect-video'} w-full rounded-lg`)}
      <div><p class="text-sm text-muted">Sur ${esc(U.cast)}</p><h2 class="text-2xl font-semibold tracking-tight">${esc(series ? series.name : it.name)}</h2>${series ? `<p class="text-base text-muted">${epCode(it)} · ${esc(it.name)}</p>` : ''}</div>
      <div class="flex flex-col gap-2"><div class="h-1 overflow-hidden rounded-full bg-white/20"><div id="remote-bar" class="h-full w-(--p) bg-accent"></div></div><p id="remote-pos" class="text-sm text-muted tabular-nums"></p></div>
      <div class="flex items-center gap-3">${iconBtn('backward', 'Précédent', 'data-np-remote="prev"')}<button type="button" data-np-remote="toggle" aria-label="${NP.playing ? 'Pause' : 'Lecture'}" class="grid size-14 place-items-center rounded-full bg-accent text-black hover:bg-accent-strong">${ic(NP.playing ? 'pause' : 'play')}</button>${iconBtn('forward', 'Suivant', 'data-np-remote="next"')}${iconBtn('arrow-uturn-left', `Reculer de ${U.prefs.backSec} s`, 'data-np-remote="back"')}${iconBtn('arrow-uturn-right', `Avancer de ${U.prefs.fwdSec} s`, 'data-np-remote="fwd"')}</div>
    </section>
    <section aria-labelledby="rq" class="flex flex-col gap-3"><h2 id="rq" class="text-xl font-semibold">File d'attente</h2>
      <ol role="list" class="flex flex-col">${q.map(x => `<li class="flex items-center gap-3 rounded-md p-2 ${x.id === it.id ? 'bg-white/10' : ''}">${imgOrPlaceholder(x.Type === 'Episode' ? x.img : img.poster(x), titleOf(x), `${x.Type === 'Episode' ? 'aspect-video w-20' : 'aspect-[2/3] w-9'} shrink-0 rounded`)}<div class="min-w-0 flex-1"><p class="truncate text-sm font-medium ${x.id === it.id ? 'text-accent' : ''}">${esc(x.name)}</p><p class="truncate text-sm text-muted">${x.Type === 'Episode' ? epCode(x) : typeLabel(x)} · ${fmtMin(x.runtime)}</p></div></li>`).join('')}</ol></section>
  </div>`;
}
document.addEventListener('click', ev => {
  const r = ev.target.closest('[data-np-remote]');
  if (r) { const a = r.dataset.npRemote; if (a === 'toggle') NP.playing = !NP.playing; if (a === 'back') NP.pos = Math.max(0, NP.pos - U.prefs.backSec); if (a === 'fwd') NP.pos = Math.min(NP.dur, NP.pos + U.prefs.fwdSec); if (a === 'next' || a === 'prev') { $(`[data-np="${a}"]`, npEl)?.click(); } tickNowPlaying(); rerender(); return; }
  const l = ev.target.closest('[data-act="play-live"]');
  if (l) { ev.preventDefault(); if (modal.open) modal.close(); playLive(byId(l.dataset.id)); }
});
const _setCast = setCast;
setCast = name => { _setCast(name); if (!name && NP.remote && NP.item) { NP.remote = false; openPlayer(); } else if (name && NP.item && NP.playing && !NP.remote) { NP.remote = true; renderNowPlaying(); } };

/* ---------- Démarrage ---------- */
render();
setInterval(() => { if (route().path === 'livetv' && !modal.open && !document.querySelector('#view :focus')) rerender(); }, 60000);
