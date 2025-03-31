import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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
const auth = getAuth(app);
const database = getDatabase(app);

$(document).ready(function() {
  onAuthStateChanged(auth, user => {
    if (user) {
      const dbRef = ref(database);
      get(child(dbRef, 'macchine')).then(snapshot => {
        if (snapshot.exists()) {
          const macchine = snapshot.val();
          const events = [];
          for (const key in macchine) {
            const macchina = macchine[key];
            if (macchina.manutenzionemac) {
              for (const manKey in macchina.manutenzionemac) {
                const manutenzione = macchina.manutenzionemac[manKey];
                const dataInizio = moment(manutenzione.dataInizio, 'DD/MM/YYYY');
                const ogni = parseInt(manutenzione.ogni);
                const quando = manutenzione.quando.toLowerCase();

                let intervallo;
                switch (quando) {
                  case 'quotidiano':
                    intervallo = 'days';
                    break;
                  case 'settimanale':
                    intervallo = 'weeks';
                    break;
                  case 'mensile':
                    intervallo = 'months';
                    break;
                  case 'annuale':
                    intervallo = 'years';
                    break;
                  default:
                    intervallo = 'days';
                }

                let currentDate = dataInizio.clone();
                while (currentDate.isBefore(moment().add(1, 'years'))) {
                  events.push({
                    title: macchina.codiceInterno,
                    start: currentDate.format('YYYY-MM-DD'),
                    macchina: macchina,
                    manutenzione: manutenzione
                  });
                  currentDate.add(ogni, intervallo);
                }
              }
            }
          }
          $('#calendar').fullCalendar({
            locale: 'it',
            header: {
              left: 'prev,next today',
              center: 'title',
              right: 'month,agendaWeek,agendaDay'
            },
            editable: false,
            events: events,
            eventClick: function(event) {
              $('#machineDetails').html(`
                <p><strong>Nome macchina:</strong> ${event.macchina.nomeMacchina}</p>
                <p><strong>Costruttore:</strong> ${event.macchina.costruttore}</p>
                <p><strong>Fornitore:</strong> ${event.macchina.fornitore}</p>
                <p><strong>Codice interno:</strong> ${event.macchina.codiceInterno}</p>
                <p><strong>Modello:</strong> ${event.macchina.modello}</p>
                <p><strong>Matricola:</strong> ${event.macchina.matricola}</p>
                <p><strong>Settore:</strong> ${event.macchina.settore}</p>
                <p><strong>Anno di costruzione:</strong> ${event.macchina.annoCostruzione}</p>
                <p><strong>Anno di collaudo:</strong> ${event.macchina.annoCollaudo}</p>
                <p><strong>4.0:</strong> ${event.macchina.quattroPuntoZero}</p>
                <p><strong>5.0:</strong> ${event.macchina.cinquePuntoZero}</p>
                <p><strong>Altre agevolazioni:</strong> ${event.macchina.altreAgevolazioni}</p>
                <p><strong>Proprietà:</strong> ${event.macchina.proprieta}</p>
                <p><strong>Manutenzione:</strong> ${event.manutenzione.manutenzione}</p>
                <p><strong>Quando:</strong> ${event.manutenzione.quando}</p>
                <p><strong>Ogni:</strong> ${event.manutenzione.ogni}</p>
                <p><strong>Data inizio:</strong> ${event.manutenzione.dataInizio}</p>
                <p><strong>Data prossima:</strong> ${event.manutenzione.dataProssima}</p>
              `);
              $('#machineModal').css('display', 'block');
            }
          });
        }
      }).catch(error => {
        console.error("Errore durante il caricamento delle macchine: ", error);
      });
    } else {
      window.location.href = 'login.html';
    }
  });

  $('#closeModal').click(function() {
    $('#machineModal').css('display', 'none');
  });

  window.onclick = function(event) {
    const modal = document.getElementById('machineModal');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
});