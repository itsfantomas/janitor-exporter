# Changelog

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

- Initial public release
- Chat export (TXT/JSONL)
- Character card export (PNG)
- Tracker JSON export
- Persona backup (ZIP)
- Bilingual UI (RU/EN)
- Token interception
