# ⚡ Быстрый старт - Wedding API

## 🎯 Текущий статус

✅ **Сервер запущен:** http://localhost:8000  
⚠️  **База данных:** Не подключена (нужен PostgreSQL)

---

## 🚀 Вариант 1: Тестировать БЕЗ базы данных

Можно протестировать базовую функциональность API (без реальных данных):

```bash
cd WeddingV3-main
node test-auth.js
```

**Ожидай ошибки:** "База данных временно недоступна"

---

## 🐘 Вариант 2: Запустить с PostgreSQL (рекомендуется)

### Если у тебя Docker:

```bash
cd WeddingV3-main
powershell -ExecutionPolicy Bypass -File start-db.ps1
```

Этот скрипт автоматически:
1. Запустит PostgreSQL в Docker
2. Применит миграции
3. Подготовит базу к работе

### Если Docker нет:

1. Установи PostgreSQL локально
2. Создай базу:
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

## 🧪 Тестирование

### Автоматический тест:

```bash
node test-auth.js
```

### Ручное тестирование:

Смотри подробную инструкцию в **TESTING.md**

---

## 📋 API Эндпоинты

### Без авторизации:
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена

### С авторизацией (требуется Bearer token):
- `GET /api/profile` - Получить профиль
- `PUT /api/profile` - Обновить профиль
- `POST /api/auth/logout` - Выход
- `GET /api/marketplace/contractors` - Каталог подрядчиков

---

## 🛑 Управление сервером

### Остановить сервер:

```bash
Get-Process -Name node | Stop-Process -Force
```

### Запустить заново:

```bash
cd WeddingV3-main
npm start
```

Сервер откроется в новом окне PowerShell.

---

## 📝 Пример запроса (curl)

```bash
# Регистрация
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"phone\":\"+79991234567\",\"password\":\"test123\",\"role\":\"wedding\"}"
```

---

## 🔧 Если что-то не работает

1. **Сервер не запускается:**
   - Проверь, что порт 8000 свободен: `netstat -ano | findstr ":8000"`
   - Останови старые процессы: `Get-Process -Name node | Stop-Process -Force`

2. **Ошибка базы данных:**
   - Проверь, что PostgreSQL запущен: `docker ps | findstr wedding-postgres`
   - Запусти базу: `powershell -ExecutionPolicy Bypass -File start-db.ps1`

3. **Ошибка bcrypt:**
   - Переустанови: `npm install bcrypt --force`

---

## 📚 Дополнительная информация

- **AUTH_SETUP.md** - Полная документация по авторизации
- **TESTING.md** - Подробные инструкции по тестированию
- **.env** - Конфигурация приложения

---

**Удачи! 🎉**

