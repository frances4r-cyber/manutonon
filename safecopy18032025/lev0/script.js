import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
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

document.addEventListener('DOMContentLoaded', function () {
  // Verifica l'autenticazione dell'utente
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Utente autenticato, inizializza il monitoraggio dell'attività
      initActivityMonitoring();

      // Imposta il pulsante di logout
      const logoutButton = document.getElementById('logoutButton');
      if (logoutButton) {
        logoutButton.addEventListener('click', logout);
      }

      // Existing form submission code
      const manutenzioneForm = document.getElementById('manutenzioneForm');
      if (manutenzioneForm) {
        manutenzioneForm.addEventListener('submit', function (e) {
          e.preventDefault();
          const numeroProgressivo = document.getElementById('numeroProgressivo').value;
          const descrizione = document.getElementById('descrizione').value;
          const tipo = document.getElementById('tipo').value;
          const settore = document.getElementById('settore').value;
          const impianto = document.getElementById('impianto').value;
          const particolare = document.getElementById('particolare').value;
          const dataInserimento = document.getElementById('dataInserimento').value;
          const assegnazione = document.getElementById('assegnazione').value;
          const reperibilita = document.getElementById('reperibilita').value;
          const stato = document.getElementById('stato').value;
          const timestamp = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });
          
          set(ref(database, 'manutenzioni/' + numeroProgressivo), {
            numeroProgressivo: numeroProgressivo,
            descrizione: descrizione,
            tipo: tipo,
            settore: settore,
            impianto: impianto,
            particolare: particolare,
            dataInserimento: dataInserimento,
            assegnazione: assegnazione,
            reperibilita: reperibilita,
            stato: stato,
            timestamp: timestamp
          }).then(() => {
            alert('Manutenzione inserita con successo!');
            manutenzioneForm.reset();
          }).catch((error) => {
            console.error("Errore durante il salvataggio: ", error);
          });
        });
      }

      // Check for search functionality elements
      const filterButton = document.getElementById('filterButton');
      if (filterButton) {
        filterButton.addEventListener('click', handleFilterClick);
      }

      // If we're on the index page, load all records initially
      const manutenzioniTable = document.getElementById('manutenzioniTable');
      if (manutenzioniTable) {
        loadAllRecords();
      }
    } else {
      // Utente non autenticato, reindirizza alla pagina di login
      window.location.href = 'index.html';
    }
  });
});

// Search functionality
function searchRecords(searchTerm) {
  const db = getDatabase();
  const manutenzioniRef = ref(db, 'manutenzioni');
  
  return new Promise((resolve, reject) => {
    get(manutenzioniRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const results = [];
        
        // Convert search term to lowercase for case-insensitive search
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        // Loop through all records
        Object.values(data).forEach(record => {
          // Check all fields in the record
          const matchFound = Object.values(record).some(value => {
            // Convert to string and check if it includes the search term
            return String(value).toLowerCase().includes(lowerSearchTerm);
          });
          
          if (matchFound) {
            results.push(record);
          }
        });
        
        resolve(results);
      } else {
        resolve([]);
      }
    }).catch((error) => {
      console.error("Error searching records: ", error);
      reject(error);
    });
  });
}

// Filter button click handler
function handleFilterClick() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      searchRecords(searchTerm).then(results => {
        displayResults(results);
      }).catch(error => {
        console.error("Search failed: ", error);
      });
    } else {
      // If search term is empty, show all records
      loadAllRecords();
    }
  }
}

// Function to load all records
function loadAllRecords() {
  const db = getDatabase();
  const manutenzioniRef = ref(db, 'manutenzioni');
  get(manutenzioniRef).then((snapshot) => {
    if (snapshot.exists()) {
      displayResults(Object.values(snapshot.val()));
    } else {
      displayResults([]);
    }
  }).catch((error) => {
    console.error("Error loading all records: ", error);
  });
}

// Function to display search results in the table
function displayResults(results) {
  const tableBody = document.getElementById('manutenzioniTableBody');
  if (tableBody) {
    tableBody.innerHTML = '';
    
    if (results.length === 0) {
      // If no results, show a message in the table
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.setAttribute('colspan', '11'); // Adjust based on your table columns
      cell.textContent = 'Nessun risultato trovato';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      tableBody.appendChild(row);
    } else {
      // Sort results by numeroProgressivo in descending order
      results.sort((a, b) => b.numeroProgressivo - a.numeroProgressivo);
      
      // Create table rows for each result
      results.forEach(record => {
        const row = document.createElement('tr');
        
        // Add cells for each field
        const fields = [
          'numeroProgressivo', 'descrizione', 'tipo', 'settore', 
          'impianto', 'particolare', 'dataInserimento', 
          'assegnazione', 'reperibilita', 'stato'
        ];
        
        fields.forEach(field => {
          const cell = document.createElement('td');
          cell.textContent = record[field] || '';
          row.appendChild(cell);
        });
        
        // Add actions cell with buttons
        const actionsCell = document.createElement('td');
        
        // Details button
        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Dettagli';
        detailsButton.className = 'action-button';
        detailsButton.onclick = function() {
          window.location.href = `details.html?id=${record.numeroProgressivo}`;
        };
        actionsCell.appendChild(detailsButton);
        
        // Append the actions cell to the row
        row.appendChild(actionsCell);
        
        // Add the row to the table
        tableBody.appendChild(row);
      });
    }
  }
}