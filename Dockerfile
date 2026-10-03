FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  elif [ -f package-lock.json ]; then npm install --legacy-peer-deps; \
  elif [ -f yarn.lock ]; then yarn install; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The blog vault (EmilioBlacksmith/blog) is private. Railway does not expose
# service variables to a Dockerfile build unless a matching ARG is declared, so
# BLOG_REPO_TOKEN must be set as a service variable (or passed via --build-arg).
# It is used only in this build stage and never copied into the final runner.
ARG BLOG_REPO=https://github.com/EmilioBlacksmith/blog.git
ARG BLOG_REPO_TOKEN
RUN apk add --no-cache git \
 && if [ -n "$BLOG_REPO_TOKEN" ]; then \
      clone_url="https://x-access-token:${BLOG_REPO_TOKEN}@${BLOG_REPO#https://}"; \
    else \
      clone_url="$BLOG_REPO"; \
    fi \
 && { git clone --depth 1 "$clone_url" /tmp/blog \
      || { echo "ERROR: could not clone '$BLOG_REPO'."; \
           echo "If it is private, set BLOG_REPO_TOKEN as a Railway service variable,"; \
           echo "or pass --build-arg BLOG_REPO_TOKEN=<pat> to docker build."; \
           exit 1; }; } \
 && mkdir -p blog public/blog \
 && cp -r /tmp/blog/en/. blog/en/ \
 && cp -r /tmp/blog/es/. blog/es/ \
 && cp -r /tmp/blog/assets/. public/blog/

RUN npm run build

FROM deps AS syndicate
WORKDIR /app

ARG BLOG_REPO=https://github.com/EmilioBlacksmith/blog.git
ARG BLOG_REPO_TOKEN

RUN apk add --no-cache git \
 && if [ -n "$BLOG_REPO_TOKEN" ]; then \
      clone_url="https://x-access-token:${BLOG_REPO_TOKEN}@${BLOG_REPO#https://}"; \
    else \
      clone_url="$BLOG_REPO"; \
    fi \
 && { git clone --depth 1 "$clone_url" /tmp/blog \
      || { echo "ERROR: could not clone '$BLOG_REPO'."; \
           echo "If it is private, set BLOG_REPO_TOKEN as a Railway service variable."; \
           exit 1; }; } \
 && mkdir -p blog \
 && cp -r /tmp/blog/en/. blog/en/ \
 && cp -r /tmp/blog/es/. blog/es/

COPY scripts/syndicate-devto.mjs ./scripts/

CMD ["node", "scripts/syndicate-devto.mjs"]

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/blog ./blog
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

