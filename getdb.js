import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

function loadManutenzioni() {
    const manutenzioniTableBody = document.querySelector('#manutenzioniTable tbody');
    const manutenzioniRef = ref(database, 'manutenzioni');

    onValue(manutenzioniRef, (snapshot) => {
        const manutenzioni = [];
        snapshot.forEach((childSnapshot) => {
            const manutenzione = childSnapshot.val();
            manutenzioni.push(manutenzione);
        });

        // Ordina le manutenzioni in ordine decrescente per numeroProgressivo
        manutenzioni.sort((a, b) => b.numeroProgressivo - a.numeroProgressivo);

        manutenzioniTableBody.innerHTML = '';
        manutenzioni.forEach((manutenzione) => {
            const row = document.createElement('tr');
            const timestampFormatted = manutenzione.timestamp ? new Date(manutenzione.timestamp).toLocaleDateString('it-IT') : '';

            row.innerHTML = `
                <td>${manutenzione.numeroProgressivo}</td>
                <td>${manutenzione.descrizione}</td>
                <td>${manutenzione.tipo}</td>
                <td>${manutenzione.settore}</td>
                <td>${manutenzione.impianto}</td>
                <td>${manutenzione.particolare || ''}</td>
                <td>${manutenzione.dataInserimento}</td>
                <td>${manutenzione.assegnazione}</td>
                <td>${manutenzione.reperibilita}</td>
                <td>${manutenzione.stato || 'N/A'}</td>
                <td>
                    ${timestampFormatted}
                    ${manutenzione.stato === 'Chiusa' ? `<button class="mod-button" onclick="editTimestamp('${manutenzione.numeroProgressivo}')">Modifica</button>` : ''}
                </td>
                <td>${manutenzione.stato !== 'Chiusa' ? `<button class="mod-button" onclick="window.location.href='editdb.html?numeroProgressivo=${manutenzione.numeroProgressivo}'">MOD</button>` : ''}</td>
            `;

            manutenzioniTableBody.appendChild(row);
        });
    });
}

window.filterTable = function() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filterStato = document.getElementById('filterStato').value.toLowerCase();
    const filterAssegnazione = document.getElementById('filterAssegnazione').value.toLowerCase();
    const manutenzioniTableBody = document.querySelector('#manutenzioniTable tbody');
    const rows = manutenzioniTableBody.getElementsByTagName('tr');

    let hasVisibleRows = false;

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const descrizione = cells[1].textContent.toLowerCase();
        const stato = cells[9].textContent.toLowerCase();
        const assegnazione = cells[7].textContent.toLowerCase();

        const matchesSearch = descrizione.includes(searchInput);
        const matchesStato = !filterStato || stato === filterStato;
        const matchesAssegnazione = !filterAssegnazione || assegnazione === filterAssegnazione;

        if (matchesSearch && matchesStato && matchesAssegnazione) {
            rows[i].style.display = '';
            hasVisibleRows = true;
        } else {
            rows[i].style.display = 'none';
        }
    }

    document.getElementById('exportButton').style.display = hasVisibleRows ? 'inline-block' : 'none';
}

window.clearFilters = function() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStato').value = '';
    document.getElementById('filterAssegnazione').value = '';
    const rows = document.querySelector('#manutenzioniTable tbody').getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
    document.getElementById('exportButton').style.display = 'none';
}

window.exportToXLSX = function() {
    const rows = document.querySelectorAll('#manutenzioniTable tr:not([style*="display: none"])');
    const data = [];
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll('th, td');
        const rowData = Array.from(cells).map(cell => cell.textContent);
        data.push(rowData);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Manutenzioni');
    XLSX.writeFile(workbook, 'manutenzioni.xlsx');
}

window.editTimestamp = function(numeroProgressivo) {
    const newTimestamp = prompt("Inserisci la nuova data di chiusura (gg/mm/aaaa):");
    if (newTimestamp) {
        const [day, month, year] = newTimestamp.split('/');
        const formattedDate = new Date(`${year}-${month}-${day}`).getTime();
        const manutenzioneRef = ref(database, `manutenzioni/${numeroProgressivo}`);
        update(manutenzioneRef, { timestamp: formattedDate });
    }
}

loadManutenzioni();