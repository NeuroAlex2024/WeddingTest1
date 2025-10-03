# 🧪 Инструкция по тестированию авторизации

## ✅ Сервер запущен!

Сервер работает на: **http://localhost:8000**

База данных: будет подключаться автоматически при доступности PostgreSQL

---

## 🚀 Быстрый старт

### Вариант 1: Автоматический тест

Запусти в терминале:
```bash
cd WeddingV3-main
node test-auth.js
```

Этот скрипт автоматически проверит:
- ✅ Регистрацию
- ✅ Получение профиля
- ✅ Обновление токена
- ✅ Защиту от неавторизованного доступа
- ✅ Выход из системы
- ✅ Повторный вход

---

### Вариант 2: Ручное тестирование через curl

#### 1️⃣ Регистрация нового пользователя

```bash
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"+79991234567\",\"password\":\"mypass123\",\"email\":\"test@example.com\",\"role\":\"wedding\"}" ^
  -c cookies.txt
```

**Ожидаемый ответ:**
```json
{
  "user": {
    "id": "uuid...",
    "phone": "+79991234567",
    "email": "test@example.com",
    "role": "wedding"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "accessTokenExpiresInMs": 900000,
  "refreshTokenExpiresInMs": 2592000000
}
```

**Сохрани `accessToken` для следующих запросов!**

---

#### 2️⃣ Получение профиля (с токеном)

```bash
curl http://localhost:8000/api/profile ^
  -H "Authorization: Bearer <ТВОЙ_ACCESS_TOKEN>"
```

**Замени** `<ТВОЙ_ACCESS_TOKEN>` на токен из предыдущего ответа!

**Ожидаемый ответ:**
```json
{
  "user": { ... },
  "profile": {
    "timeline": [...],
    "checklist": [...],
    "budgetEntries": [...]
  },
  "weddingProfile": { ... },
  "contractorProfile": null
}
```

---

#### 3️⃣ Обновление профиля

```bash
curl -X PUT http://localhost:8000/api/profile ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <ТВОЙ_ACCESS_TOKEN>" ^
  -d "{\"coupleNames\":\"Иван и Мария\",\"eventDate\":\"2025-12-31\",\"location\":\"Москва\"}"
```

---

#### 4️⃣ Попытка доступа БЕЗ токена (должна вернуть ошибку)

```bash
curl http://localhost:8000/api/profile
```

**Ожидаемый ответ:**
```json
{
  "error": "Требуется авторизация."
}
```

---

#### 5️⃣ Обновление access токена через refresh

```bash
curl -X POST http://localhost:8000/api/auth/refresh ^
  -b cookies.txt ^
  -c cookies.txt
```

**Ожидаемый ответ:** Новый access token

---

#### 6️⃣ Выход из системы

```bash
curl -X POST http://localhost:8000/api/auth/logout ^
  -H "Authorization: Bearer <ТВОЙ_ACCESS_TOKEN>" ^
  -b cookies.txt
```

**Ожидаемый ответ:** Пустой ответ с кодом 204

---

#### 7️⃣ Попытка обновить токен после выхода (должна вернуть ошибку)

```bash
curl -X POST http://localhost:8000/api/auth/refresh ^
  -b cookies.txt
```

**Ожидаемый ответ:**
```json
{
  "error": "Недействительный refresh token."
}
```

---

#### 8️⃣ Повторный вход с теми же данными

```bash
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"+79991234567\",\"password\":\"mypass123\"}" ^
  -c cookies.txt
```

---

## 🌐 Вариант 3: Тестирование через Postman

### Настройка окружения

1. Создай новое окружение в Postman
2. Добавь переменную:
   - `BASE_URL` = `http://localhost:8000`
   - `ACCESS_TOKEN` = (будет заполнена автоматически)

### Регистрация

```
POST {{BASE_URL}}/api/auth/register
Content-Type: application/json

{
  "phone": "+79991234567",
  "password": "mypass123",
  "email": "test@example.com",
  "role": "wedding"
}
```

**После запроса:** Скопируй `accessToken` из ответа в переменную окружения `ACCESS_TOKEN`

### Получение профиля

```
GET {{BASE_URL}}/api/profile
Authorization: Bearer {{ACCESS_TOKEN}}
```

### Обновление профиля

```
PUT {{BASE_URL}}/api/profile
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "coupleNames": "Иван и Мария",
  "eventDate": "2025-12-31",
  "location": "Москва"
}
```

### Обновление токена

```
POST {{BASE_URL}}/api/auth/refresh
```

**Важно:** Включи отправку cookies в настройках Postman!

### Выход

```
POST {{BASE_URL}}/api/auth/logout
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 📊 Что проверять

### ✅ Успешные сценарии:

- [x] Регистрация с валидными данными
- [x] Вход с правильными credentials
- [x] Получение профиля с валидным токеном
- [x] Обновление профиля
- [x] Обновление токена через refresh
- [x] Выход из системы

### ❌ Негативные сценарии:

- [x] Доступ к профилю без токена → 401
- [x] Доступ с невалидным токеном → 401
- [x] Регистрация с существующим телефоном → 409
- [x] Вход с неправильным паролем → 401
- [x] Обновление токена после logout → 401

---

## 🔍 Логи сервера

Сервер запущен в отдельном окне PowerShell. Там ты можешь видеть:
- Входящие запросы (благодаря morgan)
- Ошибки авторизации
- Проблемы с базой данных

---

## 🛑 Остановка сервера

Чтобы остановить сервер:

```bash
# В PowerShell
Get-Process -Name node | Stop-Process -Force
```

Или просто закрой окно PowerShell, в котором запущен сервер.

---

## 📝 База данных

**Примечание:** Сервер сейчас работает БЕЗ подключения к базе данных PostgreSQL.

Эндпоинты авторизации будут возвращать ошибки типа:
```json
{
  "error": "База данных временно недоступна."
}
```

### Как подключить PostgreSQL:

#### Вариант 1: Docker (рекомендуется)

```bash
docker run --name wedding-postgres ^
  -e POSTGRES_PASSWORD=wedding ^
  -e POSTGRES_USER=wedding ^
  -e POSTGRES_DB=wedding ^
  -p 5432:5432 ^
  -d postgres:15
```

Затем запусти миграции:
```bash
cd WeddingV3-main
npm run prisma:migrate
```

#### Вариант 2: Локальный PostgreSQL

1. Установи PostgreSQL с официального сайта
2. Создай базу данных:
   ```sql
   CREATE DATABASE wedding;
   CREATE USER wedding WITH PASSWORD 'wedding';
   GRANT ALL PRIVILEGES ON DATABASE wedding TO wedding;
   ```
3. Запусти миграции:
   ```bash
   npm run prisma:migrate
   ```

---

## 🎯 Итоговая проверка

После подключения БД выполни:

```bash
node test-auth.js
```

Ожидаемый результат:
```
🧪 Тестирование системы авторизации

1️⃣  Регистрация нового пользователя...
   ✅ Регистрация успешна

2️⃣  Получение профиля (с токеном)...
   ✅ Профиль получен

3️⃣  Обновление токена через refresh...
   ✅ Токен обновлен

4️⃣  Попытка доступа без токена...
   ✅ Доступ правильно заблокирован

5️⃣  Выход из системы...
   ✅ Выход выполнен успешно

6️⃣  Попытка обновить токен после выхода...
   ✅ Токен правильно инвалидирован

7️⃣  Повторный вход с теми же данными...
   ✅ Вход выполнен успешно

==================================================
🎉 Все тесты пройдены успешно!
==================================================
```

---

**Удачи в тестировании! 🚀**

