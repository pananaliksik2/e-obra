/**
 * E-Obra Firebase Configuration
 * ============================================================
 * IMPORTANT: Replace the placeholder values below with your
 * actual Firebase project configuration from the Firebase Console.
 * 
 * To get your config:
 * 1. Go to https://console.firebase.google.com
 * 2. Select your "E-Obra" project
 * 3. Click the gear icon (⚙) → Project Settings
 * 4. Scroll to "Your Apps" → Web app
 * 5. If no web app exists, click "Add app" → Web (</>) icon
 * 6. Copy the firebaseConfig object
 * ============================================================
 */

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
firebase.initializeApp(firebaseConfig);

// Export Firebase Auth instance for use across modules
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Force account selection on every login
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// API Base URL (adjust if needed)
const API_BASE = '/E-Obra/api';
