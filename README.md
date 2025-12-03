# Learn Chinese (Vite + React + Tailwind)

Минимальный современный шаблон сайта для изучения китайского языка.

Технологии: React 18, Vite 5, React Router 6, TailwindCSS 3, Framer Motion 11.

## Быстрый старт

1. Установите зависимости:

```cmd
npm install
```

2. Запустите дев-сервер:

```cmd
npm run dev
```

3. Сборка продакшн-версии:

```cmd
npm run build
npm run preview
```

## Структура

```
src/
├── components/
│   ├── Navbar.jsx
│   └── ErrorBoundary.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── ListeningPage.jsx
│   └── CharactersPage.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Темы и стили

- Светлая цветовая схема с коралловым акцентом.
- Мягкие тени, скругления, плавные анимации.
- Переходы между страницами через Framer Motion.

Готово к расширению функционалом тренировок.

## Деплой на GitHub Pages

Проект настроен для автоматического деплоя на GitHub Pages при пуше в ветку `main`.

### Автоматический деплой

При каждом пуше в ветку `main`, GitHub Actions автоматически:
1. Собирает проект (`npm run build`)
2. Деплоит собранные файлы в ветку `gh-pages`

Сайт будет доступен по адресу: `https://<username>.github.io/Learnapp/`

### Ручной деплой

Если нужно задеплоить вручную, используйте скрипт:

```bash
./deploy-gh-pages.sh
```

Или вручную:

```bash
# Соберите проект
npm run build

# Переключитесь на ветку gh-pages
git checkout gh-pages

# Скопируйте файлы из dist/
cp -r dist/* .

# Закоммитьте и запушьте
git add -A
git commit -m "Deploy"
git push origin gh-pages
```

## Troubleshooting (если белый экран)

1. Проверьте консоль браузера (F12 → Console) на наличие ошибок.
2. Убедитесь, что в `index.html` есть `<div id="root"></div>` и подключён `main.jsx`.
3. Проверьте, что `vite.config.js` экспортирует объект:
   ```js
   import react from '@vitejs/plugin-react';
   export default { plugins: [react()] };
   ```
4. Перестройте `/node_modules`:
   ```cmd
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   npm run dev
   ```
5. Отключите сторонние расширения браузера (AdBlock и пр.) — иногда блокируют локальный скрипт.
6. Если ошибка рендера — появится сообщение от `ErrorBoundary`.
7. Проверьте путь: при неверном маршруте отображается страница "Страница не найдена".

## Следующие шаги

- Добавить реальные упражнения для слуха.
- Добавить тренировку иероглифов (рисование, распознавание).
- Локализация на английский при необходимости.
- Темная тема (переключатель).
