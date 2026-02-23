## Запуск проекта

```bash
npm install
npm run dev
```

## Подключение к MySQL

В проект уже встроены данные подключения по умолчанию:

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_NAME=git`
- `DB_USER=git`
- `DB_PASSWORD=iA5eY6fB8x`

Если на сервере параметры другие, их можно переопределить через `.env.local`.

Также можно (рекомендуется) задать секреты:

```env
SESSION_SECRET=change-me-very-long-random-string
PASSWORD_SALT=change-me-password-salt
CODE_SECRET=change-me-code-secret
```

## Что реализовано

- Реальная регистрация пользователей.
- Подтверждение e-mail кодом (для dev-режима код возвращается в ответе).
- Реальный вход по e-mail/паролю.
- Сессия в `httpOnly` cookie.
- Защита `/admin` с редиректом на `/login`.
- Выход через `/api/logout`.
- Автосоздание таблиц `users` и `email_verification_codes` при первом обращении.
