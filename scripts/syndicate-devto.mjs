import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

try {
  process.loadEnvFile(".env");
} catch {
  if (!process.env.DEVTO_API_KEY) {
    console.warn("No .env found; falling back to process env.");
  }
}

const API_BASE = "https://dev.to/api";
const SITE_URL = "https://emilioherrera.site";
const BLOG_DIR = path.join(process.cwd(), "blog");
const STATE_FILE = path.join(process.cwd(), "scripts/.devto-state.json");
const DEFAULT_LOCALE = "en";

const IMAGE_EMBED = /!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const WIKILINK = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

function resolveAsset(src) {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
  return `${SITE_URL}/blog/${src}`;
}

function convertWikiLinks(markdown) {
  const withEmbeds = markdown.replace(IMAGE_EMBED, (_, src, alt) => {
    const p = src.trim();
    const altText = (alt ?? "").trim() || p.split("/").pop() || "image";
    return `![${altText.replace(/"/g, "")}](${resolveAsset(p)})`;
  });
  return withEmbeds.replace(WIKILINK, (match, src, alt) => {
    const p = src.trim();
    if (!IMAGE_EXT.test(p)) return match;
    const text = (alt ?? "").trim() || p.split("/").pop() || p;
    return `[${text}](${resolveAsset(p)})`;
  });
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n");
}

function canonicalUrl(locale, slug) {
  return locale === DEFAULT_LOCALE
    ? `${SITE_URL}/blog/${slug}`
    : `${SITE_URL}/${locale}/blog/${slug}`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function devto(pathname, method, key, body) {
  const maxAttempts = 5;
  let delay = 2000;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(`${API_BASE}${pathname}`, {
      method,
      headers: {
        "api-key": key,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after")) || delay;
      console.warn(
        `Dev.to ${method} ${pathname} → ${res.status}, retrying in ${retryAfter}s (${attempt}/${maxAttempts})`
      );
      await sleep(retryAfter * 1000);
      delay *= 2;
      continue;
    }
    const text = await res.text();
    throw new Error(`Dev.to ${method} ${pathname} → ${res.status}: ${text}`);
  }
  throw new Error(`Dev.to ${method} ${pathname}: rate limited after ${maxAttempts} attempts`);
}

async function findExisting(key) {
  const headers = { "api-key": key };
  const endpoints = ["/articles/me?per_page=1000", "/articles/me/unpublished?per_page=1000"];
  const lists = await Promise.all(
    endpoints.map(async (endpoint) => {
      const res = await fetch(`${API_BASE}${endpoint}`, { headers });
      if (!res.ok) throw new Error(`Dev.to GET ${endpoint} → ${res.status}`);
      return res.json();
    })
  );
  const byCanonical = new Map();
  for (const article of lists.flat()) {
    if (article.canonical_url) {
      byCanonical.set(article.canonical_url, {
        id: article.id,
        url: article.url,
        body: article.body_markdown,
        title: article.title,
        description: article.description,
      });
    }
  }
  return byCanonical;
}

async function main() {
  const key = process.env.DEVTO_API_KEY;
  if (!key) {
    console.error("DEVTO_API_KEY is not set. Add it to .env (see .env.example).");
    process.exit(1);
  }

  const locales = (process.env.DEVTO_LOCALES ?? DEFAULT_LOCALE)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const publish = process.env.DEVTO_DRAFT !== "1";
  const state = loadState();
  const existing = await findExisting(key);

  for (const locale of locales) {
    const dir = path.join(BLOG_DIR, locale);
    if (!fs.existsSync(dir)) {
      console.warn(`Skipping ${locale}: no ${dir}`);
      continue;
    }

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort();

    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      if (!data.published) {
        console.log(`skip ${locale}/${file}: not published`);
        continue;
      }
      if (!data.title || !data.description || !data.date) {
        console.warn(`skip ${locale}/${file}: missing required frontmatter`);
        continue;
      }

      const slug = file.replace(/\.md$/, "");
      const stateKey = `${locale}/${slug}`;
      const canonical = canonicalUrl(locale, slug);
      const payload = {
        article: {
          title: data.title,
          published: publish,
          body_markdown: convertWikiLinks(content.trim()),
          canonical_url: canonical,
          description: data.description,
          tags: (data.tags ?? []).slice(0, 4).map((t) => t.replace(/\s+/g, "-")),
        },
      };

      const remote = existing.get(canonical);
      if (remote) {
        const same =
          remote.body === payload.article.body_markdown &&
          remote.title === payload.article.title &&
          remote.description === payload.article.description;
        if (same) {
          console.log(`up to date ${stateKey}`);
          state[stateKey] = remote;
          continue;
        }
        console.log(`updating ${stateKey} → ${API_BASE}/articles/${remote.id}`);
        await devto(`/articles/${remote.id}`, "PUT", key, payload);
        state[stateKey] = remote;
      } else {
        try {
          const created = await devto("/articles", "POST", key, payload);
          state[stateKey] = { id: created.id, url: created.url };
          existing.set(canonical, state[stateKey]);
          console.log(`created ${stateKey} → ${created.url}`);
        } catch (err) {
          const remoteNow = (await findExisting(key)).get(canonical);
          if (!remoteNow) throw err;
          console.log(
            `recovered ${stateKey} (already exists) → ${API_BASE}/articles/${remoteNow.id}`
          );
          await devto(`/articles/${remoteNow.id}`, "PUT", key, payload);
          state[stateKey] = remoteNow;
          existing.set(canonical, remoteNow);
        }
      }
    }
  }

  saveState(state);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});