import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set, get, query, orderByChild, equalTo, limitToLast } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
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

// Funzione per ottenere l'ultimo COD. INT. inserito
function fetchLastCodInt() {
  const lastCodIntQuery = query(ref(database, 'ricambi'), orderByChild('codInt'), limitToLast(1));
  get(lastCodIntQuery).then((snapshot) => {
    if (snapshot.exists()) {
      let lastCodInt = 0;
      snapshot.forEach(childSnapshot => {
        lastCodInt = parseInt(childSnapshot.val().codInt);
      });
      const newCodInt = (lastCodInt + 1).toString().padStart(4, '0');
      document.getElementById('codInt').value = newCodInt;
    } else {
      document.getElementById('codInt').value = '0001';
    }
  }).catch((error) => {
    console.error('Errore durante il recupero dell\'ultimo COD. INT.: ', error);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Verifica l'autenticazione dell'utente
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Utente autenticato, inizializza il monitoraggio dell'attività
      initActivityMonitoring();
      
      // Aggiungi pulsante logout
      addLogoutButton();
      
      // Recupera l'ultimo COD. INT. e imposta il nuovo valore
      fetchLastCodInt();
      
      console.log("DOM fully loaded and parsed");
      
      const ricambiForm = document.getElementById('ricambiForm');
      if (ricambiForm) {
        console.log("Form trovato e pronto per l'uso.");
        ricambiForm.addEventListener('submit', function (e) {
          e.preventDefault();
          console.log("Form submit event detected");

          const codInt = document.getElementById('codInt').value;
          const codFor = document.getElementById('codFor').value;
          const descrizione = document.getElementById('descrizione').value;
          const destinazione = document.getElementById('destinazione').value;
          const tipo = document.getElementById('tipo').value;
          const fornitore = document.getElementById('fornitore').value;
          const qta = parseFloat(document.getElementById('qta').value);
          const costo = parseFloat(document.getElementById('costo').value);

          console.log("Dati raccolti dal form:", { codInt, codFor, descrizione, destinazione, tipo, fornitore, qta, costo });

          const codIntQuery = query(ref(database, 'ricambi'), orderByChild('codInt'), equalTo(codInt));
          const codForQuery = query(ref(database, 'ricambi'), orderByChild('codFor'), equalTo(codFor));

          Promise.all([get(codIntQuery), get(codForQuery)]).then((snapshots) => {
            const codIntExists = snapshots[0].exists();
            const codForExists = snapshots[1].exists();

            if (codIntExists || codForExists) {
              alert('Il codice inserito esiste già nel database.');
            } else {
              set(ref(database, 'ricambi/' + codInt), {
                codInt: codInt,
                codFor: codFor,
                descrizione: descrizione,
                destinazione: destinazione,
                tipo: tipo,
                fornitore: fornitore,
                qtaResidua: qta,
                costo: costo
              }).then(() => {
                alert('Ricambio inserito con successo!');
                ricambiForm.reset();
                fetchLastCodInt();
              }).catch((error) => {
                console.error("Errore durante il salvataggio: ", error);
              });
            }
          }).catch((error) => {
            console.error('Errore durante il controllo dei codici: ', error);
          });
        });
      } else {
        console.error("Form non trovato!");
      }
    } else {
      // Utente non autenticato, reindirizza alla pagina di login
      window.location.href = 'index.html';
    }
  });
});