# Changelog

[English Version](#english-version) | [Русская версия](#russian-version)

---

## English Version <a id="english-version"></a>

## [2.5] - 2026-01-30 (BETA/TEST)

### 🛡️ Security Improvements
- **CRITICAL**: Fetch Proxy is now **strictly isolated to `janitorai.com`** — no more token interception from other scripts or APIs.
- **CRITICAL**: Persona list modal completely rebuilt using native DOM API — 100% XSS immunity (eliminated `innerHTML` handling user data).
- **HIGH**: Added `escapeHTML()` function to securely sanitize all DOM outputs.
- **HIGH**: Filename sanitization implemented to prevent DoS attacks (filters invalid characters and excessive length).

### ✨ User Experience
- **First-Run Dialog**: Users are greeted with a clear, informative screen explaining the script's functionality.
- **Native `alert()` Replacement**: Swapped all native alerts with stylish custom notifications for a less intrusive UX.
- **Native `confirm()` Replacement**: Swapped native confirmation boxes with beautiful custom modals.
- **Enhanced Visualization**: The language switcher is now more prominent and features a smooth transition effect.
- **Smooth Toast Fade-Out**: Notifications now gracefully fade in and out.

### 🐛 Bug Fixes
- **ZIP Compression Hang**: JSZip now forces `compression: "STORE"` (PNGs are already compressed; re-compressing them caused the browser to hang).
- **Persona Modal Safety**: Replaced all `innerHTML` usage for character names with robust DOM API methods.
- **Fetch Proxy Versatility**: The proxy now correctly validates resource types, supporting `Request`, `URL`, and string objects.

### 🎯 New Features
- **Alternative Greetings in Character Cards**: If `alternative_first_messages` exist, they are securely embedded into the PNG metadata as `alternate_greetings`.
- **Tavern V2 Spec Support**: Exported cards now fully comply with the `chara_card_v2` specification.
- **CORS Proxy Fallback**: If a direct image fetch fails, the script automatically attempts a fallback via `api.allorigins.win`.
- **Request Logging**: All requests targeting `janitorai.com` are logged directly to the DevTools console for full transparency.

### 📚 Documentation
- **"🔒 Security & Privacy" Section**: Significantly expanded inside the README.
- **Security Verification Guide**: Added step-by-step instructions on how to audit the script using the DevTools Network tab.
- **Version Bump**: Updated to 2.5 with an explicit BETA status tag.

### ⚙️ Technical Details
- **Lines of Code**: ~850 (up from ~822)
- **Token Proxy Filtering**: Restricted exclusively to `janitorai.com` and relative paths (`/`).
- **DOM API Migration**: The persona list rendering logic was completely rewritten using `document.createElement` (checkboxes, images, spans).
- **Robust Error Handling**: All fetch errors are now caught and logged as console warnings, preventing full script execution crashes.

### ⚠️ Known Issues / Testing Needed
- [ ] Verify that the CORS proxy functions correctly across various image formats.
- [ ] Verify that alternative greetings import smoothly into SillyTavern.
- [ ] Verify that the first-run dialog doesn't interfere with the platform's SPA navigation.
- [ ] Verify that the fetch proxy does not capture unintended tokens under complex edge-case scenarios.

### 📦 How to Test
1. Load the script from the `test/v2.5` branch instead of the production version.
2. Clear your localStorage keys: `jai_suite_setup_shown`, `jai_suite_lang`, `jai_suite_min`.
3. Refresh the page — the welcome dialog should trigger immediately.
4. Open DevTools (F12) → Console tab → verify that request logs are printing.
5. Test all three primary export types: chats, character cards, and personas.
6. Check that custom notifications render beautifully and fade out as intended.

### 💬 Feedback
- If you encounter any bugs, please drop a comment directly in the issue tracker under the `test/v2.5` branch.

---

## [2.0] - Original Release

- Initial public release
- Chat export functionality (TXT/JSONL)
- Character card export functionality (PNG)
- Tracker JSON data export
- Persona backup system (ZIP)
- Bilingual User Interface (RU/EN)
- Token interception capabilities

---

## Русская версия <a id="russian-version"></a>

## [2.5] - 2026-01-30 (BETA/TEST)

### 🛡️ Security Improvements
- **CRITICAL**: Fetch Proxy теперь **изолирован только на `janitorai.com`** — больше нет перехвата токенов от других скриптов или API.
- **CRITICAL**: Модальное окно списка персон полностью перестроено на native DOM API — 100% XSS иммунитет (больше нет `innerHTML` с пользовательскими данными).
- **HIGH**: Добавлена функция `escapeHTML()` для безопасного экранирования всех выводов в DOM.
- **HIGH**: Санитизация имён файлов для защиты от DoS-атак (фильтрация невалидных символов и ограничение избыточной длины).

### ✨ User Experience
- **Диалог первого запуска**: Юзеры видят понятный приветственный экран с объяснением того, что делает скрипт.
- **Замена всех `alert()`**: Нативные алерты заменены на кастомные notifications.
- **Замена `confirm()`**: Вместо системных окон теперь используются кастомные модали с выбором действий.
- **Улучшенная визуализация**: Переключатель языков (Lang switch) стал более заметным, добавлена плавная transition-анимация.
- **Плавное исчезновение тостов**: Уведомления теперь плавно появляются и исчезают.

### 🐛 Bug Fixes
- **ZIP compression hang**: JSZip теперь принудительно использует `compression: "STORE"` (PNG-картинки уже сжаты, повторное сжатие намертво вешало браузер).
- **Безопасность модали персон**: Имена персонажей больше не рендерятся через `innerHTML` — логика полностью переведена на DOM API.
- **Универсальность Fetch Proxy**: Теперь корректно проверяется тип ресурса, обеспечивая стабильную работу с объектами `Request`, `URL` и строками.

### 🎯 New Features
- **Альтернативные приветствия в карточках**: Если в данных присутствуют `alternative_first_messages`, они автоматически встраиваются в метаданные PNG как `alternate_greetings`.
- **Поддержка спецификации Tavern V2**: Экспортируемые карточки теперь строго соответствуют стандарту `chara_card_v2`.
- **Резервный CORS proxy**: Если прямой fetch-запрос за картинкой не удался, скрипт пробует загрузить её через `api.allorigins.win`.
- **Логирование запросов**: Все запросы к `janitorai.com` логируются в консоль DevTools для полной прозрачности работы скрипта.

### 📚 Documentation
- **Раздел "🔒 Security & Privacy"**: Существенно расширен и подробно расписан в README.
- **Инструкция по проверке безопасности**: Добавлен гайд для пользователей о том, как самостоятельно проверить скрипт через вкладку Network в DevTools.
- **Обновление версии**: Версия поднята до 2.5 со статусом BETA.

### ⚙️ Technical Details
- **Объем кода**: ~850 строк (было ~822).
- **Фильтрация Token Proxy**: Теперь строго ограничена доменом `janitorai.com` и относительными путями (`/`).
- **Миграция на DOM API**: Список персон полностью переписан на создание элементов через `document.createElement` (checkbox, img, span).
- **Улучшенная обработка ошибок**: Все ошибки fetch-запросов теперь перехватываются и выводятся как предупреждения (warnings), не вызывая падения всего скрипта.

### ⚠️ Known Issues / Testing Needed
- [ ] Проверить, корректно ли работает CORS proxy для всех существующих форматов и типов картинок.
- [ ] Проверить, что альтернативные приветствия правильно импортируются и распознаются в SillyTavern.
- [ ] Убедиться, что диалог первого запуска не ломает навигацию внутри SPA (Single Page Application).
- [ ] Проверить, что fetch proxy не перехватывает лишние токены при сложных или нестандартных сценариях запросов.

### 📦 How to Test
1. Установить/обновить скрипт с тестовой ветки `test/v2.5` вместо основной версии.
2. Полностью очистить ключи localStorage: `jai_suite_setup_shown`, `jai_suite_lang`, `jai_suite_min`.
3. Обновить страницу — должен мгновенно появиться приветственный welcome-диалог.
4. Открыть инструменты разработчика (F12) → вкладка Console → убедиться в наличии логов сетевых запросов.
5. Проверить работоспособность всех трех типов экспорта (история чата, карточка персонажа, бэкап персон).
6. Убедиться, что кастомные уведомления выглядят корректно и исчезают с правильными таймингами.

### 💬 Feedback
- Если вы обнаружили баг — пожалуйста, оставьте комментарий в соответствующем issue к ветке `test/v2.5`.

---

## [2.0] - Original Release

- Первичный публичный релиз.
- Экспорт диалогов (форматы TXT/JSONL).
- Экспорт карточек персонажей со встроенными метаданными (PNG).
- Экспорт данных трекера в формате JSON.
- Создание бэкапа персон в ZIP-архиве.
- Двуязычный интерфейс управления (RU/EN).
- Перехват токенов для авторизации.
