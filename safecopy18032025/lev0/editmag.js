import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
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
      
      // Carica il ricambio dai parametri URL
      const urlParams = new URLSearchParams(window.location.search);
      const codInt = urlParams.get('codInt');
      if (codInt) {
        loadRicambio(codInt);
      } else {
        alert('Parametro codInt mancante!');
        window.location.href = 'magdb.html';
      }

      // Configurazione listeners
      document.getElementById('updateForm').addEventListener('submit', updateRicambio);
      document.getElementById('deleteButton').addEventListener('click', confirmDelete);
    } else {
      // Utente non autenticato, reindirizza alla pagina di login
      window.location.href = 'index.html';
    }
  });
});

function loadRicambio(codInt) {
  const ricambioRef = ref(database, `ricambi/${codInt}`);
  
  get(ricambioRef).then((snapshot) => {
    if (snapshot.exists()) {
      const ricambio = snapshot.val();
      
      // Imposta i valori nei campi del form
      document.getElementById('codInt').value = ricambio.codInt || "";
      document.getElementById('codFor').value = ricambio.codFor || "";
      document.getElementById('descrizione').value = ricambio.descrizione || "";
      document.getElementById('destinazione').value = ricambio.destinazione || "";
      document.getElementById('tipo').value = ricambio.tipo || "";
      document.getElementById('fornitore').value = ricambio.fornitore || "";
      document.getElementById('qta').value = ricambio.qtaResidua !== undefined ? ricambio.qtaResidua : ricambio.qta;
      document.getElementById('costo').value = ricambio.costo || "";
      
      // Abilita il form
      document.getElementById('updateForm').style.display = 'block';
      document.getElementById('loading').style.display = 'none';
    } else {
      alert('Ricambio non trovato!');
      window.location.href = 'magdb.html';
    }
  }).catch((error) => {
    console.error("Errore nel caricamento del ricambio:", error);
    alert("Errore nel caricamento del ricambio: " + error.message);
  });
}

function updateRicambio(e) {
  e.preventDefault();
  
  const codInt = document.getElementById('codInt').value;
  const ricambioRef = ref(database, `ricambi/${codInt}`);
  
  const updatedRicambio = {
    codInt: document.getElementById('codInt').value,
    codFor: document.getElementById('codFor').value,
    descrizione: document.getElementById('descrizione').value,
    destinazione: document.getElementById('destinazione').value,
    tipo: document.getElementById('tipo').value,
    fornitore: document.getElementById('fornitore').value,
    qtaResidua: parseFloat(document.getElementById('qta').value),
    costo: parseFloat(document.getElementById('costo').value),
    timestamp: Date.now()
  };
  
  update(ricambioRef, updatedRicambio).then(() => {
    alert('Ricambio aggiornato con successo!');
    window.location.href = 'magdb.html';
  }).catch((error) => {
    console.error("Errore nell'aggiornamento:", error);
    alert("Errore nell'aggiornamento: " + error.message);
  });
}

function confirmDelete() {
  const codInt = document.getElementById('codInt').value;
  
  if (confirm(`Sei sicuro di voler eliminare il ricambio ${codInt}?`)) {
    const ricambioRef = ref(database, `ricambi/${codInt}`);
    
    remove(ricambioRef).then(() => {
      alert('Ricambio eliminato con successo!');
      window.location.href = 'magdb.html';
    }).catch((error) => {
      console.error("Errore nell'eliminazione:", error);
      alert("Errore nell'eliminazione: " + error.message);
    });
  }
}