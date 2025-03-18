import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";

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

let inactivityTimeout;
const inactivityTime = 10 * 60 * 1000; // 10 minuti in millisecondi

// Funzione per controllare se l'utente è autenticato
export function checkAuth() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Utente autenticato
        resetInactivityTimer();
        resolve(user);
      } else {
        // Utente non autenticato, reindirizza alla pagina di login
        window.location.href = 'index.html';
        reject('Utente non autenticato');
      }
    });
  });
}

// Funzione per eseguire il logout
export function logout() {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
}

// Funzione per resettare il timer di inattività
export function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    logout();
  }, inactivityTime);
}

// Inizializza il monitoraggio dell'inattività
export function initActivityMonitoring() {
  // Aggiungi event listener per tracciare l'attività dell'utente
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
  
  // Imposta il timer iniziale
  resetInactivityTimer();
}

// Aggiungi pulsante di logout a tutte le pagine (se non è già presente)
export function addLogoutButton() {
  // Controlla se esiste già un elemento di navigazione
  let navigationDiv = document.querySelector('.navigation');
  
  if (!navigationDiv) {
    // Se non esiste, crea un nuovo div di navigazione
    navigationDiv = document.createElement('div');
    navigationDiv.className = 'navigation';
    document.querySelector('h1').after(navigationDiv);
  }
  
  // Controlla se il pulsante di logout esiste già
  if (!document.getElementById('logoutButton')) {
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logoutButton';
    logoutButton.textContent = 'Logout';
    logoutButton.style.backgroundColor = '#dc3545';
    logoutButton.onclick = logout;
    navigationDiv.appendChild(logoutButton);
  }
}