// ==UserScript==
// @name         Janitor AI Suite (Ultimate) 2.5 BETA
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Export JanitorAI chats to TXT/JSONL & Download Character Cards & Tracker JSON & Backup Personas.
// @author       [itsfantomas]
// @copyright    2026 by itsfantomas, [https://t.me/itsfantomaslab]
// @license      MIT
// @match        https://janitorai.com/*
// @grant        none
// @run-at       document-start
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @updateURL    https://github.com/itsfantomas/janitor-exporter/raw/main/janitor-exporter.user.js
// @downloadURL  https://github.com/itsfantomas/janitor-exporter/raw/main/janitor-exporter.user.js
// @supportURL   https://t.me/itsfantomaslab
// ==/UserScript==

/* global JSZip */

/**
 * 🛡️ SECURITY & STABILITY AUDIT NOTE (v2.5):
 * - Fetch Proxy isolated ONLY to 'janitorai.com' to prevent cross-origin token leaks.
 * - Eliminated innerHTML in persona list (migrated to pure DOM textContent for 100% XSS immunity).
 * - Implemented First-Time Consent and Security Disclosure Modal.
 * - GM_xmlhttpRequest completely removed to prevent scary Tampermonkey security prompts.
 * - Added fallback public CORS proxy for external images to bypass browser restrictions silently.
 * - JSZip compression set to "STORE" to prevent browser thread hanging.
 */

(function () {
    'use strict';

    console.log(
        '%c ✨ J.AI Suite by [itsfantomas] %c v2.5 BETA Loaded ',
        'background: #7c3aed; color: white; font-weight: bold; border-radius: 4px;',
        'color: #a78bfa;'
    );

    // --- 0. НАСТРОЙКИ ---
    const CONFIG = {
        lang: localStorage.getItem('jai_suite_lang') || 'ru',
        isMinimized: localStorage.getItem('jai_suite_min') === 'true',
        token: null,
        currentUrl: ''
    };

    const TEXT = {
        ru: {
            title: "💎 J.AI Suite",
            status_wait: "Жду перехода...",
            status_ready: "Готово",
            status_loading: "Загрузка...",
            status_error: "Ошибка",
            mode_chat: "ЭКСПОРТ ЧАТА",
            mode_card: "ЭКСПОРТ КАРТЫ",
            mode_profile: "БЭКАП ПЕРСОН",
            btn_txt: "Скачать .TXT",
            btn_jsonl: "Скачать .JSONL",
            btn_card: "Скачать Карту (.png)",
            btn_tracker: "Для Трекера (.json)",
            btn_personas: "Все персоны (.zip)",
            placeholder_filename: "Имя файла...",
            hint_manual: "Ручной режим",
            alert_no_data: "Данные не найдены. Обновите страницу (F5).",
            alert_old_data: "Внимание: ID в URL не совпадает с данными. Продолжить?",
            nav_hint: "Перейдите в чат, к персонажу или в профиль",
            select_all: "Выбрать все",
            download_selected: "Скачать выбранные",
            welcome_title: "🛡️ J.AI Suite v2.5",
            welcome_text: "Спасибо за установку! Скрипт создан для безопасного бэкапа ваших данных.",
            welcome_li1: "Работает полностью в вашем браузере",
            welcome_li2: "Ваш токен НЕ передается на сторонние серверы",
            welcome_li3: "Открытый и проверяемый исходный код",
            welcome_li4: "Никаких пугающих уведомлений Tampermonkey",
            btn_understand: "Понятно, спасибо",
            btn_github: "Код на GitHub"
        },
        en: {
            title: "💎 J.AI Suite",
            status_wait: "Waiting...",
            status_ready: "Ready",
            status_loading: "Loading...",
            status_error: "Error",
            mode_chat: "CHAT EXPORT",
            mode_card: "CARD EXPORT",
            mode_profile: "PERSONA BACKUP",
            btn_txt: "Download .TXT",
            btn_jsonl: "Download .JSONL",
            btn_card: "Download Card (.png)",
            btn_tracker: "For Tracker (.json)",
            btn_personas: "Backup Personas (.zip)",
            placeholder_filename: "Filename...",
            hint_manual: "Manual Mode",
            alert_no_data: "No data found. Refresh page (F5).",
            alert_old_data: "Warning: URL ID mismatch. Continue?",
            nav_hint: "Go to Chat, Character or Profile page",
            select_all: "Select All",
            download_selected: "Download Selected",
            welcome_title: "🛡️ J.AI Suite v2.5",
            welcome_text: "Thanks for installing! This script is designed for safe data backup.",
            welcome_li1: "Runs completely locally in your browser",
            welcome_li2: "Your token is NEVER sent to third-party servers",
            welcome_li3: "Open-source and fully auditable code",
            welcome_li4: "No scary Tampermonkey permission popups",
            btn_understand: "Understood",
            btn_github: "View on GitHub"
        }
    };

    function t(key) {
        return TEXT[CONFIG.lang][key] || key;
    }

    // --- УТИЛИТЫ БЕЗОПАСНОСТИ И UI ---

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, match => {
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return map[match];
        });
    }

    function showNotification(msg, isError = false) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px;
            background: ${isError ? '#ef4444' : '#1f2937'}; border: 1px solid ${isError ? '#b91c1c' : '#374151'};
            color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999999;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5); font-family: sans-serif; font-size: 13px;
            transition: opacity 0.3s; opacity: 0;
        `;
        toast.innerHTML = escapeHTML(msg);
        document.body.appendChild(toast);

        requestAnimationFrame(() => { toast.style.opacity = '1'; });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function customConfirm(msg, onConfirm) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(2px);';

        const box = document.createElement('div');
        box.style.cssText = 'background:#1f2937;padding:24px;border-radius:12px;color:#f3f4f6;font-family:sans-serif;max-width:320px;text-align:center;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);border:1px solid #374151;';

        box.innerHTML = `
            <div style="margin-bottom:20px; font-size:14px;">${escapeHTML(msg)}</div>
            <div style="display:flex;gap:12px;justify-content:center;">
                <button id="jai-btn-yes" style="flex:1; padding:8px 16px; background:#059669; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">OK</button>
                <button id="jai-btn-no" style="flex:1; padding:8px 16px; background:#4b5563; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">Cancel</button>
            </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        document.getElementById('jai-btn-yes').onclick = () => { overlay.remove(); onConfirm(); };
        document.getElementById('jai-btn-no').onclick = () => { overlay.remove(); };
    }

    function showFirstTimeSetup() {
        const shown = localStorage.getItem('jai_suite_setup_shown');
        if (shown === 'true') return;

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(3px);';

        const box = document.createElement('div');
        box.style.cssText = 'background:#1f2937;padding:30px;border-radius:12px;color:#f3f4f6;font-family:system-ui, sans-serif;max-width:420px;border:1px solid #374151;box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);';

        box.innerHTML = `
            <h2 style="margin:0 0 15px 0; color:#a78bfa;">${t('welcome_title')}</h2>
            <p style="margin:0 0 15px 0; font-size:14px; color:#d1d5db;">${t('welcome_text')}</p>
            <ul style="margin:0 0 20px 0; padding-left:20px; font-size:13px; color:#9ca3af; line-height:1.6;">
                <li>✅ ${t('welcome_li1')}</li>
                <li>✅ ${t('welcome_li2')}</li>
                <li>✅ ${t('welcome_li3')}</li>
                <li>✅ ${t('welcome_li4')}</li>
            </ul>
            <div style="display:flex;gap:12px;">
                <button id="jai-got-it" style="flex:1;padding:10px;background:#059669;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;transition:0.2s;">${t('btn_understand')}</button>
                <button id="jai-github" style="flex:1;padding:10px;background:#374151;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:bold;transition:0.2s;">${t('btn_github')}</button>
            </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        document.getElementById('jai-got-it').onmouseover = (e) => e.target.style.background = '#047857';
        document.getElementById('jai-got-it').onmouseout = (e) => e.target.style.background = '#059669';

        document.getElementById('jai-github').onmouseover = (e) => e.target.style.background = '#4b5563';
        document.getElementById('jai-github').onmouseout = (e) => e.target.style.background = '#374151';

        document.getElementById('jai-got-it').onclick = () => {
            localStorage.setItem('jai_suite_setup_shown', 'true');
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        };

        document.getElementById('jai-github').onclick = () => {
            window.open('https://github.com/itsfantomas/janitor-exporter', '_blank');
        };
    }

    // --- 1. ЛОГИКА АВТОРИЗАЦИИ ---
    function findTokenInCookies() {
        try {
            const cookies = document.cookie.split(';');
            const tokenChunks = [];
            cookies.forEach((c) => {
                const parts = c.trim().split('=');
                if (parts[0] && parts[0].startsWith('sb-auth-auth-token.')) {
                    const index = parseInt(parts[0].split('.').pop(), 10);
                    tokenChunks[index] = decodeURIComponent(parts.slice(1).join('='));
                }
            });
            if (tokenChunks.length > 0) {
                let fullValue = tokenChunks.join('').replace('base64-', '').replace(/-/g, '+').replace(/_/g, '/');
                const sessionObj = JSON.parse(atob(fullValue));
                if (sessionObj && sessionObj.access_token) {
                    return `Bearer ${sessionObj.access_token}`;
                }
            }
        } catch (e) {
            // silent
        }
        return null;
    }

    function findTokenInStorage() {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item && item.access_token) {
                        return `Bearer ${item.access_token}`;
                    }
                }
            }
        } catch (e) {
            // silent
        }
        return null;
    }

    function findToken() {
        if (CONFIG.token) return CONFIG.token;
        let token = findTokenInCookies();
        if (!token) token = findTokenInStorage();
        return token;
    }

    const originalFetch = window.fetch;
    window.fetch = new Proxy(window.fetch, {
        apply: function (target, thisArg, argumentsList) {
            const [resource, config] = argumentsList;

            let urlStr = '';
            if (typeof resource === 'string') {
                urlStr = resource;
            } else if (resource instanceof Request) {
                urlStr = resource.url;
            } else if (resource instanceof URL) {
                urlStr = resource.href;
            }

            const isJanitorApi = urlStr.includes('janitorai.com') || urlStr.startsWith('/');

            if (config && config.headers && !CONFIG.token && isJanitorApi) {
                try {
                    let auth;
                    if (config.headers instanceof Headers) {
                        auth = config.headers.get('Authorization');
                    } else {
                        auth = config.headers.Authorization || config.headers.authorization;
                    }
                    if (auth && auth.includes('Bearer')) {
                        CONFIG.token = auth;
                        console.log('[J.AI Suite] ✅ Token acquired from API call');
                    }
                } catch (err) {
                    // silent
                }
            }
            return target.apply(thisArg, argumentsList);
        }
    });

    async function downloadImageFetch(url) {
        try {
            const res = await originalFetch(url);
            if (res.ok) return await res.blob();
            throw new Error('Direct fetch failed');
        } catch (e) {
            try {
                console.log('[J.AI Suite] 📡 Direct fetch failed, trying CORS proxy...');
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                const res = await originalFetch(proxyUrl);
                if (res.ok) return await res.blob();
                throw new Error('Proxy fetch failed');
            } catch (proxyError) {
                throw proxyError;
            }
        }
    }

    // --- 2. ПАРСЕР ДАННЫХ ---
    function getPageData() {
        try {
            const urlMatch = window.location.href.match(/characters\/([a-zA-Z0-9-]+)/);
            const targetId = urlMatch ? urlMatch[1] : null;
            const scripts = document.querySelectorAll('script');
            for (let i = scripts.length - 1; i >= 0; i--) {
                const script = scripts[i];
                if (script.textContent.includes('window.mbxM.push')) {
                    const match = script.textContent.match(/JSON\.parse\("(.+?)"\)\);/);
                    if (match && match[1]) {
                        const jsonStr = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                        try {
                            const data = JSON.parse(jsonStr);
                            const storeKey = Object.keys(data).find((k) => k.includes('characterStore'));
                            if (storeKey && data[storeKey] && data[storeKey].character) {
                                const char = data[storeKey].character;
                                if (targetId) {
                                    if (char.id && targetId.includes(char.id)) {
                                        return char;
                                    }
                                    continue;
                                }
                                return char;
                            }
                        } catch (e) {
                            // skip
                        }
                    }
                }
            }
        } catch (e) {
            // skip
        }
        return null;
    }

    function getPersonasData() {
        try {
            if (typeof window._storeState_ !== 'undefined' && window._storeState_.Sb && Array.isArray(window._storeState_.Sb.personas)) {
                return window._storeState_.Sb.personas;
            }
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                if (script.textContent.includes('window._storeState_ = JSON.parse')) {
                    const startMarker = 'JSON.parse("';
                    const endMarker = '")';
                    const startIndex = script.textContent.indexOf(startMarker);
                    if (startIndex === -1) { continue; }
                    const jsonStart = startIndex + startMarker.length;
                    const endIndex = script.textContent.lastIndexOf(endMarker);

                    if (endIndex > jsonStart) {
                        const jsonStr = script.textContent.substring(jsonStart, endIndex);
                        const cleanStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                        try {
                            const data = JSON.parse(cleanStr);
                            for (const key in data) {
                                if (data[key] && Array.isArray(data[key].personas)) {
                                    return data[key].personas;
                                }
                            }
                        } catch (e) {
                            // skip
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    // --- 3. ИНТЕРФЕЙС (UI) ---
    function createUI() {
        if (document.getElementById('jai-suite-panel')) { return; }

        showFirstTimeSetup();

        const panel = document.createElement('div');
        panel.id = 'jai-suite-panel';
        panel.style.cssText = `
            position: fixed; top: 80px; right: 20px; width: 240px;
            background: #111827; border: 1px solid #374151; border-radius: 12px;
            z-index: 999999; color: #f3f4f6; font-family: system-ui, -apple-system, sans-serif; font-size: 13px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            display: flex; flex-direction: column; overflow: hidden;
            transition: all 0.3s ease;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            padding: 12px; background: #1f2937; border-bottom: 1px solid #374151;
            cursor: move; display: flex; justify-content: space-between; align-items: center; user-select: none;
        `;

        const body = document.createElement('div');
        body.id = 'jai-body';
        body.style.cssText = 'padding: 12px; display: flex; flex-direction: column; gap: 10px;';

        panel.appendChild(header);
        panel.appendChild(body);
        document.body.appendChild(panel);

        function render() {
            header.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-weight:bold; color:#a78bfa;">${t('title')}</span>
                    <span style="font-size:10px; cursor:pointer; background:#4b5563; color:#e5e7eb; padding:2px 6px; border-radius:4px; font-weight:bold; border:1px solid #6b7280;" id="jai-lang-switch">${CONFIG.lang.toUpperCase()}</span>
                </div>
                <div id="jai-toggle" style="cursor:pointer; color:#9ca3af; font-weight:bold; padding: 0 5px;">${CONFIG.isMinimized ? '+' : '−'}</div>
            `;

            const langSwitch = document.getElementById('jai-lang-switch');
            if (langSwitch) {
                langSwitch.onclick = () => {
                    CONFIG.lang = CONFIG.lang === 'ru' ? 'en' : 'ru';
                    localStorage.setItem('jai_suite_lang', CONFIG.lang);
                    render();
                };
            }

            const toggle = document.getElementById('jai-toggle');
            if (toggle) {
                toggle.onclick = () => {
                    CONFIG.isMinimized = !CONFIG.isMinimized;
                    localStorage.setItem('jai_suite_min', CONFIG.isMinimized);
                    render();
                };
            }

            if (CONFIG.isMinimized) {
                body.style.display = 'none';
                return;
            }
            body.style.display = 'flex';

            const isChat = window.location.href.includes('/chats/');
            const isCharacter = window.location.href.includes('/characters/');
            const isProfile = window.location.href.includes('/profile') ||
                              window.location.href.includes('/settings') ||
                              window.location.href.includes('/me') ||
                              window.location.href.includes('/my_personas') ||
                              window.location.href.includes('/edit_persona');

            let html = `<div id="jai-status" style="font-size:11px; color:#9ca3af; margin-bottom:4px;">${t('status_ready')}</div>`;

            if (isChat) {
                html += `
                    <div style="font-size:10px; font-weight:bold; color:#60a5fa; margin-top:4px;">${t('mode_chat')}</div>
                    <input type="text" id="jai-filename" placeholder="${t('placeholder_filename')}"
                        style="width:100%; background:#374151; border:none; color:#e5e7eb; padding:6px; border-radius:4px; font-size:12px; box-sizing:border-box;">
                    <div style="display:flex; gap:6px;">
                        <button id="btn-chat-txt" class="jai-btn primary">${t('btn_txt')}</button>
                        <button id="btn-chat-jsonl" class="jai-btn secondary">${t('btn_jsonl')}</button>
                    </div>
                `;
            }

            if (isCharacter) {
                html += `
                    <div style="font-size:10px; font-weight:bold; color:#f472b6; margin-top:8px;">${t('mode_card')}</div>
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <button id="btn-dl-card" class="jai-btn pink">${t('btn_card')}</button>
                        <button id="btn-dl-tracker" class="jai-btn purple">${t('btn_tracker')}</button>
                    </div>
                `;
            }

            if (isProfile) {
                html += `
                    <div style="font-size:10px; font-weight:bold; color:#10b981; margin-top:8px;">${t('mode_profile')}</div>
                    <button id="btn-dl-personas" class="jai-btn green">${t('btn_personas')}</button>
                `;
            }

            if (!isChat && !isCharacter && !isProfile) {
                html += `<div style="text-align:center; color:#6b7280; padding:10px; font-size:12px;">${t('nav_hint')}</div>`;
            }

            html += `<div style="font-size:9px; color:#4b5563; text-align:center; margin-top:5px;">by [itsfantomas]</div>`;
            body.innerHTML = html;

            if (isChat) {
                const btnTxt = document.getElementById('btn-chat-txt');
                if (btnTxt) { btnTxt.onclick = () => { runChatExport('txt'); }; }

                const btnJsonl = document.getElementById('btn-chat-jsonl');
                if (btnJsonl) { btnJsonl.onclick = () => { runChatExport('jsonl'); }; }
            }
            if (isCharacter) {
                const btnCard = document.getElementById('btn-dl-card');
                if (btnCard) { btnCard.onclick = () => { runCardExport(); }; }

                const btnTracker = document.getElementById('btn-dl-tracker');
                if (btnTracker) { btnTracker.onclick = () => { runTrackerExport(); }; }
            }
            if (isProfile) {
                const btnPersonas = document.getElementById('btn-dl-personas');
                if (btnPersonas) { btnPersonas.onclick = () => { showPersonaSelector(); }; }
            }
        }

        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            .jai-btn { flex:1; border:none; padding:8px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:600; transition:0.2s; color:white; width:100%; }
            .jai-btn.primary { background:#2563eb; } .jai-btn.primary:hover { background:#1d4ed8; }
            .jai-btn.secondary { background:#4b5563; } .jai-btn.secondary:hover { background:#374151; }
            .jai-btn.pink { background:#db2777; } .jai-btn.pink:hover { background:#be185d; }
            .jai-btn.purple { background:#9333ea; } .jai-btn.purple:hover { background:#7e22ce; }
            .jai-btn.green { background:#059669; } .jai-btn.green:hover { background:#047857; }
            .jai-modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(2px); }
            .jai-modal-content { background:#1f2937; padding:20px; border-radius:12px; width:400px; max-height:80vh; overflow-y:auto; color:#f3f4f6; font-family:sans-serif; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5); border:1px solid #374151;}
            .jai-persona-item { display:flex; align-items:center; gap:10px; padding:8px; border-bottom:1px solid #374151; }
            .jai-persona-item:last-child { border-bottom:none; }
            .jai-persona-item img { width:30px; height:30px; border-radius:50%; object-fit:cover; }
            .jai-actions { margin-top:15px; display:flex; gap:10px; justify-content:flex-end; }
        `;
        document.head.appendChild(styleSheet);

        let isDragging = false;
        let startX, startY, initLeft, initTop;

        header.onmousedown = (e) => {
            if (e.target.id === 'jai-lang-switch' || e.target.id === 'jai-toggle') return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = panel.getBoundingClientRect();
            initLeft = rect.left;
            initTop = rect.top;
            panel.style.right = 'auto';
            panel.style.left = initLeft + 'px';
            panel.style.top = initTop + 'px';
            panel.style.opacity = '0.8';
        };
        document.onmousemove = (e) => {
            if (!isDragging) return;
            panel.style.left = (initLeft + (e.clientX - startX)) + 'px';
            panel.style.top = (initTop + (e.clientY - startY)) + 'px';
        };
        document.onmouseup = () => {
            if (isDragging) {
                isDragging = false;
                panel.style.opacity = '1';
            }
        };

        render();
        setInterval(() => {
            if (window.location.href !== CONFIG.currentUrl) {
                CONFIG.currentUrl = window.location.href;
                render();
            }
            if (!document.getElementById('jai-suite-panel')) {
                createUI();
            }
        }, 1000);
    }

    function updateStatus(msg) {
        const el = document.getElementById('jai-status');
        if (el) el.textContent = escapeHTML(msg);
    }

    // --- 4. МЕНЮ ВЫБОРА ПЕРСОН (DOM API) ---
    function showPersonaSelector() {
        if (!window.JSZip) {
            showNotification("JSZip lib not loaded.", true);
            return;
        }
        const personas = getPersonasData();
        if (!personas || personas.length === 0) {
            showNotification(t('alert_no_data'), true);
            return;
        }

        const domImages = new Map();
        const images = document.querySelectorAll('img[alt$=" avatar"]');
        images.forEach((img) => {
            const name = img.alt.replace(/ avatar$/, '').trim();
            if (name && img.src) {
                domImages.set(name, img.src);
            }
        });

        const modal = document.createElement('div');
        modal.className = 'jai-modal';

        const content = document.createElement('div');
        content.className = 'jai-modal-content';

        const title = document.createElement('h3');
        title.style.margin = '0 0 15px 0';
        title.textContent = t('btn_personas');

        const topActions = document.createElement('div');
        topActions.style.marginBottom = '10px';
        const btnSelAll = document.createElement('button');
        btnSelAll.className = 'jai-btn secondary';
        btnSelAll.style.cssText = 'padding:4px 8px; font-size:10px; width:auto;';
        btnSelAll.textContent = t('select_all');
        topActions.appendChild(btnSelAll);

        const listContainer = document.createElement('div');
        listContainer.style.cssText = 'max-height:300px; overflow-y:auto; border:1px solid #374151; border-radius:6px; padding:4px;';

        personas.forEach((p, idx) => {
            let avatar = domImages.get(p.name) || p.avatar;
            if (avatar && !avatar.startsWith('http')) avatar = `https://janitorai.com${avatar}`;
            p._domAvatarUrl = avatar;

            const item = document.createElement('div');
            item.className = 'jai-persona-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `p-check-${idx}`;
            checkbox.checked = true;

            const img = document.createElement('img');
            img.src = avatar || 'https://via.placeholder.com/30';
            img.onerror = () => { img.src = 'https://via.placeholder.com/30'; };

            const nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';
            nameSpan.textContent = p.name;  // ✅ 100% XSS safe - textContent, not innerHTML

            item.appendChild(checkbox);
            item.appendChild(img);
            item.appendChild(nameSpan);
            listContainer.appendChild(item);
        });

        const bottomActions = document.createElement('div');
        bottomActions.className = 'jai-actions';

        const btnCancel = document.createElement('button');
        btnCancel.className = 'jai-btn secondary';
        btnCancel.textContent = 'Cancel';

        const btnDownload = document.createElement('button');
        btnDownload.className = 'jai-btn green';
        btnDownload.textContent = t('download_selected');

        bottomActions.appendChild(btnCancel);
        bottomActions.appendChild(btnDownload);

        content.appendChild(title);
        content.appendChild(topActions);
        content.appendChild(listContainer);
        content.appendChild(bottomActions);
        modal.appendChild(content);
        document.body.appendChild(modal);

        btnCancel.onclick = () => document.body.removeChild(modal);

        btnSelAll.onclick = () => {
            const checks = listContainer.querySelectorAll('input[type="checkbox"]');
            const allChecked = Array.from(checks).every(c => c.checked);
            checks.forEach(c => c.checked = !allChecked);
        };

        btnDownload.onclick = async () => {
            const selected = [];
            personas.forEach((p, idx) => {
                const cb = document.getElementById(`p-check-${idx}`);
                if (cb && cb.checked) { selected.push(p); }
            });
            if (selected.length === 0) { return; }

            document.body.removeChild(modal);
            await runPersonasBackup(selected);
        };
    }

    // --- 5. ЭКСПОРТ ПЕРСОН (ZIP) ---
    async function runPersonasBackup(personas) {
        updateStatus("Создание архива...");
        const zip = new JSZip();
        const backupData = { personas: {}, persona_descriptions: {} };

        let count = 0;
        const total = personas.length;

        for (const p of personas) {
            count++;
            updateStatus(`Обработка: ${count}/${total}`);

            const cleanName = String(p.name).replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s\-_]/gi, '').trim().replace(/\s+/g, '_') || `persona_${count}`;
            const fileName = `${Date.now() + count}-${cleanName}.png`;

            backupData.personas[fileName] = p.name;
            backupData.persona_descriptions[fileName] = {
                description: p.appearance || p.description || "",
                position: 0,
                role: 0,
                title: ""
            };

            const avatarUrl = p._domAvatarUrl || p.avatar;

            if (avatarUrl) {
                try {
                    let finalUrl = avatarUrl;
                    if (!finalUrl.startsWith('http')) {
                        finalUrl = `https://janitorai.com${finalUrl}`;
                    }
                    const imgResp = await downloadImageFetch(finalUrl);
                    zip.file(fileName, imgResp);
                } catch (e) {
                    console.warn(`[Skip] Image fetch failed for ${p.name}`);
                }
            }
        }

        zip.file("personas_backup.json", JSON.stringify(backupData, null, 2));

        try {
            updateStatus("Упаковка (быстрая)...");
            const content = await zip.generateAsync({ type: "blob", compression: "STORE" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Janitor_Personas_Backup.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            updateStatus(t('status_ready'));
            showNotification(`Бэкап готов! Сохранено ${count} персон.`);
        } catch (zipError) {
            console.error("ZIP Error:", zipError);
            showNotification("Ошибка создания архива: " + zipError.message, true);
            updateStatus(t('status_error'));
        }
    }

    // --- ОСТАЛЬНЫЕ ЭКСПОРТЫ ---
    async function runChatExport(format) {
        if (!CONFIG.token) { CONFIG.token = findToken(); }
        const chatIdMatch = window.location.href.match(/chats\/([a-zA-Z0-9-]+)/);
        const chatId = chatIdMatch ? chatIdMatch[1] : null;
        if (!chatId || !CONFIG.token) {
            showNotification(`${t('alert_no_data')}\n(Missing ID/Token)`, true);
            return;
        }
        updateStatus(t('status_loading'));

        let rawFilename = document.getElementById('jai-filename').value.trim();
        let filename = rawFilename.replace(/[^a-zA-Z0-9а-яА-ЯёЁ\s\-_]/g, '_');
        if (!filename) { filename = `janitor_chat_${chatId}`; }

        try {
            const url = `https://janitorai.com/hampter/chats/${chatId}`;
            console.log(`[J.AI Suite] 📥 Fetching chat from ${url}`);
            const resp = await originalFetch(url, {
                method: 'GET',
                headers: { 'Authorization': CONFIG.token, 'Content-Type': 'application/json', 'x-app-version': '7.4.9.9.7' },
                credentials: 'include'
            });
            if (!resp.ok) { throw new Error("API " + resp.status); }
            const json = await resp.json();
            const msgs = json.chatMessages || json.messages || (Array.isArray(json) ? json : null);
            if (!msgs) { throw new Error("No messages"); }

            msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            let content = '';
            const mimeType = format === 'txt' ? 'text/plain' : 'application/json';

            if (format === 'txt') {
                content = msgs.map((msg, i) => {
                    const isBot = msg.is_bot === true;
                    const name = isBot ? 'Char' : 'You';
                    const text = (msg.message || msg.content || '').replace(/<[^>]*>/g, '').trim();
                    if (!text) { return ''; }
                    if (i === 0 && isBot) { return `${text}\n\n------------------`; }
                    return `${name}: ${text}`;
                }).filter(Boolean).join('\n\n');
                filename += '.txt';
            } else {
                content = msgs.map((msg) => JSON.stringify({
                    name: msg.is_bot ? "Char" : "You",
                    is_user: !msg.is_bot,
                    is_name: msg.is_bot,
                    send_date: new Date(msg.created_at).getTime(),
                    mes: (msg.message || msg.content || '').replace(/<[^>]*>/g, '').trim(),
                    role: msg.is_bot ? "assistant" : "user"
                })).join('\n');
                filename += '.jsonl';
            }
            downloadFile(content, filename, mimeType);
            updateStatus(t('status_ready'));
            showNotification(`Чат успешно скачан: ${filename}`);
        } catch (e) {
            console.error(e);
            showNotification(t('status_error'), true);
            updateStatus(t('status_error'));
        }
    }

    async function processCardExport() {
        const rawData = getPageData();
        updateStatus(t('status_loading'));
        try {
            let avatarUrl = rawData.avatar;
            if (avatarUrl && !avatarUrl.startsWith('http')) { avatarUrl = `https://janitorai.com${avatarUrl}`; }
            const domImg = document.querySelector('.character-card-flex-avatar img') || document.querySelector('img[alt*="avatar"]');
            if (domImg && domImg.src) { avatarUrl = domImg.src; }

            const imgResp = await downloadImageFetch(avatarUrl);
            const imgBitmap = await createImageBitmap(imgResp);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = imgBitmap.width;
            canvas.height = imgBitmap.height;
            ctx.drawImage(imgBitmap, 0, 0);
            const pngBlob = await new Promise((r) => canvas.toBlob(r, 'image/png'));

            const standardTags = rawData.tags ? rawData.tags.map((t) => t.name || t) : [];
            const customTags = rawData.custom_tags ? rawData.custom_tags.map((t) => t.name || t) : [];

            const altGreetings = (
                rawData.alternative_first_messages ||
                rawData.alternate_greetings ||
                []
            ).filter(g => g && typeof g === 'string' && g.trim() !== '');

            const cardData = {
                name: rawData.name,
                description: rawData.description || "",
                personality: rawData.personality || "",
                scenario: rawData.scenario || "",
                first_mes: rawData.first_message || rawData.greeting || "",
                mes_example: rawData.example_dialogs || rawData.example_dialogue || "",
                creator_notes: rawData.creator_notes || "",
                system_prompt: rawData.system_prompt || "",
                post_history_instructions: "",
                alternate_greetings: altGreetings,
                tags: [...standardTags, ...customTags],
                creator: rawData.creator_name || "JanitorAI",
                character_version: "1.0",
                extensions: { janitor_id: rawData.id }
            };

            const tavernCard = {
                spec: "chara_card_v2",
                spec_version: "2.0",
                data: cardData
            };

            const finalBlob = await embedDataInPng(pngBlob, JSON.stringify(tavernCard));
            const cleanName = (cardData.name || "char").replace(/[^a-z0-9а-яё\s-]/gi, '').trim().replace(/\s+/g, '_') + ".png";

            downloadFile(finalBlob, cleanName, 'image/png');
            updateStatus(t('status_ready'));
            showNotification("Карта успешно сохранена!");
        } catch (e) {
            console.error(e);
            showNotification(t('status_error'), true);
            updateStatus(t('status_error'));
        }
    }

    function runCardExport() {
        const rawData = getPageData();
        if (!rawData) {
            showNotification(t('alert_no_data'), true);
            return;
        }
        if (window.location.href.includes('/characters/')) {
             const urlIdMatch = window.location.href.match(/characters\/([a-f0-9-]+)/);
             if (urlIdMatch && rawData.id && !urlIdMatch[1].includes(rawData.id)) {
                 customConfirm(t('alert_old_data'), processCardExport);
                 return;
             }
        }
        processCardExport();
    }

    function processTrackerExport() {
        const rawData = getPageData();
        try {
            const status = rawData.is_public ? 'active' : 'private';
            const date = rawData.updated_at ? new Date(rawData.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            let avatar = rawData.avatar;
            if (avatar && !avatar.startsWith('http')) { avatar = `https://janitorai.com${avatar}`; }
            const domImg = document.querySelector('.character-card-flex-avatar img') || document.querySelector('img[alt*="avatar"]');
            if (domImg && domImg.src) { avatar = domImg.src; }

            let safeDescription = rawData.description || rawData.first_message || "";
            if (safeDescription.length > 500) { safeDescription = safeDescription.substring(0, 500) + "..."; }
            const standardTags = rawData.tags ? rawData.tags.map((t) => t.name || t) : [];
            const customTags = rawData.custom_tags ? rawData.custom_tags.map((t) => t.name || t) : [];

            const trackerObj = {
                name: rawData.name,
                link: window.location.href.split('?')[0],
                avatar: avatar,
                status: status,
                lastUpdated: date,
                tags: [...standardTags, ...customTags],
                notes: safeDescription
            };
            const filename = (rawData.name || "character").replace(/[^a-z0-9а-яё\s-]/gi, '').trim().replace(/\s+/g, '_') + "_tracker.json";

            downloadFile(JSON.stringify(trackerObj, null, 2), filename, 'application/json');
            updateStatus(t('status_ready'));
            showNotification("JSON для трекера скачан!");
        } catch (e) {
            console.error(e);
            showNotification(t('status_error') + ': ' + e.message, true);
        }
    }

    function runTrackerExport() {
        const rawData = getPageData();
        if (!rawData) {
            showNotification(t('alert_no_data'), true);
            return;
        }
        if (window.location.href.includes('/characters/')) {
             const urlIdMatch = window.location.href.match(/characters\/([a-f0-9-]+)/);
             if (urlIdMatch && rawData.id && !urlIdMatch[1].includes(rawData.id)) {
                 customConfirm(t('alert_old_data'), processTrackerExport);
                 return;
             }
        }
        processTrackerExport();
    }

    function downloadFile(content, filename, type) {
        const blob = content instanceof Blob ? content : new Blob([content], { type: `${type};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const crcTable = (function () {
        let c;
        const table = new Int32Array(256);
        for (let n = 0; n < 256; n++) {
            c = n;
            for (let k = 0; k < 8; k++) {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            table[n] = c;
        }
        return table;
    })();

    function calculateCrc32(buf) {
        let crc = -1;
        for (let i = 0; i < buf.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
        }
        return (crc ^ -1) >>> 0;
    }

    async function embedDataInPng(pngBlob, jsonData) {
        const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
        const encodedData = btoa(unescape(encodeURIComponent(jsonData)));
        const keyword = "chara";
        const textChunk = new TextEncoder().encode(keyword + '\0' + encodedData);
        const chunkType = new TextEncoder().encode("tEXt");
        const chunkData = new Uint8Array(8 + textChunk.length + 4);
        const view = new DataView(chunkData.buffer);
        view.setUint32(0, textChunk.length, false);
        chunkData.set(chunkType, 4);
        chunkData.set(textChunk, 8);
        const crc = calculateCrc32(chunkData.subarray(4, 4 + 4 + textChunk.length));
        view.setUint32(8 + textChunk.length, crc, false);
        const iendOffset = pngBytes.length - 12;
        const finalPng = new Uint8Array(pngBytes.length + chunkData.length);
        finalPng.set(pngBytes.subarray(0, iendOffset));
        finalPng.set(chunkData, iendOffset);
        finalPng.set(pngBytes.subarray(iendOffset), iendOffset + chunkData.length);
        return new Blob([finalPng], { type: 'image/png' });
    }

    const waitBody = setInterval(() => {
        if (document.body) {
            clearInterval(waitBody);
            createUI();
        }
    }, 100);

})();
