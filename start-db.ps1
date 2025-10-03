# Скрипт для быстрого запуска PostgreSQL через Docker

Write-Host "🐘 Запуск PostgreSQL для проекта Wedding..." -ForegroundColor Cyan

# Проверка Docker
$dockerExists = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerExists) {
    Write-Host "❌ Docker не установлен!" -ForegroundColor Red
    Write-Host "Установи Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Остановка старого контейнера если есть
Write-Host "Остановка старого контейнера..." -ForegroundColor Yellow
docker stop wedding-postgres 2>$null
docker rm wedding-postgres 2>$null

# Запуск нового контейнера
Write-Host "Запуск PostgreSQL контейнера..." -ForegroundColor Green
docker run --name wedding-postgres `
  -e POSTGRES_PASSWORD=wedding `
  -e POSTGRES_USER=wedding `
  -e POSTGRES_DB=wedding `
  -p 5432:5432 `
  -d postgres:15

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL успешно запущен!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Параметры подключения:" -ForegroundColor Cyan
    Write-Host "  Host: localhost" -ForegroundColor White
    Write-Host "  Port: 5432" -ForegroundColor White
    Write-Host "  Database: wedding" -ForegroundColor White
    Write-Host "  User: wedding" -ForegroundColor White
    Write-Host "  Password: wedding" -ForegroundColor White
    Write-Host ""
    Write-Host "⏳ Ожидание запуска базы данных (5 сек)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host "🔄 Запуск миграций..." -ForegroundColor Green
    npm run prisma:migrate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Все готово! База данных настроена!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Теперь можешь тестировать:" -ForegroundColor Cyan
        Write-Host "  node test-auth.js" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "⚠️  Миграции не применились. Попробуй запустить вручную:" -ForegroundColor Yellow
        Write-Host "  npm run prisma:migrate" -ForegroundColor White
    }
} else {
    Write-Host "❌ Не удалось запустить PostgreSQL" -ForegroundColor Red
    Write-Host "Проверь, что Docker Desktop запущен" -ForegroundColor Yellow
}

