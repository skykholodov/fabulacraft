// Простая HTTP‑сервер для лендинга Fabula с API для управления каталогом.
// Для запуска выполните: node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Публичная директория, содержащая файлы сайта
const publicDir = path.join(__dirname, 'public');
const productsFile = path.join(publicDir, 'data', 'products.json');
const imagesDir = path.join(publicDir, 'images');

/**
 * Определить MIME‑тип в зависимости от расширения файла.
 * @param {string} ext
 */
function getContentType(ext) {
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.webp': return 'image/webp';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

/**
 * Считать JSON файл каталога. Возвращает массив товаров.
 */
function readProducts() {
  try {
    const raw = fs.readFileSync(productsFile, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Ошибка чтения каталога:', err);
    return [];
  }
}

/**
 * Записать массив товаров в JSON файл.
 * @param {Array} products
 */
function writeProducts(products) {
  try {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Ошибка записи каталога:', err);
  }
}

/**
 * Отправить JSON ответ.
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {Object|Array} data
 */
function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

/**
 * Отправить ошибку 404.
 */
function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
}

/**
 * Создать уникальный идентификатор для нового товара. Использует имя категории и число.
 * @param {Array} products
 * @param {string} category
 */
function generateId(products, category) {
  const prefix = category.toLowerCase();
  const ids = products
    .filter(p => p.category === category)
    .map(p => p.id)
    .filter(id => id.startsWith(prefix + '-'));
  // найдем максимальный номер
  let max = 0;
  ids.forEach(id => {
    const parts = id.split('-');
    const num = parseInt(parts[1], 10);
    if (!isNaN(num) && num > max) max = num;
  });
  return `${prefix}-${max + 1}`;
}

/**
 * Сохранить изображения из base64 кодировки в папку изображений.
 * @param {string[]} base64List Список строк DataURL (data:image/...;base64,...)
 * @returns {string[]} Массив относительных путей к сохранённым файлам
 */
function saveBase64Images(base64List) {
  const saved = [];
  if (!Array.isArray(base64List)) return saved;
  base64List.forEach(dataUrl => {
    if (typeof dataUrl !== 'string') return;
    const match = dataUrl.match(/^data:(image\/([a-zA-Z0-9+.-]+));base64,(.+)$/);
    if (!match) return;
    const mime = match[1];
    let ext = match[2].toLowerCase();
    // нормализуем jpeg
    if (ext === 'jpeg') ext = 'jpg';
    const base64 = match[3];
    // генерируем уникальное имя файла
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const filePath = path.join(imagesDir, filename);
    try {
      fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
      saved.push(path.posix.join('images', filename));
    } catch (err) {
      console.error('Ошибка записи изображения', err);
    }
  });
  return saved;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // API для товаров
  if (pathname.startsWith('/api/products')) {
    // Разрешим CORS для удобства разработки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Предварительный запрос
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
    const products = readProducts();
    // /api/products или /api/products/:id
    if (req.method === 'GET' && pathname === '/api/products') {
      return sendJson(res, 200, products);
    }
    if (pathname.startsWith('/api/products/')) {
      const id = pathname.split('/').pop();
      if (req.method === 'GET') {
        const item = products.find(p => p.id === id);
        return item ? sendJson(res, 200, item) : send404(res);
      }
      if (req.method === 'PUT' || req.method === 'DELETE') {
        // Locate index of product
        const index = products.findIndex(p => p.id === id);
        if (index === -1) return send404(res);
        if (req.method === 'DELETE') {
          products.splice(index, 1);
          writeProducts(products);
          return sendJson(res, 200, { ok: true });
        }
        // PUT: update
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
          try {
            const existing = products[index];
            const updated = JSON.parse(body);
            // Защита: не позволяем менять id через тело
            updated.id = id;
            // Обработка изображений
            // Объединим существующие изображения и новые
            let images = Array.isArray(updated.images)
              ? updated.images.slice()
              : Array.isArray(existing.images)
              ? existing.images.slice()
              : [];
            if (Array.isArray(updated.imagesBase64) && updated.imagesBase64.length > 0) {
              const saved = saveBase64Images(updated.imagesBase64);
              images = images.concat(saved);
            }
            updated.images = images;
            delete updated.imagesBase64;
            // Обновляем запись, приоритет у полей из updated
            products[index] = Object.assign({}, existing, updated);
            writeProducts(products);
            return sendJson(res, 200, products[index]);
          } catch (err) {
            return sendJson(res, 400, { error: 'Invalid JSON' });
          }
        });
        return;
      }
    }
    if (req.method === 'POST' && pathname === '/api/products') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        try {
          const item = JSON.parse(body);
          if (!item.category) {
            return sendJson(res, 400, { error: 'category is required' });
          }
          // Ensure images array exists
          if (!Array.isArray(item.images)) item.images = [];
          // Save uploaded images if present
          if (Array.isArray(item.imagesBase64) && item.imagesBase64.length > 0) {
            const saved = saveBase64Images(item.imagesBase64);
            item.images = item.images.concat(saved);
          }
          delete item.imagesBase64;
          // Generate id if missing
          if (!item.id || item.id.trim() === '') {
            item.id = generateId(products, item.category);
          }
          products.push(item);
          writeProducts(products);
          return sendJson(res, 201, item);
        } catch (err) {
          return sendJson(res, 400, { error: 'Invalid JSON' });
        }
      });
      return;
    }
    // Если ничего из вышеописанного не подошло
    return send404(res);
  }

  // Статические файлы
  let filePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  filePath = path.normalize(filePath);
  // Защита от выхода за пределы publicDir
  const resolvedPath = path.join(publicDir, filePath);
  if (!resolvedPath.startsWith(publicDir)) {
    return send404(res);
  }
  fs.stat(resolvedPath, (err, stat) => {
    if (err) {
      return send404(res);
    }
    if (stat.isDirectory()) {
      // Если запрашивается директория, пробуем отдать index.html
      const indexFile = path.join(resolvedPath, 'index.html');
      fs.readFile(indexFile, (err2, data) => {
        if (err2) return send404(res);
        res.writeHead(200, { 'Content-Type': getContentType('.html') });
        res.end(data);
      });
      return;
    }
    const ext = path.extname(resolvedPath);
    fs.readFile(resolvedPath, (err2, data) => {
      if (err2) return send404(res);
      res.writeHead(200, { 'Content-Type': getContentType(ext) });
      res.end(data);
    });
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Fabula server is running at http://localhost:${PORT}`);
});