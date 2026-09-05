# SmartGov-Wase — Phase 9 Delta (Discover Wase)

Per spec §38 Phase 9: Tourism, History, Notable People, Galleries, and
Maps. This is the platform's most image-heavy section (spec §74.6-74.11)
— it uses real gallery support built on the `mediables` polymorphic
table the schema was designed for since Phase 1, rather than another
single-image field.

One new dependency: `leaflet` (+ `@types/leaflet`) for the public map,
per spec §48/§74.11's explicit recommendation of OpenStreetMap + Leaflet.

## The gallery architecture, explained

`HasGalleryMedia` is a new trait providing a `morphToMany` relation
against `mediables` — this table's `mediable_type`/`mediable_id`
columns already followed Laravel's standard polymorphic naming
convention (for the morph name `mediable`), so this is a native
Eloquent relation, not a custom pivot workaround. Applied to
`TouristAttraction`, giving it `attachGalleryMedia()` / `detachGalleryMedia()`.
`NotablePerson` didn't need it — it already had a single `photo_media_id`
column, matching how a portrait (one image) differs from a tourism
gallery (many images).

Standalone `Gallery` (spec §53) uses its own pre-existing `gallery_media`
pivot rather than `mediables` — a gallery *is* a curated image
collection in its own right, distinct from "images attached to some
other piece of content."

## Backend — 6 admin controllers, 4 public controllers, 1 map aggregator

| Content type | Admin permission | Notes |
|---|---|---|
| Tourism categories + attractions | `content.manage` | Attractions get dedicated gallery attach/detach endpoints. |
| Historical records | `content.manage` | draft → published pipeline, same pattern as News/Events. `sources` isn't required by validation (a draft-while-researching entry is still allowed) but is present on every response so the public timeline can render its presence or honest absence. |
| Notable people categories + people | `content.manage` | draft → **review** → published (spec §40's extra editorial step — no fabricated biographies). `biography` is required; `sources` isn't. |
| Galleries | `content.manage` | Own attach/detach endpoints via `gallery_media`. |

All gated by the existing `content.manage` permission — spec §28 states
`content_admin` manages exactly "News, History, Tourism, People, Events,
Gallery," so no new permission was needed.

**Public endpoints**, all filtering to published/active only:
`GET /public/tourism` (+`/categories`, `/{slug}`), `/public/history`
(+`/{slug}`), `/public/notable-people` (+`/categories`, `/{slug}`),
`/public/galleries` (+`/{slug}`), and `GET /public/map` — which
aggregates geolocated markers from tourist attractions, active
facilities, in-progress/completed projects, and communities into one
array, so the frontend makes a single request rather than four.

## Frontend — 6 new admin pages, 10 new public pages

**Admin:** Tourism (list + a genuinely substantial detail page — the
gallery grid with inline upload/remove is the centerpiece, per spec
§74.6), History, Notable People (with the portrait upload reused from
Phase 8's `ImageUploadField`), Galleries (list + detail with the same
gallery-grid pattern).

**Public:** `/discover` (a hub page — the nav and footer already linked
here since Phase 1 and it 404'd the whole time), `/discover/tourism`
(+ detail with photo gallery and a "View on map" link), `/discover/history`
(rendered as an actual timeline per spec §74.7, not a wall of text —
vertical line, period labels, chronological), `/discover/notable-people`
(+ detail), `/discover/gallery` (+ detail with a lightbox), and `/map`.

## The map — one deliberate implementation choice

Leaflet touches `window`/`document` at import time, which breaks
Next.js server-side rendering if imported normally. The map component
uses a **dynamic `import('leaflet')` inside a `useEffect`**, keeping it
out of the SSR bundle entirely. The CSS, by contrast, is a **static**
`import "leaflet/dist/leaflet.css"` at the top of the file — CSS has no
runtime `window` dependency, and Next.js App Router supports importing
CSS in any client component, not just the root layout. (An earlier
draft of this file tried to dynamically `import()` the CSS file
alongside the JS, which isn't a reliable pattern — caught and fixed
before packaging.)

The map reads `?lat=` and `?lng=` query params to center and zoom on a
specific point — the tourism detail page's "View on map" link uses
this to jump straight to an attraction's location.

## MODIFIED FILES

| File | What changed |
|---|---|
| `backend/app/Models/Discover/TouristAttraction.php` | Added `HasGalleryMedia`. |
| `backend/routes/api.php` | All new admin/public routes. |
| `frontend/package.json` | Added `leaflet` + `@types/leaflet`. |
| `frontend/app/(admin)/layout.tsx` | Added Tourism, History, Notable People, Galleries nav links (22 items now — the scrollable sidebar from the Phase 8 follow-up handles this without the earlier overflow bug recurring). |

## Known limitations carried forward

- **No drag-to-reorder for gallery images** — attaching a new photo
  appends it; reordering existing ones means detach-and-reattach.
  Matches the "no reordering UI" limitation already flagged for other
  content types in Phase 8.
- **The map has no clustering** — with more than a couple dozen markers
  in one area it'll get visually crowded. Fine for the current expected
  volume; worth revisiting if the platform grows significantly.
- **Wards aren't shown on the map** — they're stored as boundary
  `map_coordinates` JSON (polygon-shaped data), not a simple lat/lng
  point like everything else `MapController` aggregates. Rendering
  ward boundaries as map overlays (rather than point markers) is a
  distinct, larger piece of work than this pass covers.
- **No caption/alt-text editing UI** for gallery images after upload —
  `Media.alt_text`/`credit` exist and are returned by the API, but
  there's no admin form field to set them post-upload (the initial
  `ImageUploadField` doesn't collect them either — see Phase 8's
  follow-up notes on the same gap).

## Setup after applying

```bash
cd frontend
npm install   # pulls in leaflet + @types/leaflet

cd ../backend
composer dump-autoload
```

No new migrations — every table this phase uses (`tourism_categories`,
`tourist_attractions`, `historical_records`, `notable_people_categories`,
`notable_people`, `galleries`, `gallery_media`, `mediables`) existed
since Phase 1.