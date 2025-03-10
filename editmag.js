import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const codInt = urlParams.get('codInt');

    if (codInt) {
        const ricambioRef = ref(database, 'ricambi/' + codInt);
        get(ricambioRef).then((snapshot) => {
            if (snapshot.exists()) {
                const ricambio = snapshot.val();
                document.getElementById('codInt').value = ricambio.codInt;
                document.getElementById('codFor').value = ricambio.codFor;
                document.getElementById('descrizione').value = ricambio.descrizione;
                document.getElementById('destinazione').value = ricambio.destinazione;
                document.getElementById('tipo').value = ricambio.tipo;
                document.getElementById('fornitore').value = ricambio.fornitore;
                document.getElementById('qtaResidua').value = ricambio.qtaResidua;
                document.getElementById('costo').value = ricambio.costo;
            } else {
                alert('Ricambio non trovato.');
                window.location.href = 'magdb.html';
            }
        }).catch((error) => {
            console.error('Errore durante il recupero dei dati: ', error);
        });

        const editRicambiForm = document.getElementById('editRicambiForm');
        if (editRicambiForm) {
            editRicambiForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const codFor = document.getElementById('codFor').value;
                const descrizione = document.getElementById('descrizione').value;
                const destinazione = document.getElementById('destinazione').value;
                const tipo = document.getElementById('tipo').value;
                const fornitore = document.getElementById('fornitore').value;
                const qtaResidua = parseFloat(document.getElementById('qtaResidua').value);
                const costo = parseFloat(document.getElementById('costo').value);

                update(ricambioRef, {
                    codFor,
                    descrizione,
                    destinazione,
                    tipo,
                    fornitore,
                    qtaResidua,
                    costo
                }).then(() => {
                    alert('Ricambio aggiornato con successo!');
                    window.location.href = 'magdb.html';
                }).catch((error) => {
                    console.error('Errore durante l\'aggiornamento: ', error);
                });
            });
        }

        const deleteButton = document.getElementById('deleteButton');
        if (deleteButton) {
            deleteButton.addEventListener('click', function () {
                if (confirm('Sei sicuro di voler eliminare questo ricambio?')) {
                    remove(ricambioRef).then(() => {
                        alert('Ricambio eliminato con successo!');
                        window.location.href = 'magdb.html';
                    }).catch((error) => {
                        console.error('Errore durante l\'eliminazione: ', error);
                    });
                }
            });
        }
    } else {
        alert('Codice ricambio non fornito.');
        window.location.href = 'magdb.html';
    }
});