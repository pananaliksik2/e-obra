/**
 * E-Obra: UI Manager
 * Handles dynamic loading of header, footer, and navigation states
 */

async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(window.BASE_URL + componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        updateNavLinks();
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

function updateNavLinks() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.neu-nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.replace('../', ''))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Brand link logic
    const brandLink = document.getElementById('brand-home');
    if (brandLink && (currentPath.includes('dashboard.html') || currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
        brandLink.classList.add('active');
    }
}

// Global UI Persistence
const Persistence = {
    save: (key, value) => {
        const page = window.location.pathname.split('/').filter(Boolean).pop() || 'index';
        const storageKey = `eobra_${page}_${key}`;
        localStorage.setItem(storageKey, JSON.stringify(value));
    },
    load: (key) => {
        const page = window.location.pathname.split('/').filter(Boolean).pop() || 'index';
        const storageKey = `eobra_${page}_${key}`;
        const data = localStorage.getItem(storageKey);
        try { return data ? JSON.parse(data) : null; } catch (e) { return null; }
    },
    initAutoSave: (selectors) => {
        selectors.forEach(selector => {
            const el = document.querySelector(selector);
            if (!el) return;

            // Restore
            const savedValue = Persistence.load(selector);
            if (savedValue !== null) {
                if (el.type === 'checkbox' || el.type === 'radio') {
                    el.checked = savedValue;
                } else {
                    el.value = savedValue;
                    // Trigger input event to fire any listeners
                    el.dispatchEvent(new Event('input'));
                }
            }

            // Save on change
            el.addEventListener('input', () => {
                const val = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value;
                Persistence.save(selector, val);
            });
        });
    },
    initScrollPersistence: () => {
        const savedScroll = Persistence.load('scroll_pos');
        if (savedScroll) {
            setTimeout(() => window.scrollTo(0, savedScroll), 100);
        }

        window.addEventListener('scroll', () => {
            // Use debounce for performance
            clearTimeout(window.scrollTimeout);
            window.scrollTimeout = setTimeout(() => {
                Persistence.save('scroll_pos', window.scrollY);
            }, 500);
        });
    }
};

// Global UI Initialization
document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) loadComponent('header-placeholder', 'includes/header.html');
    if (footerPlaceholder) loadComponent('footer-placeholder', 'includes/footer.html');

    // Initialize Global Persistence
    Persistence.initScrollPersistence();

    // Auto-save search inputs across all pages
    Persistence.initAutoSave(['#chapter-search', '.filter-input']);

    // Global Background Interactions
    document.addEventListener('mousemove', (e) => {
        const glow = document.getElementById('soft-glow');
        if (glow) {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        }

        const floatItems = document.querySelectorAll('.float-item');
        if (floatItems.length > 0) {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

            floatItems.forEach((item, index) => {
                const speed = (index + 1) * 0.5;
                item.style.setProperty('--tx', `${moveX * speed}px`);
                item.style.setProperty('--ty', `${moveY * speed}px`);
            });
        }
    });
    // Researchers Pop-up Logic
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#researchers-btn');
        const existing = document.getElementById('researchers-popup');

        if (btn) {
            e.preventDefault();
            if (existing) {
                existing.remove();
            } else {
                showResearchersPopup(btn);
            }
        } else if (existing && !e.target.closest('#researchers-popup')) {
            existing.remove();
        }
    });

    function showResearchersPopup(btn) {
        const rect = btn.getBoundingClientRect();
        const isMobile = window.innerWidth < 992;

        if (isMobile) {
            const popupHtml = `
                <div id="researchers-popup" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1060; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                    <div class="neu-card p-4 shadow-lg animate-fade-in" style="width: 90%; max-width: 300px; border: 2px solid rgba(128, 0, 0, 0.2); pointer-events: auto;">
                        <div class="text-center">
                            <h6 class="title-font text-maroon mb-2" style="font-size: 1rem;">Mga Mananaliksik</h6>
                            <div class="neu-divider-sm mx-auto mb-2" style="height: 1px;"></div>
                            <div class="researchers-list text-start ps-2" style="font-family: 'Cormorant Garamond', serif; font-size: 0.95rem; line-height: 1.6; color: #444;">
                                Abong, Shanel Kate A.<br>
                                Delante, Rona G.<br>
                                Flor, Aicha Mae L.<br>
                                Hulleza, Nadine D.<br>
                                Santiago, Daniela T.
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', popupHtml);
        } else {
            const popupHtml = `
                <div id="researchers-popup" class="fade-in neu-card p-4 shadow-lg" style="position: fixed; top: ${rect.bottom + 10}px; left: ${rect.left - 50}px; width: 250px; z-index: 1060; border: 2px solid rgba(128, 0, 0, 0.2);">
                    <div class="text-center">
                        <h6 class="title-font text-maroon mb-2" style="font-size: 0.9rem;">Mga Mananaliksik</h6>
                        <div class="neu-divider-sm mx-auto mb-2" style="height: 1px;"></div>
                        <div class="researchers-list text-start ps-2" style="font-family: 'Cormorant Garamond', serif; font-size: 0.95rem; line-height: 1.6; color: #444;">
                            Abong, Shanel Kate A.<br>
                            Delante, Rona G.<br>
                            Flor, Aicha Mae L.<br>
                            Hulleza, Nadine D.<br>
                            Santiago, Daniela T.
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', popupHtml);
        }
    }
});
