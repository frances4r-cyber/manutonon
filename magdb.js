import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, onValue, get, update } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";
import * as XLSX from 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js';

const firebaseConfig = {
  apiKey: "API_KEY",
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

function loadRicambi() {
    const ricambiTableBody = document.getElementById('ricambiTableBody');
    if (!ricambiTableBody) {
        console.error("Elemento ricambiTableBody non trovato!");
        return;
    }

    const ricambiRef = ref(database, 'ricambi');

    onValue(ricambiRef, (snapshot) => {
        const ricambi = [];
        snapshot.forEach((childSnapshot) => {
            const ricambio = childSnapshot.val();
            ricambi.push(ricambio);
        });

        ricambiTableBody.innerHTML = '';
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
    });
}

window.filterTable = function() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filterTipo = document.getElementById('filterTipo').value.toLowerCase();
    const ricambiTableBody = document.getElementById('ricambiTableBody');
    const rows = ricambiTableBody.getElementsByTagName('tr');

    let hasVisibleRows = false;

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const descrizione = cells[2].textContent.toLowerCase();
        const tipo = cells[4].textContent.toLowerCase();

        const matchesSearch = cells[0].textContent.toLowerCase().includes(searchInput) ||
                              cells[1].textContent.toLowerCase().includes(searchInput) ||
                              descrizione.includes(searchInput) ||
                              cells[3].textContent.toLowerCase().includes(searchInput) ||
                              cells[5].textContent.toLowerCase().includes(searchInput);

        const matchesTipo = !filterTipo || tipo === filterTipo;

        if (matchesSearch && matchesTipo) {
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
    document.getElementById('filterTipo').value = '';
    const rows = document.getElementById('ricambiTableBody').getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = '';
    }
    document.getElementById('exportButton').style.display = 'none';
}

window.exportToXLSX = function() {
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

window.prelevaRicambio = function(codInt) {
    const qtaPrelevata = prompt("Inserisci la quantità da prelevare:");
    if (qtaPrelevata) {
        const ricambioRef = ref(database, 'ricambi/' + codInt);
        get(ricambioRef).then((snapshot) => {
            if (snapshot.exists()) {
                const ricambio = snapshot.val();
                const nuovaQta = (ricambio.qtaResidua !== undefined ? ricambio.qtaResidua : ricambio.qta) - parseFloat(qtaPrelevata);
                update(ricambioRef, { qtaResidua: nuovaQta }).then(() => {
                    alert("Quantità aggiornata con successo!");
                    loadRicambi();
                });
            }
        });
    }
}

window.depositaRicambio = function(codInt) {
    const qtaDeposita = prompt("Inserisci la quantità da depositare:");
    if (qtaDeposita) {
        const ricambioRef = ref(database, 'ricambi/' + codInt);
        get(ricambioRef).then((snapshot) => {
            if (snapshot.exists()) {
                const ricambio = snapshot.val();
                const nuovaQta = (ricambio.qtaResidua !== undefined ? ricambio.qtaResidua : ricambio.qta) + parseFloat(qtaDeposita);
                update(ricambioRef, { qtaResidua: nuovaQta }).then(() => {
                    alert("Quantità aggiornata con successo!");
                    loadRicambi();
                });
            }
        });
    }
}

window.filterLowStock = function() {
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

document.addEventListener('DOMContentLoaded', function () {
    loadRicambi();
});