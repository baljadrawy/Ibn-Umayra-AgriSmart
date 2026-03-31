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

# نسخ الملفات الضرورية فقط من مرحلة البناء
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
