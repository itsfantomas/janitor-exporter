# 💎 Janitor AI Suite (Ultimate)

**v2.0** — A powerful all-in-one Tampermonkey userscript for [JanitorAI](https://janitorai.com) conneted with [JaniTracker](https://github.com/itsfantomas/JaniTracker)

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-JanitorAI-blue.svg)](https://janitorai.com)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Compatible-green.svg)](https://www.tampermonkey.net/)
[![Version](https://img.shields.io/badge/Version-2.0-blueviolet.svg)](#)

**Export chats • Download character cards • Backup personas — all in one click.**

<img width="1024" height="373" alt="Janitor AI Suite Banner" src="https://github.com/user-attachments/assets/717a73f7-37e6-4444-a2d6-3c26b4ecede4" />

---

[English](#-english) • [Русский](#-русский)

</div>

---

# 🇬🇧 English

## 📖 Overview

**Janitor AI Suite** is a client-side Tampermonkey userscript that injects a sleek, draggable floating panel into [janitorai.com](https://janitorai.com). It provides a set of powerful tools to **export your chat history**, **download character cards** in the SillyTavern-compatible Tavern V1 PNG format, **generate tracker JSON files**, and **backup your personas** — all without sending any data to third-party servers.

> [!NOTE]
> This script operates entirely client-side. It fetches data **only** from `janitorai.com` using your existing authenticated session. No data is transmitted externally.

---

## ✨ Features

### 💬 Chat Export
| Format | Description |
|--------|-------------|
| **`.TXT`** | Plain-text export with `You` / `Char` labels. Perfect for reading your roleplay like a book — opens in any text editor or e-reader. |
| **`.JSONL`** | Structured JSON Lines format ready for **SillyTavern** import. Each message includes `name`, `role`, `send_date`, and `mes` fields. |

### 🖼️ Character Card Export
| Format | Description |
|--------|-------------|
| **`.PNG` Card** | Full character card embedded in a PNG image using the **Tavern V1** `tEXt` chunk specification. Includes name, description, personality, scenario, first message, example dialogs, creator notes, system prompt, and tags. Drag-and-drop into SillyTavern. |
| **`.JSON` Tracker** | Lightweight JSON file containing character metadata (name, link, avatar, status, tags, notes) designed for bot tracker applications. |

### 👤 Persona Backup
- Select individual personas or batch-export all at once.
- Downloads a **`.zip`** archive containing:
  - `personas_backup.json` — structured backup with persona names, descriptions, and avatar mappings.
  - Individual avatar images (PNG) for each persona.
- Compatible with SillyTavern persona import format.

### 🎛️ User Interface
- **Floating panel** — fixed-position, draggable dark panel (top-right corner).
- **Minimize/Expand** — collapse the panel to a thin header bar.
- **Bilingual** — switch between 🇷🇺 Russian and 🇬🇧 English with a single click.
- **Context-aware** — the panel automatically detects your current page (chat, character, profile) and shows the relevant action buttons.
- **Auto-reconnect** — if the panel is removed from the DOM (e.g., SPA navigation), it reattaches itself automatically.

---

## 🏗️ Architecture & Technical Details

### Project Structure

```
janitor-exporter-main/
├── janitor-exporter.user.js   # Main userscript (~822 lines)
├── README.md                  # Documentation
└── LICENSE                    # MIT License
```

### Module Breakdown

The script is a single self-executing IIFE organized into the following logical sections:

| Section | Lines | Description |
|---------|-------|-------------|
| **0. Configuration** | 36–92 | `CONFIG` object (language, minimized state, token cache) and `TEXT` bilingual string dictionary with translation helper `t()`. |
| **1. Authentication** | 94–164 | Token extraction from Supabase cookies (`sb-auth-auth-token.*`), localStorage, and a `window.fetch` Proxy that intercepts outgoing `Authorization` headers. |
| **2. Data Parser** | 174–246 | `getPageData()` — extracts character data from inline `<script>` tags containing `window.mbxM.push` calls. `getPersonasData()` — extracts persona lists from `window._storeState_`. |
| **3. UI Engine** | 248–441 | Creates and manages the floating panel: header (title, language switch, minimize toggle), body (context-aware buttons), CSS injection, drag-and-drop logic, and URL-based re-rendering via `setInterval`. |
| **4. Persona Selector** | 448–536 | Modal dialog with checkboxes, avatar thumbnails (resolved from DOM or JSON), select-all toggle, and download trigger. |
| **5. Persona Backup** | 538–606 | `runPersonasBackup()` — iterates selected personas, fetches avatar images (best-effort), builds a ZIP archive with `JSZip`, and triggers download. |
| **6. Chat Export** | 609–662 | `runChatExport(format)` — calls the internal API (`/hampter/chats/{id}`) with the intercepted Bearer token, sorts messages chronologically, formats to TXT or JSONL. |
| **7. Card Export** | 664–719 | `runCardExport()` — fetches avatar image, creates an off-screen canvas, redraws to a clean PNG, constructs a Tavern V1-spec JSON payload, and embeds it via `tEXt` PNG chunk. |
| **8. Tracker Export** | 721–760 | `runTrackerExport()` — builds a lightweight JSON object from parsed character data with status, tags, and truncated description. |
| **9. Utilities** | 762–812 | `downloadFile()` — generic Blob download helper. CRC32 table generation and `calculateCrc32()` for PNG chunk validation. `embedDataInPng()` — low-level PNG `tEXt` chunk injection. |
| **10. Bootstrap** | 814–821 | Waits for `document.body` to be available, then calls `createUI()`. |

### Key Technical Highlights

- **Token Acquisition Strategy** — Three-layer fallback:
  1. **Fetch Proxy** — intercepts `Authorization: Bearer` headers from the app's own API calls via `Proxy(window.fetch)`.
  2. **Cookie Parser** — reconstructs the Supabase session from chunked `sb-auth-auth-token.*` cookies (base64 + URL-safe encoding).
  3. **LocalStorage Scan** — scans keys matching `sb-*-auth-token` pattern.

- **PNG tEXt Chunk Embedding** — Raw binary manipulation:
  - Constructs a valid PNG `tEXt` chunk with keyword `"chara"`.
  - Encodes character JSON as base64 and writes it as the chunk value.
  - Computes a CRC32 checksum for chunk integrity.
  - Injects the chunk just before the `IEND` marker.

- **SPA Awareness** — Uses a 1-second `setInterval` to detect URL changes (no `popstate` available in the JanitorAI SPA) and re-renders the panel accordingly.

- **CORS Handling** — Avatar downloads use standard `fetch()` with a best-effort approach. Images sourced from the DOM (already loaded by the browser) benefit from cache hits.

### Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| [JSZip](https://stuk.github.io/jszip/) | 3.10.1 | Client-side ZIP archive creation for persona backups |
| [Tampermonkey](https://www.tampermonkey.net/) | — | Userscript manager (browser extension) |

---

## 🚀 Installation

### Prerequisites

Install a userscript manager for your browser:

| Browser | Extension |
|---------|-----------|
| Chrome / Yandex / Edge | [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) |
| Firefox | [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) |
| Android | Install [Kiwi Browser](https://play.google.com/store/apps/details?id=com.niceBrwsr.niceBrwsr.niceBrwsr), then add Tampermonkey via the Chrome link above |
| iPhone (Safari) | Install [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) from the App Store |

### Install the Script

1. **[Click here to copy the script code](https://github.com/itsfantomas/janitor-exporter/blob/main/janitor-exporter.user.js)**
2. Open the Tampermonkey dashboard → Create a new script → Paste the code → Save (`Ctrl+S`).
3. Done! 🎉

https://github.com/user-attachments/assets/a725128f-8d41-4c37-be85-ae1fb783259a

### Auto-Update

The script includes `@updateURL` and `@downloadURL` headers pointing to this repository. Tampermonkey can check for updates automatically.

---

## 🎮 Usage

1. Navigate to [janitorai.com](https://janitorai.com).
2. A dark floating panel (**💎 J.AI Suite**) appears in the top-right corner.
   - **Drag** the header bar to reposition the panel.
   - Click **−** to minimize / **+** to expand.
   - Click **RU** / **EN** to switch language.

<img width="352" height="275" alt="Panel Screenshot" src="https://github.com/user-attachments/assets/2f00fd49-7603-497f-8990-43896fb75f1f" />

### Export a Chat

1. Open any chat with a bot.
2. Blue buttons (**Download .TXT** / **Download .JSONL**) appear in the panel.
3. Optionally enter a custom filename.
4. Click the desired format — the full chat history is downloaded automatically.

https://github.com/user-attachments/assets/e1043ff1-ec29-4921-95b7-d7c173e9d9c2

### Download a Character Card

1. Open a character's profile page (or be in an active chat with them).
2. Click the pink **Download Card (.png)** button.
3. The PNG file with embedded character data is saved to your Downloads folder.

https://github.com/user-attachments/assets/bee7655f-4dd4-45b7-baef-284b20cd7d8e

https://github.com/user-attachments/assets/684b887c-694f-4c51-a7a4-01885afb0bdc

### Export for Tracker

1. On a character page, click the purple **For Tracker (.json)** button.
2. A lightweight JSON file with character metadata is downloaded.

### Backup Personas

1. Navigate to your profile / personas page.
2. Click the green **Backup Personas (.zip)** button.
3. A modal dialog lets you **select/deselect** individual personas.
4. Click **Download Selected** — a ZIP archive is generated and downloaded.

---

## ❓ FAQ

**Q: I click a button but it says "No data found".**
> Refresh the page (`F5`). The script sometimes loads before the site finishes rendering its data. After refreshing, it will work.

**Q: Where are my downloaded files?**
> In your browser's default **Downloads** folder.

**Q: Is this safe? Can my account be stolen?**
> Absolutely safe. The script runs **entirely in your browser** and does **not** transmit your conversations, passwords, or tokens to any third party. It simply automates the "copy and paste" actions you could do manually. You can verify the source code through any AI assistant or code review tool.

**Q: Can I download any bot's card?**
> Only bots whose descriptions are **publicly visible** (not hidden by the creator). The script automates what you can already do manually — it just makes it instant.

**Q: Does it work with SillyTavern?**
> Yes! **JSONL** chat exports and **PNG character cards** are fully compatible with SillyTavern's import functionality.

---

## 🔒 Security & Privacy

- **Client-side only** — all data processing happens in your browser.
- **No external requests** — the script only communicates with `janitorai.com`.
- **No data collection** — no analytics, no telemetry, no tracking.
- **Open source** — full source code is available for audit.
- **Token handling** — authentication tokens are used temporarily in-memory and are never stored persistently or transmitted externally.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 💖 Support

Made with love for the community.

- **Author:** [itsfantomas]
- **Telegram:** [Questions & Support](https://t.me/itsfantomaslab)

---
---

# 🇷🇺 Русский

## 📖 Обзор

**Janitor AI Suite** — это клиентский Tampermonkey-юзерскрипт, который встраивает стильную перетаскиваемую плавающую панель на сайт [janitorai.com](https://janitorai.com). Он предоставляет набор мощных инструментов для **экспорта истории чатов**, **скачивания карточек персонажей** в формате Tavern V1 PNG (совместимом с SillyTavern), **генерации JSON-файлов для трекера** и **бэкапа ваших персон** — и всё это без отправки каких-либо данных на сторонние серверы.

> [!NOTE]
> Скрипт работает полностью на стороне клиента. Он запрашивает данные **только** с `janitorai.com`, используя вашу текущую авторизованную сессию. Никакие данные не передаются третьим лицам.

---

## ✨ Возможности

### 💬 Экспорт чатов
| Формат | Описание |
|--------|----------|
| **`.TXT`** | Текстовый экспорт с метками `You` / `Char`. Идеально для чтения переписки как книги — откроется в любом текстовом редакторе или читалке. |
| **`.JSONL`** | Структурированный формат JSON Lines, готовый к импорту в **SillyTavern**. Каждое сообщение содержит поля `name`, `role`, `send_date` и `mes`. |

### 🖼️ Экспорт карточки персонажа
| Формат | Описание |
|--------|----------|
| **`.PNG` Карточка** | Полная карточка персонажа, встроенная в PNG-изображение по спецификации **Tavern V1** через `tEXt`-чанк. Включает имя, описание, личность, сценарий, первое сообщение, примеры диалогов, заметки автора, системный промпт и теги. Перетащите в SillyTavern — и бот готов к работе. |
| **`.JSON` Трекер** | Лёгкий JSON-файл с метаданными персонажа (имя, ссылка, аватар, статус, теги, заметки) для трекеров ботов. |

### 👤 Бэкап персон
- Выбирайте отдельные персоны или экспортируйте все сразу.
- Скачивается **`.zip`**-архив, содержащий:
  - `personas_backup.json` — структурированный бэкап с именами, описаниями и привязками аватаров.
  - Отдельные изображения аватаров (PNG) для каждой персоны.
- Совместим с форматом импорта персон SillyTavern.

### 🎛️ Пользовательский интерфейс
- **Плавающая панель** — тёмная панель с фиксированной позицией, перетаскиваемая мышью (правый верхний угол).
- **Свернуть/Развернуть** — сворачивание панели в тонкую полоску заголовка.
- **Двуязычность** — переключение между 🇷🇺 Русским и 🇬🇧 Английским одним нажатием.
- **Контекстная адаптация** — панель автоматически определяет текущую страницу (чат, персонаж, профиль) и показывает соответствующие кнопки.
- **Автоподключение** — если панель удаляется из DOM (например, при SPA-навигации), она автоматически восстанавливается.

---

## 🏗️ Архитектура и технические детали

### Структура проекта

```
janitor-exporter-main/
├── janitor-exporter.user.js   # Основной юзерскрипт (~822 строк)
├── README.md                  # Документация
└── LICENSE                    # Лицензия MIT
```

### Разбор модулей

Скрипт представляет собой единый самовыполняющийся IIFE, организованный в следующие логические секции:

| Секция | Строки | Описание |
|--------|--------|----------|
| **0. Конфигурация** | 36–92 | Объект `CONFIG` (язык, состояние сворачивания, кэш токена) и словарь `TEXT` с переводами + хелпер `t()`. |
| **1. Авторизация** | 94–164 | Извлечение токена из Supabase-куки (`sb-auth-auth-token.*`), localStorage и перехват заголовков `Authorization` через `Proxy(window.fetch)`. |
| **2. Парсер данных** | 174–246 | `getPageData()` — извлекает данные персонажа из инлайн-тегов `<script>` с `window.mbxM.push`. `getPersonasData()` — извлекает списки персон из `window._storeState_`. |
| **3. UI-движок** | 248–441 | Создание и управление плавающей панелью: заголовок (название, переключатель языка, кнопка сворачивания), тело (контекстные кнопки), внедрение CSS, логика перетаскивания и ре-рендеринг по URL через `setInterval`. |
| **4. Выбор персон** | 448–536 | Модальный диалог с чекбоксами, миниатюрами аватаров (из DOM или JSON), кнопкой «Выбрать все» и триггером скачивания. |
| **5. Бэкап персон** | 538–606 | `runPersonasBackup()` — перебирает выбранные персоны, загружает аватары (best-effort), формирует ZIP-архив через `JSZip` и запускает скачивание. |
| **6. Экспорт чата** | 609–662 | `runChatExport(format)` — вызывает внутреннее API (`/hampter/chats/{id}`) с перехваченным Bearer-токеном, сортирует сообщения хронологически, форматирует в TXT или JSONL. |
| **7. Экспорт карточки** | 664–719 | `runCardExport()` — загружает аватар, создаёт offscreen-canvas, перерисовывает в чистый PNG, формирует JSON-payload по спецификации Tavern V1 и встраивает его через `tEXt`-чанк PNG. |
| **8. Экспорт для трекера** | 721–760 | `runTrackerExport()` — собирает лёгкий JSON-объект из данных персонажа со статусом, тегами и обрезанным описанием. |
| **9. Утилиты** | 762–812 | `downloadFile()` — универсальный хелпер скачивания через Blob. Генерация таблицы CRC32 и функция `calculateCrc32()` для валидации PNG-чанков. `embedDataInPng()` — низкоуровневая инъекция `tEXt`-чанка в PNG. |
| **10. Загрузка** | 814–821 | Ожидание доступности `document.body`, затем вызов `createUI()`. |

### Ключевые технические решения

- **Стратегия получения токена** — трёхуровневый фолбэк:
  1. **Proxy на fetch** — перехватывает заголовки `Authorization: Bearer` из собственных API-запросов приложения через `Proxy(window.fetch)`.
  2. **Парсер куки** — реконструирует сессию Supabase из чанкированных куки `sb-auth-auth-token.*` (base64 + URL-safe кодирование).
  3. **Сканирование localStorage** — ищет ключи по паттерну `sb-*-auth-token`.

- **Встраивание tEXt-чанка в PNG** — низкоуровневая бинарная манипуляция:
  - Формирует валидный PNG `tEXt`-чанк с ключевым словом `"chara"`.
  - Кодирует JSON персонажа в base64 и записывает как значение чанка.
  - Вычисляет контрольную сумму CRC32 для целостности чанка.
  - Внедряет чанк непосредственно перед маркером `IEND`.

- **Поддержка SPA** — использует `setInterval` с интервалом 1 секунда для обнаружения изменений URL (событие `popstate` недоступно в SPA JanitorAI) и перерисовки панели.

- **Обработка CORS** — скачивание аватаров использует стандартный `fetch()` по принципу best-effort. Изображения, полученные из DOM (уже загруженные браузером), используют кэш.

### Зависимости

| Зависимость | Версия | Назначение |
|-------------|--------|------------|
| [JSZip](https://stuk.github.io/jszip/) | 3.10.1 | Создание ZIP-архивов на стороне клиента для бэкапа персон |
| [Tampermonkey](https://www.tampermonkey.net/) | — | Менеджер юзерскриптов (расширение браузера) |

---

## 🚀 Установка

### Предварительные требования

Установите менеджер юзерскриптов для вашего браузера:

| Браузер | Расширение |
|---------|------------|
| Chrome / Yandex / Edge | [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) |
| Firefox | [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) |
| Android | Установите [Kiwi Browser](https://play.google.com/store/apps/details?id=com.niceBrwsr.niceBrwsr.niceBrwsr), затем добавьте Tampermonkey по ссылке для Chrome выше |
| iPhone (Safari) | Установите [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) из App Store |

### Установка скрипта

1. **[Нажмите сюда, чтобы скопировать код скрипта](https://github.com/itsfantomas/janitor-exporter/blob/main/janitor-exporter.user.js)**
2. Откройте панель управления Tampermonkey → Создать новый скрипт → Вставьте код → Сохраните (`Ctrl+S`).
3. Готово! 🎉

https://github.com/user-attachments/assets/a725128f-8d41-4c37-be85-ae1fb783259a

### Автообновление

Скрипт включает заголовки `@updateURL` и `@downloadURL`, указывающие на этот репозиторий. Tampermonkey может автоматически проверять наличие обновлений.

---

## 🎮 Как пользоваться

1. Зайдите на [janitorai.com](https://janitorai.com).
2. В правом верхнем углу появится тёмная плавающая панель (**💎 J.AI Suite**).
   - **Перетаскивайте** панель за заголовок для изменения позиции.
   - Нажмите **−** для сворачивания / **+** для разворачивания.
   - Нажмите **RU** / **EN** для смены языка.

<img width="352" height="275" alt="Скриншот панели" src="https://github.com/user-attachments/assets/2f00fd49-7603-497f-8990-43896fb75f1f" />

### Экспорт чата

1. Откройте любой чат с ботом.
2. В панели появятся синие кнопки (**Скачать .TXT** / **Скачать .JSONL**).
3. При желании введите пользовательское имя файла.
4. Нажмите нужный формат — полная история чата скачается автоматически.

https://github.com/user-attachments/assets/e1043ff1-ec29-4921-95b7-d7c173e9d9c2

### Скачивание карточки персонажа

1. Откройте страницу профиля персонажа (или находитесь в активном чате с ним).
2. Нажмите розовую кнопку **Скачать Карту (.png)**.
3. PNG-файл со встроенными данными персонажа сохранится в папку «Загрузки».

https://github.com/user-attachments/assets/bee7655f-4dd4-45b7-baef-284b20cd7d8e

https://github.com/user-attachments/assets/684b887c-694f-4c51-a7a4-01885afb0bdc

### Экспорт для трекера

1. На странице персонажа нажмите фиолетовую кнопку **Для Трекера (.json)**.
2. Скачается лёгкий JSON-файл с метаданными персонажа.

### Бэкап персон

1. Перейдите на страницу вашего профиля / персон.
2. Нажмите зелёную кнопку **Все персоны (.zip)**.
3. В модальном окне **выберите/снимите выбор** отдельных персон.
4. Нажмите **Скачать выбранные** — ZIP-архив будет сгенерирован и скачан.

---

## ❓ Частые вопросы (FAQ)

**В: Нажимаю кнопку, а появляется «Данные не найдены».**
> Обновите страницу (`F5`). Иногда скрипт загружается раньше, чем сайт успевает отрендерить данные. После обновления всё заработает.

**В: Куда делись скачанные файлы?**
> В стандартную папку **«Загрузки» (Downloads)** вашего браузера.

**В: Это безопасно? Мой аккаунт не украдут?**
> Абсолютно безопасно. Скрипт работает **полностью внутри вашего браузера** и **не** передаёт ваши переписки, пароли или токены третьим лицам. Он просто автоматизирует действия «Скопировать и Вставить», которые вы можете выполнить вручную. Исходный код открыт для аудита.

**В: Можно ли скачать карточку любого бота?**
> Только тех ботов, описание которых **не скрыто** автором. Скрипт автоматизирует то, что вы и так можете сделать руками — просто делает это мгновенно.

**В: Работает ли экспорт с SillyTavern?**
> Да! Экспорт чатов в **JSONL** и карточки персонажей в **PNG** полностью совместимы с функцией импорта SillyTavern.

---

## 🔒 Безопасность и конфиденциальность

- **Только на стороне клиента** — вся обработка данных происходит в вашем браузере.
- **Нет внешних запросов** — скрипт обращается только к `janitorai.com`.
- **Нет сбора данных** — без аналитики, телеметрии и отслеживания.
- **Открытый исходный код** — полный код доступен для аудита.
- **Обработка токенов** — токены авторизации используются временно в оперативной памяти и никогда не сохраняются постоянно и не передаются вовне.

---

## 📄 Лицензия

Проект распространяется по лицензии **MIT** — подробности в файле [LICENSE](LICENSE).

---

## 💖 Поддержка

Сделано с любовью для комьюнити.

- **Автор:** [itsfantomas]
- **Telegram:** [Вопросы и поддержка](https://t.me/itsfantomaslab)
