document.addEventListener('DOMContentLoaded', () => {
    // === Генерация случайных ярких точек на фоне (3–7 штук) ===
    const dotsContainer = document.getElementById('bgDots');
    if (dotsContainer) {
        const count = Math.floor(Math.random() * 5) + 3; // 3..7
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

    setupToggle('projectsToggle', 'projectsContent');
    setupToggle('newsToggle', 'newsContent');

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
            } catch (err) {
                const textarea = document.createElement('textarea');
                textarea.value = ip;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                copyBtn.textContent = '✅';
                setTimeout(() => copyBtn.textContent = '📋', 1500);
            }
        });
    }

    // === НАСТРОЙКИ: тема и Liquid Glass с сохранением в localStorage ===
    const root = document.documentElement;
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    const glassToggle = document.getElementById('glassToggle');
    const themeButtons = document.querySelectorAll('.theme-option');

    const STORAGE_THEME = 'odeyalko_theme';
    const STORAGE_GLASS = 'odeyalko_glass';

    // Текущие значения
    function getTheme() {
        return localStorage.getItem(STORAGE_THEME) || 'dark';
    }
    function getGlass() {
        const v = localStorage.getItem(STORAGE_GLASS);
        return v === null ? 'on' : v;
    }

    // Применение темы
    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.themeValue === theme);
        });
    }

    // Применение стекла
    function applyGlass(state) {
        if (state === 'off') {
            root.classList.add('no-glass');
        } else {
            root.classList.remove('no-glass');
        }
        glassToggle.checked = state === 'on';
    }

    // Инициализация из сохранённых значений
    applyTheme(getTheme());
    applyGlass(getGlass());

    // Открытие/закрытие меню
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

    // Клик вне меню — закрыть
    document.addEventListener('click', (e) => {
        if (!settingsMenu.hidden &&
            !settingsMenu.contains(e.target) &&
            !settingsBtn.contains(e.target)) {
            closeMenu();
        }
    });

    // Esc — закрыть
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !settingsMenu.hidden) closeMenu();
    });

    // Переключатель Liquid Glass
    glassToggle.addEventListener('change', () => {
        const state = glassToggle.checked ? 'on' : 'off';
        localStorage.setItem(STORAGE_GLASS, state);
        applyGlass(state);
    });

    // Переключатель темы
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.themeValue;
            localStorage.setItem(STORAGE_THEME, theme);
            applyTheme(theme);
        });
    });
});