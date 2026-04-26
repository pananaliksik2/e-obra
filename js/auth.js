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

// Monitor session (Removed MySQL session check for static site)
function startSessionMonitor() {
    // Not needed for static site
}

function stopSessionMonitor() {
    // Not needed for static site
}

// Global Auth Listener
auth.onAuthStateChanged((user) => {
    const path = window.location.pathname;
    // Check if we are on the landing page (root index.html)
    const isLoginPage = path.endsWith('/E-Obra/') || path.endsWith('/index.html') || path === '/' || path.endsWith('/E-Obra/index.html');
    
    if (user) {
        console.log("User is authenticated:", user.email);
        
        // Update Profile Info in UI
        const updateProfileUI = () => {
            const nameEl = document.getElementById('user-name-nav');
            const photoEl = document.getElementById('user-photo-nav');
            const welcomeNameEl = document.getElementById('user-display-name');

            if (nameEl) {
                nameEl.innerText = user.displayName;
                nameEl.classList.remove('d-none');
            }
            if (photoEl && user.photoURL) {
                photoEl.src = user.photoURL;
                photoEl.style.display = 'block';
                photoEl.classList.remove('d-none');
            }
            if (welcomeNameEl) {
                welcomeNameEl.innerText = user.displayName.split(' ')[0];
            }

            if (!nameEl || !photoEl) {
                setTimeout(updateProfileUI, 500);
            }
        };
        updateProfileUI();

        if (isLoginPage) {
            window.location.href = window.BASE_URL + 'dashboard/';
        }
    } else {
        console.log("User is not authenticated");
        if (!isLoginPage) {
            window.location.href = window.BASE_URL;
        }
    }
});

// Force auth check on back-button navigation
window.addEventListener('pageshow', (event) => {
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        // Force refresh or re-check auth
        firebase.auth().onAuthStateChanged((user) => {
            if (!user && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
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
