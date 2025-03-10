import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set, remove, get } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

const urlParams = new URLSearchParams(window.location.search);
const numeroProgressivo = urlParams.get('numeroProgressivo');

const editForm = document.getElementById('editForm');
const numeroProgressivoField = document.getElementById('numeroProgressivo');
const descrizione = document.getElementById('descrizione');
const tipo = document.getElementById('tipo');
const settore = document.getElementById('settore');
const impianto = document.getElementById('impianto');
const particolare = document.getElementById('particolare');
const dataInserimento = document.getElementById('dataInserimento');
const timestamp = document.getElementById('timestamp');
const assegnazione = document.getElementById('assegnazione');
const reperibilita = document.getElementById('reperibilita');
const stato = document.getElementById('stato');
const deleteButton = document.querySelector('.delete-button');

// Carica i dati del record
const manutenzioneRef = ref(database, `manutenzioni/${numeroProgressivo}`);
get(manutenzioneRef).then((snapshot) => {
    const manutenzione = snapshot.val();
    if (manutenzione) {
        numeroProgressivoField.value = manutenzione.numeroProgressivo;
        descrizione.value = manutenzione.descrizione;
        tipo.value = manutenzione.tipo;
        settore.value = manutenzione.settore;
        impianto.value = manutenzione.impianto;
        particolare.value = manutenzione.particolare || "";
        dataInserimento.value = manutenzione.dataInserimento;
        timestamp.value = manutenzione.timestamp.split('/').reverse().join('-'); // Convert to yyyy-mm-dd
        assegnazione.value = manutenzione.assegnazione;
        reperibilita.value = manutenzione.reperibilita;
        stato.value = manutenzione.stato || "Aperta";

        editForm.querySelectorAll('input, select').forEach(element => {
            element.disabled = false;
        });

        deleteButton.style.display = 'inline-block';
    } else {
        alert('Manutenzione non trovata');
        window.location.href = 'getdb.html';
    }
}).catch((error) => {
    console.error("Errore durante il caricamento: ", error);
});

// Salva le modifiche
editForm.addEventListener('submit', function (e) {
    e.preventDefault();

    set(manutenzioneRef, {
        numeroProgressivo: numeroProgressivoField.value,
        descrizione: descrizione.value,
        tipo: tipo.value,
        settore: settore.value,
        impianto: impianto.value,
        particolare: particolare.value,
        dataInserimento: dataInserimento.value,
        timestamp: timestamp.value.split('-').reverse().join('/'), // Convert to dd/mm/yyyy
        assegnazione: assegnazione.value,
        reperibilita: reperibilita.value,
        stato: stato.value
    }).then(() => {
        alert('Modifiche salvate con successo!');
        window.location.href = 'getdb.html';
    }).catch((error) => {
        console.error("Errore durante il salvataggio: ", error);
    });
});

// Elimina il record
window.confirmDelete = function () {
    if (confirm("Sei sicuro di voler eliminare questo record?")) {
        remove(manutenzioneRef).then(() => {
            alert('Record eliminato con successo!');
            window.location.href = 'getdb.html';
        }).catch((error) => {
            console.error("Errore durante l'eliminazione: ", error);
        });
    }
};