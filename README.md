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
| **Blog** | Markdown-first journal. Write posts in Obsidian, flip `published: true`, and they're statically generated at build time. No CMS, no database. |

## STACK

```
Next.js 16  (App Router, Turbopack, standalone output)
React 19
TypeScript 5
Tailwind CSS 4
@react-three/fiber + drei + three
next-intl
gray-matter + marked (blog content)
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
    blog/                blog index
    blog/[slug]/         per-post static pages
  components/
    scene/               the 3D engine (camera, lights, model)
    header, hero, work, about, contact, ...
data/
  en/ es/                locale-scoped content (projects + profile JSON)
  types.ts               shared Project/Profile types
lib/
  blog-types.ts          Post + frontmatter types
  blog.ts                blog loader (gray-matter + marked, published gate)
  site.ts                site config
i18n/                    next-intl routing + request config
messages/                en.json / es.json UI strings
public/
  models/shield.glb      the 3D star of the show
  blog/                  post images (copied from the vault at build time)
```

> `blog/` content is **not** in this repo — it lives in the separate `blog`
> vault repo (`https://github.com/EmilioBlacksmith/blog.git`) and is
> cloned in at build time (see below).

## EDITING YOUR CONTENT

Everything worth editing lives in `data/`, `messages/`, and `blog/` — no component surgery needed.

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

### BLOG — WRITE IN OBSIDIAN, SHIP BY TOGGLING ONE FLAG

Blog content lives in its **own repo** —
`https://github.com/EmilioBlacksmith/blog.git` — which is the
Obsidian vault. Layout:

```
blog-repo/               ← the Obsidian vault
  en/*.md
  es/*.md
  assets/*.png|svg       ← images
```

The filename is the slug. Every post needs a YAML frontmatter block:

```yaml
---
title: "This blog runs on Obsidian"
description: "Markdown-first, CMS-free."
date: 2026-08-22
tags: [nextjs, markdown, workflow]
published: true          # false → stays off the site, no build
translationOf: my-other-slug  # optional cross-locale link
cover: cover-demo.svg         # optional featured image → /blog/<name>
---
```

The `published` flag is the whole trick — drafts never leave the forge.

- **Images** live in the vault's `assets/`. In Obsidian, set *Settings → Files
  & Links → Default location for attachments* to `assets`, then embed with
  native Obsidian syntax: `![[image.png|alt text]]`. Plain markdown
  `![alt](/blog/image.png)` works too.
- **Cover** is optional; give it a `cover:` field and it renders as a
  thumbnail on `/blog` and a hero on the post page.
- **Editing**: flip `published` to `true`, push the vault repo, rebuild the
  portfolio — the new post ships.

#### Local dev

The vault content is gitignored here, so clone it in to write/serve locally:

```bash
git clone https://github.com/EmilioBlacksmith/blog.git blog
cp -r blog/assets public/blog
npm run dev
```

#### Docker / VPS build

The `Dockerfile` clones the vault at build time, so every image gets the
latest posts — no extra CI. The vault repo requires a token to read:

```bash
docker build \
  --build-arg BLOG_REPO=https://github.com/EmilioBlacksmith/blog.git \
  --build-arg BLOG_REPO_TOKEN=<ghp_pat_with_repo_scope> \
  -t emilioherrera .
```

`BLOG_REPO` defaults to `https://github.com/EmilioBlacksmith/blog.git`.
The token is used only inside the builder stage and never lands in the
final image. If the vault repo ever becomes public, drop `BLOG_REPO_TOKEN`.

## DOCKER

The app builds to Next.js **standalone** output for a slim image. Build args
come from a `.env` file, so nothing needs to be passed by hand:

```bash
cp .env.example .env      # then paste your BLOG_REPO_TOKEN
docker compose up -d --build
```

`.env`:

```env
BLOG_REPO=https://github.com/EmilioBlacksmith/blog.git
BLOG_REPO_TOKEN=ghp_...   # fine-grained PAT, Contents: Read
```

Compose maps `BLOG_REPO` / `BLOG_REPO_TOKEN` into the build automatically
(`.env` is gitignored, `.env.example` is the committed template). Running
it without compose:

```bash
docker build --build-arg BLOG_REPO_TOKEN=$(grep BLOG_REPO_TOKEN .env | cut -d= -f2) -t emilioherrera .
docker run -d -p 3000:3000 --name emilioherrera emilioherrera
```

The blog clone step is layer-cached, so unchanged builds stay fast — run
`docker compose build --no-cache` to force a fresh vault fetch.

No runtime env vars required — the image is self-contained. The only
build-time secret is the blog repo PAT (omit `BLOG_REPO_TOKEN` if the vault
repo ever becomes publicly readable).

### RAILWAY

Railway does **not** read a local `.env` file, and a Dockerfile build does
**not** inherit service variables unless the Dockerfile declares a matching
`ARG` (it does: `ARG BLOG_REPO_TOKEN`). So the PAT must be defined as a
Railway **service variable**:

1. Open the service (repeat for `web` and `syndicate` if both are deployed).
2. **Variables → New Variable**:
   - `BLOG_REPO_TOKEN` = fine-grained PAT for `EmilioBlacksmith/blog`
   - `BLOG_REPO` *(optional)* = `https://github.com/EmilioBlacksmith/blog.git`
3. Redeploy so the builder stage reruns.

The fine-grained PAT must be configured as:

- **Resource owner:** `EmilioBlacksmith` (a user account, not an org)
- **Repository access:** Only select repositories → `EmilioBlacksmith/blog`
  (do **not** leave the default "Public repositories")
- **Repository permissions → Contents:** Read-only
- **Account permissions:** none

A `403 Write access to repository not granted` during the clone means the
token authenticates but is not authorized for that repo — almost always
"Repository access" was left on Public repositories or Contents wasn't granted.
Verify a token before redeploying (without echoing it to your shell history):

```bash
read -rs TOKEN
GIT_TERMINAL_PROMPT=0 git ls-remote \
  "https://EmilioBlacksmith:${TOKEN}@github.com/EmilioBlacksmith/blog.git" HEAD
unset TOKEN
```

The name must match the `ARG` exactly (case-sensitive). A *shared* variable
also has to be referenced by the service (`${{shared.BLOG_REPO_TOKEN}}`) to be
injected — adding it to the service directly is simplest.

If the token is missing, the build now stops with an explicit
`ERROR: could not clone ...` message instead of git's
`could not read Username` prompt.

## DEPLOY NOTES

- Site config (domain, socials, taglines) lives in one file: `lib/site.ts`. Buying the `.com` later? Change one string and redeploy.
- Terminate TLS at your reverse proxy (Caddy / nginx / traefik) — the SEO metadata is HTTPS.
- `robots.txt`, `sitemap.xml`, and the OG image are generated at build time against `lib/site.ts`.

## OPERATIONS

- **CI** — `.github/workflows/ci.yml` runs lint, typecheck, unit tests, a
  production build, and a runtime smoke test (health + home) on every push to
  `main` and every PR. It clones the blog vault with the `BLOG_REPO_TOKEN`
  secret; when the secret isn't available (e.g. Dependabot PRs) it builds
  against an empty vault instead of failing.
- **Tests** — `npm test` uses Node's built-in runner (no extra dependency).
  Pure markdown/asset helpers live in `lib/markdown.ts` so they're testable in
  isolation; `lib/blog.ts` re-exports them.
- **Performance** — `next.config.ts` serves AVIF/WebP and sets a 1-day
  `Cache-Control` (with `stale-while-revalidate`) for `/models/*` and
  `/images/*`. For best results, add matching Cloudflare cache rules for
  `/_next/static/*`, `/models/*`, and `/images/*` (leave HTML uncached — it
  varies by locale cookie).
- **SEO** — RSS is advertised via `alternates.types`; blog posts emit
  `BlogPosting` JSON-LD; projects emit `CreativeWork` + `BreadcrumbList` and
  have their own OG image (`app/[locale]/projects/[id]/opengraph-image.tsx`).
- **A11y & extras** — skip-to-content link (localized), a web app manifest
  (`app/manifest.ts`), `.well-known/security.txt`, and `poweredByHeader: false`
  so the framework header isn't exposed.
- **Health check** — `GET /api/health` returns `{ "status": "ok" }` with
  `no-store`. Point Railway's healthcheck at it (service Settings → Deploy →
  Healthcheck Path → `/api/health`) so a broken deploy is caught before traffic.
- **Rollback** — Railway → Deployments → pick the last good deployment →
  Redeploy. Images are retained per plan (Hobby 72h).
- **Error handling** — `app/global-error.tsx` (last-resort) and
  `app/[locale]/error.tsx` (retry + home) catch render errors and give generic
  ref digests instead of a blank screen.
- **Security headers** — set centrally in `next.config.ts` (nosniff,
  frame-ancestors, HSTS, referrer/permissions policies).
- **Dependency updates** — `.github/dependabot.yml` opens grouped npm and
  GitHub Actions PRs weekly.

### Runbook: site is down

1. Check the Railway deploy status and logs — look for OOM kills or the
   `ERROR: could not clone` vault message.
2. Verify `/api/health` responds against the deployment.
3. If a recent deploy broke it, roll back to the previous deployment.
4. If it's DNS/TLS, confirm the records in Cloudflare/Namecheap and that Railway
   shows the green verified check.

### Recommended next steps

- Add error tracking (e.g. Sentry) and uptime monitoring with alerts.
- Keep the fine-grained `BLOG_REPO_TOKEN` from expiring in both Railway and the
  GitHub Actions secret.

## THE VIBE

Dark rooms. Hard edges. Cool steel. Terminal prompts, blinking cursors, and small details that whisper instead of shout.

```
emilio@blacksmith:~$ whoami
Product Engineer forging full-scale software end-to-end
emilio@blacksmith:~$ npx emilioblacksmith
▮
```
