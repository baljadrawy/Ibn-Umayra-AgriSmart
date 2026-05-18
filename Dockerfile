# ── المرحلة 1: البناء ──────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# نسخ ملفات المتطلبات أولاً (استفادة من cache)
COPY package.json package-lock.json ./
RUN npm ci

# نسخ باقي الملفات وبناء المشروع
COPY . .
RUN mkdir -p public
RUN npm run build

# ── المرحلة 2: التشغيل (صغير الحجم) ──────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# نسخ الملفات الضرورية فقط من مرحلة البناء (ملكية للمستخدم node)
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# تشغيل بمستخدم غير-root للأمان
USER node

EXPOSE 3000

CMD ["node", "server.js"]
