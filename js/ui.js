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
        try { return data ? JSON.parse(data) : null; } catch(e) { return null; }
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
});
