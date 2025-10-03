# 🔐 Настройка и использование системы авторизации

## ✅ Исправленные проблемы

1. ✅ Добавлен эндпоинт `/api/auth/refresh` для обновления токенов
2. ✅ Создан файл `.env` с необходимыми секретами
3. ✅ Исправлена схема Prisma (SQLite вместо PostgreSQL)
4. ✅ Добавлен `cookie-parser` для работы с refresh токенами
5. ✅ Улучшена проверка refresh токенов

## 📦 Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Файл `.env` уже создан с базовыми настройками. **ВАЖНО**: Перед продакшеном измени `JWT_SECRET` на более безопасное значение!

```env
JWT_SECRET=ваш-очень-секретный-ключ-минимум-32-символа
```

### 3. Инициализация базы данных

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Запуск сервера

```bash
# Для разработки с автоперезагрузкой
npm run dev

# Для продакшена
npm start
```

Сервер запустится на `http://localhost:3000`

## 🔑 API Эндпоинты

### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "phone": "+79991234567",
  "password": "secure_password",
  "email": "user@example.com",
  "role": "wedding" // или "contractor"
}
```

**Ответ:**
```json
{
  "user": {
    "id": "uuid",
    "phone": "+79991234567",
    "email": "user@example.com",
    "role": "wedding"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "accessTokenExpiresInMs": 900000,
  "refreshTokenExpiresInMs": 2592000000
}
```

### Вход
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+79991234567",
  "password": "secure_password"
}
```

**Ответ:** Аналогичен регистрации

### Обновление токена
```http
POST /api/auth/refresh
Cookie: refreshToken=<refresh_token>
```

**Ответ:** Аналогичен логину с новым access токеном

### Выход
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Ответ:** `204 No Content`

### Получение профиля (защищено)
```http
GET /api/profile
Authorization: Bearer <access_token>
```

### Обновление профиля (защищено)
```http
PUT /api/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "coupleNames": "Иван и Мария",
  "eventDate": "2025-12-31",
  "location": "Москва"
}
```

## 🔒 Как работает авторизация

### 1. Access Token
- Время жизни: **15 минут** (по умолчанию)
- Передается в заголовке: `Authorization: Bearer <token>`
- Используется для всех защищенных эндпоинтов
- Содержит: `userId`, `role`, `phone`

### 2. Refresh Token
- Время жизни: **30 дней** (по умолчанию)
- Хранится в **httpOnly cookie** (защита от XSS)
- Используется для получения нового access токена
- Ротируется при каждом обновлении (защита от повторного использования)

### 3. Процесс работы

```
1. Регистрация/Вход
   ↓
   Получение Access Token (15 мин) + Refresh Token (30 дней в cookie)
   ↓
2. Использование API
   ↓
   Отправка Access Token в заголовке Authorization
   ↓
3. Access Token истек?
   ↓
   Автоматический запрос к /api/auth/refresh
   ↓
   Получение нового Access Token
   ↓
4. Refresh Token истек?
   ↓
   Редирект на страницу логина
```

## 🛡️ Безопасность

### Что реализовано:
- ✅ Хеширование паролей с bcrypt (12 rounds)
- ✅ JWT токены с подписью
- ✅ HttpOnly cookies для refresh токенов
- ✅ Ротация refresh токенов
- ✅ Санитизация данных пользователя
- ✅ Валидация входных данных
- ✅ Защита от SQL-инъекций (Prisma ORM)

### Рекомендации для продакшена:
1. 🔴 **ОБЯЗАТЕЛЬНО** измените `JWT_SECRET` на криптостойкое значение
2. 🔴 Используйте HTTPS в продакшене
3. 🟡 Добавьте rate limiting для эндпоинтов авторизации
4. 🟡 Включите CORS с ограничением по доменам
5. 🟡 Добавьте логирование попыток входа
6. 🟡 Рассмотрите добавление 2FA
7. 🟡 Добавьте CSRF защиту для критичных операций

## 🧪 Тестирование

### С помощью curl:

```bash
# 1. Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+79991234567","password":"test123","role":"wedding"}' \
  -c cookies.txt

# 2. Получение профиля
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer <ваш_access_token>"

# 3. Обновление токена
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt

# 4. Выход
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <ваш_access_token>" \
  -b cookies.txt
```

## ⚙️ Настройка времени жизни токенов

В файле `.env`:

```env
# Время жизни access токена (примеры)
JWT_ACCESS_TTL=15m    # 15 минут (по умолчанию)
JWT_ACCESS_TTL=1h     # 1 час
JWT_ACCESS_TTL=3600   # 3600 секунд (1 час)

# Время жизни refresh токена (примеры)
JWT_REFRESH_TTL=30d   # 30 дней (по умолчанию)
JWT_REFRESH_TTL=7d    # 7 дней
JWT_REFRESH_TTL=2592000 # 30 дней в секундах
```

## 🐛 Решение проблем

### Ошибка: "JWT_SECRET is not configured"
- Создайте файл `.env` в корне проекта
- Скопируйте содержимое из `.env.example`
- Установите `JWT_SECRET`

### Ошибка: "Database temporarily unavailable"
- Проверьте наличие `DATABASE_URL` в `.env`
- Запустите `npm run prisma:generate`
- Запустите `npm run prisma:migrate`

### Ошибка: "Cannot find module 'cookie-parser'"
- Запустите `npm install`

### Access token истекает слишком быстро
- Увеличьте `JWT_ACCESS_TTL` в `.env`
- Убедитесь, что клиент автоматически обновляет токены через `/api/auth/refresh`

## 📚 Структура проекта авторизации

```
routes/
  └── auth.js                # Эндпоинты авторизации
src/
  ├── middleware/
  │   └── auth.js            # Middleware для проверки токенов
  ├── services/
  │   └── auth.js            # Логика работы с паролями и токенами
  └── server/
      └── config.js          # Конфигурация из .env
prisma/
  └── schema.prisma          # Схема базы данных
```

## 📝 Логи

Все ошибки авторизации логируются в консоль. Для продакшена рекомендуется использовать централизованное логирование (Winston, Bunyan, и т.д.).

---

**Готово!** 🎉 Ваша система авторизации полностью настроена и готова к использованию.

