import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

function loadStatistics() {
    const manutenzioniRef = ref(database, 'manutenzioni');
    onValue(manutenzioniRef, (snapshot) => {
        let totalManutenzioni = 0;
        let openManutenzioni = 0;
        let closedManutenzioni = 0;
        let totalRequests = 0;
        let totalClosureTimeMANUT = 0;
        let totalClosureTimeUTEC = 0;
        let closedCountMANUT = 0;
        let closedCountUTEC = 0;
        let requestsPerMonth = {};
        let closedRequestsPerMonth = {};
        let reperibilitaActivities = 0;
        let holidayActivities = 0;
        const typeCount = {};
        const sectorCount = {};
        const plantCount = {};

        snapshot.forEach((childSnapshot) => {
            const manutenzione = childSnapshot.val();
            totalManutenzioni++;

            if (manutenzione.stato === 'Aperta') {
                openManutenzioni++;
            } else if (manutenzione.stato === 'Chiusa') {
                closedManutenzioni++;
                const creationDate = new Date(manutenzione.dataInserimento);
                const closureDate = new Date(manutenzione.timestamp);
                const closureTime = Math.ceil((closureDate - creationDate) / (1000 * 60 * 60 * 24)); // In giorni

                if (manutenzione.assegnazione === 'MANUT') {
                    totalClosureTimeMANUT += closureTime;
                    closedCountMANUT++;
                } else if (manutenzione.assegnazione === 'UTEC') {
                    totalClosureTimeUTEC += closureTime;
                    closedCountUTEC++;
                }

                const monthYear = `${closureDate.getMonth() + 1}/${closureDate.getFullYear()}`;
                closedRequestsPerMonth[monthYear] = (closedRequestsPerMonth[monthYear] || 0) + 1;
            }

            if (manutenzione.tipo) {
                typeCount[manutenzione.tipo] = (typeCount[manutenzione.tipo] || 0) + 1;
            }
            if (manutenzione.settore) {
                sectorCount[manutenzione.settore] = (sectorCount[manutenzione.settore] || 0) + 1;
            }
            if (manutenzione.impianto) {
                plantCount[manutenzione.impianto] = (plantCount[manutenzione.impianto] || 0) + 1;
            }
            if (manutenzione.reperibilita === 'SI') {
                reperibilitaActivities++;
            }
            const creationDate = new Date(manutenzione.dataInserimento);
            const dayOfWeek = creationDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Domenica = 0, Sabato = 6
                holidayActivities++;
            }
            const monthYear = `${creationDate.getMonth() + 1}/${creationDate.getFullYear()}`;
            requestsPerMonth[monthYear] = (requestsPerMonth[monthYear] || 0) + 1;
            totalRequests++;
        });

        const averageClosureTimeMANUT = closedCountMANUT > 0 ? Math.round(totalClosureTimeMANUT / closedCountMANUT) : 0;
        const averageClosureTimeUTEC = closedCountUTEC > 0 ? Math.round(totalClosureTimeUTEC / closedCountUTEC) : 0;
        const totalMonths = Object.keys(requestsPerMonth).length;
        const averageRequestsPerMonth = totalMonths > 0 ? Math.round(totalRequests / totalMonths) : 0;
        const averageClosedRequestsPerMonth = totalMonths > 0 ? Math.round(closedManutenzioni / totalMonths) : 0;

        document.getElementById('totalManutenzioni').textContent = totalManutenzioni;
        document.getElementById('openManutenzioni').textContent = openManutenzioni;
        document.getElementById('closedManutenzioni').textContent = closedManutenzioni;
        populateTable('typeManutenzioni', typeCount, totalManutenzioni);
        populateTable('sectorManutenzioni', sectorCount, totalManutenzioni);
        populateTable('plantManutenzioni', plantCount, totalManutenzioni);
        document.getElementById('openRequests').textContent = openManutenzioni;
        document.getElementById('totalRequests').textContent = totalRequests;
        document.getElementById('pendingRequests').textContent = openManutenzioni;
        document.getElementById('averageClosureTime').textContent = `MANUT: ${averageClosureTimeMANUT} giorni, UTEC: ${averageClosureTimeUTEC} giorni`;
        document.getElementById('averageRequestsPerMonth').textContent = averageRequestsPerMonth;
        document.getElementById('averageClosedRequestsPerMonth').textContent = averageClosedRequestsPerMonth;
        document.getElementById('reperibilitaActivities').textContent = reperibilitaActivities;
        document.getElementById('holidayActivities').textContent = holidayActivities;
    });
}

function populateTable(tableId, data, total) {
    const tableBody = document.getElementById(tableId);
    tableBody.innerHTML = '';
    for (const key in data) {
        const row = tableBody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        cell1.textContent = key;
        cell2.textContent = data[key];
        cell3.textContent = ((data[key] / total) * 100).toFixed(2) + '%';
    }
}

window.exportToCSV = function() {
    const tables = document.querySelectorAll('.stat table');
    const csv = [];

    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowArray = Array.from(cells).map(cell => `"${cell.textContent}"`);
            csv.push(rowArray.join(','));
        });
        csv.push(''); // Aggiunge una riga vuota tra le tabelle
    });

    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statistiche_manutenzioni.csv';
    a.click();
    URL.revokeObjectURL(url);
}

loadStatistics();