/**
 * E-Obra Firebase Authentication (Login Page)
 * ============================================================
 * Handles Google Sign-In via Firebase, then sends user data
 * to PHP backend for MySQL verification/registration.
 * ============================================================
 */

(function () {
    'use strict';

    // DOM Elements
    const loadingScreen = document.getElementById('loadingScreen');
    const loginPage = document.getElementById('loginPage');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const loginStatus = document.getElementById('loginStatus');
    const loginParticles = document.getElementById('loginParticles');

    // =============================================
    // Utility Functions
    // =============================================

    function showStatus(message, type) {
        loginStatus.textContent = message;
        loginStatus.className = 'login-status ' + type;
    }

    function showLoadingStatus(message) {
        loginStatus.innerHTML = `<div class="loading-spinner" style="width:18px;height:18px;border-width:2px;"></div> ${message}`;
        loginStatus.className = 'login-status loading';
    }

    function hideLoading() {
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
                loadingScreen.style.display = 'none';
                showLoginPage();
            }
        });
    }

    function showLoginPage() {
        loginPage.style.display = 'flex';
        
        // GSAP entrance animations
        const tl = gsap.timeline();
        
        tl.from('.login-emblem', {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.7)'
        })
        .from('.login-title', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.3')
        .from('.login-subtitle', {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.out'
        }, '-=0.3')
        .from('.login-tagline', {
            opacity: 0,
            duration: 0.4,
        }, '-=0.2')
        .from('.divider', {
            scaleX: 0,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.2')
        .from('.login-card', {
            y: 40,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, '-=0.3')
        .from('.login-footer', {
            opacity: 0,
            duration: 0.4,
        }, '-=0.2');
    }

    // =============================================
    // Create Floating Particles
    // =============================================

    function createParticles() {
        if (!loginParticles) return;
        
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (6 + Math.random() * 6) + 's';
            particle.style.width = (2 + Math.random() * 4) + 'px';
            particle.style.height = particle.style.width;
            particle.style.opacity = (0.2 + Math.random() * 0.4);
            loginParticles.appendChild(particle);
        }
    }

    // =============================================
    // Firebase to MySQL Auth Flow
    // =============================================

    async function handleGoogleSignIn() {
        googleSignInBtn.disabled = true;
        showLoadingStatus('Kumokonekta sa Google...');

        try {
            // Step 1: Firebase Google Sign-In
            const result = await auth.signInWithPopup(googleProvider);
            const user = result.user;

            // Extract user info
            const displayName = user.displayName || '';
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || 'User';
            const lastName = nameParts.slice(1).join(' ') || '';
            const firebaseUid = user.uid;

            showLoadingStatus('Sinusuri ang iyong account...');

            // Step 2: Send to PHP backend
            const response = await fetch(`${API_BASE}/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firebase_uid: firebaseUid,
                    first_name: firstName,
                    last_name: lastName
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Store user data in sessionStorage
                sessionStorage.setItem('eobra_user', JSON.stringify({
                    user_id: data.user.user_id,
                    first_name: data.user.first_name,
                    last_name: data.user.last_name,
                    photo_url: user.photoURL || '',
                    email: user.email || ''
                }));

                const actionMsg = data.action === 'register'
                    ? `Maligayang pagdating, ${firstName}! Matagumpay na naisagawa ang pagpaparehistro.`
                    : `Maligayang pagbabalik, ${firstName}!`;

                showStatus(actionMsg, 'success');

                // Redirect after a short delay
                gsap.to('.login-container', {
                    opacity: 0,
                    y: -20,
                    duration: 0.5,
                    delay: 1,
                    ease: 'power2.in',
                    onComplete: () => {
                        window.location.href = 'dashboard.html';
                    }
                });
            } else {
                throw new Error(data.message || 'Hindi makilalang error.');
            }

        } catch (error) {
            console.error('Auth Error:', error);
            
            if (error.code === 'auth/popup-closed-by-user') {
                showStatus('Isinara mo ang login window. Subukan muli.', 'error');
            } else if (error.code === 'auth/network-request-failed') {
                showStatus('Walang koneksyon sa internet. Pakisuri ang iyong network.', 'error');
            } else {
                showStatus(error.message || 'May naganap na error. Pakisubukan muli.', 'error');
            }

            googleSignInBtn.disabled = false;
        }
    }

    // =============================================
    // Auth State Observer
    // =============================================

    function initAuthObserver() {
        auth.onAuthStateChanged((user) => {
            if (user && sessionStorage.getItem('eobra_user')) {
                // Already logged in — redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Not logged in — show login page
                hideLoading();
            }
        });
    }

    // =============================================
    // Event Listeners
    // =============================================

    googleSignInBtn.addEventListener('click', handleGoogleSignIn);

    // =============================================
    // Initialize
    // =============================================

    createParticles();
    initAuthObserver();

})();
