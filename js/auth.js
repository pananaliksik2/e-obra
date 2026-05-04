// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBAiZpz5w0-kwRN-NnERdSSWX2x5HMf5-Q",
    authDomain: "e-obra-32b9d.firebaseapp.com",
    projectId: "e-obra-32b9d",
    storageBucket: "e-obra-32b9d.firebasestorage.app",
    messagingSenderId: "776500024564",
    appId: "1:776500024564:web:ccdde8fa5502a5d636baa1",
    measurementId: "G-L73MH145QD"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

/**
 * Detects if the site is being viewed inside an in-app browser (WebView)
 * common in Facebook, Messenger, Instagram, etc.
 */
function isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isFacebook = (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
    const isInstagram = (ua.indexOf("Instagram") > -1);
    const isMessenger = (ua.indexOf("Messenger") > -1);
    return isFacebook || isInstagram || isMessenger;
}

/**
 * Shows a premium warning for in-app browsers
 */
function showInAppWarning() {
    const warningId = 'in-app-browser-warning';
    if (document.getElementById(warningId)) return;

    const warningDiv = document.createElement('div');
    warningDiv.id = warningId;
    warningDiv.innerHTML = `
        <div style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; width: 90%; max-width: 400px;">
            <div class="neu-card p-3 shadow-lg fade-in" style="background: white; border-left: 5px solid #800000;">
                <div class="d-flex align-items-start gap-3">
                    <div class="text-maroon"><i class="bi bi-exclamation-triangle-fill fs-4"></i></div>
                    <div>
                        <h6 class="mb-1 fw-bold text-maroon">Limitasyon sa Messenger</h6>
                        <p class="small mb-2 text-muted">Ang Google Login ay madalas na hinarang sa loob ng Messenger/Facebook. Inirerekomenda na buksan ito sa Safari o Chrome.</p>
                        <div class="d-flex gap-2">
                            <button onclick="this.closest('#in-app-browser-warning').remove()" class="btn btn-sm btn-outline-secondary">Naintindihan</button>
                            <button onclick="handleGoogleLogin()" class="btn btn-sm btn-maroon text-white">Subukan Pa Rin</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(warningDiv);
}

/**
 * Centralized Google Login handler with environment checks
 */
async function handleGoogleLogin() {
    // If we are in-app and haven't shown a warning yet, show it
    if (isInAppBrowser() && !document.getElementById('in-app-browser-warning')) {
        showInAppWarning();
        return;
    }

    // Remove warning if it exists
    const warning = document.getElementById('in-app-browser-warning');
    if (warning) warning.remove();

    try {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile || isInAppBrowser()) {
            await auth.signInWithRedirect(provider);
        } else {
            const result = await auth.signInWithPopup(provider);
            if (result.user) {
                window.location.href = window.BASE_URL + 'dashboard/';
            }
        }
    } catch (error) {
        console.error("Login Error:", error);
        if (error.code === 'auth/disallowed-useragent' || error.message.includes('disallowed_useragent')) {
            alert("Blocked ng Google: Hindi pinapayagan ang pag-login sa browser na ito.\n\nPAANO AYUSIN:\n1. I-click ang '...' sa itaas.\n2. Piliin ang 'Open in Safari' o 'Open in Chrome'.");
        } else {
            alert("Nagkaroon ng error sa pag-login: " + error.message);
        }
    }
}

// Monitor session (Removed MySQL session check for static site)
function startSessionMonitor() {
    // Not needed for static site
}

function stopSessionMonitor() {
    // Not needed for static site
}

// Global Auth Listener
auth.onAuthStateChanged((user) => {
    // Normalize paths for comparison (remove trailing slashes and lowercase)
    const normalizePath = (p) => p.replace(/\/+$/, '').toLowerCase() || '/';
    
    const currentPath = normalizePath(window.location.pathname);
    const baseUrlPath = normalizePath(new URL(window.BASE_URL).pathname);
    
    // The landing page is the base URL path or the base URL path + index.html
    const isLoginPage = currentPath === baseUrlPath || 
                        currentPath === normalizePath(baseUrlPath + '/index.html');
    
    console.log("Auth State Changed. User:", user ? user.email : "None");
    console.log("Path:", currentPath, "Base:", baseUrlPath, "isLoginPage:", isLoginPage);

    if (user) {
        // Update Profile Info in UI
        const updateProfileUI = () => {
            const nameEl = document.getElementById('user-name-nav');
            const photoEl = document.getElementById('user-photo-nav');
            const welcomeNameEl = document.getElementById('user-display-name');

            if (nameEl) nameEl.innerText = user.displayName;
            if (photoEl && user.photoURL) {
                photoEl.src = user.photoURL;
                photoEl.style.display = 'block';
            }
            if (welcomeNameEl) welcomeNameEl.innerText = user.displayName.split(' ')[0];

            if (!nameEl || !photoEl) setTimeout(updateProfileUI, 500);
        };
        updateProfileUI();

        if (isLoginPage) {
            console.log("Redirecting to dashboard...");
            window.location.href = window.BASE_URL + 'dashboard/';
        }
    } else {
        if (!isLoginPage) {
            console.log("Protected page detected, redirecting to home...");
            window.location.href = window.BASE_URL;
        }
    }
});

// Force auth check on back-button navigation
window.addEventListener('pageshow', (event) => {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        firebase.auth().onAuthStateChanged((user) => {
            const normalizePath = (p) => p.replace(/\/+$/, '').toLowerCase() || '/';
            const currentPath = normalizePath(window.location.pathname);
            const baseUrlPath = normalizePath(new URL(window.BASE_URL).pathname);
            const isOnLoginPage = currentPath === baseUrlPath || currentPath === normalizePath(baseUrlPath + '/index.html');
            
            if (!user && !isOnLoginPage) {
                window.location.href = window.BASE_URL;
            }
        });
    }
});

// Add Logout Button Listener
document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('#logout-btn');
    if (logoutBtn) {
        e.preventDefault();
        auth.signOut().then(() => {
            // Clear history state to prevent back button access
            window.history.replaceState(null, null, window.BASE_URL);
            window.location.href = window.BASE_URL;
        }).catch((error) => {
            console.error("Sign out error:", error);
        });
    }
});
