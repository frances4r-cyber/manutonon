import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, onValue, get, update, serverTimestamp, query, orderByChild } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import * as XLSX from 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js';

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

document.addEventListener('DOMContentLoaded', function () {
  // Verifica l'autenticazione dell'utente
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Utente autenticato, inizializza il monitoraggio dell'attività
      initActivityMonitoring();
      
      // Aggiungi pulsante logout
      addLogoutButton();
      
      // Carica i dati dei ricambi
      loadRicambi();
      
      // Espone le funzioni nel contesto window
      window.filterTable = filterTable;
      window.clearFilters = clearFilters;
      window.exportToXLSX = exportToXLSX;
      window.prelevaRicambio = prelevaRicambio;
      window.depositaRicambio = depositaRicambio;
      window.filterLowStock = filterLowStock;
    } else {
      // Utente non autenticato, reindirizza alla pagina di login
      window.location.href = 'index.html';
    }
  });
});

function loadRicambi() {
  const ricambiTableBody = document.getElementById('ricambiTableBody');
  if (!ricambiTableBody) {
    console.error("Elemento ricambiTableBody non trovato!");
    return;
  }

  // Riferimento al nodo ricambi nel database
  const ricambiRef = ref(database, 'ricambi');

  onValue(ricambiRef, (snapshot) => {
    const ricambi = [];
    
    // Recupera tutti i ricambi dal database
    snapshot.forEach((childSnapshot) => {
      const key = childSnapshot.key;
      const ricambio = childSnapshot.val();
      ricambio.id = key;
      
      // Se il record non ha un timestamp, imposta uno di default
      if (!ricambio.timestamp) {
        ricambio.timestamp = 0;
      }
      
      ricambi.push(ricambio);
    });

    // Ordina per codInt in ordine decrescente
    ricambi.sort((a, b) => {
      // Converti i codici interni in numeri se possibile, altrimenti usa confronto di stringhe
      const codA = parseInt(a.codInt) || a.codInt;
      const codB = parseInt(b.codInt) || b.codInt;
      
      // Se entrambi sono numeri, confronta numericamente
      if (typeof codA === 'number' && typeof codB === 'number') {
        return codB - codA; // Ordine decrescente
      }
      
      // Altrimenti confronta come stringhe
      return String(b.codInt).localeCompare(String(a.codInt));
    });

    // Pulisci la tabella prima di riempirla
    ricambiTableBody.innerHTML = '';
    
    // Popola la tabella con i dati ordinati
    ricambi.forEach((ricambio) => {
      const row = document.createElement('tr');
      const formattedCosto = parseFloat(ricambio.costo).toFixed(2);

      row.innerHTML = `
        <td>${ricambio.codInt}</td>
        <td>${ricambio.codFor}</td>
        <td>${ricambio.descrizione}</td>
        <td>${ricambio.destinazione}</td>
        <td>${ricambio.tipo}</td>
        <td>${ricambio.fornitore}</td>
        <td class="${ricambio.qtaResidua <= 0 ? 'low-stock' : ''}">${ricambio.qtaResidua !== undefined ? ricambio.qtaResidua : ricambio.qta}</td>
        <td>${formattedCosto}</td>
        <td>
          <button class="mod-button" onclick="window.location.href='editmag.html?codInt=${ricambio.codInt}'">MOD</button>
          <button class="preleva-button" onclick="window.prelevaRicambio('${ricambio.codInt}')">PRELEVA</button>
          <button class="deposita-button" onclick="window.depositaRicambio('${ricambio.codInt}')">DEPOSITA</button>
        </td>
      `;
      ricambiTableBody.appendChild(row);
    });
    
    // Carica i tipi disponibili nel filtro
    populateFilterOptions(ricambi);
  });
}

// Funzione per popolare le opzioni di filtro con valori dinamici dal database
function populateFilterOptions(ricambi) {
  const filterTipo = document.getElementById('filterTipo');
  
  // Mantieni l'opzione "Tutti i tipi"
  const allOption = filterTipo.options[0];
  
  // Pulisci le altre opzioni esistenti
  filterTipo.innerHTML = '';
  filterTipo.appendChild(allOption);
  
  // Raccogli tutti i tipi unici
  const tipiUnici = new Set();
  ricambi.forEach(ricambio => {
    if (ricambio.tipo && ricambio.tipo.trim() !== '') {
      tipiUnici.add(ricambio.tipo.trim());
    }
  });
  
  // Aggiungi le opzioni in ordine alfabetico
  Array.from(tipiUnici).sort().forEach(tipo => {
    const option = document.createElement('option');
    option.value = tipo;
    option.textContent = tipo;
    filterTipo.appendChild(option);
  });
}

function filterTable() {
  const searchInput = document.getElementById('searchInput').value.toLowerCase();
  const filterTipo = document.getElementById('filterTipo').value;
  const ricambiTableBody = document.getElementById('ricambiTableBody');
  const rows = ricambiTableBody.getElementsByTagName('tr');

  let hasVisibleRows = false;

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    let matchesSearch = false;
    
    // Cerca in tutti i campi (tranne l'ultimo che contiene i bottoni)
    for (let j = 0; j < cells.length - 1; j++) {
      if (cells[j].textContent.toLowerCase().includes(searchInput)) {
        matchesSearch = true;
        break;
      }
    }
    
    // Controlla il tipo selezionato
    const tipo = cells[4].textContent.trim();
    const matchesTipo = !filterTipo || tipo.toLowerCase() === filterTipo.toLowerCase();

    if (matchesSearch && matchesTipo) {
      rows[i].style.display = '';
      hasVisibleRows = true;
    } else {
      rows[i].style.display = 'none';
    }
  }

  document.getElementById('exportButton').style.display = hasVisibleRows ? 'inline-block' : 'none';
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterTipo').value = '';
  const rows = document.getElementById('ricambiTableBody').getElementsByTagName('tr');
  for (let i = 0; i < rows.length; i++) {
    rows[i].style.display = '';
  }
  document.getElementById('exportButton').style.display = 'none';
}

function exportToXLSX() {
  const rows = document.querySelectorAll('#ricambiTable tr:not([style*="display: none"])');
  const data = [];
  rows.forEach((row, index) => {
    const cells = row.querySelectorAll('th, td');
    const rowData = Array.from(cells).map(cell => cell.textContent);
    data.push(rowData);
  });
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ricambi');
  XLSX.writeFile(workbook, 'ricambi.xlsx');
}

function prelevaRicambio(codInt) {
  const qtaPrelevata = prompt("Inserisci la quantità da prelevare:");
  if (qtaPrelevata && !isNaN(qtaPrelevata)) {
    const ricambioRef = ref(database, 'ricambi/' + codInt);
    get(ricambioRef).then((snapshot) => {
      if (snapshot.exists()) {
        const ricambio = snapshot.val();
        const nuovaQta = (ricambio.qtaResidua !== undefined ? ricambio.qtaResidua : ricambio.qta) - parseFloat(qtaPrelevata);
        
        // Aggiorna la quantità e il timestamp
        const updates = {
          qtaResidua: nuovaQta,
          timestamp: Date.now() // Timestamp attuale
        };
        
        update(ricambioRef, updates).then(() => {
          alert("Quantità aggiornata con successo!");
          loadRicambi();
        }).catch(error => {
          console.error("Errore nell'aggiornamento:", error);
          alert("Errore durante l'aggiornamento: " + error.message);
        });
      }
    });
  }
}

function depositaRicambio(codInt) {
  const qtaDeposita = prompt("Inserisci la quantità da depositare:");
  if (qtaDeposita && !isNaN(qtaDeposita)) {
    const ricambioRef = ref(database, 'ricambi/' + codInt);
    get(ricambioRef).then((snapshot) => {
      if (snapshot.exists()) {
        const ricambio = snapshot.val();
        const nuovaQta = (ricambio.qtaResidua !== undefined ? ricambio.qtaResidua : ricambio.qta) + parseFloat(qtaDeposita);
        
        // Aggiorna la quantità e il timestamp
        const updates = {
          qtaResidua: nuovaQta,
          timestamp: Date.now() // Timestamp attuale
        };
        
        update(ricambioRef, updates).then(() => {
          alert("Quantità aggiornata con successo!");
          loadRicambi();
        }).catch(error => {
          console.error("Errore nell'aggiornamento:", error);
          alert("Errore durante l'aggiornamento: " + error.message);
        });
      }
    });
  }
}

function filterLowStock() {
  const ricambiTableBody = document.getElementById('ricambiTableBody');
  const rows = ricambiTableBody.getElementsByTagName('tr');

  let hasVisibleRows = false;

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName('td');
    const qtaResidua = parseFloat(cells[6].textContent);

    if (qtaResidua === 0) {
      rows[i].style.display = '';
      hasVisibleRows = true;
    } else {
      rows[i].style.display = 'none';
    }
  }

  document.getElementById('exportButton').style.display = hasVisibleRows ? 'inline-block' : 'none';
}