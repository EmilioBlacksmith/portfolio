```
emilio@blacksmith:~$ cat portfolio
```

# EMILIO BLACKSMITH — PORTFOLIO

> **Herrera means blacksmith. I took it literally.**

A dark, minimal, terminal-flavored personal portfolio. A rotating GLB shield greets you on the left; a giant `EMILIO HERRERA` wordmark on the right. Built with Next.js, Three.js, and an unreasonable attention to detail.

```
emilio@blacksmith:~$ npm run dev
▮ Ready in 232ms
→ http://localhost:3000
```

---

## WHAT'S INSIDE

| Piece | What it does |
| --- | --- |
| **3D Hero** | A Draco-compressed `shield.glb` (1.3MB) rendered with react-three-fiber, isometric orthographic camera, custom Lightformer studio lighting, real shadows, and a `prefers-reduced-motion` guard. |
| **Wordmark** | Space Grotesk, `clamp()`-scaled. Solid `EMILIO` over an outlined `HERRERA`. |
| **Hello card** | A terminal note — `> Hello! I'm Emilio — the Blacksmith...` with @ Finsphera linked. |
| **Forged Works** | Every project is a clickable card → its own statically-generated detail page. |
| **The Smith** | Bio, experience timeline, profile, education, languages, and the arsenal of skills. |
| **i18n** | Full EN/ES via `next-intl`. Locale lives in a cookie (`NEXT_LOCALE`), so the URL stays clean: `/` works for both. |
| **SEO** | `robots.txt`, `sitemap.xml`, dynamic OG image (`emilio@blacksmith:~$` card), JSON-LD Person/WebSite, per-locale metadata, custom favicon. |
| **A11y** | Steel `:focus-visible` rings, larger hit areas, localized ARIA labels, reduced-motion everywhere. |
| **ASCII art** | Hand-fed braille pieces rotate through the section headings — anvil, hammer, forge, and a face at the contact block. |

## STACK

```
Next.js 16  (App Router, Turbopack, standalone output)
React 19
TypeScript 5
Tailwind CSS 4
@react-three/fiber + drei + three
next-intl
```

## RUN IT

```bash
npm install
npm run dev
```

Production build + lint:

```bash
npm run lint
npm run build
npm run start
```

## PROJECT MAP

```
app/
  [locale]/              i18n-scoped routes (root layout, home, project pages)
    projects/[id]/       per-project static pages
  components/
    scene/               the 3D engine (camera, lights, model)
    header, hero, work, about, contact, ...
data/
  en/ es/                locale-scoped content (projects + profile JSON)
  types.ts               shared Project/Profile types
i18n/                    next-intl routing + request config
messages/                en.json / es.json UI strings
public/models/shield.glb the 3D star of the show
```

## EDITING YOUR CONTENT

Everything worth editing lives in `data/` and `messages/` — no component surgery needed.

```bash
# Projects (titles, descriptions, stacks, images)
data/en/projects.json        data/es/projects.json

# Profile (bio, experience, skills, links)
data/en/profile.json         data/es/profile.json

# UI strings (nav, hero, sections, contact)
messages/en.json             messages/es.json

# The 3D model — drop a new .glb over:
public/models/shield.glb
```

## DOCKER

The app builds to Next.js **standalone** output for a slim image. Run it anywhere:

```bash
docker build -t emilioherrera .
docker run -d -p 3000:3000 --name emilioherrera emilioherrera
```

No env vars required — the image is self-contained.

## DEPLOY NOTES

- Site config (domain, socials, taglines) lives in one file: `lib/site.ts`. Buying the `.com` later? Change one string and redeploy.
- Terminate TLS at your reverse proxy (Caddy / nginx / traefik) — the SEO metadata is HTTPS.
- `robots.txt`, `sitemap.xml`, and the OG image are generated at build time against `lib/site.ts`.

## THE VIBE

Dark rooms. Hard edges. Cool steel. Terminal prompts, blinking cursors, and small details that whisper instead of shout.

```
emilio@blacksmith:~$ whoami
Product Engineer forging full-scale software end-to-end
emilio@blacksmith:~$ npx emilioblacksmith
▮
```
