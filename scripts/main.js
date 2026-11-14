document.addEventListener('DOMContentLoaded', () => {
    // === Генерация случайных ярких точек на фоне (3–7 штук) ===
    const dotsContainer = document.getElementById('bgDots');
    if (dotsContainer) {
        const count = Math.floor(Math.random() * 5) + 3;
        const colors = [
            'rgba(255, 179, 71, 0.9)',
            'rgba(255, 107, 157, 0.9)',
            'rgba(107, 179, 255, 0.9)',
            'rgba(180, 107, 255, 0.9)',
            'rgba(255, 230, 107, 0.9)'
        ];

        for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.className = 'bg-dot';
            const top = 5 + Math.random() * 90;
            const left = 5 + Math.random() * 90;
            const size = 180 + Math.random() * 180;
            const color = colors[Math.floor(Math.random() * colors.length)];
            dot.style.top = top + '%';
            dot.style.left = left + '%';
            dot.style.width = size + 'px';
            dot.style.height = size + 'px';
            dot.style.background = `radial-gradient(circle, ${color}, transparent 70%)`;
            dotsContainer.appendChild(dot);
        }
    }

    // === СОРТИРОВКА НОВОСТЕЙ ПО ДАТЕ (новые сверху) ===
    (function sortNewsByDate() {
        const newsList = document.getElementById('newsList');
        if (!newsList) return;

        const items = Array.from(newsList.querySelectorAll('.news-item'));
        if (items.length < 2) return;

        function parseNewsDate(item) {
            const timeEl = item.querySelector('.news-time');
            if (!timeEl) return 0;

            const text = timeEl.textContent.trim();
            const match = text.match(/(\d{1,2}):(\d{2})\s+(\d{1,2})\.(\d{1,2})\.(\d{4})/);
            if (!match) return 0;

            const [, hh, mm, dd, mo, yyyy] = match;
            return new Date(
                parseInt(yyyy, 10),
                parseInt(mo, 10) - 1,
                parseInt(dd, 10),
                parseInt(hh, 10),
                parseInt(mm, 10)
            ).getTime();
        }

        items.sort((a, b) => parseNewsDate(b) - parseNewsDate(a));
        items.forEach(item => newsList.appendChild(item));
    })();

    // === Универсальная функция для сворачиваемых секций ===
    function setupToggle(buttonId, contentId) {
        const toggleBtn = document.getElementById(buttonId);
        const content = document.getElementById(contentId);
        if (!toggleBtn || !content) return;

        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
            content.classList.toggle('collapsed', isExpanded);
        });
    }

    setupToggle('newsToggle', 'newsContent');
    setupToggle('projectsToggle', 'projectsContent');
    setupToggle('serverToggle', 'serverContent');

    // === Тост «Скопировано» с таймером ===
    const toast = document.getElementById('copyToast');
    const toastTimer = document.getElementById('copyToastTimer');
    const TOAST_DURATION = 4;
    let toastInterval = null;
    let toastTimeout = null;

    function showCopyToast() {
        if (!toast || !toastTimer) return;

        if (toastInterval) clearInterval(toastInterval);
        if (toastTimeout) clearTimeout(toastTimeout);

        let secondsLeft = TOAST_DURATION;
        toastTimer.textContent = secondsLeft;
        toast.classList.add('visible');

        toastInterval = setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft > 0) {
                toastTimer.textContent = secondsLeft;
            }
        }, 1000);

        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
            clearInterval(toastInterval);
            toastInterval = null;
            toastTimeout = null;
        }, TOAST_DURATION * 1000);
    }

    // === Копирование IP сервера ===
    const copyBtn = document.getElementById('copyIpBtn');
    const serverIp = document.getElementById('serverIp');

    if (copyBtn && serverIp) {
        copyBtn.addEventListener('click', async () => {
            const ip = serverIp.textContent.trim();
            try {
                await navigator.clipboard.writeText(ip);
                copyBtn.textContent = '✅';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.textContent = '📋';
                    copyBtn.classList.remove('copied');
                }, 1500);
                showCopyToast();
            } catch (err) {
                const textarea = document.createElement('textarea');
                textarea.value = ip;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                copyBtn.textContent = '✅';
                setTimeout(() => copyBtn.textContent = '📋', 1500);
                showCopyToast();
            }
        });
    }

    // === НАСТРОЙКИ ===
    const root = document.documentElement;
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    const settingsCloseBtn = document.getElementById('settingsCloseBtn');
    const glassToggle = document.getElementById('glassToggle');
    const shadowsToggle = document.getElementById('shadowsToggle');
    const themeButtons = document.querySelectorAll('.theme-option');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');

    const STORAGE_THEME = 'odeyalko_theme';
    const STORAGE_GLASS = 'odeyalko_glass';
    const STORAGE_SHADOWS = 'odeyalko_shadows';
    const DEFAULT_THEME = 'dark';
    const DEFAULT_GLASS = 'on';
    const DEFAULT_SHADOWS = 'on';

    function getTheme() {
        return localStorage.getItem(STORAGE_THEME) || DEFAULT_THEME;
    }
    function getGlass() {
        const v = localStorage.getItem(STORAGE_GLASS);
        return v === null ? DEFAULT_GLASS : v;
    }
    function getShadows() {
        const v = localStorage.getItem(STORAGE_SHADOWS);
        return v === null ? DEFAULT_SHADOWS : v;
    }

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.themeValue === theme);
        });

        const isBase = theme === 'base';
        glassToggle.disabled = isBase;
        shadowsToggle.disabled = isBase;

        if (isBase) {
            root.classList.add('no-glass', 'no-shadows');
        } else {
            if (getGlass() === 'off') {
                root.classList.add('no-glass');
            } else {
                root.classList.remove('no-glass');
            }
            if (getShadows() === 'off') {
                root.classList.add('no-shadows');
            } else {
                root.classList.remove('no-shadows');
            }
        }
    }

    function applyGlass(state) {
        if (state === 'off') {
            root.classList.add('no-glass');
        } else {
            root.classList.remove('no-glass');
        }
        glassToggle.checked = state === 'on';
    }

    function applyShadows(state) {
        if (state === 'off') {
            root.classList.add('no-shadows');
        } else {
            root.classList.remove('no-shadows');
        }
        shadowsToggle.checked = state === 'on';
    }

    // Инициализация
    glassToggle.checked = getGlass() === 'on';
    shadowsToggle.checked = getShadows() === 'on';
    applyTheme(getTheme());
    applyGlass(getGlass());
    applyShadows(getShadows());
    applyTheme(getTheme());

    // Открытие/закрытие меню настроек
    function closeMenu() {
        settingsMenu.hidden = true;
        settingsBtn.setAttribute('aria-expanded', 'false');
    }
    function openMenu() {
        settingsMenu.hidden = false;
        settingsBtn.setAttribute('aria-expanded', 'true');
    }

    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (settingsMenu.hidden) openMenu();
        else closeMenu();
    });

    settingsCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
    });

    document.addEventListener('click', (e) => {
        if (!settingsMenu.hidden &&
            !settingsMenu.contains(e.target) &&
            !settingsBtn.contains(e.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !settingsMenu.hidden) closeMenu();
    });

    glassToggle.addEventListener('change', () => {
        const state = glassToggle.checked ? 'on' : 'off';
        localStorage.setItem(STORAGE_GLASS, state);
        applyGlass(state);
    });

    shadowsToggle.addEventListener('change', () => {
        const state = shadowsToggle.checked ? 'on' : 'off';
        localStorage.setItem(STORAGE_SHADOWS, state);
        applyShadows(state);
    });

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.themeValue;
            localStorage.setItem(STORAGE_THEME, theme);
            applyTheme(theme);
        });
    });

    resetSettingsBtn.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_THEME);
        localStorage.removeItem(STORAGE_GLASS);
        localStorage.removeItem(STORAGE_SHADOWS);
        glassToggle.checked = DEFAULT_GLASS === 'on';
        shadowsToggle.checked = DEFAULT_SHADOWS === 'on';
        applyTheme(DEFAULT_THEME);
        applyGlass(DEFAULT_GLASS);
        applyShadows(DEFAULT_SHADOWS);
    });

    // === СЕКРЕТНОЕ МЕНЮ РАЗРАБОТЧИКА (5 кликов по логотипу) ===
    const logoSecret = document.getElementById('logoSecret');
    const devOverlay = document.getElementById('devOverlay');
    const devCloseBtn = document.getElementById('devCloseBtn');
    const devCloseBtn2 = document.getElementById('devCloseBtn2');
    const devNewsCount = document.getElementById('devNewsCount');
    const devProjectsCount = document.getElementById('devProjectsCount');

    let logoClickCount = 0;
    let firstClickTime = 0;
    const LOGO_CLICK_WINDOW = 2000;

    if (logoSecret) {
        logoSecret.addEventListener('click', () => {
            const now = Date.now();

            if (logoClickCount === 0 || (now - firstClickTime > LOGO_CLICK_WINDOW)) {
                logoClickCount = 1;
                firstClickTime = now;
                return;
            }

            logoClickCount++;

            if (logoClickCount >= 5) {
                logoClickCount = 0;
                firstClickTime = 0;
                openDevMenu();
            }
        });
    }

    function openDevMenu() {
        if (!devOverlay) return;

        const newsItems = document.querySelectorAll('#newsList .news-item').length;
        const projectItems = document.querySelectorAll('#projectsList .project-item').length;

        if (devNewsCount) devNewsCount.textContent = newsItems;
        if (devProjectsCount) devProjectsCount.textContent = projectItems;

        devOverlay.hidden = false;
    }

    function closeDevMenu() {
        if (devOverlay) devOverlay.hidden = true;
    }

    // ВЫНОСИМ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ВИДИМОСТИ ДЛЯ КОНСОЛИ
    window.openDevMenu = openDevMenu;
    window.closeDevMenu = closeDevMenu;

    if (devCloseBtn) devCloseBtn.addEventListener('click', closeDevMenu);
    if (devCloseBtn2) devCloseBtn2.addEventListener('click', closeDevMenu);

    if (devOverlay) {
        devOverlay.addEventListener('click', (e) => {
            if (e.target === devOverlay) closeDevMenu();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && devOverlay && !devOverlay.hidden) closeDevMenu();
    });
});