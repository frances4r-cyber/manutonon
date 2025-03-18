import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set, remove, get } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
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
const database = getDatabase(app);
const auth = getAuth(app);

// Variabili per il controllo dell'inattività
let inactivityTimeout;
const inactivityTime = 10 * 60 * 1000; // 10 minuti in millisecondi

// Funzione per il logout
function logout() {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
}

// Funzione per resettare il timer di inattività
function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    logout();
  }, inactivityTime);
}

// Inizializza il monitoraggio dell'attività
function initActivityMonitoring() {
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
  resetInactivityTimer();
}

// Funzione per aggiungere il pulsante di logout
function addLogoutButton() {
  const navigation = document.querySelector('.navigation');
  if (navigation && !document.getElementById('logoutButton')) {
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logoutButton';
    logoutButton.textContent = 'Logout';
    logoutButton.style.backgroundColor = '#dc3545';
    logoutButton.onclick = logout;
    navigation.appendChild(logoutButton);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Verifica l'autenticazione dell'utente
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Utente autenticato, inizializza il monitoraggio dell'attività
      initActivityMonitoring();
      
      // Aggiungi pulsante logout
      addLogoutButton();
      
      // Carica i dati del record
      const urlParams = new URLSearchParams(window.location.search);
      const numeroProgressivo = urlParams.get('numeroProgressivo');
      loadManutenzione(numeroProgressivo);

      // Aggiungi funzionalità di eliminazione
      window.confirmDelete = confirmDelete;
    } else {
      // Utente non autenticato, reindirizza alla pagina di login
      window.location.href = 'index.html';
    }
  });
});

function loadManutenzione(numeroProgressivo) {
  const manutenzioneRef = ref(database, `manutenzioni/${numeroProgressivo}`);
  
  get(manutenzioneRef).then((snapshot) => {
    const manutenzione = snapshot.val();
    if (manutenzione) {
      document.getElementById('numeroProgressivo').value = manutenzione.numeroProgressivo;
      document.getElementById('descrizione').value = manutenzione.descrizione;
      document.getElementById('tipo').value = manutenzione.tipo;
      document.getElementById('settore').value = manutenzione.settore;
      document.getElementById('impianto').value = manutenzione.impianto;
      document.getElementById('particolare').value = manutenzione.particolare || "";
      document.getElementById('dataInserimento').value = manutenzione.dataInserimento;
      document.getElementById('assegnazione').value = manutenzione.assegnazione;
      document.getElementById('reperibilita').value = manutenzione.reperibilita;
      document.getElementById('stato').value = manutenzione.stato || "Aperta";

      document.querySelectorAll('input, select').forEach(element => {
        element.disabled = false;
      });

      document.querySelector('.delete-button').style.display = 'inline-block';
    } else {
      alert('Manutenzione non trovata');
      window.location.href = 'getdb.html';
    }
  }).catch((error) => {
    console.error("Errore durante il caricamento: ", error);
  });
  
  // Gestisci il form di modifica
  document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    set(manutenzioneRef, {
      numeroProgressivo: document.getElementById('numeroProgressivo').value,
      descrizione: document.getElementById('descrizione').value,
      tipo: document.getElementById('tipo').value,
      settore: document.getElementById('settore').value,
      impianto: document.getElementById('impianto').value,
      particolare: document.getElementById('particolare').value,
      dataInserimento: document.getElementById('dataInserimento').value,
      assegnazione: document.getElementById('assegnazione').value,
      reperibilita: document.getElementById('reperibilita').value,
      stato: document.getElementById('stato').value
    }).then(() => {
      alert('Modifiche salvate con successo!');
      window.location.href = 'getdb.html';
    }).catch((error) => {
      console.error("Errore durante il salvataggio: ", error);
    });
  });
}

function confirmDelete() {
  if (confirm("Sei sicuro di voler eliminare questo record?")) {
    const numeroProgressivo = document.getElementById('numeroProgressivo').value;
    const manutenzioneRef = ref(database, `manutenzioni/${numeroProgressivo}`);
    
    remove(manutenzioneRef).then(() => {
      alert('Record eliminato con successo!');
      window.location.href = 'getdb.html';
    }).catch((error) => {
      console.error("Errore durante l'eliminazione: ", error);
    });
  }
}