document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            auth.signInWithPopup(provider)
                .then((result) => {
                    console.log("Login successful");
                })
                .catch((error) => {
                    console.error("Login failed:", error);
                    if (error.code !== 'auth/cancelled-popup-request') {
                        auth.signInWithRedirect(provider);
                    }
                });
        });
    }
});
