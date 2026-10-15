/* 2BFlix Groove — script du thème pour Jellyfin web 12.1 (plugin JavaScript Injector).
   Deux façons de l'activer :
   - version assemblée (tools/build.mjs) : le CSS est embarqué et appliqué aux comptes listés
     dans window.__GROOVE_USERS (liste vide = tout le monde) ;
   - groove.css collé à la main dans Préférences > Affichage > CSS personnalisé (variable --groove: 1).
   Sans l'un ou l'autre, le script ne fait rien. */
(() => {
  if (window.__groove) return;
  window.__groove = true;

  const PLATFORMS = ['Netflix', 'Prime Video', 'Disney+', 'Apple TV+', 'HBO Max', 'Canal+', 'Paramount+', 'Crunchyroll', 'Anime'];
  const MIN_ROW_ITEMS = 3;
  const HERO_SLIDES = 7;
  const HERO_MS = 9000;
  const LS = { collapsed: 'groove.sidebar.collapsed', filter: 'groove.sidebar.filter' };

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } } };
  const api = () => window.ApiClient;
  const userId = () => { try { return api()?.getCurrentUserId(); } catch { return null; } };
  const img = (id, opts) => api().getScaledImageUrl(id, opts);
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Heroicons (MIT)
  const ICON = {
    library: 'M7.605 2.112a.75.75 0 0 1 .79 0l5.25 3.25A.75.75 0 0 1 13 6.707V12.5h.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H3V6.707a.75.75 0 0 1-.645-1.345l5.25-3.25ZM4.5 8.75a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3ZM8 8a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 8 8Zm2 .75a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3ZM8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    heart: 'M2 6.342a3.375 3.375 0 0 1 6-2.088 3.375 3.375 0 0 1 5.997 2.26c-.063 2.134-1.618 3.76-2.955 4.784a14.437 14.437 0 0 1-2.676 1.61c-.02.01-.038.017-.05.022l-.014.006-.004.002h-.002a.75.75 0 0 1-.592.001h-.002l-.004-.003-.015-.006a5.528 5.528 0 0 1-.232-.107 14.395 14.395 0 0 1-2.535-1.557C3.564 10.22 1.999 8.558 1.999 6.38L2 6.342Z',
    play: 'M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z',
    info: 'M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z',
    list: 'M2 4a2 2 0 0 1 2-2h8a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2ZM2 9.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 9.25ZM2.75 12.5a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75Z',
  };
  const svg = (name, cls = 'g-icon') => `<svg class="${cls}" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="${ICON[name]}"/></svg>`;

  /* ---------- Activation ---------- */
  let active = false;
  const EMBEDDED_CSS = window.__GROOVE_CSS || '';
  const ONLY_USERS = window.__GROOVE_USERS || [];
  const allowedUser = () => !!userId() && (!ONLY_USERS.length || ONLY_USERS.includes(userId()));
  function applyEmbeddedCss() {
    // Le CSS par utilisateur de Jellyfin est stocké dans le navigateur : on l'apporte depuis le serveur via ce script.
    if (!EMBEDDED_CSS) return;
    let el = document.getElementById('groove-css');
    if (allowedUser()) {
      if (!el) { el = document.createElement('style'); el.id = 'groove-css'; el.textContent = EMBEDDED_CSS; }
      if (el !== document.body.lastElementChild) document.body.appendChild(el); // après les styles de la marque
    } else el?.remove();
  }
  const enabledByCss = () => getComputedStyle(document.documentElement).getPropertyValue('--groove').trim() === '1';
  const disabledSheets = new Set();
  function disableOldTheme() {
    // Abyss et l'ancien CSS 2BFlix viennent de la marque du serveur : on les coupe pour ce profil seulement.
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
      const text = el.tagName === 'STYLE' ? el.textContent : el.href;
      if (!text || text.includes('--groove: 1')) return;
      if (/abyss-jellyfin|\/\* 2BFlix:/.test(text) && el.sheet && !el.sheet.disabled) { el.sheet.disabled = true; disabledSheets.add(el); }
    });
  }
  function restoreOldTheme() { disabledSheets.forEach(el => { if (el.sheet) el.sheet.disabled = false; }); disabledSheets.clear(); }

  function sync() {
    applyEmbeddedCss();
    const on = enabledByCss() && !!userId();
    if (on && !active) { active = true; document.documentElement.classList.add('groove'); }
    if (!on && active) { active = false; teardown(); }
    if (!active) return;
    disableOldTheme();
    sidebar.sync();
    home.sync();
    details.sync();
  }
  function teardown() {
    document.documentElement.classList.remove('groove', 'groove-sb', 'groove-sb-collapsed', 'groove-sb-playing');
    $('#groove-sidebar')?.remove();
    document.querySelectorAll('.groove-hero, .groove-platform').forEach(el => el.remove());
    restoreOldTheme();
  }

  /* ---------- Colonne « Médiathèques » ---------- */
  const sidebar = {
    data: null, loading: false, loadedFor: null,
    async load() {
      const uid = userId();
      if (this.loading || this.loadedFor === uid) return;
      this.loading = true;
      try {
        const [views, playlists, boxsets, favs] = await Promise.all([
          api().getUserViews({}, uid),
          api().getItems(uid, { IncludeItemTypes: 'Playlist', Recursive: true, SortBy: 'SortName', Fields: 'ChildCount', EnableImageTypes: 'Primary', ImageTypeLimit: 1 }),
          api().getItems(uid, { IncludeItemTypes: 'BoxSet', Recursive: true, SortBy: 'SortName', Fields: 'ChildCount', EnableImageTypes: 'Primary', ImageTypeLimit: 1 }),
          api().getItems(uid, { Filters: 'IsFavorite', Recursive: true, Limit: 0 }),
        ]);
        const vs = views.Items || [];
        // Mosaïque des 4 derniers ajouts de chaque médiathèque (comme les listes Spotify)
        await Promise.all(vs.filter(v => ['movies', 'tvshows', 'mixed', 'boxsets', undefined, null].includes(v.CollectionType)).map(async v => {
          const r = await api().getItems(uid, { ParentId: v.Id, Recursive: true, IncludeItemTypes: v.CollectionType === 'boxsets' ? 'BoxSet' : 'Movie,Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 4, ImageTypes: 'Primary', EnableImageTypes: 'Primary', ImageTypeLimit: 1 }).catch(() => ({ Items: [] }));
          v.groovePosters = (r.Items || []).map(i => img(i.Id, { type: 'Primary', maxHeight: 96, tag: i.ImageTags.Primary }));
        }));
        const order = c => { const k = PLATFORMS.indexOf(c.Name); return k < 0 ? 100 : k; };
        const bs = (boxsets.Items || []).sort((a, b) => order(a) - order(b) || a.Name.localeCompare(b.Name, 'fr'));
        this.data = { views: vs, playlists: playlists.Items || [], boxsets: bs, favCount: favs.TotalRecordCount || 0 };
        this.loadedFor = uid;
      } catch (e) { console.warn('[Groove] médiathèques', e); }
      finally { this.loading = false; }
      this.render();
    },
    href(it) {
      if (it.Type === 'CollectionFolder' || it.Type === 'UserView') {
        const t = it.CollectionType;
        const route = { movies: 'movies', tvshows: 'tv', music: 'music', books: 'books', homevideos: 'homevideos', musicvideos: 'musicvideos', boxsets: 'boxsets', playlists: 'playlists', livetv: 'livetv' }[t] || 'mixed';
        return route === 'livetv' ? '#/livetv' : `#/${route}?topParentId=${it.Id}&collectionType=${t || 'mixed'}`;
      }
      return `#/details?id=${it.Id}&serverId=${it.ServerId}`;
    },
    kindOf(it) { return it.Type === 'Playlist' ? 'playlists' : it.Type === 'BoxSet' ? 'boxsets' : it.CollectionType === 'tvshows' ? 'tvshows' : it.CollectionType === 'movies' ? 'movies' : 'other'; },
    subOf(it) {
      if (it.Type === 'Playlist') return `Liste de lecture${it.ChildCount != null ? ` · ${it.ChildCount}` : ''}`;
      if (it.Type === 'BoxSet') return `Collection${it.ChildCount != null ? ` · ${it.ChildCount}` : ''}`;
      return `Médiathèque · ${{ movies: 'Films', tvshows: 'Séries', music: 'Musique', livetv: 'TV en direct', boxsets: 'Collections', playlists: 'Listes', books: 'Livres' }[it.CollectionType] || 'Mixte'}`;
    },
    render() {
      if (!this.data || !active) return;
      let el = $('#groove-sidebar');
      if (!el) {
        el = document.createElement('nav');
        el.id = 'groove-sidebar';
        el.setAttribute('aria-label', 'Médiathèques');
        document.body.appendChild(el);
        el.addEventListener('click', ev => {
          const b = ev.target.closest('button'); if (!b) return;
          if (b.dataset.collapse !== undefined) { const c = !document.documentElement.classList.contains('groove-sb-collapsed'); store.set(LS.collapsed, c ? '1' : '0'); document.documentElement.classList.toggle('groove-sb-collapsed', c); b.setAttribute('aria-expanded', String(!c)); }
          if (b.dataset.filter) { const cur = store.get(LS.filter); store.set(LS.filter, cur === b.dataset.filter ? '' : b.dataset.filter); this.render(); }
        });
      }
      const filter = store.get(LS.filter) || '';
      const collapsed = store.get(LS.collapsed) === '1';
      const { views, playlists, boxsets, favCount } = this.data;
      const all = [...views, ...playlists, ...boxsets].filter(it => !filter || this.kindOf(it) === filter);
      const thumb = it => {
        if (it.groovePosters?.length === 4) return `<span class="g-thumb">${it.groovePosters.map(u => `<img src="${esc(u)}" alt="" loading="lazy">`).join('')}</span>`;
        const tag = it.ImageTags?.Primary;
        return tag ? `<span class="g-thumb g-single"><img src="${esc(img(it.Id, { type: 'Primary', maxHeight: 96, tag }))}" alt="" loading="lazy"></span>` : `<span class="g-thumb g-single">${svg('library')}</span>`;
      };
      const item = (it, h, sub, th) => `<li><a class="g-item" href="${h}" ${collapsed ? `title="${esc(it.Name)}" aria-label="${esc(it.Name)}"` : ''}>${th}<span class="g-text"><span class="g-name" style="display:block">${esc(it.Name)}</span><span class="g-sub" style="display:block">${esc(sub)}</span></span></a></li>`;
      const chips = [['movies', 'Films'], ['tvshows', 'Séries'], ['boxsets', 'Collections'], ['playlists', 'Listes de lecture']];
      el.innerHTML = `
        <div class="g-head"><button type="button" class="g-title" data-collapse aria-expanded="${!collapsed}" aria-label="${collapsed ? 'Déplier' : 'Réduire'} les médiathèques">${svg('library')}<span class="g-label">Médiathèques</span></button></div>
        <div class="g-chips" role="group" aria-label="Filtrer">${chips.map(([k, l]) => `<button type="button" class="g-chip" data-filter="${k}" aria-pressed="${filter === k}">${l}</button>`).join('')}</div>
        <ul class="g-list" role="list">
          ${filter ? '' : item({ Name: 'Favoris' }, '#/home?tab=1', `Liste · ${favCount}`, `<span class="g-thumb g-single g-fav">${svg('heart')}</span>`)}
          ${all.map(it => item(it, this.href(it), this.subOf(it), thumb(it))).join('')}
        </ul>`;
      this.mark();
    },
    mark() {
      const h = location.hash;
      document.querySelectorAll('#groove-sidebar .g-item').forEach(a => {
        const id = (a.getAttribute('href').match(/(?:topParentId|id)=([a-f0-9]+)/) || [])[1];
        const cur = id ? h.includes(id) : h.startsWith(a.getAttribute('href'));
        cur ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
      });
    },
    sync() {
      const page = document.querySelector('.page:not(.hide)');
      const show = !!userId() && !['videoOsdPage', 'loginPage'].includes(page?.id) && !location.hash.startsWith('#/video');
      const html = document.documentElement;
      const bar = document.querySelector('header.MuiAppBar-root');
      if (bar) html.style.setProperty('--g-appbar', `${Math.round(bar.getBoundingClientRect().height)}px`);
      html.classList.toggle('groove-sb', show);
      html.classList.toggle('groove-sb-collapsed', show && store.get(LS.collapsed) === '1');
      html.classList.toggle('groove-sb-playing', !!document.querySelector('.nowPlayingBar:not(.nowPlayingBar-hidden)'));
      if (!show) return;
      if (this.loadedFor !== userId()) this.load(); else if (!$('#groove-sidebar')) this.render(); else this.mark();
    },
  };

  /* ---------- Accueil : bannière + rangées par plateforme ---------- */
  const home = {
    heroItems: null, timer: null, busyHero: false, busyRows: false, colsPromise: null,
    container() { return document.querySelector('#indexPage:not(.hide) .homeSectionsContainer'); },
    sync() {
      const c = this.container();
      if (!c) { clearInterval(this.timer); return; }
      this.hero(c); this.rows(c);
    },
    async hero(c) {
      if (c.parentElement.querySelector('.groove-hero') || this.busyHero) return;
      this.busyHero = true;
      try {
        if (!this.heroItems) {
          const r = await api().getItems(userId(), { IncludeItemTypes: 'Movie,Series', Recursive: true, SortBy: 'Random', Limit: 24, ImageTypes: 'Backdrop', Filters: 'IsUnplayed', Fields: 'Overview,Genres,ProductionYear,OfficialRating,CommunityRating,ChildCount,ParentId', EnableImageTypes: 'Backdrop,Logo,Primary', ImageTypeLimit: 1 });
          this.heroItems = (r.Items || []).filter(i => i.BackdropImageTags?.length && i.Overview).sort((a, b) => !!b.ImageTags?.Logo - !!a.ImageTags?.Logo).slice(0, HERO_SLIDES);
        }
        if (!this.heroItems.length || c.parentElement.querySelector('.groove-hero')) return;
        const el = document.createElement('section');
        el.className = 'groove-hero';
        el.setAttribute('aria-roledescription', 'carrousel');
        el.setAttribute('aria-label', 'À la une');
        el.innerHTML = this.heroItems.map((it, k) => {
          const meta = [it.ProductionYear, it.Type === 'Series' ? (it.ChildCount ? `${it.ChildCount} saison${it.ChildCount > 1 ? 's' : ''}` : 'Série') : 'Film', it.CommunityRating ? `★ ${it.CommunityRating.toFixed(1).replace('.', ',')}` : '', it.OfficialRating || '', (it.Genres || []).slice(0, 2).join(', ')].filter(Boolean).join(' · ');
          return `<div class="groove-hero-slide" ${k === 0 ? 'data-active' : ''} aria-roledescription="diapositive" aria-label="${k + 1} sur ${this.heroItems.length}" ${k ? 'aria-hidden="true"' : ''}>
            <img class="groove-hero-bg" src="${esc(img(it.Id, { type: 'Backdrop', maxWidth: 1920, tag: it.BackdropImageTags[0] }))}" alt="" ${k ? 'loading="lazy"' : ''}>
            <div class="groove-hero-body">
              <p class="groove-hero-eyebrow">${it.Type === 'Series' ? 'Série' : 'Film'} à découvrir</p>
              ${it.ImageTags?.Logo ? `<h2 style="margin:0"><img class="groove-hero-logo" src="${esc(img(it.Id, { type: 'Logo', maxWidth: 800, tag: it.ImageTags.Logo }))}" alt="${esc(it.Name)}"></h2>` : `<h2 class="groove-hero-title">${esc(it.Name)}</h2>`}
              <p class="groove-hero-meta" style="margin:0">${esc(meta)}</p>
              <p class="groove-hero-overview">${esc(it.Overview)}</p>
              <div class="groove-hero-actions">
                <a class="groove-btn groove-btn-primary" href="#/details?id=${it.Id}&serverId=${it.ServerId}" data-groove-play="${it.Id}">${svg('play', '')}Lecture</a>
                <a class="groove-btn groove-btn-secondary" href="#/details?id=${it.Id}&serverId=${it.ServerId}">${svg('info', '')}Plus d'infos</a>
              </div>
            </div>
          </div>`;
        }).join('') + `<div class="groove-hero-dots" role="group" aria-label="Choisir une diapositive">${this.heroItems.map((it, k) => `<button type="button" class="groove-hero-dot" data-go="${k}" aria-label="${esc(it.Name)}" aria-current="${k === 0}"></button>`).join('')}</div>`;
        c.parentElement.insertBefore(el, c);
        let cur = 0;
        const go = k => {
          cur = (k + this.heroItems.length) % this.heroItems.length;
          el.querySelectorAll('.groove-hero-slide').forEach((s, n) => { s.toggleAttribute('data-active', n === cur); n === cur ? s.removeAttribute('aria-hidden') : s.setAttribute('aria-hidden', 'true'); });
          el.querySelectorAll('.groove-hero-dot').forEach((d, n) => d.setAttribute('aria-current', String(n === cur)));
        };
        el.addEventListener('click', ev => {
          const d = ev.target.closest('[data-go]'); if (d) go(+d.dataset.go);
          const p = ev.target.closest('[data-groove-play]'); if (p) { try { sessionStorage.setItem('groove.autoplay', p.dataset.groovePlay); } catch { /* ignoré */ } }
        });
        clearInterval(this.timer);
        if (!reduceMotion()) this.timer = setInterval(() => { if (!document.contains(el)) return clearInterval(this.timer); if (!document.hidden && !el.matches(':hover, :focus-within')) go(cur + 1); }, HERO_MS);
      } catch (e) { console.warn('[Groove] bannière', e); }
      finally { this.busyHero = false; }
    },
    cols() {
      return this.colsPromise ||= api().getItems(userId(), { IncludeItemTypes: 'BoxSet', Recursive: true })
        .then(r => (r.Items || []).filter(c => PLATFORMS.includes(c.Name)).sort((a, b) => PLATFORMS.indexOf(a.Name) - PLATFORMS.indexOf(b.Name)))
        .catch(e => { this.colsPromise = null; throw e; });
    },
    async rows(c) {
      const anchor = c.querySelector('.RecentlyAddedShows') || c.querySelector('.RecentlyAddedMovies') || c.querySelector('.verticalSection:last-child');
      if (!anchor || c.querySelector('.groove-platform') || this.busyRows) return;
      this.busyRows = true;
      try {
        const cols = await this.cols();
        const html = await Promise.all(cols.map(async col => {
          const r = await api().getItems(userId(), { ParentId: col.Id, SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 24, Fields: 'PrimaryImageAspectRatio,ProductionYear', EnableImageTypes: 'Primary', ImageTypeLimit: 1 });
          const items = (r.Items || []).filter(i => i.ImageTags?.Primary);
          if (items.length < MIN_ROW_ITEMS) return '';
          return `<div class="verticalSection groove-platform">
            <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
              <a href="#/details?id=${col.Id}&serverId=${col.ServerId}" class="button-flat button-flat-mini sectionTitleTextButton emby-button"><h2 class="sectionTitle sectionTitle-cards">${esc(col.Name)}</h2><span class="material-icons chevron_right" aria-hidden="true"></span></a>
            </div>
            <div class="groove-scroller padded-left padded-right" style="display:flex;overflow-x:auto;scroll-snap-type:x proximity;scrollbar-width:none">${items.map(it => `
              <div class="card overflowPortraitCard card-hoverable" style="flex:0 0 auto;scroll-snap-align:start"><div class="cardBox cardBox-bottompadded"><div class="cardScalable">
                <div class="cardPadder cardPadder-overflowPortrait"></div>
                <a class="cardImageContainer coveredImage cardContent" href="#/details?id=${it.Id}&serverId=${it.ServerId}" aria-label="${esc(it.Name)}" style="background-image:url('${esc(img(it.Id, { type: 'Primary', maxHeight: 400, tag: it.ImageTags.Primary }))}')"></a>
              </div><div class="cardText cardText-first"><bdi>${esc(it.Name)}</bdi></div>${it.ProductionYear ? `<div class="cardText cardText-secondary">${it.ProductionYear}</div>` : ''}</div></div>`).join('')}
            </div>
          </div>`;
        }));
        if (!c.querySelector('.groove-platform') && document.contains(anchor)) anchor.insertAdjacentHTML('afterend', html.join(''));
      } catch (e) { console.warn('[Groove] rangées plateformes', e); }
      finally { this.busyRows = false; }
    },
  };

  /* ---------- Fiche : teinte tirée de l'affiche + lecture depuis la bannière ---------- */
  const details = {
    done: new WeakMap(),
    sync() {
      const page = document.querySelector('#itemDetailPage:not(.hide)');
      if (!page) return;
      this.tint(page);
      this.autoplay(page);
    },
    tint(page) {
      const box = page.querySelector('.detailImageContainer .cardImageContainer, .detailImageContainer img');
      const src = box?.tagName === 'IMG' ? box.src : (box?.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [])[1];
      if (!src || this.done.get(page) === src) return;
      this.done.set(page, src);
      const im = new Image();
      im.onload = () => {
        try {
          const cv = document.createElement('canvas'); cv.width = 24; cv.height = 36;
          const x = cv.getContext('2d'); x.drawImage(im, 0, 0, 24, 36);
          const d = x.getImageData(0, 0, 24, 36).data; let r = 0, g = 0, b = 0, w = 0;
          for (let k = 0; k < d.length; k += 4) { const mx = Math.max(d[k], d[k + 1], d[k + 2]), mn = Math.min(d[k], d[k + 1], d[k + 2]); const wt = (mx ? (mx - mn) / mx : 0) ** 2 * (mx / 255) + 0.01; r += d[k] * wt; g += d[k + 1] * wt; b += d[k + 2] * wt; w += wt; }
          page.style.setProperty('--g-tint', `rgb(${Math.round(r / w)} ${Math.round(g / w)} ${Math.round(b / w)})`);
        } catch { /* image d'une autre origine : on garde la teinte par défaut */ }
      };
      im.src = src;
    },
    autoplay(page) {
      let id = null; try { id = sessionStorage.getItem('groove.autoplay'); } catch { /* ignoré */ }
      if (!id || !location.hash.includes(id)) return;
      const btn = page.querySelector('.mainDetailButtons .btnPlay:not(.hide)');
      if (!btn) return;
      try { sessionStorage.removeItem('groove.autoplay'); } catch { /* ignoré */ }
      btn.click();
    },
  };

  /* ---------- Boucle ---------- */
  let queued = false;
  const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; try { sync(); } catch (e) { console.warn('[Groove]', e); } }); };
  document.addEventListener('viewshow', schedule);
  window.addEventListener('hashchange', schedule);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  schedule();
})();
