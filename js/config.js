/**
 * E-Obra: Global Configuration
 * Handles environment-specific paths and settings
 */

const getBaseUrl = () => {
    const { protocol, host, pathname } = window.location;
    
    // Support for file:// protocol (opening files directly)
    if (protocol === 'file:') {
        const projectRoot = pathname.substring(0, pathname.lastIndexOf('/E-Obra/') + 8);
        return `${protocol}//${projectRoot}`;
    }

    // GitHub Pages logic: usually /repo-name/
    if (host.includes('github.io')) {
        const repoName = pathname.split('/')[1];
        return `${protocol}//${host}/${repoName}/`;
    }
    
    // Local dev or standard domain
    if (pathname.includes('/E-Obra/')) {
        return `${protocol}//${host}/E-Obra/`;
    }
    
    return `${protocol}//${host}/`;
};

const CONFIG = {
    BASE_URL: getBaseUrl(),
    DATA_PATH: 'data/',
    IS_GITHUB_PAGES: window.location.host.includes('github.io')
};

// Expose BASE_URL globally for legacy compatibility
window.BASE_URL = CONFIG.BASE_URL;
