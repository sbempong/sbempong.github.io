# sbempong.github.io

Personal site, served by GitHub Pages from the `main` branch. Plain HTML, CSS and JavaScript, no build step. Open `index.html` in a browser to preview locally.

## Layout

| Path | Purpose |
|---|---|
| `index.html` | The whole site: Home, Projects, Resume, Now and Photography tabs |
| `style.css` | All styles, light and dark themes |
| `tabs.js` | Tab navigation (ARIA tablist; plain anchors without JavaScript) |
| `now.js` | Now tab and the "Last played" line on Home: paints `data/*.json` first, then refreshes live in the browser |
| `photos.js` | Photography lightbox |
| `theme.js` | Dark theme toggle (saved in `localStorage`) |
| `config.js` | GitHub username and the public, read-only keys used by `now.js` |
| `data/` | Feed snapshots committed by the workflow (`recent.json`, `anilist.json`, `trakt.json`, `books.json`) |
| `photos/` | Gallery images, several sizes per photo |
| `resume/` | Resume PDF and its preview images |
| `teams/` | Team crests (see `CREDITS.md`) |

## Now feeds

`.github/workflows/now-feeds.yml` runs hourly (and on demand from the Actions tab) and commits a data file only when it changed. Each feed is an independent job, so one failing never touches the others.

| Feed | Source | Needs | Writes |
|---|---|---|---|
| Recently played | Last.fm | secret `LASTFM_API_KEY`, variable `LASTFM_USER` | `data/recent.json` |
| Anime, manga and manhwa | AniList (public GraphQL) | nothing | `data/anilist.json` |
| Movies and TV | Trakt | secret `TRAKT_CLIENT_ID` | `data/trakt.json` |
| Books | Hardcover | secret `HARDCOVER_TOKEN` | `data/books.json` |

Secrets and variables live in the repository settings under Actions. A missing secret makes that job log a skip message and exit successfully. Usernames for AniList, Trakt and Hardcover are set in the workflow file.

Last.fm, AniList and Trakt are also fetched live by `now.js` using the public keys in `config.js`, with the committed JSON as the fallback. Hardcover is JSON-only because its token is private.

## Link check

`.github/workflows/links.yml` checks every link in `index.html`, `README.md` and `CREDITS.md` on the first of each month and opens an issue if any are broken.

## Editing

- **Cache-busting.** `index.html` loads `style.css`, the scripts and the resume PDF with a `?v=YYYYMMDDx` query. Bump it whenever one of those files changes, in every place it appears:
  ```sh
  sed -i '' 's/v=20261023b/v=20261101a/g' index.html   # old value -> new value
  ```
- **Projects.** Edit the list in the Projects section of `index.html`. Repo links use `data-repo="name"` so `tabs.js` can rewrite them from `config.js`.
- **Photos.** Each photo is a `<li>` in the gallery with `data-full="photos/photo-N"` and a `data-lb` list of the lightbox widths that exist. Files follow `photo-N-g400.webp`, `photo-N-g800.webp` (grid) and `photo-N-l1200.webp`, `photo-N-l1600.webp`, `photo-N-l2048.webp` (lightbox). Strip metadata before committing. Newest first.
- **Resume.** Replace `resume/Sylvester_Bempong_Resume.pdf` and regenerate `preview-1x.webp` (612x792) and `preview-2x.webp`, then bump the cache-bust query and update the download size in the `aria-label`.
- **GitHub username.** `./update-user.sh newname` rewrites `config.js` and the static links in `index.html`.

## Credits

Icon and crest sources are listed in `CREDITS.md`.
