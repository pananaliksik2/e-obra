document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleGoogleLogin);
    }
});
