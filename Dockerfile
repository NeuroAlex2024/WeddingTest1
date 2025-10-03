FROM node:20-alpine

# Установим необходимые пакеты для сборки нативных модулей и OpenSSL
RUN apk add --no-cache python3 make g++ openssl openssl-dev

WORKDIR /usr/src/app

# Установим зависимости по lock-файлу
COPY package*.json ./
RUN npm ci --omit=dev

# Скопируем исходники
COPY . .

# Пересоберем bcrypt для Alpine Linux
RUN npm rebuild bcrypt --build-from-source

# Перегенерируем Prisma клиент для Alpine Linux
RUN npx prisma generate

# Готовим директорию для статически сгенерированных приглашений
RUN mkdir -p /usr/src/app/invites \
  && chown -R node:node /usr/src/app

USER node

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["node", "server.js"]


