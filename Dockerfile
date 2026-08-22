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

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG BLOG_REPO=https://github.com/EmilioBlacksmith/blog.git
ARG BLOG_REPO_TOKEN
RUN apk add --no-cache git \
 && if [ -n "$BLOG_REPO_TOKEN" ]; then \
      git clone --depth 1 "https://x-access-token:${BLOG_REPO_TOKEN}@${BLOG_REPO#https://}" /tmp/blog; \
    else \
      git clone --depth 1 "$BLOG_REPO" /tmp/blog; \
    fi \
 && mkdir -p blog public/blog \
 && cp -r /tmp/blog/en/. blog/en/ \
 && cp -r /tmp/blog/es/. blog/es/ \
 && cp -r /tmp/blog/assets/. public/blog/
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f yarn.lock ]; then yarn build; \
  else npm run build; \
  fi

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

