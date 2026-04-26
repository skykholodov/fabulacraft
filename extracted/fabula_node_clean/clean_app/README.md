# Fabula NodeJS App (Clean)

## Структура
- `server.js` — HTTP сервер со статикой и REST API `/api/products` (GET/POST/PUT/DELETE).
- `public/` — фронтенд (лендинг + админка).
  - `index.html`, `admin.html`, `script.js`, `admin.js`, `style.css`
  - `data/products.json` — хранилище каталога (JSON массив).
  - `images/` — загружаемые изображения.
- `package.json` — запуск `npm start`.

## Запуск
```bash
npm start
# сервер: http://localhost:8000
```

## Примечания
- Сервер не использует сторонние зависимости и работает на чистом Node.js.
- POST/PUT поддерживают поле `imagesBase64` (DataURL) — сервер сохранит файлы в `public/images/` и добавит пути в `images`.
- Безопасность: есть защита от выхода за пределы `public` при раздаче статики.
