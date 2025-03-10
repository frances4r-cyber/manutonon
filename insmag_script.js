import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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
    console.log("DOM fully loaded and parsed");
    
    const ricambiForm = document.getElementById('ricambiForm');
    if (ricambiForm) {
        console.log("Form trovato e pronto per l'uso.");
        ricambiForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log("Form submit event detected");

            const codInt = document.getElementById('codInt').value;
            const codFor = document.getElementById('codFor').value;
            const descrizione = document.getElementById('descrizione').value;
            const destinazione = document.getElementById('destinazione').value;
            const tipo = document.getElementById('tipo').value;
            const fornitore = document.getElementById('fornitore').value;
            const qta = parseFloat(document.getElementById('qta').value);
            const costo = parseFloat(document.getElementById('costo').value);

            console.log("Dati raccolti dal form:", { codInt, codFor, descrizione, destinazione, tipo, fornitore, qta, costo });

            const codIntQuery = query(ref(database, 'ricambi'), orderByChild('codInt'), equalTo(codInt));
            const codForQuery = query(ref(database, 'ricambi'), orderByChild('codFor'), equalTo(codFor));

            Promise.all([get(codIntQuery), get(codForQuery)]).then((snapshots) => {
                const codIntExists = snapshots[0].exists();
                const codForExists = snapshots[1].exists();

                if (codIntExists || codForExists) {
                    alert('Il codice inserito esiste già nel database.');
                } else {
                    set(ref(database, 'ricambi/' + codInt), {
                        codInt: codInt,
                        codFor: codFor,
                        descrizione: descrizione,
                        destinazione: destinazione,
                        tipo: tipo,
                        fornitore: fornitore,
                        qtaResidua: qta,
                        costo: costo
                    }).then(() => {
                        alert('Ricambio inserito con successo!');
                        ricambiForm.reset();
                    }).catch((error) => {
                        console.error("Errore durante il salvataggio: ", error);
                    });
                }
            }).catch((error) => {
                console.error('Errore durante il controllo dei codici: ', error);
            });
        });
    } else {
        console.error("Form non trovato!");
    }
});