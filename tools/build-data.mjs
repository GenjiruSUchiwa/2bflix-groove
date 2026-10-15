// Construit mockup/data.js à partir de TVmaze (séries) et Wikipédia (films, personnes, chaînes).
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2];
const UA = { 'User-Agent': '2bflix-mockup/1.0 (maquette locale)' };
const get = async url => {
  for (let n = 0; n < 6; n++) {
    let r;
    try { r = await fetch(url, { headers: UA }); } catch { await new Promise(s => setTimeout(s, 1200 * (n + 1))); continue; }
    if (r.status === 429) { await new Promise(s => setTimeout(s, 1500)); continue; }
    if (r.status === 404) throw new Error(`404 ${url}`);
    if (!r.ok) { await new Promise(s => setTimeout(s, 1200)); continue; }
    if (false) throw new Error(`${r.status} ${url}`);
    return r.json();
  }
  throw new Error(`429 ${url}`);
};
const strip = h => (h || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const wiki = async (page, lang = 'en') => {
  try {
    const j = await get(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page)}`);
    return { img: j.originalimage?.source?.split('?')[0] || null, thumb: j.thumbnail?.source?.split('?')[0] || null };
  } catch { return { img: null, thumb: null }; }
};
const GENRE_FR = { Drama: 'Drame', Thriller: 'Thriller', 'Science-Fiction': 'Science-fiction', Action: 'Action', Adventure: 'Aventure', Comedy: 'Comédie', Crime: 'Policier', Fantasy: 'Fantastique', Horror: 'Horreur', Mystery: 'Mystère', Romance: 'Romance', History: 'Histoire', War: 'Guerre', Family: 'Famille', Children: 'Jeunesse', Anime: 'Anime', Western: 'Western', Supernatural: 'Surnaturel', Espionage: 'Espionnage', Legal: 'Judiciaire', Medical: 'Médical', Music: 'Musique', Sports: 'Sport', Food: 'Cuisine', Family: 'Famille' };

// [requête TVmaze, bibliothèque, année de première diffusion attendue]
const SHOWS = [
  ['Stranger Things', 'netflix', 2016], ['Squid Game', 'netflix', 2021], ['Lupin', 'netflix', 2021], ['Arcane', 'netflix', 2021], ['Dark', 'netflix', 2017], ['Wednesday', 'netflix', 2022],
  ['Severance', 'appletv', 2022], ['Slow Horses', 'appletv', 2022], ['Ted Lasso', 'appletv', 2020],
  ['The Boys', 'amazon', 2019], ['Reacher', 'amazon', 2022], ['Fallout', 'amazon', 2024],
  ['Shogun', 'disney', 2024], ['The Bear', 'disney', 2022], ['Andor', 'disney', 2022], ['The Mandalorian', 'disney', 2019],
  ['The Last of Us', 'hbo', 2023], ['House of the Dragon', 'hbo', 2022], ['Succession', 'hbo', 2018], ['The Penguin', 'hbo', 2024],
  ['Frieren', 'crunchy', 2023], ['Attack on Titan', 'crunchy', 2013], ['Solo Leveling', 'crunchy', 2024],
  ['Bluey', 'kids', 2018], ['Avatar: The Last Airbender', 'kids', 2005],
  ['Yellowstone', 'ocs', 2018], ['Tulsa King', 'ocs', 2022], ['Game of Thrones', 'ocs', 2011],
  ['Business Proposal', 'viki', 2022], ['Queen of Tears', 'viki', 2024], ['Crash Landing on You', 'viki', 2019],
];

async function show([q, lib, year]) {
  const found = await get(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);
  const hit = found.map(f => f.show).find(s => s.premiered?.startsWith(String(year))) || found[0].show;
  const id = hit.id;
  const [s, eps, cast, crew, imgs, seasons] = await Promise.all([
    get(`https://api.tvmaze.com/shows/${id}`), get(`https://api.tvmaze.com/shows/${id}/episodes`), get(`https://api.tvmaze.com/shows/${id}/cast`),
    get(`https://api.tvmaze.com/shows/${id}/crew`), get(`https://api.tvmaze.com/shows/${id}/images`), get(`https://api.tvmaze.com/shows/${id}/seasons`),
  ]);
  const best = type => imgs.filter(i => i.type === type).sort((a, b) => (b.main - a.main) || (b.resolutions.original.width - a.resolutions.original.width))[0];
  const bg = best('background'), poster = best('poster'), logo = best('typography'), banner = best('banner');
  const seen = new Set();
  return {
    id: `s${id}`, type: 'Series', lib, name: s.name, year: +s.premiered?.slice(0, 4), end: s.ended ? +s.ended.slice(0, 4) : null, status: s.status,
    runtime: s.runtime || s.averageRuntime, rating: s.rating?.average, network: s.network?.name || s.webChannel?.name, country: s.network?.country?.code || s.webChannel?.country?.code || null,
    lang: s.language, genres: s.genres.map(g => GENRE_FR[g] || g), imdb: s.externals?.imdb, tvdb: s.externals?.thetvdb, summaryEn: strip(s.summary),
    poster: poster?.resolutions.medium?.url || poster?.resolutions.original.url || s.image?.medium, posterLg: poster?.resolutions.original.url || s.image?.original,
    backdrop: bg?.resolutions.original.url || null, logo: logo?.resolutions.original.url || null, banner: banner?.resolutions.original.url || null,
    creators: crew.filter(c => c.type === 'Creator').map(c => c.person.name).slice(0, 3),
    cast: cast.filter(c => !seen.has(c.person.id) && seen.add(c.person.id)).slice(0, 12).map(c => ({ id: `p${c.person.id}`, name: c.person.name, role: c.character.name, img: c.person.image?.medium || null, born: c.person.birthday, place: c.person.country?.name || null })),
    seasons: seasons.filter(x => x.number > 0 && eps.some(e => e.season === x.number)).map(x => ({ n: x.number, img: x.image?.medium || null, premiere: x.premiereDate })),
    episodes: eps.filter(e => e.type === 'regular' || e.type === 'significant_special').map(e => ({ id: `e${e.id}`, s: e.season, n: e.number, name: e.name, date: e.airdate, runtime: e.runtime, rating: e.rating?.average, img: e.image?.medium || null, imgLg: e.image?.original || null, summaryEn: strip(e.summary) })),
  };
}

// Films : [page Wikipédia EN, titre FR, année, durée, genres, classification FR, note, bibliothèque, réalisation, distribution [acteur, rôle, page], studios, slogan, résumé]
const FILMS = [
  ['Dune:_Part_Two', 'Dune : Deuxième partie', 2024, 166, ['Science-fiction', 'Aventure'], 'Tous publics', 8.5, 'films', 'Denis Villeneuve', [['Timothée Chalamet', 'Paul Atréides'], ['Zendaya', 'Chani'], ['Rebecca Ferguson', 'Jessica'], ['Javier Bardem', 'Stilgar'], ['Austin Butler', 'Feyd-Rautha'], ['Florence Pugh', 'Princesse Irulan']], ['Legendary Pictures'], 'Longue vie aux combattants.', "Paul Atréides s'unit à Chani et aux Fremen pour venger sa famille. Face à un choix entre l'amour de sa vie et le destin de l'univers, il tente d'empêcher l'avenir terrible qu'il est le seul à prévoir.", 'Dune - Saga'],
  ['Dune_(2021_film)', 'Dune', 2021, 155, ['Science-fiction', 'Aventure'], 'Tous publics', 8.0, 'films', 'Denis Villeneuve', [['Timothée Chalamet', 'Paul Atréides'], ['Rebecca Ferguson', 'Jessica'], ['Oscar Isaac', 'Leto Atréides'], ['Zendaya', 'Chani'], ['Jason Momoa', 'Duncan Idaho']], ['Legendary Pictures'], 'Au-delà de la peur, le destin vous attend.', "Fils d'une famille noble chargée de la planète la plus hostile de l'univers, Paul Atréides doit protéger l'avenir des siens sur Arrakis, seule source de l'épice.", 'Dune - Saga'],
  ['Inception', 'Inception', 2010, 148, ['Science-fiction', 'Action'], 'Tous publics', 8.8, 'films', 'Christopher Nolan', [['Leonardo DiCaprio', 'Dom Cobb'], ['Joseph Gordon-Levitt', 'Arthur'], ['Elliot Page', 'Ariadne'], ['Tom Hardy', 'Eames'], ['Marion Cotillard', 'Mal']], ['Warner Bros.', 'Syncopy'], 'Votre esprit est la scène du crime.', "Dom Cobb vole des secrets dans le subconscient de ses cibles pendant leur sommeil. Pour retrouver sa vie, il doit réussir l'inverse : implanter une idée."],
  ['Interstellar_(film)', 'Interstellar', 2014, 169, ['Science-fiction', 'Drame'], 'Tous publics', 8.7, 'films', 'Christopher Nolan', [['Matthew McConaughey', 'Cooper'], ['Anne Hathaway', 'Brand'], ['Jessica Chastain', 'Murph'], ['Michael Caine', 'Professeur Brand']], ['Paramount Pictures', 'Syncopy'], "L'humanité est née sur Terre. Elle n'est pas destinée à y mourir.", "Alors que la Terre se meurt, un ancien pilote rejoint une mission qui traverse un trou de ver pour trouver une nouvelle planète habitable."],
  ['Oppenheimer_(film)', 'Oppenheimer', 2023, 180, ['Drame', 'Histoire'], 'Tous publics', 8.3, 'films', 'Christopher Nolan', [['Cillian Murphy', 'J. Robert Oppenheimer'], ['Emily Blunt', 'Kitty Oppenheimer'], ['Matt Damon', 'Leslie Groves'], ['Robert Downey Jr.', 'Lewis Strauss'], ['Florence Pugh', 'Jean Tatlock']], ['Universal Pictures', 'Syncopy'], 'Le monde a changé pour toujours.', "Le physicien J. Robert Oppenheimer dirige le projet Manhattan et la course pour mettre au point la première bombe atomique."],
  ['Parasite_(2019_film)', 'Parasite', 2019, 132, ['Thriller', 'Drame'], 'Tous publics', 8.5, 'films', 'Bong Joon-ho', [['Song Kang-ho', 'Kim Ki-taek'], ['Lee Sun-kyun', 'Park Dong-ik'], ['Cho Yeo-jeong', 'Choi Yeon-gyo'], ['Choi Woo-shik', 'Kim Ki-woo']], ['Barunson E&A'], 'Agis comme si tu en faisais partie.', "Toute la famille de Ki-taek est au chômage. Un à un, ses membres s'infiltrent au service des Park, une famille riche de Séoul."],
  ['Arrival_(film)', 'Premier Contact', 2016, 116, ['Science-fiction', 'Drame'], 'Tous publics', 7.9, 'films', 'Denis Villeneuve', [['Amy Adams', 'Louise Banks'], ['Jeremy Renner', 'Ian Donnelly'], ['Forest Whitaker', 'Colonel Weber']], ['Paramount Pictures', 'FilmNation'], 'Pourquoi sont-ils ici ?', "Douze vaisseaux se posent sur Terre. La linguiste Louise Banks est chargée de comprendre ce que veulent leurs occupants."],
  ['Blade_Runner_2049', 'Blade Runner 2049', 2017, 164, ['Science-fiction'], 'Tous publics', 8.0, 'films', 'Denis Villeneuve', [['Ryan Gosling', 'K'], ['Harrison Ford', 'Rick Deckard'], ['Ana de Armas', 'Joi'], ['Sylvia Hoeks', 'Luv']], ['Alcon Entertainment', 'Warner Bros.'], "La clé de l'avenir réside dans le passé.", "L'agent K, un blade runner, découvre un secret enfoui qui le mène sur la trace de Rick Deckard, disparu depuis trente ans."],
  ['Mad_Max:_Fury_Road', 'Mad Max: Fury Road', 2015, 120, ['Action', 'Aventure'], 'Avertissement', 8.1, 'films', 'George Miller', [['Tom Hardy', 'Max Rockatansky'], ['Charlize Theron', 'Furiosa'], ['Nicholas Hoult', 'Nux']], ['Warner Bros.', 'Village Roadshow'], 'Que la route soit longue.', "Dans un désert post-apocalyptique, Furiosa fuit le tyran Immortan Joe avec ses captives. Max se retrouve pris dans la course."],
  ['Amélie', "Le Fabuleux Destin d'Amélie Poulain", 2001, 122, ['Comédie', 'Romance'], 'Tous publics', 8.3, 'films', 'Jean-Pierre Jeunet', [['Audrey Tautou', 'Amélie Poulain'], ['Mathieu Kassovitz', 'Nino Quincampoix']], ['UGC', 'Claudie Ossard Productions'], 'Elle va changer votre vie.', "À Montmartre, une jeune serveuse décide de changer en secret la vie des gens qui l'entourent."],
  ['The_Intouchables', 'Intouchables', 2011, 112, ['Comédie', 'Drame'], 'Tous publics', 8.5, 'films', 'Olivier Nakache, Éric Toledano', [['François Cluzet', 'Philippe'], ['Omar Sy', 'Driss']], ['Gaumont', 'Quad'], "D'après une histoire vraie.", "Philippe, riche aristocrate tétraplégique, engage comme auxiliaire de vie Driss, un jeune de banlieue tout juste sorti de prison."],
  ['Everything_Everywhere_All_at_Once', 'Everything Everywhere All at Once', 2022, 139, ['Science-fiction', 'Comédie'], 'Tous publics', 7.8, 'films', 'Daniel Kwan, Daniel Scheinert', [['Michelle Yeoh', 'Evelyn Wang'], ['Ke Huy Quan', 'Waymond Wang'], ['Jamie Lee Curtis', 'Deirdre Beaubeirdre']], ['A24'], 'Le multivers est une réalité.', "Une gérante de laverie découvre qu'elle doit traverser le multivers pour sauver le monde, et sa famille."],
  ['La_La_Land', 'La La Land', 2016, 128, ['Comédie', 'Romance', 'Musique'], 'Tous publics', 8.0, 'films', 'Damien Chazelle', [['Ryan Gosling', 'Sebastian'], ['Emma Stone', 'Mia']], ['Summit Entertainment', 'Lionsgate'], 'Pour les rêveurs.', "À Los Angeles, une actrice et un pianiste de jazz tombent amoureux en poursuivant leurs rêves."],
  ['Whiplash_(2014_film)', 'Whiplash', 2014, 106, ['Drame', 'Musique'], 'Tous publics', 8.5, 'films', 'Damien Chazelle', [['Miles Teller', 'Andrew Neiman'], ['J. K. Simmons', 'Terence Fletcher']], ['Blumhouse', 'Sony Pictures Classics'], 'La passion mène au génie.', "Un jeune batteur de jazz intègre la classe d'un professeur aussi brillant que tyrannique."],
  ['Spirited_Away', 'Le Voyage de Chihiro', 2001, 125, ['Animation', 'Fantastique'], 'Tous publics', 8.6, 'anim', 'Hayao Miyazaki', [['Rumi Hiiragi', 'Chihiro (voix)'], ['Miyu Irino', 'Haku (voix)']], ['Studio Ghibli'], "Le tunnel menait Chihiro vers un monde mystérieux.", "Égarée dans le monde des esprits, une fillette travaille dans des bains magiques pour sauver ses parents changés en cochons."],
  ['Your_Name', 'Your Name.', 2016, 106, ['Animation', 'Romance'], 'Tous publics', 8.4, 'anim', 'Makoto Shinkai', [['Ryunosuke Kamiki', 'Taki (voix)'], ['Mone Kamishiraishi', 'Mitsuha (voix)']], ['CoMix Wave Films'], '', "Deux adolescents qui ne se connaissent pas échangent leurs corps dans leurs rêves."],
  ['Spider-Man:_Into_the_Spider-Verse', 'Spider-Man : New Generation', 2018, 117, ['Animation', 'Action'], 'Tous publics', 8.4, 'anim', 'Bob Persichetti, Peter Ramsey, Rodney Rothman', [['Shameik Moore', 'Miles Morales (voix)'], ['Hailee Steinfeld', 'Gwen Stacy (voix)'], ['Jake Johnson', 'Peter B. Parker (voix)']], ['Sony Pictures Animation'], '', "Miles Morales devient Spider-Man et croise d'autres Spider-héros venus d'univers parallèles.", 'Spider-Verse - Saga'],
  ['Spider-Man:_Across_the_Spider-Verse', 'Spider-Man : Across the Spider-Verse', 2023, 140, ['Animation', 'Action'], 'Tous publics', 8.5, 'anim', 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson', [['Shameik Moore', 'Miles Morales (voix)'], ['Hailee Steinfeld', 'Gwen Stacy (voix)'], ['Oscar Isaac', 'Miguel O\'Hara (voix)']], ['Sony Pictures Animation'], '', "Miles retrouve Gwen et se lance à travers le multivers, où il se heurte à la Spider-Société.", 'Spider-Verse - Saga'],
  ['Coco_(2017_film)', 'Coco', 2017, 105, ['Animation', 'Famille'], 'Tous publics', 8.4, 'anim', 'Lee Unkrich', [['Anthony Gonzalez', 'Miguel (voix)'], ['Gael García Bernal', 'Héctor (voix)']], ['Pixar', 'Walt Disney Pictures'], '', "Miguel, qui rêve de devenir musicien, se retrouve au pays des morts le jour de la fête des morts."],
  ['The_Boy_and_the_Heron', 'Le Garçon et le Héron', 2023, 124, ['Animation', 'Fantastique'], 'Tous publics', 7.4, 'anim', 'Hayao Miyazaki', [['Soma Santoki', 'Mahito (voix)']], ['Studio Ghibli'], '', "Après la mort de sa mère, Mahito suit un héron qui parle dans une tour abandonnée menant à un autre monde."],
  ['Flow_(2024_film)', 'Flow, le chat qui n\'avait plus peur de l\'eau', 2024, 85, ['Animation', 'Aventure'], 'Tous publics', 7.9, 'anim', 'Gints Zilbalodis', [], ['Dream Well Studio', 'Sacrebleu Productions'], '', "Un chat solitaire trouve refuge sur un bateau avec d'autres animaux quand une inondation engloutit sa vallée."],
  ['Call_Me_by_Your_Name_(film)', 'Call Me by Your Name', 2017, 132, ['Romance', 'Drame'], 'Tous publics', 7.8, 'sex', 'Luca Guadagnino', [['Timothée Chalamet', 'Elio Perlman'], ['Armie Hammer', 'Oliver']], ['Frenesy Film'], '', "Été 1983 en Italie. Elio, 17 ans, s'éprend d'Oliver, l'étudiant américain que son père accueille."],
  ['Challengers_(film)', 'Challengers', 2024, 131, ['Romance', 'Drame'], 'Tous publics', 7.0, 'sex', 'Luca Guadagnino', [['Zendaya', 'Tashi Duncan'], ['Mike Faist', 'Art Donaldson'], ['Josh O\'Connor', 'Patrick Zweig']], ['Metro-Goldwyn-Mayer'], '', "Une ancienne prodige du tennis devenue entraîneuse transforme son mari en champion. Son ex croise leur route."],
  ['Basic_Instinct', 'Basic Instinct', 1992, 127, ['Thriller'], '-16', 7.0, 'sex', 'Paul Verhoeven', [['Michael Douglas', 'Nick Curran'], ['Sharon Stone', 'Catherine Tramell']], ['Carolco Pictures'], '', "Un inspecteur de San Francisco enquête sur le meurtre d'une rock star et s'éprend de la principale suspecte, une romancière."],
];

const CHANNELS = [['TF1', 'TF1'], ['France 2', 'France_2'], ['France 3', 'France_3'], ['Canal+', 'Canal%2B'], ['France 5', 'France_5'], ['M6', 'M6_(TV_channel)'], ['Arte', 'Arte'], ['TMC', 'TMC_(TV_channel)'], ['W9', 'W9_(TV_channel)'], ['franceinfo', 'Franceinfo']];

const pool = async (list, n, fn) => { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < list.length) { const k = i++; try { out[k] = await fn(list[k]); } catch (e) { console.error('FAIL', list[k][0], e.message); } } })); return out; };

const shows = (await pool(SHOWS, 2, show)).filter(Boolean);
const people = new Map();
const films = await pool(FILMS, 3, async ([page, name, year, runtime, genres, cert, rating, lib, director, cast, studios, tagline, overview, collection]) => {
  const w = await wiki(page);
  return { id: `f${page.replace(/[^A-Za-z0-9]/g, '').slice(0, 24)}`, type: 'Movie', lib, name, year, runtime, genres, cert, rating, director, studios, tagline, overview, collection: collection || null, poster: w.img, cast: cast.map(([n, role]) => ({ name: n, role })) };
});
const names = [...new Set(films.flatMap(f => [...f.cast.map(c => c.name), ...f.director.split(', ')]))];
await pool(names.map(n => [n]), 3, async ([n]) => { const w = await wiki(n.replace(/ /g, '_')); people.set(n, w.thumb || w.img); });
films.forEach(f => { f.cast.forEach(c => { c.img = people.get(c.name) || null; c.id = `w${c.name.replace(/[^A-Za-z]/g, '')}`; }); f.directorImg = people.get(f.director.split(', ')[0]) || null; });
const channels = await pool(CHANNELS, 2, async ([name, page]) => { const w = await wiki(decodeURIComponent(page)); return { id: `c${name.replace(/[^A-Za-z0-9]/g, '')}`, name, logo: w.thumb || w.img }; });

writeFileSync(OUT, `/* Généré par build-data.mjs — sources : TVmaze (séries), Wikipédia (films, personnes, chaînes). */\nwindow.DATA = ${JSON.stringify({ shows, films, channels })};\n`);
console.log('shows', shows.length, 'films', films.length, 'channels', channels.length);
console.log('shows sans backdrop:', shows.filter(s => !s.backdrop).map(s => s.name).join(', ') || '-');
console.log('shows sans logo:', shows.filter(s => !s.logo).length, '/', shows.length);
console.log('films sans affiche:', films.filter(f => !f.poster).map(f => f.name).join(', ') || '-');
console.log('personnes sans photo:', [...people].filter(([, v]) => !v).map(([k]) => k).join(', ') || '-');
console.log('chaînes sans logo:', channels.filter(c => !c.logo).map(c => c.name).join(', ') || '-');
console.log('épisodes:', shows.reduce((n, s) => n + s.episodes.length, 0), 'sans image:', shows.reduce((n, s) => n + s.episodes.filter(e => !e.img).length, 0));
console.log('noms:', shows.map(s => `${s.name} (${s.year}, ${s.network})`).join(' | '));
