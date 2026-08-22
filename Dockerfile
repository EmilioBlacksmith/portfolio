# ---- dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
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

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
