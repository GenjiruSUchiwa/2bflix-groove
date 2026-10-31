/* 2BFlix Groove : script du thème pour Jellyfin web 12.1 (plugin JavaScript Injector).
   Deux façons de l'activer :
   - version assemblée (tools/build.mjs) : le CSS est embarqué et appliqué aux comptes listés
     dans window.__GROOVE_USERS (liste vide = tout le monde) ;
   - groove.css collé à la main dans Préférences > Affichage > CSS personnalisé (variable --groove: 1).
   Sans l'un ou l'autre, le script ne fait rien. */
(() => {
  if (window.__groove) return;
  window.__groove = true;

  const NAV_MAIN = ['Netflix', 'Apple TV+', 'Crunchyroll']; // plateformes affichées dans la barre du haut, le reste va dans « Plus »
  const PLATFORMS = ['Netflix', 'Prime Video', 'Disney+', 'Apple TV+', 'HBO Max', 'Canal+', 'Paramount+', 'Crunchyroll', 'Anime'];
  const MIN_ROW_ITEMS = 3;
  const HERO_SLIDES = 7;
  const HERO_MS = 9000;
  const LS = { collapsed: 'groove.sidebar.collapsed', sort: 'groove.sidebar.sort', more: 'groove.sidebar.more' };
  // Médiathèque « Mangas » : le lien mène à Uchiyomi. /jellyfin y ouvre l'appli si une session existe, sinon connecte
  // avec le compte Jellyfin du navigateur (passerelle nagaretv.com/sso). enabled: false donne le comportement Jellyfin par défaut.
  const MANGAS = { enabled: true, library: 'Mangas', url: 'https://manga.nagaretv.com/jellyfin' };
  const isMangas = v => MANGAS.enabled && v.CollectionType === 'books' && v.Name === MANGAS.library;

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } } };
  const api = () => window.ApiClient;
  const userId = () => { try { return api()?.getCurrentUserId(); } catch { return null; } };
  const img = (id, opts) => api().getScaledImageUrl(id, opts);
  const plural = (n, s, p = s + 's') => `${n} ${n > 1 ? p : s}`;
  const frNum = n => String(n).replace('.', ',');
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Heroicons (MIT)
  const ICON = {
    library: 'M7.605 2.112a.75.75 0 0 1 .79 0l5.25 3.25A.75.75 0 0 1 13 6.707V12.5h.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H3V6.707a.75.75 0 0 1-.645-1.345l5.25-3.25ZM4.5 8.75a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3ZM8 8a.75.75 0 0 0-.75.75v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 8 8Zm2 .75a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-1.5 0v-3ZM8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    heart: 'M2 6.342a3.375 3.375 0 0 1 6-2.088 3.375 3.375 0 0 1 5.997 2.26c-.063 2.134-1.618 3.76-2.955 4.784a14.437 14.437 0 0 1-2.676 1.61c-.02.01-.038.017-.05.022l-.014.006-.004.002h-.002a.75.75 0 0 1-.592.001h-.002l-.004-.003-.015-.006a5.528 5.528 0 0 1-.232-.107 14.395 14.395 0 0 1-2.535-1.557C3.564 10.22 1.999 8.558 1.999 6.38L2 6.342Z',
    play: 'M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z',
    info: 'M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z',
    star: 'M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 12.08l-3.135 1.915a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z',
    chevL: 'M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z',
    chevR: 'M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z',
    list: 'M2 4a2 2 0 0 1 2-2h8a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2ZM2 9.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 9.25ZM2.75 12.5a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75Z',
  };
  const svg = (name, cls = 'g-icon') => `<svg class="${cls}" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="${ICON[name]}"/></svg>`;

  /* ---------- Activation ---------- */
  let active = false;
  const EMBEDDED_CSS = window.__GROOVE_CSS || '';
  const ONLY_USERS = window.__GROOVE_USERS || [];
  // Avant que l'API soit prête, on lit l'utilisateur mémorisé par Jellyfin pour appliquer le thème sans attendre
  const storedUserId = () => { try { return JSON.parse(localStorage.getItem('jellyfin_credentials'))?.Servers?.find(s => s.UserId)?.UserId || null; } catch { return null; } };
  const allowedUser = () => { const u = userId() || storedUserId(); return !!u && (!ONLY_USERS.length || ONLY_USERS.includes(u)); };
  function applyEmbeddedCss() {
    // Le CSS par utilisateur de Jellyfin est stocké dans le navigateur : on l'apporte depuis le serveur via ce script.
    if (!EMBEDDED_CSS) return;
    let el = document.getElementById('groove-css');
    if (allowedUser()) {
      if (!el) { el = document.createElement('style'); el.id = 'groove-css'; el.textContent = EMBEDDED_CSS; }
      const host = document.body || document.documentElement;
      if (el !== host.lastElementChild) host.appendChild(el); // après les styles de la marque
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
    const on = enabledByCss() && !!(userId() || storedUserId());
    if (on && !active) { active = true; document.documentElement.classList.add('groove'); }
    if (!on && active) { active = false; teardown(); }
    if (!active) return;
    disableOldTheme();
    if (!userId() || !api()) return; // API pas encore prête : le CSS suffit en attendant
    sidebar.sync();
    topbar.sync();
    home.sync();
    details.sync();
    osd.sync();
  }
  function teardown() {
    document.documentElement.classList.remove('groove', 'groove-sb', 'groove-sb-collapsed', 'groove-sb-playing', 'groove-nav', 'groove-nav-compact');
    menu.close();
    $('#groove-sidebar')?.remove();
    document.querySelectorAll('.groove-hero, .groove-platform, .g-home, .g-brand, .g-nav, .g-drawer,.g-osd-ends, .g-osd-fav, .g-osd-title').forEach(el => el.remove());
    // Fiche : on rend à Jellyfin les infos déplacées
    document.querySelectorAll('.groove-dhero').forEach(h => {
      h.closest('.itemDetailPage')?.querySelector('.infoWrapper')?.append(...h.querySelectorAll('.itemMiscInfo'));
      const p = h.closest('.itemDetailPage');
      p?.querySelector('.detailSectionContent')?.append(...p.querySelectorAll('.g-details > :not(h2)'));
      p?.querySelectorAll('.g-details, .g-sticky, .g-epnav, .g-ep-n').forEach(n => n.remove());
      p?.classList.remove('groove-dnative');
      h.remove();
    });
    restoreOldTheme();
  }

  /* ---------- Petit menu contextuel (style des menus de la maquette) ---------- */
  const menu = {
    el: null,
    open(anchor, html, onClick, { align = 'start' } = {}) {
      this.close();
      const m = document.createElement('div');
      m.className = 'g-menu';
      m.innerHTML = html;
      document.body.appendChild(m);
      const r = anchor.getBoundingClientRect();
      m.style.top = `${Math.round(r.bottom + 4)}px`;
      if (align === 'end') m.style.right = `${Math.round(innerWidth - r.right)}px`; else m.style.left = `${Math.round(r.left)}px`;
      m.addEventListener('click', ev => onClick(ev, m));
      this.out = ev => { if (!m.contains(ev.target) && !anchor.contains(ev.target)) this.close(); };
      this.key = ev => { if (ev.key === 'Escape') { this.close(); anchor.focus(); } };
      document.addEventListener('pointerdown', this.out, true);
      document.addEventListener('keydown', this.key);
      this.el = m;
      m.querySelector('input, button')?.focus();
      return m;
    },
    close() {
      this.el?.remove(); this.el = null;
      document.removeEventListener('pointerdown', this.out, true);
      document.removeEventListener('keydown', this.key);
    },
  };
  const mi = name => `<span class="material-icons ${name} g-mi" aria-hidden="true"></span>`;
  const menuItem = (k, label, icon, checked) => `<button type="button" role="${checked == null ? 'menuitem' : 'menuitemradio'}" ${checked == null ? '' : `aria-checked="${checked}"`} data-k="${k}">${icon ? mi(icon) : ''}<span>${esc(label)}</span>${checked ? '<span class="material-icons check g-mi g-ok" aria-hidden="true"></span>' : ''}</button>`;

  /* ---------- Colonne « Médiathèques » (maquette) ---------- */
  const SORTS = [['custom', 'Par défaut'], ['alpha', 'Alphabétique'], ['count', 'Nombre de titres']];
  const KIND = { movies: 'Films', tvshows: 'Séries' };
  // Médiathèques « <Plateforme> Films » / « <Plateforme> Séries » regroupées par plateforme, dans l'ordre de l'accueil, « Autres » en dernier
  const groupViews = views => {
    const platforms = new Map(), others = [];
    for (const v of views) {
      const m = KIND[v.CollectionType] && v.Name.match(/^(.+?)\s+(films?|s[ée]ries?)$/i);
      if (!m) { others.push(v); continue; }
      const key = m[1].toLowerCase();
      if (!platforms.has(key)) platforms.set(key, { name: m[1], key });
      platforms.get(key)[v.CollectionType] = v;
    }
    const rank = p => p.key === 'autres' ? 999 : (k => k < 0 ? 500 : k)(PLATFORMS.findIndex(n => n.toLowerCase() === p.key));
    return { platforms: [...platforms.values()].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'fr')), others };
  };
  const kindsOf = p => ['movies', 'tvshows'].filter(t => p[t]);
  const sidebar = {
    data: null, loading: false, loadedFor: null,
    async load() {
      const uid = userId();
      if (this.loading || this.loadedFor === uid) return;
      this.loading = true;
      try {
        const [views, playlists, boxsets, favs, me] = await Promise.all([
          api().getUserViews({}, uid),
          api().getItems(uid, { IncludeItemTypes: 'Playlist', Recursive: true, SortBy: 'SortName', Fields: 'ChildCount', EnableImageTypes: 'Primary', ImageTypeLimit: 1 }),
          api().getItems(uid, { IncludeItemTypes: 'BoxSet', Recursive: true, SortBy: 'SortName', Fields: 'ChildCount', EnableImageTypes: 'Primary', ImageTypeLimit: 1 }),
          api().getItems(uid, { Filters: 'IsFavorite', Recursive: true, Limit: 0 }),
          api().getCurrentUser().catch(() => null),
        ]);
        const vs = views.Items || [];
        // La barre du haut n'a besoin que des médiathèques : on l'affiche sans attendre les mosaïques
        this.views = vs;
        topbar.sync();
        // Mosaïque des 4 derniers ajouts de chaque médiathèque (comme les listes Spotify) + nombre de titres
        await Promise.all(vs.filter(v => ['movies', 'tvshows', 'mixed', 'boxsets', undefined, null].includes(v.CollectionType)).map(async v => {
          const r = await api().getItems(uid, { ParentId: v.Id, Recursive: true, IncludeItemTypes: v.CollectionType === 'boxsets' ? 'BoxSet' : 'Movie,Series', SortBy: 'DateCreated', SortOrder: 'Descending', Limit: 4, ImageTypes: 'Primary', EnableImageTypes: 'Primary', ImageTypeLimit: 1, EnableTotalRecordCount: true }).catch(() => ({ Items: [] }));
          v.groovePosters = (r.Items || []).map(i => img(i.Id, { type: 'Primary', maxHeight: 96, tag: i.ImageTags.Primary }));
          v.grooveCount = r.TotalRecordCount;
        }).concat((boxsets.Items || []).filter(b => !b.ImageTags?.Primary).map(async b => {
          // Collection sans image : les affiches de ses titres
          const r = await api().getItems(uid, { ParentId: b.Id, Limit: 4, ImageTypes: 'Primary', EnableImageTypes: 'Primary', ImageTypeLimit: 1 }).catch(() => ({ Items: [] }));
          b.groovePosters = (r.Items || []).map(i => img(i.Id, { type: 'Primary', maxHeight: 96, tag: i.ImageTags.Primary }));
        })));
        const order = c => { const k = PLATFORMS.indexOf(c.Name); return k < 0 ? 100 : k; };
        const bs = (boxsets.Items || []).sort((a, b) => order(a) - order(b) || a.Name.localeCompare(b.Name, 'fr'));
        this.data = { views: vs, playlists: playlists.Items || [], boxsets: bs, favCount: favs.TotalRecordCount || 0, admin: !!me?.Policy?.IsAdministrator };
        this.loadedFor = uid;
      } catch (e) { console.warn('[Groove] médiathèques', e); }
      finally { this.loading = false; }
      this.render();
    },
    reload() { this.loadedFor = null; this.load(); },
    href(it) {
      if (isMangas(it)) return MANGAS.url;
      if (it.Type === 'CollectionFolder' || it.Type === 'UserView') {
        const t = it.CollectionType;
        const route = { movies: 'movies', tvshows: 'tv', music: 'music', books: 'books', homevideos: 'homevideos', musicvideos: 'musicvideos', boxsets: 'boxsets', playlists: 'playlists', livetv: 'livetv' }[t] || 'mixed';
        return route === 'livetv' ? '#/livetv' : `#/${route}?topParentId=${it.Id}&collectionType=${t || 'mixed'}`;
      }
      return `#/details?id=${it.Id}&serverId=${it.ServerId}`;
    },
    countOf(it) { return it.Type === 'Playlist' || it.Type === 'BoxSet' ? it.ChildCount : it.grooveCount; },
    // Le nom dit déjà le type (« Dune Collection », « Films ») : le sous-titre ne donne que le nombre
    subOf(it) {
      const n = this.countOf(it);
      if (n != null) return plural(n, 'titre');
      return { livetv: 'Chaînes', books: 'Livres' }[it.CollectionType] || '';
    },
    // « + » : nouvelle liste de lecture (tout le monde) ; nouvelle collection et médiathèque (admin)
    create(anchor) {
      const items = [['playlist', 'Nouvelle liste de lecture', 'playlist_add'], ...(this.data?.admin ? [['collection', 'Nouvelle collection', 'video_library'], ['library', 'Ajouter une médiathèque', 'create_new_folder']] : [])];
      menu.open(anchor, items.map(([k, l, i]) => menuItem(k, l, i)).join(''), ev => {
        const k = ev.target.closest('[data-k]')?.dataset.k;
        if (!k) return;
        if (k === 'library') { menu.close(); location.hash = '#/dashboard/libraries'; return; }
        this.askName(anchor, k);
      });
    },
    askName(anchor, kind) {
      const label = kind === 'playlist' ? 'Nouvelle liste de lecture' : 'Nouvelle collection';
      menu.open(anchor, `<form class="g-menu-form"><label for="g-new-name">${label}</label><input id="g-new-name" name="name" required maxlength="120" autocomplete="off" placeholder="Nom"><div><button type="submit" class="groove-btn groove-btn-primary">Créer</button></div><p class="g-menu-err" role="alert" hidden></p></form>`, () => {});
      menu.el.querySelector('form').addEventListener('submit', async ev => {
        ev.preventDefault();
        const name = ev.target.elements.name.value.trim();
        if (!name) return;
        const btn = ev.target.querySelector('button');
        btn.disabled = true;
        try {
          const r = kind === 'playlist'
            ? await api().ajax({ type: 'POST', url: api().getUrl('Playlists'), data: JSON.stringify({ Name: name, UserId: userId(), MediaType: 'Video' }), contentType: 'application/json', dataType: 'json' })
            : await api().ajax({ type: 'POST', url: api().getUrl('Collections', { Name: name, IsLocked: false }), dataType: 'json' });
          menu.close();
          this.reload();
          if (r?.Id) location.hash = `#/details?id=${r.Id}&serverId=${api().serverId()}`;
        } catch (e) {
          console.warn('[Groove] création', e);
          const p = menu.el?.querySelector('.g-menu-err');
          if (p) { p.hidden = false; p.textContent = 'Création impossible. Vérifiez vos droits sur le serveur.'; }
          btn.disabled = false;
        }
      });
    },
    sortMenu(anchor) {
      const cur = store.get(LS.sort) || 'custom';
      menu.open(anchor, '<p class="g-menu-h">Trier par</p>' + SORTS.map(([k, l]) => menuItem(k, l, null, cur === k)).join(''), ev => {
        const k = ev.target.closest('[data-k]')?.dataset.k;
        if (!k) return;
        store.set(LS.sort, k); menu.close(); this.render();
      }, { align: 'end' });
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
          const b = ev.target.closest('button');
          if (!b) return;
          if (b.dataset.collapse !== undefined) { const c = !document.documentElement.classList.contains('groove-sb-collapsed'); store.set(LS.collapsed, c ? '1' : '0'); document.documentElement.classList.toggle('groove-sb-collapsed', c); this.render(); }
          if (b.dataset.create !== undefined) this.create(b);
          if (b.dataset.sort !== undefined) this.sortMenu(b);
        });
        el.addEventListener('toggle', ev => { if (ev.target.matches('details')) store.set(LS.more, ev.target.open ? '1' : '0'); }, true);
      }
      const sort = store.get(LS.sort) || 'custom';
      const collapsed = store.get(LS.collapsed) === '1';
      const { views, playlists, boxsets, favCount, admin } = this.data;
      const { platforms, others } = groupViews(views);
      // La médiathèque « Collections » ferait doublon avec la section Collections : elle devient son lien « Tout voir »
      const boxView = others.find(v => v.CollectionType === 'boxsets');
      const libs = others.filter(v => v !== boxView);
      const total = p => kindsOf(p).reduce((n, t) => n + (p[t].grooveCount || 0), 0);
      const sorted = (list, name, count) => sort === 'alpha' ? [...list].sort((a, b) => name(a).localeCompare(name(b), 'fr')) : sort === 'count' ? [...list].sort((a, b) => count(b) - count(a)) : list;
      const byName = it => it.Name, byCount = it => this.countOf(it) || 0;
      const thumb = it => {
        if (it.groovePosters?.length === 4) return `<span class="g-thumb">${it.groovePosters.map(u => `<img src="${esc(u)}" alt="" loading="lazy">`).join('')}</span>`;
        const tag = it.ImageTags?.Primary;
        const src = tag ? img(it.Id, { type: 'Primary', maxHeight: 96, tag }) : it.groovePosters?.[0];
        return src ? `<span class="g-thumb g-single"><img src="${esc(src)}" alt="" loading="lazy"></span>` : `<span class="g-thumb g-single">${it.CollectionType === 'livetv' ? mi('live_tv') : svg('library')}</span>`;
      };
      const item = (it, h, sub, th) => `<li><a class="g-item" href="${h}" ${collapsed ? `title="${esc(it.Name)}" aria-label="${esc(it.Name)}"` : ''}>${th}<span class="g-text"><span class="g-name">${esc(it.Name)}</span>${sub ? `<span class="g-sub">${esc(sub)}</span>` : ''}</span></a></li>`;
      // Plateforme : vignette de la médiathèque (logo) vers son premier type, puis une pilule par type avec son nombre de titres
      const platform = p => {
        const first = p[kindsOf(p)[0]];
        const logo = kindsOf(p).map(t => p[t]).find(v => v.ImageTags?.Primary);
        const th = logo ? `<span class="g-thumb g-single"><img src="${esc(img(logo.Id, { type: 'Primary', maxHeight: 96, tag: logo.ImageTags.Primary }))}" alt="" loading="lazy"></span>` : thumb(first);
        return `<li class="g-plat"><a class="g-item" href="${this.href(first)}" title="${esc(p.name)}" aria-label="${esc(p.name)} : ${KIND[kindsOf(p)[0]]}">${th}</a><span class="g-text"><span class="g-name">${esc(p.name)}</span><span class="g-pills">${kindsOf(p).map(t => `<a href="${this.href(p[t])}">${KIND[t]}${p[t].grooveCount != null ? ` <span class="g-n">${p[t].grooveCount}</span>` : ''}</a>`).join('')}</span></span></li>`;
      };
      const section = (title, rows, link = '') => rows ? `<section><h3 class="g-sec"><span>${title}</span>${link}</h3><ul role="list">${rows}</ul></section>` : '';
      const more = [['#/queue', 'Télécommande', 'settings_remote'], ['#/mypreferencesmenu', 'Préférences', 'settings'], ...(admin ? [['#/dashboard', 'Tableau de bord', 'dashboard'], ['#/metadata', 'Gestionnaire de métadonnées', 'edit_note']] : [])];
      el.innerHTML = `
        <div class="g-head">
          <button type="button" class="g-title" data-collapse aria-expanded="${!collapsed}" aria-label="${collapsed ? 'Déplier' : 'Réduire'} les médiathèques">${svg('library')}<span class="g-label">Médiathèques</span></button>
          <button type="button" class="g-ib g-hide-collapsed" data-create aria-label="Créer" aria-haspopup="menu">${mi('add')}</button>
        </div>
        <div class="g-tools"><a class="g-ib" href="#/search" aria-label="Rechercher dans les médiathèques">${mi('search')}</a><button type="button" class="g-sort" data-sort aria-haspopup="menu">${SORTS.find(s => s[0] === sort)[1]}${mi('format_list_bulleted')}</button></div>
        <div class="g-list">
          <ul role="list">${item({ Name: 'Favoris' }, '#/home?tab=1', plural(favCount, 'élément'), `<span class="g-thumb g-single g-fav">${svg('heart')}</span>`)}</ul>
          ${section('Plateformes', sorted(platforms, p => p.name, total).map(platform).join(''))}
          ${section('Médiathèques', sorted(libs, byName, byCount).map(it => item(it, this.href(it), this.subOf(it), thumb(it))).join(''))}
          ${section('Collections', sorted(boxsets, byName, byCount).map(it => item(it, this.href(it), this.subOf(it), thumb(it))).join(''), boxView ? `<a href="${this.href(boxView)}">Tout voir</a>` : '')}
          ${section('Listes de lecture', sorted(playlists, byName, byCount).map(it => item(it, this.href(it), this.subOf(it), thumb(it))).join(''))}
        </div>
        <details class="g-more" ${store.get(LS.more) === '1' ? 'open' : ''}><summary>Plus${mi('chevron_right')}</summary>
          <ul role="list">${more.map(([h, l, i]) => `<li><a href="${h}">${mi(i)}${l}</a></li>`).join('')}</ul>
        </details>`;
      this.mark();
    },
    mark() {
      const h = location.hash;
      document.querySelectorAll('#groove-sidebar :is(.g-item, .g-pills a)').forEach(a => {
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
    heroItems: null, timer: null, busyRows: false, colsPromise: null,
    container() { return document.querySelector('#indexPage:not(.hide) .homeSectionsContainer'); },
    sync() {
      const c = this.container();
      if (!c) { clearInterval(this.timer); return; }
      this.hero(c); this.rows(c);
    },
    async hero(c) {
      if (c.parentElement.querySelector('.groove-hero')) return;
      // Emplacement posé tout de suite (même hauteur) pour que les rangées ne sautent pas quand la bannière arrive
      const el = document.createElement('section');
      el.className = 'groove-hero';
      el.setAttribute('aria-roledescription', 'carrousel');
      el.setAttribute('aria-label', 'À la une');
      c.parentElement.insertBefore(el, c);
      try {
        if (!this.heroItems) {
          const r = await api().getItems(userId(), { IncludeItemTypes: 'Movie,Series', Recursive: true, SortBy: 'Random', Limit: 24, ImageTypes: 'Backdrop', Filters: 'IsUnplayed', Fields: 'Overview,Genres,ProductionYear,OfficialRating,CommunityRating,ChildCount,ParentId', EnableImageTypes: 'Backdrop,Logo,Primary', ImageTypeLimit: 1 });
          this.heroItems = (r.Items || []).filter(i => i.BackdropImageTags?.length && i.Overview).sort((a, b) => !!b.ImageTags?.Logo - !!a.ImageTags?.Logo).slice(0, HERO_SLIDES);
        }
        if (!el.isConnected) return;
        if (!this.heroItems.length) { el.remove(); return; }
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
        let cur = 0;
        const go = k => {
          cur = (k + this.heroItems.length) % this.heroItems.length;
          el.querySelectorAll('.groove-hero-slide').forEach((s, n) => { s.toggleAttribute('data-active', n === cur); n === cur ? s.removeAttribute('aria-hidden') : s.setAttribute('aria-hidden', 'true'); });
          el.querySelectorAll('.groove-hero-dot').forEach((d, n) => d.setAttribute('aria-current', String(n === cur)));
        };
        el.addEventListener('click', ev => {
          const d = ev.target.closest('[data-go]'); if (d) go(+d.dataset.go);
        });
        clearInterval(this.timer);
        if (!reduceMotion()) this.timer = setInterval(() => { if (!document.contains(el)) return clearInterval(this.timer); if (!document.hidden && !el.matches(':hover, :focus-within')) go(cur + 1); }, HERO_MS);
      } catch (e) { console.warn('[Groove] bannière', e); el.remove(); }
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

  /* ---------- Barre du haut : lien « Accueil » comme la maquette ---------- */
  const topbar = {
    sync() {
      this.drawer();
      const logo = $('header.MuiAppBar-root a[href="#/"]');
      if (!logo) {
        // Mobile : seul le bouton du menu reste à gauche, on y accole le logo
        const burger = $('header.MuiAppBar-root .MuiToolbar-root > .MuiIconButton-root:first-child');
        if (burger && !burger.nextElementSibling?.matches('.g-brand')) burger.insertAdjacentHTML('afterend', '<a class="g-brand" href="#/home" aria-label="Accueil"></a>');
        return;
      }
      $('header.MuiAppBar-root .g-brand')?.remove();
      let a = $('header.MuiAppBar-root .g-home');
      if (!a) { a = document.createElement('a'); a.className = 'g-home'; a.href = '#/home'; a.textContent = 'Accueil'; }
      if (logo.nextElementSibling !== a) logo.after(a);
      const home = /^#\/home(\?(?!.*tab=[1-9])|$)/.test(location.hash) || location.hash === '#/' || !location.hash;
      home ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
      $('header.MuiAppBar-root a[href="#/search"]')?.toggleAttribute('data-active', location.hash.startsWith('#/search'));
      this.nav(a);
    },
    // Médiathèques « <Plateforme> Films » / « <Plateforme> Séries » regroupées : un lien par plateforme, sous-menu au survol
    navFor: null,
    nav(after) {
      const views = sidebar.views;
      if (!views) return; // pas encore chargées : la barre reste vide (CSS), sans passer par la navigation de Jellyfin
      let nav = $('header.MuiAppBar-root .g-nav');
      if (!nav || this.navFor !== views) {
        nav?.remove();
        nav = document.createElement('nav');
        nav.className = 'g-nav';
        nav.setAttribute('aria-label', 'Médiathèques');
        nav.innerHTML = this.html(views);
        nav.addEventListener('click', ev => {
          const b = ev.target.closest('button[aria-expanded]');
          const open = b && b.getAttribute('aria-expanded') !== 'true';
          this.closeSubs();
          if (open) b.setAttribute('aria-expanded', 'true');
        });
        nav.addEventListener('keydown', ev => { if (ev.key === 'Escape') { nav.querySelector('[aria-expanded="true"]')?.focus(); this.closeSubs(); } });
        if (!this.bound) {
          this.bound = true;
          document.addEventListener('pointerdown', ev => { if (!ev.target.closest('.g-nav')) this.closeSubs(); }, true);
          window.addEventListener('hashchange', () => this.closeSubs());
        }
        this.navFor = views;
      }
      if (after.nextElementSibling !== nav) after.after(nav);
      document.documentElement.classList.add('groove-nav');
      const h = location.hash;
      nav.querySelectorAll('a[data-id]').forEach(l => h.includes(l.dataset.id) ? l.setAttribute('aria-current', 'page') : l.removeAttribute('aria-current'));
      nav.querySelector('[data-fav]').toggleAttribute('data-active', /^#\/home\?.*tab=1/.test(h));
      // La largeur libre dépend des icônes de droite (admin, Jellyfin Enhanced) : on mesure plutôt que de fixer des seuils
      if (this.observed !== nav.parentElement) {
        this.ro ??= new ResizeObserver(() => this.fit());
        this.ro.disconnect();
        this.ro.observe(this.observed = nav.parentElement);
      }
      this.fit();
    },
    fit() {
      const nav = $('header.MuiAppBar-root .g-nav');
      if (!nav) return;
      const root = document.documentElement, stack = nav.parentElement;
      root.classList.remove('groove-nav-compact');
      if (stack.scrollWidth > stack.clientWidth) root.classList.add('groove-nav-compact');
      // Un lien masqué (display: none) ne compte pas : « Plus » n'est actif que si la page courante y est visible
      nav.querySelectorAll('.g-nav-group').forEach(g => g.firstElementChild.toggleAttribute('data-active', [...g.querySelectorAll('[aria-current]')].some(l => l.checkVisibility())));
    },
    closeSubs() { document.querySelectorAll('.g-nav [aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false')); },
    drawer() {
      const list = $('.MuiDrawer-paper ul:has(> .MuiListSubheader-root)');
      if (!list || !sidebar.views) return;
      list.classList.add('g-lib-native');
      if (!list.nextElementSibling?.matches('.g-drawer')) list.insertAdjacentHTML('afterend', `<nav class="g-drawer" aria-label="Médiathèques">${this.html(sidebar.views, true)}</nav>`);
      list.nextElementSibling.querySelectorAll('a[data-id]').forEach(l => location.hash.includes(l.dataset.id) ? l.setAttribute('aria-current', 'page') : l.removeAttribute('aria-current'));
    },
    html(views, drawer = false) {
      const ALL = { movies: 'Tous les films', tvshows: 'Toutes les séries' };
      const { platforms, others: all } = groupViews(views);
      const mangas = all.find(isMangas);
      const others = all.filter(v => v !== mangas); // Mangas : lien direct dans la barre, pas dans « Plus »
      const link = (v, label, cls = '') => `<a class="${cls}" href="${sidebar.href(v)}" data-id="${v.Id}">${esc(label)}</a>`;
      const group = (label, sub, k, cls = '') => `<div class="g-nav-group"><button type="button" class="g-nav-link" aria-expanded="false" aria-controls="g-nav-sub-${k}">${esc(label)}${mi('expand_more')}</button><div class="g-nav-sub ${cls}" id="g-nav-sub-${k}">${sub}</div></div>`;
      const main = NAV_MAIN.map(n => platforms.find(p => p.key === n.toLowerCase())).filter(Boolean);
      const rest = platforms.filter(p => !main.includes(p));
      // « Plus » : plateformes à gauche (vignette de la médiathèque, pilules calées à droite, sans case vide), liens généraux à droite
      const ICONS = { movies: 'movie', tvshows: 'tv', boxsets: 'collections_bookmark', music: 'library_music', livetv: 'live_tv' };
      const pthumb = v => v.ImageTags?.Primary ? `<img src="${esc(img(v.Id, { type: 'Primary', maxHeight: 64, tag: v.ImageTags.Primary }))}" alt="" loading="lazy">` : '';
      // Les plateformes de la barre y figurent aussi, affichées seulement quand la barre manque de place (groove-nav-compact)
      const row = (p, isMain) => `<li class="g-nav-row"${isMain ? ' data-main' : ''}><span class="g-nav-pthumb">${pthumb(p.movies || p.tvshows)}</span><span class="g-nav-pname">${esc(p.name)}</span><span class="g-nav-pills">${kindsOf(p).map(t => link(p[t], KIND[t])).join('')}</span></li>`;
      const rows = main.map(p => row(p, true)).join('') + rest.map(p => row(p, false)).join('');
      const browse = others.sort((a, b) => !ALL[a.CollectionType] - !ALL[b.CollectionType]).map(v => `<li><a href="${sidebar.href(v)}" data-id="${v.Id}">${mi(ICONS[v.CollectionType] || 'video_library')}${esc(ALL[v.CollectionType] || v.Name)}</a></li>`).join('');
      const col = (title, list) => list ? `<div class="g-nav-col"><p class="g-nav-h">${title}</p><ul role="list">${list}</ul></div>` : '';
      // Tiroir mobile : même contenu que « Plus », avec toutes les plateformes et Mangas (la barre n'y est pas)
      if (drawer) return col('Plateformes', rows) + col('Parcourir', browse + (mangas ? `<li><a href="${MANGAS.url}">${mi('menu_book')}Mangas</a></li>` : ''));
      const more = col('Plateformes', rows) + col('Parcourir', browse);
      return main.map((p, k) => group(p.name, kindsOf(p).map(t => link(p[t], KIND[t])).join(''), k)).join('')
        + (more ? group('Plus', more, 'more', 'g-nav-more') : '')
        + (mangas ? `<a class="g-nav-link" href="${MANGAS.url}">Mangas</a>` : '')
        + '<a class="g-nav-link" href="#/home?tab=1" data-fav>Favoris</a>';
    },
  };

  /* ---------- Fiche : bannière de la maquette, teinte tirée de l'affiche, lecture depuis l'accueil ---------- */
  // Fiches en cache (et préchargées au survol des cartes) pour remplir la bannière sans attendre
  const itemCache = new Map();
  const itemData = id => {
    if (!itemCache.has(id)) {
      if (itemCache.size > 60) itemCache.delete(itemCache.keys().next().value);
      const uid = userId();
      itemCache.set(id, Promise.all([api().getItem(uid, id), api().getAncestorItems(id, uid).catch(() => [])]).catch(e => { itemCache.delete(id); throw e; }));
    }
    return itemCache.get(id);
  };
  document.addEventListener('click', ev => {
    const p = ev.target.closest?.('[data-groove-play]');
    if (p) { try { sessionStorage.setItem('groove.autoplay', p.dataset.groovePlay); } catch { /* ignoré */ } }
  });
  document.addEventListener('pointerover', ev => {
    const id = ev.target.closest?.('.card[data-id], .listItem[data-id], a[href*="details?id="]')?.dataset.id || (ev.target.closest?.('a[href*="details?id="]')?.getAttribute('href').match(/id=([a-f0-9]{32})/) || [])[1];
    if (active && id && api()) itemData(id).catch(() => {});
  }, { passive: true });
  const HERO_TYPES = ['Movie', 'Series', 'Season', 'Episode', 'BoxSet', 'Video', 'MusicVideo'];
  const details = {
    done: new WeakMap(),
    sync() {
      const page = document.querySelector('#itemDetailPage:not(.hide)');
      if (!page) return;
      this.hero(page);
      this.episodes(page);
      this.labels(page);
      this.layout(page);
      this.sticky(page);
      this.tint(page);
      this.autoplay(page);
    },
    // Bannière posée tout de suite (vide, à la bonne taille) puis remplie : pas de flash de la fiche Jellyfin
    hero(page) {
      const id = new URLSearchParams(location.hash.split('?')[1]).get('id');
      const old = page.querySelector('.groove-dhero');
      if (!id || old?.dataset.id === id) return;
      if (old) { page.querySelector('.infoWrapper')?.append(...old.querySelectorAll('.itemMiscInfo')); old.remove(); }
      const el = document.createElement('header');
      el.className = 'groove-dhero';
      el.dataset.id = id;
      el.innerHTML = '<div class="g-dh-in"></div>';
      page.querySelector('.detailPageWrapperContainer')?.prepend(el);
      page.classList.remove('groove-dnative');
      page.style.removeProperty('--g-tint');
      delete page.dataset.gnext;
      this.done.delete(page);
      this.fill(page, el, id);
    },
    async fill(page, el, id) {
      try {
        const uid = userId();
        const [it, anc] = await itemData(id);
        if (!el.isConnected || el.dataset.id !== id) return;
        if (!HERO_TYPES.includes(it.Type)) { page.classList.add('groove-dnative'); el.remove(); return; }
        const link = (lid, name) => `<a href="#/details?id=${lid}&serverId=${it.ServerId}">${esc(name)}</a>`;
        const lib = (anc || []).find(a => a.Type === 'CollectionFolder')?.Name;
        const eyebrow = it.Type === 'Episode' ? [it.SeriesId && link(it.SeriesId, it.SeriesName), it.SeasonId && link(it.SeasonId, it.SeasonName), it.IndexNumber != null && `Épisode ${it.IndexNumber}`].filter(Boolean).join(' · ')
          : it.Type === 'Season' ? (it.SeriesId ? link(it.SeriesId, it.SeriesName) : '')
          : [{ Movie: 'Film', Series: 'Série', BoxSet: 'Collection', Video: 'Vidéo', MusicVideo: 'Clip' }[it.Type], lib && esc(lib)].filter(Boolean).join(' · ');
        const big = (iid, type, tag) => img(iid, { type, maxWidth: 1920, tag });
        const backdrop = it.Type === 'Episode' && it.ImageTags?.Primary ? big(it.Id, 'Primary', it.ImageTags.Primary)
          : it.BackdropImageTags?.length ? big(it.Id, 'Backdrop', it.BackdropImageTags[0])
          : it.ParentBackdropImageTags?.length ? big(it.ParentBackdropItemId, 'Backdrop', it.ParentBackdropImageTags[0]) : '';
        const seriesPoster = it.SeriesPrimaryImageTag && img(it.SeriesId, { type: 'Primary', maxHeight: 640, tag: it.SeriesPrimaryImageTag });
        const poster = it.Type === 'Episode' ? seriesPoster
          : it.ImageTags?.Primary ? img(it.Id, { type: 'Primary', maxHeight: 640, tag: it.ImageTags.Primary }) : seriesPoster;
        // Séries et saisons : Jellyfin n'affiche presque rien, on reprend la ligne de la maquette
        let meta = [];
        if (it.Type === 'Series') {
          const y0 = it.ProductionYear, y1 = it.EndDate ? new Date(it.EndDate).getFullYear() : null;
          const span = !y0 ? '' : it.Status === 'Continuing' ? `${y0}\u2013` : y1 && y1 !== y0 ? `${y0}\u2013${y1}` : String(y0);
          meta = [span, it.ChildCount ? plural(it.ChildCount, 'saison') : '', it.CommunityRating ? `<span class="g-star">${svg('star', '')}${frNum(it.CommunityRating.toFixed(1))}</span>` : '', esc((it.Genres || []).join(', ')),
            it.Status ? `<span class="g-status" data-on="${it.Status === 'Continuing'}">${it.Status === 'Continuing' ? 'En cours' : 'Terminée'}</span>` : ''];
        } else if (it.Type === 'Season') {
          const y = it.PremiereDate ? new Date(it.PremiereDate).getFullYear() : it.ProductionYear;
          const left = it.UserData?.UnplayedItemCount;
          // « 12 épisodes · 12 non vus » répète le total : on n'affiche le reste que si la saison est entamée
          meta = [y || '', it.ChildCount ? plural(it.ChildCount, 'épisode') : '', left && left < it.ChildCount ? plural(left, 'épisode restant', 'épisodes restants') : !left && it.ChildCount ? 'Saison vue' : ''];
        }
        meta = meta.filter(Boolean);
        el.toggleAttribute('data-backdrop', !!backdrop);
        const code = it.ParentIndexNumber != null && it.IndexNumber != null ? `S${it.ParentIndexNumber}:E${it.IndexNumber}` : '';
        el.dataset.title = it.Type === 'Episode' && code ? `${code} · ${it.Name}` : it.Type === 'Season' && it.SeriesName ? `${it.SeriesName} · ${it.Name}` : it.Name;
        if (it.Type === 'Episode') { el.dataset.series = it.SeriesName || ''; el.dataset.sn = it.ParentIndexNumber ?? ''; }
        el.innerHTML = `${backdrop ? `<img class="g-dh-bg" src="${esc(backdrop)}" alt="">` : poster ? `<img class="g-dh-bg g-dh-blur" src="${esc(poster)}" alt="">` : ''}
          <div class="g-dh-in">
            ${poster ? `<div class="g-dh-poster"><img src="${esc(poster)}" alt=""></div>` : ''}
            <div class="g-dh-body">
              ${eyebrow ? `<p class="g-dh-eyebrow">${eyebrow}</p>` : ''}
              <h1 class="g-dh-title">${esc(it.Name)}</h1>
              <div class="g-dh-meta">${meta.length ? `<div class="g-dh-row">${meta.join('<span aria-hidden="true">·</span>')}</div>` : ''}</div>
              ${it.Taglines?.[0] ? `<p class="g-dh-tagline">${esc(it.Taglines[0])}</p>` : ''}
            </div>
          </div>`;
        // Les infos (année, durée, note, fin à...) restent celles de Jellyfin : on les déplace dans la bannière (Jellyfin les retrouve par page.querySelector).
        if (!meta.length) el.querySelector('.g-dh-meta').append(...page.querySelectorAll('.itemMiscInfo-primary, .itemMiscInfo-secondary'));
        this.done.delete(page);
        schedule();
        if (it.Type === 'Episode') { el.dataset.season = it.SeasonName || ''; this.epnav(page, it, uid); }
        if (it.Type === 'Series') api().getItems(uid, { ParentId: it.Id, IncludeItemTypes: 'Season', Fields: 'ChildCount,PremiereDate' }).then(r => {
          this.seasonSubs = new Map((r.Items || []).map(s => [s.Id, [s.ChildCount ? plural(s.ChildCount, 'épisode') : '', s.PremiereDate ? new Date(s.PremiereDate).getFullYear() : s.ProductionYear || ''].filter(Boolean).join(' · ')]));
          schedule();
        }).catch(() => {});
        this.playLabel(page, it, uid);
      } catch (e) { console.warn('[Groove] fiche', e); }
    },
    // Liste des épisodes : le n° passe dans sa propre colonne (« 1. L'appel » devient « 1 » + « L'appel »)
    episodes(page) {
      page.querySelectorAll('.vertical-list > .listItem:not([data-gn])').forEach(li => {
        li.dataset.gn = '';
        // Jellyfin ne met aucune action sur le texte (data-action="none") et la vignette lance la lecture :
        // le texte ouvre la fiche de l'épisode, à la souris comme au clavier
        const body = li.querySelector('.listItemBody');
        if (body) {
          body.dataset.action = 'link';
          body.tabIndex = 0;
          body.setAttribute('role', 'link');
          body.addEventListener('keydown', e => { if (e.key === 'Enter') body.click(); });
        }
        const b = li.querySelector('.listItemBodyText bdi');
        const m = b?.textContent.match(/^(\d+)\.\s+([\s\S]*)$/);
        if (!m) return;
        b.textContent = m[2];
        const n = document.createElement('span');
        n.className = 'g-ep-n'; n.textContent = m[1]; n.setAttribute('aria-hidden', 'true');
        li.querySelector('.listItem-content')?.prepend(n);
      });
      page.querySelectorAll('.vertical-list > .listItem[data-id]').forEach(li => {
        const on = li.dataset.id === page.dataset.gnext;
        li.toggleAttribute('data-gnext', on);
        li.toggleAttribute('data-gresume', on && !!page.dataset.gresume);
      });
    },
    labels(page) {
      const season = page.querySelector('.groove-dhero')?.dataset.season;
      const t = season && page.querySelector('.moreFromSeasonSection .sectionTitle');
      const want = season && (/^saison\b/i.test(season) ? `Autres épisodes de la ${season.toLowerCase()}` : `Autres épisodes : ${season}`);
      if (t && !t.children.length && t.textContent !== want) t.textContent = want;
      // Cartes des saisons : sous-titre de la maquette
      if (this.seasonSubs) page.querySelectorAll('#childrenContent .card[data-id]:not([data-gs])').forEach(card => {
        const sub = this.seasonSubs.get(card.dataset.id);
        if (!sub) return;
        card.dataset.gs = '';
        card.querySelector('.cardText-secondary')?.remove();
        card.querySelector('.cardText-first')?.insertAdjacentHTML('afterend', `<div class="cardText cardText-secondary">${esc(sub)}</div>`);
      });
      // Cartes d'épisodes : « Série » puis « S1:E3 · Titre » (maquette) au lieu de « 3. Titre »
      const h = page.querySelector('.groove-dhero');
      if (!h?.dataset.series) return;
      page.querySelectorAll('.moreFromSeasonSection .card:not([data-gn])').forEach(card => {
        card.dataset.gn = '';
        const first = card.querySelector('.cardText-first');
        const link = first?.querySelector('a, bdi');
        const m = link?.textContent.match(/^(\d+)\.\s+([\s\S]*)$/);
        if (!m) return;
        link.textContent = h.dataset.series;
        const sub = document.createElement('div');
        sub.className = 'cardText cardText-secondary';
        sub.textContent = `${h.dataset.sn !== '' ? `S${h.dataset.sn}:E${m[1]}` : m[1]} · ${m[2]}`;
        first.after(sub);
      });
    },
    // « Détails » (infos, liens, étiquettes) en fin de fiche, avant « Plus comme ça », comme la maquette
    layout(page) {
      if (!page.querySelector('.groove-dhero .g-dh-body') || page.querySelector('.g-details')) return;
      const box = document.createElement('section');
      box.className = 'g-details';
      box.innerHTML = '<h2 class="sectionTitle">Détails</h2>';
      box.append(...['.itemDetailsGroup', '.itemExternalLinks', '.itemTags'].map(s => page.querySelector(s)).filter(Boolean));
      const sec = page.querySelector('.detailPageSecondaryContainer');
      const similar = sec?.querySelector('#similarCollapsible');
      similar ? similar.before(box) : sec?.append(box);
    },
    // Barre collante : rond vert + titre, visible après 280 px de défilement
    sticky(page) {
      const h = page.querySelector('.groove-dhero');
      if (!h?.dataset.title) return; // bannière pas encore remplie
      let bar = page.querySelector('.g-sticky');
      if (bar?.dataset.id === h.dataset.id && bar.dataset.title === h.dataset.title) return;
      bar?.remove();
      bar = document.createElement('div');
      bar.className = 'g-sticky';
      bar.dataset.id = h.dataset.id;
      bar.dataset.title = h.dataset.title;
      bar.innerHTML = `<button type="button" class="g-sticky-play" aria-label="Lire ${esc(h.dataset.title)}">${svg('play', '')}</button><p>${esc(h.dataset.title)}</p>`;
      bar.querySelector('button').addEventListener('click', () => page.querySelector('.mainDetailButtons .btnPlay:not(.hide)')?.click());
      page.prepend(bar);
      bar.toggleAttribute('data-show', scrollY > 280);
    },
    // Libellé du bouton Lecture comme la maquette : « Lire S1:E5 », « Reprendre · 2 h 13 restantes » + barre de progression
    async playLabel(page, it, uid) {
      try {
        const resumed = x => x?.UserData?.PlaybackPositionTicks > 0;
        const fmt = m => m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`;
        const ep = e => `${resumed(e) ? 'Reprendre' : 'Lire'} S${e.ParentIndexNumber}:E${e.IndexNumber}`;
        let label = 'Lecture', pct = 0;
        if (it.Type === 'Series') {
          const n = (await api().getNextUpEpisodes({ SeriesId: it.Id, UserId: uid, Limit: 1, EnableUserData: true, Fields: 'Overview', EnableImageTypes: 'Primary,Thumb,Backdrop', ImageTypeLimit: 1 })).Items?.[0];
          if (n) { label = ep(n); this.nextCard(page, n, resumed(n)); }
        } else if (it.Type === 'Season' && it.SeriesId) {
          const eps = (await api().getEpisodes(it.SeriesId, { SeasonId: it.Id, userId: uid, Fields: 'UserData' })).Items || [];
          const next = eps.find(resumed) || eps.find(e => !e.UserData?.Played);
          const n = next || eps[0];
          if (n) label = ep(n);
          // Repère « À suivre » / « Reprendre » sur la ligne de l'épisode (posé par episodes())
          if (next && document.contains(page)) { page.dataset.gnext = next.Id; page.dataset.gresume = resumed(next) ? '1' : ''; schedule(); }
        } else if (resumed(it) && it.RunTimeTicks) {
          label = `Reprendre · ${fmt(Math.max(1, Math.round((it.RunTimeTicks - it.UserData.PlaybackPositionTicks) / 6e8)))} restantes`;
          pct = Math.round(it.UserData.PlayedPercentage || 0);
        }
        const b = page.querySelector('.mainDetailButtons .btnPlay');
        if (!b || !document.contains(page)) return;
        b.dataset.glabel = label;
        page.querySelector('.g-progress')?.remove();
        if (pct) b.closest('.mainDetailButtons').insertAdjacentHTML('afterend', `<div class="g-progress" role="progressbar" aria-label="Progression" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>`);
      } catch (e) { console.warn('[Groove] bouton Lecture', e); }
    },
    // Série : carte « Prochain épisode » de la maquette à la place de la carte « À suivre » de Jellyfin
    nextCard(page, n, resume) {
      if (!document.contains(page)) return;
      page.querySelectorAll('.g-next').forEach(x => x.remove());
      const thumb = n.ImageTags?.Primary ? img(n.Id, { type: 'Primary', maxWidth: 640, tag: n.ImageTags.Primary })
        : n.ParentThumbImageTag ? img(n.ParentThumbItemId, { type: 'Thumb', maxWidth: 640, tag: n.ParentThumbImageTag })
        : n.ParentBackdropImageTags?.length ? img(n.ParentBackdropItemId, { type: 'Backdrop', maxWidth: 640, tag: n.ParentBackdropImageTags[0] }) : '';
      const href = `#/details?id=${n.Id}&serverId=${n.ServerId}`;
      const pct = Math.round(n.UserData?.PlayedPercentage || 0);
      const info = [n.ParentIndexNumber != null && n.IndexNumber != null ? `S${n.ParentIndexNumber}:E${n.IndexNumber}` : '', n.RunTimeTicks ? `${Math.round(n.RunTimeTicks / 6e8)} min` : ''].filter(Boolean).join(' · ');
      const sec = document.createElement('section');
      sec.className = 'g-next';
      sec.innerHTML = `<h2 class="sectionTitle">${resume ? 'Reprendre' : 'Prochain épisode'}</h2>
        <article class="g-next-card">
          <a class="g-next-thumb" href="${href}" tabindex="-1" aria-hidden="true">${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy">` : ''}${pct ? `<span class="g-bar"><span style="width:${pct}%"></span></span>` : ''}</a>
          <div class="g-next-body">
            <p class="g-next-info">${esc(info)}</p>
            <h3><a href="${href}">${esc(n.Name)}</a></h3>
            ${n.Overview ? `<p class="g-next-ov">${esc(n.Overview)}</p>` : ''}
            <div><a class="groove-btn groove-btn-primary" href="${href}" data-groove-play="${n.Id}">${svg('play', '')}${resume ? 'Reprendre' : 'Lecture'}</a></div>
          </div>
        </article>`;
      const anchor = page.querySelector('.nextUpSection') || page.querySelector('#listChildrenCollapsible');
      anchor ? anchor.before(sec) : page.querySelector('.detailSection')?.append(sec);
    },
    async epnav(page, it, uid) {
      try {
        const list = (await api().getEpisodes(it.SeriesId, { userId: uid, AdjacentTo: it.Id })).Items || [];
        const k = list.findIndex(x => x.Id === it.Id);
        const prev = k > 0 ? list[k - 1] : null, next = k >= 0 ? list[k + 1] : null;
        if ((!prev && !next) || !document.contains(page)) return;
        const code = e => e.ParentIndexNumber != null && e.IndexNumber != null ? `S${e.ParentIndexNumber}:E${e.IndexNumber}` : e.Name;
        const a = (e, cls, html) => e ? `<a class="${cls}" href="#/details?id=${e.Id}&serverId=${e.ServerId}">${html}</a>` : '';
        const nav = document.createElement('nav');
        nav.className = 'g-epnav';
        nav.setAttribute('aria-label', 'Épisodes voisins');
        nav.innerHTML = a(prev, 'g-prev', `${svg('chevL', '')}Précédent : ${esc(prev && code(prev))}`) + a(next, 'g-next', `Suivant : ${esc(next && code(next))}${svg('chevR', '')}`);
        page.querySelectorAll('.g-epnav').forEach(n => n.remove());
        const sel = page.querySelector('.detailSection > .trackSelections');
        sel ? sel.after(nav) : page.querySelector('.detailSection')?.append(nav);
      } catch (e) { console.warn('[Groove] épisodes voisins', e); }
    },
    tint(page) {
      const box = page.querySelector('.g-dh-poster img, .detailImageContainer .cardImageContainer, .detailImageContainer img');
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

  /* ---------- Lecteur : en-tête de la maquette (série / « S1:E1 · Titre », fin, favori) ---------- */
  const osd = {
    last: null, busy: false,
    sync() {
      const page = document.querySelector('#videoOsdPage:not(.hide)');
      // 12.1 : en-tête React (.videoOsd-appBar) = bouton retour, p (titre), boîte de boutons à droite
      const header = document.querySelector('.skinHeader.osdHeader .videoOsd-appBar');
      if (!page || !header) { this.last = null; return; }
      const right = header.querySelector(':scope > .MuiBox-root:last-child');
      if (right && !right.querySelector('.g-osd-ends')) {
        right.insertAdjacentHTML('afterbegin', `<p class="g-osd-ends"></p><button type="button" class="g-osd-fav headerButton paper-icon-button-light" aria-label="Favori" aria-pressed="false">${svg('heart', '')}</button>`);
        right.querySelector('.g-osd-fav').addEventListener('click', () => document.querySelector('#videoOsdPage:not(.hide) .btnUserRating')?.click());
      }
      // Copies : Jellyfin continue de mettre à jour ses propres éléments (fin, favori) dans la barre du bas
      const ends = page.querySelector('.endsAtText')?.textContent.trim() || '';
      const e = right?.querySelector('.g-osd-ends');
      if (e && e.textContent !== ends) e.textContent = ends;
      const rating = page.querySelector('.btnUserRating');
      const fav = right?.querySelector('.g-osd-fav');
      if (fav) {
        fav.hidden = !rating || rating.classList.contains('hide');
        const on = String(!!rating?.querySelector('.ratingbutton-icon-withrating'));
        if (fav.getAttribute('aria-pressed') !== on) fav.setAttribute('aria-pressed', on);
      }
      this.title(header);
    },
    async title(header) {
      const tEl = header.querySelector(':scope > p');
      const t = tEl?.textContent || '';
      if (!t || this.busy || (t === this.last && header.querySelector('.g-osd-title'))) return;
      this.busy = true; this.last = t;
      try {
        const it = (await api().getSessions({ deviceId: api().deviceId() }))?.[0]?.NowPlayingItem;
        if (!it) return;
        const l1 = it.Type === 'Episode' ? it.SeriesName : [it.ProductionYear, (it.Genres || []).join(', ')].filter(Boolean).join(' · ');
        const l2 = it.Type === 'Episode' && it.IndexNumber != null ? `S${it.ParentIndexNumber}:E${it.IndexNumber} · ${it.Name}` : it.Name;
        let box = header.querySelector('.g-osd-title');
        if (!box) { box = document.createElement('div'); box.className = 'g-osd-title'; tEl?.after(box); }
        box.innerHTML = `${l1 ? `<p class="g-osd-l1">${esc(l1)}</p>` : ''}<p class="g-osd-l2">${esc(l2)}</p>`;
      } catch (e) { console.warn('[Groove] lecteur', e); this.last = null; }
      finally { this.busy = false; }
    },
  };

  /* ---------- Boucle ---------- */
  let queued = false;
  const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; try { sync(); } catch (e) { console.warn('[Groove]', e); } }); };
  document.addEventListener('viewshow', schedule);
  window.addEventListener('hashchange', schedule);
  addEventListener('scroll', () => { document.querySelector('#itemDetailPage:not(.hide) .g-sticky')?.toggleAttribute('data-show', scrollY > 280); }, { passive: true });
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  try { sync(); } catch (e) { console.warn('[Groove]', e); } // tout de suite, sans attendre la prochaine image
  schedule();
})();
