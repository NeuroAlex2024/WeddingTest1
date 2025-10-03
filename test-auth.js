/**
 * Простой скрипт для тестирования авторизации
 * Запуск: node test-auth.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:8000';
let cookies = '';
let accessToken = '';

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (cookies) {
      options.headers['Cookie'] = cookies;
    }

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.headers['set-cookie']) {
          cookies = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAuth() {
  console.log('🧪 Тестирование системы авторизации\n');

  try {
    // 1. Регистрация
    console.log('1️⃣  Регистрация нового пользователя...');
    const phone = `+7999${Date.now().toString().slice(-7)}`;
    const registerRes = await request('POST', '/api/auth/register', {
      phone,
      password: 'test123456',
      email: `test${Date.now()}@example.com`,
      role: 'wedding'
    });

    if (registerRes.status === 201) {
      console.log('   ✅ Регистрация успешна');
      console.log('   📱 Телефон:', phone);
      console.log('   🔑 Access token:', registerRes.body.accessToken.substring(0, 20) + '...');
      accessToken = registerRes.body.accessToken;
    } else {
      console.log('   ❌ Ошибка регистрации:', registerRes.body);
      return;
    }

    console.log('');

    // 2. Получение профиля
    console.log('2️⃣  Получение профиля (с токеном)...');
    const profileRes = await request('GET', '/api/profile', null, {
      'Authorization': `Bearer ${accessToken}`
    });

    if (profileRes.status === 200) {
      console.log('   ✅ Профиль получен');
      console.log('   👤 ID пользователя:', profileRes.body.user.id);
      console.log('   📧 Email:', profileRes.body.user.email);
    } else {
      console.log('   ❌ Ошибка получения профиля:', profileRes.body);
    }

    console.log('');

    // 3. Обновление токена
    console.log('3️⃣  Обновление токена через refresh...');
    const refreshRes = await request('POST', '/api/auth/refresh');

    if (refreshRes.status === 200) {
      console.log('   ✅ Токен обновлен');
      console.log('   🔑 Новый access token:', refreshRes.body.accessToken.substring(0, 20) + '...');
      accessToken = refreshRes.body.accessToken;
    } else {
      console.log('   ❌ Ошибка обновления токена:', refreshRes.body);
    }

    console.log('');

    // 4. Попытка доступа без токена
    console.log('4️⃣  Попытка доступа без токена...');
    const noAuthRes = await request('GET', '/api/profile');

    if (noAuthRes.status === 401) {
      console.log('   ✅ Доступ правильно заблокирован');
      console.log('   🚫 Ошибка:', noAuthRes.body.error);
    } else {
      console.log('   ❌ Ошибка: доступ должен быть заблокирован!');
    }

    console.log('');

    // 5. Выход
    console.log('5️⃣  Выход из системы...');
    const logoutRes = await request('POST', '/api/auth/logout', null, {
      'Authorization': `Bearer ${accessToken}`
    });

    if (logoutRes.status === 204) {
      console.log('   ✅ Выход выполнен успешно');
    } else {
      console.log('   ❌ Ошибка выхода');
    }

    console.log('');

    // 6. Попытка обновить токен после выхода
    console.log('6️⃣  Попытка обновить токен после выхода...');
    const refreshAfterLogoutRes = await request('POST', '/api/auth/refresh');

    if (refreshAfterLogoutRes.status === 401) {
      console.log('   ✅ Токен правильно инвалидирован');
      console.log('   🚫 Ошибка:', refreshAfterLogoutRes.body.error);
    } else {
      console.log('   ❌ Ошибка: токен должен быть инвалидирован!');
    }

    console.log('');

    // 7. Повторный вход
    console.log('7️⃣  Повторный вход с теми же данными...');
    const loginRes = await request('POST', '/api/auth/login', {
      phone,
      password: 'test123456'
    });

    if (loginRes.status === 200) {
      console.log('   ✅ Вход выполнен успешно');
      console.log('   🔑 Access token:', loginRes.body.accessToken.substring(0, 20) + '...');
    } else {
      console.log('   ❌ Ошибка входа:', loginRes.body);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Все тесты пройдены успешно!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Ошибка выполнения тестов:', error.message);
    console.log('\n💡 Убедитесь, что сервер запущен на', BASE_URL);
  }
}

// Запуск тестов
testAuth();

