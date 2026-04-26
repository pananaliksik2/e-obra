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

// Global UI Initialization
document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    
    if (headerPlaceholder) loadComponent('header-placeholder', 'includes/header.html');
    if (footerPlaceholder) loadComponent('footer-placeholder', 'includes/footer.html');
});
