import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

// Configurazione Firebase
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

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Funzione per caricare i manutentori e visualizzarli nella tabella
function loadManutentori() {
  const manutentoriRef = ref(database, 'manutentori');
  onValue(manutentoriRef, (snapshot) => {
    const manutentoriTableBody = document.getElementById('manutentoriTable').getElementsByTagName('tbody')[0];
    manutentoriTableBody.innerHTML = ''; // Resetta il contenuto della tabella

    snapshot.forEach((childSnapshot) => {
      const manutentore = childSnapshot.val();

      const row = manutentoriTableBody.insertRow();
      const cellNome = row.insertCell(0);
      const cellCognome = row.insertCell(1);
      const cellEmail = row.insertCell(2);
      const cellCellulare = row.insertCell(3);
      const cellReperibilita = row.insertCell(4);

      cellNome.textContent = manutentore.nome;
      cellCognome.textContent = manutentore.cognome;
      cellEmail.textContent = manutentore.email;
      cellCellulare.textContent = manutentore.cellulare;
      cellReperibilita.textContent = manutentore.reperibilita;

      row.addEventListener('click', () => {
        window.location.href = `edit_manutentore.html?id=${childSnapshot.key}`;
      });
    });
  });
}

// Funzione per caricare la configurazione del reparto manutenzione
function loadConfig() {
  const configRef = ref(database, 'configurazioneReparto');
  get(configRef).then((snapshot) => {
    if (snapshot.exists()) {
      const config = snapshot.val();
      document.getElementById('oreGiornaliere').value = config.oreGiornaliere || '';
      document.getElementById('turnoA1').value = config.turnoA?.dalle1 || '';
      document.getElementById('turnoA2').value = config.turnoA?.alle1 || '';
      document.getElementById('turnoA3').value = config.turnoA?.dalle2 || '';
      document.getElementById('turnoA4').value = config.turnoA?.alle2 || '';
      document.getElementById('turnoB1').value = config.turnoB?.dalle1 || '';
      document.getElementById('turnoB2').value = config.turnoB?.alle1 || '';
      document.getElementById('turnoB3').value = config.turnoB?.dalle2 || '';
      document.getElementById('turnoB4').value = config.turnoB?.alle2 || '';
      document.getElementById('turnoC1').value = config.turnoC?.dalle1 || '';
      document.getElementById('turnoC2').value = config.turnoC?.alle1 || '';
      document.getElementById('turnoC3').value = config.turnoC?.dalle2 || '';
      document.getElementById('turnoC4').value = config.turnoC?.alle2 || '';
      document.getElementById('turnoG1').value = config.turnoG?.dalle1 || '';
      document.getElementById('turnoG2').value = config.turnoG?.alle1 || '';
      document.getElementById('turnoG3').value = config.turnoG?.dalle2 || '';
      document.getElementById('turnoG4').value = config.turnoG?.alle2 || '';
      document.getElementById('pausa').value = config.pausa || '';
    } else {
      document.getElementById('message').textContent = 'Configurazione non trovata';
      document.getElementById('message').className = 'error-message';
    }
  }).catch((error) => {
    document.getElementById('message').textContent = 'Errore durante il caricamento della configurazione: ' + error.message;
    document.getElementById('message').className = 'error-message';
  });
}

// Funzione per salvare la configurazione del reparto manutenzione
function saveConfig(oreGiornaliere, turnoA, turnoB, turnoC, turnoG, pausa) {
  const configRef = ref(database, 'configurazioneReparto');
  set(configRef, {
    oreGiornaliere: oreGiornaliere,
    turnoA: turnoA,
    turnoB: turnoB,
    turnoC: turnoC,
    turnoG: turnoG,
    pausa: pausa
  }).then(() => {
    document.getElementById('message').textContent = 'Configurazione salvata con successo!';
    document.getElementById('message').className = 'success-message';
  }).catch((error) => {
    document.getElementById('message').textContent = 'Errore durante il salvataggio della configurazione: ' + error.message;
    document.getElementById('message').className = 'error-message';
  });
}

// Controlla se l'utente è già autenticato
document.addEventListener('DOMContentLoaded', function() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Utente non autenticato, reindirizza alla pagina di login
      window.location.href = 'index.html';
    } else {
      // Utente autenticato, carica i manutentori e la configurazione
      loadManutentori();
      loadConfig();
    }
  });

  const configForm = document.getElementById('configForm');
  const message = document.getElementById('message');

  if (configForm) {
    configForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const oreGiornaliere = document.getElementById('oreGiornaliere').value;
      const turnoA = {
        dalle1: document.getElementById('turnoA1').value,
        alle1: document.getElementById('turnoA2').value,
        dalle2: document.getElementById('turnoA3').value,
        alle2: document.getElementById('turnoA4').value
      };
      const turnoB = {
        dalle1: document.getElementById('turnoB1').value,
        alle1: document.getElementById('turnoB2').value,
        dalle2: document.getElementById('turnoB3').value,
        alle2: document.getElementById('turnoB4').value
      };
      const turnoC = {
        dalle1: document.getElementById('turnoC1').value,
        alle1: document.getElementById('turnoC2').value,
        dalle2: document.getElementById('turnoC3').value,
        alle2: document.getElementById('turnoC4').value
      };
      const turnoG = {
        dalle1: document.getElementById('turnoG1').value,
        alle1: document.getElementById('turnoG2').value,
        dalle2: document.getElementById('turnoG3').value,
        alle2: document.getElementById('turnoG4').value
      };
      const pausa = document.getElementById('pausa').value;

      message.textContent = ''; // Resetta eventuali messaggi di errore precedenti

      saveConfig(oreGiornaliere, turnoA, turnoB, turnoC, turnoG, pausa);
    });
  }
});