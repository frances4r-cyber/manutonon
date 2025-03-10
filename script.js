import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

document.addEventListener('DOMContentLoaded', function () {
    const manutenzioneForm = document.getElementById('manutenzioneForm');
    if (manutenzioneForm) {
        manutenzioneForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const numeroProgressivo = document.getElementById('numeroProgressivo').value;
            const descrizione = document.getElementById('descrizione').value;
            const tipo = document.getElementById('tipo').value;
            const settore = document.getElementById('settore').value;
            const impianto = document.getElementById('impianto').value;
            const particolare = document.getElementById('particolare').value; // Campo "Particolare"
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
                particolare: particolare, // Campo "Particolare"
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
});