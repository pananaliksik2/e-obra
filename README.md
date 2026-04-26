# E-Obra: Panuto sa Pag-set up

Ang sistemang ito ay gumagamit ng **Firebase Authentication** at **MySQL (XAMPP)**. Sundin ang mga sumusunod na hakbang upang mapatakbo ang system:

## 1. Pag-set up ng Database
1. Buksan ang **XAMPP Control Panel** at simulan ang **Apache** at **MySQL**.
2. Pumunta sa `http://localhost/phpmyadmin/`.
3. Mag-import ng bagong database gamit ang file na matatagpuan sa `database/eobra_db.sql`.

## 2. Pag-set up ng Firebase (MAHALAGA)
Dahil ang sistemang ito ay gumagamit ng Google Sign-In, kailangan mong ilagay ang iyong sariling Firebase Configuration:
1. Pumunta sa [Firebase Console](https://console.firebase.google.com/).
2. Gumawa ng bagong project na may pangalang "E-Obra".
3. I-enable ang **Google Sign-In** sa ilalim ng **Authentication > Sign-in method**.
4. Magrehistro ng isang **Web App** sa project settings.
5. Kopyahin ang `firebaseConfig` object at i-paste ito sa `js/auth.js`.

```javascript
const firebaseConfig = {
    apiKey: "IYONG_API_KEY",
    authDomain: "IYONG_PROJECT_ID.firebaseapp.com",
    projectId: "IYONG_PROJECT_ID",
    storageBucket: "IYONG_PROJECT_ID.appspot.com",
    messagingSenderId: "IYONG_SENDER_ID",
    appId: "IYONG_APP_ID"
};
```

## 3. Paggamit ng System
1. Buksan ang browser at pumunta sa `http://localhost/E-Obra/`.
2. Mag-login gamit ang iyong Google account.
3. Maaari mo nang basahin ang Kabanata 1.
4. **Double-click** sa mga salitang may salungguhit (gaya ng *limatik*, *fraile*, atbp.) upang makita ang kahulugan.
5. I-click ang **"I-download bilang PDF"** upang i-save ang kabanata.
6. Sagutan ang pagsusulit pagkatapos magbasa.

---
*Tandaan: Ang lahat ng nilalaman at interface ay nasa pormal na wikang Filipino alinsunod sa akademikong pangangailangan ng pananaliksik.*
