import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

// Funzione per caricare i dati del manutentore
function loadManutentore(manutentoreId) {
  const manutentoreRef = ref(database, 'manutentori/' + manutentoreId);
  get(manutentoreRef).then((snapshot) => {
    if (snapshot.exists()) {
      const manutentore = snapshot.val();
      document.getElementById('nome').value = manutentore.nome;
      document.getElementById('cognome').value = manutentore.cognome;
      document.getElementById('email').value = manutentore.email;
      document.getElementById('cellulare').value = manutentore.cellulare;
      document.getElementById('reperibilita').value = manutentore.reperibilita;
    } else {
      const messageElement = document.getElementById('message');
      if (messageElement) {
        messageElement.textContent = 'Manutentore non trovato';
        messageElement.className = 'error-message';
      }
    }
  }).catch((error) => {
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.textContent = 'Errore durante il caricamento dei dati: ' + error.message;
      messageElement.className = 'error-message';
    }
  });
}

// Funzione per salvare le modifiche del manutentore
function saveManutentore(manutentoreId, nome, cognome, email, cellulare, reperibilita) {
  const manutentoreRef = ref(database, 'manutentori/' + manutentoreId);
  set(manutentoreRef, {
    nome: nome,
    cognome: cognome,
    email: email,
    cellulare: cellulare,
    reperibilita: reperibilita
  }).then(() => {
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.textContent = 'Modifiche salvate con successo!';
      messageElement.className = 'success-message';
    }
  }).catch((error) => {
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.textContent = 'Errore durante il salvataggio delle modifiche: ' + error.message;
      messageElement.className = 'error-message';
    }
  });
}

// Funzione per eliminare il manutentore
function deleteManutentore(manutentoreId) {
  const manutentoreRef = ref(database, 'manutentori/' + manutentoreId);
  remove(manutentoreRef).then(() => {
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.textContent = 'Manutentore eliminato con successo!';
      messageElement.className = 'success-message';
    }
    // Reindirizza alla pagina principale
    window.location.href = 'manu_config.html';
  }).catch((error) => {
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.textContent = 'Errore durante l\'eliminazione del manutentore: ' + error.message;
      messageElement.className = 'error-message';
    }
  });
}

// Controlla se l'utente è già autenticato
document.addEventListener('DOMContentLoaded', function() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Utente non autenticato, reindirizza alla pagina di login
      window.location.href = 'index.html';
    } else {
      // Utente autenticato, carica i dati del manutentore
      const urlParams = new URLSearchParams(window.location.search);
      const manutentoreId = urlParams.get('id');
      if (manutentoreId) {
        loadManutentore(manutentoreId);
      } else {
        const messageElement = document.getElementById('message');
        if (messageElement) {
          messageElement.textContent = 'ID del manutentore non fornito';
          messageElement.className = 'error-message';
        }
      }
    }
  });

  const editManutentoreForm = document.getElementById('editManutentoreForm');
  const message = document.getElementById('message');

  if (editManutentoreForm) {
    editManutentoreForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const urlParams = new URLSearchParams(window.location.search);
      const manutentoreId = urlParams.get('id');
      const nome = document.getElementById('nome').value;
      const cognome = document.getElementById('cognome').value;
      const email = document.getElementById('email').value;
      const cellulare = document.getElementById('cellulare').value;
      const reperibilita = document.getElementById('reperibilita').value;
      
      message.textContent = ''; // Resetta eventuali messaggi di errore precedenti

      if (manutentoreId) {
        saveManutentore(manutentoreId, nome, cognome, email, cellulare, reperibilita);
      } else {
        message.textContent = 'ID del manutentore non fornito';
        message.className = 'error-message';
      }
    });
  }

  const deleteButton = document.getElementById('deleteButton');
  if (deleteButton) {
    deleteButton.addEventListener('click', function() {
      const urlParams = new URLSearchParams(window.location.search);
      const manutentoreId = urlParams.get('id');
      if (manutentoreId) {
        deleteManutentore(manutentoreId);
      } else {
        message.textContent = 'ID del manutentore non fornito';
        message.className = 'error-message';
      }
    });
  }
});