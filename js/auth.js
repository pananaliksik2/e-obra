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
let sessionRef = null;

auth.onAuthStateChanged((user) => {
    // Normalize paths for comparison
    const normalizePath = (p) => p.replace(/\/+$/, '').toLowerCase() || '/';
    const currentPath = normalizePath(window.location.pathname);
    const baseUrlPath = normalizePath(new URL(window.BASE_URL).pathname);
    const isLoginPage = currentPath === baseUrlPath || 
                        currentPath === normalizePath(baseUrlPath + '/index.html');
    
    console.log("Auth State Changed. User:", user ? user.email : "None");

    if (user) {
        // --- START SINGLE SESSION MONITOR ---
        const localSessionId = localStorage.getItem('eobra_session_id');
        
        // Clean up previous listener if any
        if (sessionRef) {
            sessionRef.off();
        }

        sessionRef = firebase.database().ref('sessions/' + user.uid);
        sessionRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && data.session_id) {
                // If we don't have a local session ID (e.g. first time after update), sync it
                if (!localStorage.getItem('eobra_session_id')) {
                    localStorage.setItem('eobra_session_id', data.session_id);
                    return;
                }

                // If local session ID doesn't match DB, it means a newer login happened elsewhere
                if (data.session_id !== localStorage.getItem('eobra_session_id')) {
                    console.warn("New login detected on another device. Logging out...");
                    alert("May nag-login sa iyong account gamit ang ibang device. Ikaw ay awtomatikong ila-log out para sa iyong seguridad.");
                    auth.signOut().then(() => {
                        localStorage.removeItem('eobra_session_id');
                        window.location.href = window.BASE_URL;
                    });
                }
            }
        });
        // --- END SINGLE SESSION MONITOR ---

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
            window.location.href = window.BASE_URL + 'dashboard/';
        }
    } else {
        if (sessionRef) {
            sessionRef.off();
            sessionRef = null;
        }
        localStorage.removeItem('eobra_session_id');

        if (!isLoginPage) {
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
