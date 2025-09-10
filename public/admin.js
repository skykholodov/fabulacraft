/*
  Скрипт административной панели Fabula
  Позволяет просматривать, добавлять, редактировать и удалять товары.
  Для взаимодействия с сервером используются методы HTTP:
    GET    /api/products           — получить весь каталог
    POST   /api/products           — создать новый товар
    PUT    /api/products/:id       — обновить товар по id
    DELETE /api/products/:id       — удалить товар
*/
(function() {
  'use strict';
  const tableBody = document.querySelector('#productTable tbody');
  const addBtn = document.getElementById('addProductBtn');
  const formWrapper = document.getElementById('productFormWrapper');
  const form = document.getElementById('productForm');
  const formTitle = document.getElementById('formTitle');
  const cancelBtn = document.getElementById('cancelEdit');
  // Form fields
  const fid = document.getElementById('productId');
  const fname = document.getElementById('productName');
  const fcat = document.getElementById('productCategory');
  const fcatName = document.getElementById('productCategoryName');
  const fdesc = document.getElementById('productDescription');
  const fprice = document.getElementById('productPrice');
  const fmat = document.getElementById('productMaterial');
  const ffinish = document.getElementById('productFinish');
  const ftech = document.getElementById('productTechnology');
  const fsize = document.getElementById('productSize');
  const fpack = document.getElementById('productPackaging');
  const fbadges = document.getElementById('productBadges');
  const fimgs = document.getElementById('productImages');
  const fimgFiles = document.getElementById('productImageFiles');
  const fextra = document.getElementById('productExtra');

  // Map slug -> русское название для существующих категорий
  let categoriesMap = {};

  /**
   * Заполнить карту категорий и список подсказок
   */
  function buildCategoriesList() {
    categoriesMap = {};
    products.forEach(item => {
      if (item.category && item.category_name) {
        categoriesMap[item.category] = item.category_name;
      }
    });
    const datalist = document.getElementById('categoryList');
    if (!datalist) return;
    datalist.innerHTML = '';
    Object.keys(categoriesMap).forEach(slug => {
      const option = document.createElement('option');
      option.value = slug;
      // сохраняем русское название в дата-атрибуте на всякий случай
      option.dataset.name = categoriesMap[slug];
      datalist.appendChild(option);
    });
  }

  // Реагировать на выбор категории: подставить название на русском
  fcat.addEventListener('input', () => {
    const slug = fcat.value.trim();
    if (categoriesMap[slug]) {
      fcatName.value = categoriesMap[slug];
    }
  });

  let products = [];
  // Получить каталог с сервера
  async function fetchProducts() {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Ошибка при получении каталога');
    products = await res.json();
    // после получения каталога обновляем список категорий и таблицу
    buildCategoriesList();
    renderTable();
  }
  // Отобразить таблицу товаров
  function renderTable() {
    tableBody.innerHTML = '';
    products.forEach(item => {
      const tr = document.createElement('tr');
      const tdId = document.createElement('td');
      tdId.textContent = item.id;
      const tdName = document.createElement('td');
      tdName.textContent = item.name;
      const tdCat = document.createElement('td');
      tdCat.textContent = `${item.category} / ${item.category_name}`;
      const tdPrice = document.createElement('td');
      tdPrice.textContent = item.price_from ? item.price_from.toLocaleString('ru-RU') : '—';
      const tdActions = document.createElement('td');
      tdActions.className = 'actions-cell';
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary';
      editBtn.textContent = 'Редактировать';
      editBtn.addEventListener('click', () => openForm(item));
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-secondary';
      delBtn.textContent = 'Удалить';
      delBtn.addEventListener('click', () => deleteProduct(item.id));
      tdActions.appendChild(editBtn);
      tdActions.appendChild(delBtn);
      tr.appendChild(tdId);
      tr.appendChild(tdName);
      tr.appendChild(tdCat);
      tr.appendChild(tdPrice);
      tr.appendChild(tdActions);
      tableBody.appendChild(tr);
    });
  }
  // Показать форму для добавления или редактирования
  function openForm(item) {
    form.reset();
    if (item) {
      formTitle.textContent = 'Редактировать товар';
      fid.value = item.id;
      fname.value = item.name;
      fcat.value = item.category;
      fcatName.value = item.category_name;
      fdesc.value = item.short_description;
      fprice.value = item.price_from != null ? item.price_from : '';
      fmat.value = item.material || '';
      ffinish.value = item.finish || '';
      ftech.value = item.technology || '';
      fsize.value = item.size_mm || '';
      fpack.value = item.packaging || '';
      fbadges.value = item.badges || '';
      fimgs.value = item.images ? item.images.join(', ') : '';
      fextra.value = item.extra_text || '';
    } else {
      formTitle.textContent = 'Добавить товар';
      fid.value = '';
    }
    formWrapper.hidden = false;
    window.scrollTo({ top: formWrapper.offsetTop - 50, behavior: 'smooth' });
  }
  /**
   * Прочитать файл и вернуть Data URL (base64).
   * @param {File} file
   * @returns {Promise<string>}
   */
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
  }
  // Скрыть форму
  function closeForm() {
    formWrapper.hidden = true;
  }
  // Удалить товар
  async function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Ошибка при удалении');
      return;
    }
    await fetchProducts();
  }
  // Отправить форму (создать или обновить товар)
  form.addEventListener('submit', async e => {
    e.preventDefault();
    // Собираем данные формы
    const product = {
      id: fid.value.trim() || undefined,
      name: fname.value.trim(),
      category: fcat.value.trim(),
      category_name: fcatName.value.trim(),
      short_description: fdesc.value.trim(),
      price_from: fprice.value ? parseFloat(fprice.value) : null,
      material: fmat.value.trim() || null,
      finish: ffinish.value.trim() || null,
      technology: ftech.value.trim() || null,
      size_mm: fsize.value ? parseInt(fsize.value) : null,
      packaging: fpack.value.trim() || null,
      badges: fbadges.value.trim() || null,
      // существующие изображения разделены запятой
      images: fimgs.value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      extra_text: fextra.value.trim() || null,
    };
    // Читаем файлы изображений в base64
    const files = Array.from(fimgFiles.files || []);
    if (files.length > 0) {
      try {
        const base64s = await Promise.all(files.map(readFileAsDataURL));
        product.imagesBase64 = base64s;
      } catch (err) {
        alert('Ошибка при чтении изображений: ' + err.message);
        return;
      }
    }
    const method = product.id ? 'PUT' : 'POST';
    const url = product.id ? `/api/products/${encodeURIComponent(product.id)}` : '/api/products';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      alert('Ошибка при сохранении');
      return;
    }
    closeForm();
    // Очистим поле выбора файлов, чтобы предотвратить повторное добавление тех же фото при следующем редактировании
    fimgFiles.value = '';
    await fetchProducts();
  });
  // Кнопка отмены
  cancelBtn.addEventListener('click', e => {
    e.preventDefault();
    closeForm();
  });
  // Кнопка добавления
  addBtn.addEventListener('click', () => openForm(null));
  // Инициализация
  fetchProducts().catch(err => console.error(err));
})();