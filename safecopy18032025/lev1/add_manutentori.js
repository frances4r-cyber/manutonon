import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

// Funzione per aggiungere un manutentore
function addManutentore(nome, cognome, email, cellulare, reperibilita) {
  const manutentoreId = email.replace('.', '_'); // Sostituisce i punti nell'email con underscore
  set(ref(database, 'manutentori/' + manutentoreId), {
    nome: nome,
    cognome: cognome,
    email: email,
    cellulare: cellulare,
    reperibilita: reperibilita
  }).then(() => {
    document.getElementById('message').textContent = 'Manutentore aggiunto con successo!';
    document.getElementById('message').className = 'success-message';
  }).catch((error) => {
    document.getElementById('message').textContent = 'Errore durante l\'aggiunta del manutentore: ' + error.message;
    document.getElementById('message').className = 'error-message';
  });
}

// Controlla se l'utente è già autenticato
document.addEventListener('DOMContentLoaded', function() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Utente non autenticato, reindirizza alla pagina di login
      window.location.href = 'index.html';
    }
  });

  const addManutentoreForm = document.getElementById('addManutentoreForm');
  const message = document.getElementById('message');

  if (addManutentoreForm) {
    addManutentoreForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nome = document.getElementById('nome').value;
      const cognome = document.getElementById('cognome').value;
      const email = document.getElementById('email').value;
      const cellulare = document.getElementById('cellulare').value;
      const reperibilita = document.getElementById('reperibilita').value;
      
      message.textContent = ''; // Resetta eventuali messaggi di errore precedenti

      addManutentore(nome, cognome, email, cellulare, reperibilita);
    });
  }
});