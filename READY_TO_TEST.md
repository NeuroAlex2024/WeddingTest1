# ✅ СЕРВЕР ГОТОВ К ТЕСТИРОВАНИЮ!

## 🎯 Текущий статус

```
✅ Сервер: http://localhost:8000 - Работает
✅ PostgreSQL: Docker контейнер "wedding-postgres" - Работает
✅ База данных: Подключена и мигрирована
✅ Авторизация: Все эндпоинты работают корректно
✅ Автоматические тесты: Все пройдены ✓
```

## 🧪 Примеры для ручного тестирования

### 1. Регистрация нового пользователя

**Запрос:**
```bash
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"+79991234567\",\"password\":\"mypass123\",\"email\":\"test@example.com\",\"role\":\"wedding\"}" ^
  -c cookies.txt -v
```

**Ожидаемый результат (201 Created):**
```json
{
  "user": {
    "id": "uuid...",
    "phone": "+79991234567",
    "email": "test@example.com",
    "role": "wedding",
    "phoneConfirmed": true,
    "createdAt": "2025-10-03T...",
    "updatedAt": "2025-10-03T..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessTokenExpiresInMs": 900000,
  "refreshTokenExpiresInMs": 2592000000
}
```

**Что проверить:**
- ✅ Код ответа: 201
- ✅ Возвращен accessToken
- ✅ В cookies установлен refreshToken
- ✅ Создан профиль пользователя

---

### 2. Вход в систему

**Запрос:**
```bash
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"+79991234567\",\"password\":\"mypass123\"}" ^
  -c cookies.txt -v
```

**Ожидаемый результат (200 OK):**
```json
{
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "accessTokenExpiresInMs": 900000,
  "refreshTokenExpiresInMs": 2592000000
}
```

---

### 3. Получение профиля (требуется токен)

**Замени `<ACCESS_TOKEN>` на токен из предыдущего ответа!**

```bash
curl http://localhost:8000/api/profile ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -v
```

**Ожидаемый результат (200 OK):**
```json
{
  "user": {
    "id": "uuid...",
    "phone": "+79991234567",
    "email": "test@example.com",
    "role": "wedding",
    "phoneConfirmed": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "profile": {
    "id": "uuid...",
    "userId": "uuid...",
    "coupleNames": "",
    "eventDate": null,
    "location": null,
    "timeline": [...],
    "checklist": [...],
    "checklistFolders": [...],
    "budgetEntries": [...],
    "createdAt": "...",
    "updatedAt": "..."
  },
  "contractorProfile": null,
  "weddingProfile": { ... },
  "contractorCard": null
}
```

---

### 4. Обновление профиля

```bash
curl -X PUT http://localhost:8000/api/profile ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -d "{\"coupleNames\":\"Иван и Мария\",\"eventDate\":\"2025-12-31T00:00:00.000Z\",\"location\":\"Москва\"}" ^
  -v
```

**Ожидаемый результат (200 OK):**
Профиль с обновленными данными.

---

### 5. Попытка доступа БЕЗ токена (должна быть ошибка)

```bash
curl http://localhost:8000/api/profile -v
```

**Ожидаемый результат (401 Unauthorized):**
```json
{
  "error": "Требуется авторизация."
}
```

---

### 6. Обновление access токена через refresh

```bash
curl -X POST http://localhost:8000/api/auth/refresh ^
  -b cookies.txt ^
  -c cookies.txt ^
  -v
```

**Ожидаемый результат (200 OK):**
```json
{
  "user": { ... },
  "accessToken": "новый_токен...",
  "accessTokenExpiresInMs": 900000,
  "refreshTokenExpiresInMs": 2592000000
}
```

**Что проверить:**
- ✅ Возвращен новый accessToken
- ✅ Старый refreshToken заменен на новый в cookies

---

### 7. Выход из системы

```bash
curl -X POST http://localhost:8000/api/auth/logout ^
  -H "Authorization: Bearer <ACCESS_TOKEN>" ^
  -b cookies.txt ^
  -v
```

**Ожидаемый результат (204 No Content):**
Пустой ответ, refreshToken удален из cookies.

---

### 8. Попытка обновить токен после выхода (должна быть ошибка)

```bash
curl -X POST http://localhost:8000/api/auth/refresh ^
  -b cookies.txt ^
  -v
```

**Ожидаемый результат (401 Unauthorized):**
```json
{
  "error": "Недействительный refresh token."
}
```

---

## 🔍 Негативные сценарии для тестирования

### Регистрация с существующим телефоном (409)

```bash
# Сначала зарегистрируйся
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"+79997777777\",\"password\":\"test123\",\"role\":\"wedding\"}"

# Затем попробуй снова с тем же телефоном
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"+79997777777\",\"password\":\"test456\",\"role\":\"wedding\"}"
```

**Ожидается:** `{"error": "Пользователь с таким телефоном уже зарегистрирован."}`

---

### Вход с неправильным паролем (401)

```bash
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"+79997777777\",\"password\":\"wrong_password\"}"
```

**Ожидается:** `{"error": "Неверный телефон или пароль."}`

---

### Доступ с невалидным токеном (401)

```bash
curl http://localhost:8000/api/profile ^
  -H "Authorization: Bearer invalid_token_here"
```

**Ожидается:** `{"error": "Недействительный или истёкший токен."}`

---

## 🌐 Тестирование через Postman

1. **Создай коллекцию** "Wedding API"
2. **Добавь переменные окружения:**
   - `BASE_URL` = `http://localhost:8000`
   - `ACCESS_TOKEN` = (будет заполняться автоматически)

3. **Создай запросы:**

#### POST Register
```
URL: {{BASE_URL}}/api/auth/register
Method: POST
Headers: Content-Type: application/json
Body (raw JSON):
{
  "phone": "+79991234567",
  "password": "mypass123",
  "email": "test@example.com",
  "role": "wedding"
}

Tests (автоматическое сохранение токена):
pm.environment.set("ACCESS_TOKEN", pm.response.json().accessToken);
```

#### GET Profile
```
URL: {{BASE_URL}}/api/profile
Method: GET
Headers: Authorization: Bearer {{ACCESS_TOKEN}}
```

#### PUT Profile
```
URL: {{BASE_URL}}/api/profile
Method: PUT
Headers: 
  - Authorization: Bearer {{ACCESS_TOKEN}}
  - Content-Type: application/json
Body (raw JSON):
{
  "coupleNames": "Иван и Мария",
  "eventDate": "2025-12-31T00:00:00.000Z",
  "location": "Москва"
}
```

---

## 📊 Проверка базы данных

### Подключиться к PostgreSQL:

```bash
docker exec -it wedding-postgres psql -U wedding -d wedding
```

### Полезные SQL команды:

```sql
-- Посмотреть всех пользователей
SELECT id, phone, email, role, "phoneConfirmed", "createdAt" FROM "User";

-- Посмотреть профили свадеб
SELECT * FROM "WeddingProfile";

-- Посмотреть профили подрядчиков
SELECT * FROM "ContractorProfile";

-- Выход
\q
```

---

## 🛑 Управление сервисами

### Остановить сервер:
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Остановить PostgreSQL:
```bash
docker stop wedding-postgres
```

### Запустить PostgreSQL снова:
```bash
docker start wedding-postgres
```

### Запустить сервер снова:
```bash
cd WeddingV3-main
npm start
```

---

## 🎯 Что было исправлено

1. ✅ **Docker Desktop** - Запущен автоматически
2. ✅ **PostgreSQL** - Запущен в Docker контейнере `wedding-postgres`
3. ✅ **База данных** - Подключена и мигрирована
4. ✅ **Prisma Client** - Сгенерирован и работает
5. ✅ **Эндпоинт /api/auth/refresh** - Добавлен и работает
6. ✅ **cookie-parser** - Установлен и подключен
7. ✅ **Схема Prisma** - Исправлена для PostgreSQL (JsonB)
8. ✅ **Сервер** - Запущен на http://localhost:8000
9. ✅ **Все тесты** - Проходят успешно

---

## 📚 Дополнительная документация

- **TESTING.md** - Подробные инструкции по тестированию
- **QUICK_START.md** - Быстрый старт
- **AUTH_SETUP.md** - Полная документация по авторизации

---

**🎉 Готово! Можешь начинать тестировать!**

Сервер работает, база данных подключена, все эндпоинты функционируют корректно.

