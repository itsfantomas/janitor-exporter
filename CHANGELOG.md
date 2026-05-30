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
- If everything runs smoothly, this will be merged into `main` during the upcoming release cycle.

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
- **CRITICAL**: Fetch Proxy теперь **изолирован только на `janitorai.com`** — больше нет перехвата токенов от других скриптов или API
- **CRITICAL**: Persona list модаль полностью перестроена с DOM API — 100% XSS иммунитет (больше нет innerHTML с пользовательскими данными)
- **HIGH**: Добавлена функция `escapeHTML()` для экранирования всех выводов в DOM
- **HIGH**: Санитизация имён файлов от DoS атак (невалидные символы, избыточная длина)

### ✨ User Experience
- **Первый запуск диалог**: Юзеры видят понятный экран с объяснением что делает скрипт
- **Заменены все `alert()`**: На стильные notifications вместо пугающих нативных алертов
- **Заменены `confirm()`**: На красивые custom модали с выбором
- **Улучшена визуализация**: Lang switch теперь более видимый, добавлена transition
- **Плавное исчезновение тостов**: Notifications плавно появляются и исчезают

### 🐛 Bug Fixes
- **ZIP compression hang**: JSZip теперь использует `compression: "STORE"` (PNG уже сжаты, повторное сжатие вешает браузер)
- **Modal с персонами больше не использует innerHTML** для имён — полностью через DOM API
- **Fetch Proxy теперь проверяет тип ресурса**: Работает с Request, URL, и string объектами

### 🎯 New Features
- **Альтернативные приветствия в карточки**: Если есть `alternative_first_messages`, они встраиваются в PNG как `alternate_greetings`
- **Tavern V2 spec поддержка**: Карточки теперь соответствуют `chara_card_v2` спецификации
- **CORS proxy fallback**: Если прямой fetch картинки не сработал, пробуем через `api.allorigins.win`
- **Логирование запросов**: Все запросы к `janitorai.com` логируются в console для прозрачности

### 📚 Documentation
- **Раздел "🔒 Security & Privacy"** расширен в README
- **Добавлена инструкция проверки безопасности** (DevTools Network tab)
- **Версия обновлена на 2.5** со статусом BETA

### ⚙️ Technical Details
- **Lines**: ~850 (было ~822)
- **Token Proxy filtering**: Теперь только `janitorai.com` + relative URLs (`/`)
- **DOM API migration**: Persona list полностью переписан (checkbox, img, span через document.createElement)
- **Better error handling**: Все fetch errors теперь логируются как предупреждения, не падает скрипт

### ⚠️ Known Issues / Testing Needed
- [ ] Проверить что CORS proxy работает для всех типов картинок
- [ ] Проверить что альтернативные приветствия корректно импортируются в SillyTavern
- [ ] Проверить что первый запуск диалог не ломает SPA навигацию
- [ ] Проверить что fetch proxy не ловит лишние токены при сложных сценариях

### 📦 How to Test
1. Добавить скрипт с ветки `test/v2.5` вместо основной версии
2. Очистить localStorage (`jai_suite_setup_shown`, `jai_suite_lang`, `jai_suite_min`)
3. Обновить страницу — должен появиться welcome диалог
4. Открыть DevTools (F12) → Console → увидеть логи запросов
5. Проверить все три типа экспорта (чат, карточка, персоны)
6. Проверить что уведомления выглядят красиво и исчезают правильно

### 💬 Feedback
- Если находишь баги — пожалуйста откомментируй в issue с веткой `test/v2.5`
- Если нравится — merge в main при следующем релизе

---

## [2.0] - Original Release

- Первичный публичный релиз.
- Экспорт диалогов (форматы TXT/JSONL).
- Экспорт карточек персонажей со встроенными метаданными (PNG).
- Экспорт данных трекера в формате JSON.
- Создание бэкапа персон в ZIP-архиве.
- Двуязычный интерфейс управления (RU/EN).
- Перехват токенов для авторизации.
