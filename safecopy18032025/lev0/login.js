import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7I7_NxFM-bRi4WExcOW6vJpCUPandIdM",
  authDomain: "manutenzionetonon-24c9d.firebaseapp.com",
  databaseURL: "https://manutenzionetonon-24c9d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "manutenzionetonon-24c9d",
  storageBucket: "manutenzionetonon-24c9d.appspot.com",
  messagingSenderId: "278752294846",
  appId: "1:278752294846:web:49cdc7ab4f5a37f7aeebef",
  measurementId: "G-VJWMFSWH8L"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configura la persistenza dell'autenticazione
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistenza dell'autenticazione configurata su 'local'.");
  })
  .catch((error) => {
    console.error("Errore nella configurazione della persistenza:", error);
  });

// Controlla se l'utente è già autenticato
document.addEventListener('DOMContentLoaded', function() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Utente già autenticato:', user.email);
      window.location.href = 'welcome.html';
    }
  });

  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      errorMessage.textContent = ''; // Resetta eventuali messaggi di errore precedenti

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          console.log('Login avvenuto con successo:', userCredential.user.email);
          window.location.href = 'welcome.html';
        })
        .catch((error) => {
          console.error('Errore di accesso:', error);
          const errorCode = error.code;
          switch(errorCode) {
            case 'auth/user-not-found':
              errorMessage.textContent = 'Utente non trovato.';
              break;
            case 'auth/wrong-password':
              errorMessage.textContent = 'Password errata.';
              break;
            case 'auth/invalid-email':
              errorMessage.textContent = 'Email non valida.';
              break;
            default:
              errorMessage.textContent = 'Errore di accesso. Riprova più tardi.';
          }
        });
    });
  }
});