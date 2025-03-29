import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js";
import { getDatabase, ref, onValue, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js";

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

// Variabili per memorizzare le attività
let currentActivityType = '';
const activities = {
  ord: [],
  emgRicev: [],
  emgProd: [],
  emgConf: [],
  emgImbMag: [],
  emgDepur: [],
  danni: [],
  install: [],
  corsi: []
};

// Carica i manutentori nel select
function loadManutentori() {
  const manutentoriRef = ref(database, 'manutentori');
  onValue(manutentoriRef, (snapshot) => {
    const select = document.getElementById('manutentore');
    select.innerHTML = '<option value="">Seleziona un manutentore</option>';
    
    snapshot.forEach((childSnapshot) => {
      const manutentore = childSnapshot.val();
      const option = document.createElement('option');
      option.value = childSnapshot.key;
      option.textContent = `${manutentore.nome} ${manutentore.cognome}`;
      select.appendChild(option);
    });
  }, (error) => {
    console.error('Errore nel caricamento dei manutentori:', error);
  });
}

// Aggiorna il riassunto delle ore
function updateSummary() {
  const ord = parseFloat(document.getElementById('ord').value) || 0;
  const emgRicev = parseFloat(document.getElementById('emgRicev').value) || 0;
  const emgProd = parseFloat(document.getElementById('emgProd').value) || 0;
  const emgConf = parseFloat(document.getElementById('emgConf').value) || 0;
  const emgImbMag = parseFloat(document.getElementById('emgImbMag').value) || 0;
  const emgDepur = parseFloat(document.getElementById('emgDepur').value) || 0;
  const danni = parseFloat(document.getElementById('danni').value) || 0;
  const install = parseFloat(document.getElementById('install').value) || 0;
  const corsi = parseFloat(document.getElementById('corsi').value) || 0;
  const elett = parseFloat(document.getElementById('elett').value) || 0;
  const mecc = parseFloat(document.getElementById('mecc').value) || 0;
  const giornoFestivo = document.getElementById('giornoFestivo').checked;

  // Calcolo ore totali
  const oreTotali = ord + emgRicev + emgProd + emgConf + emgImbMag + emgDepur + danni + install + corsi;
  
  // Calcolo ore ordinarie/straordinarie
  let oreOrdinarie = 0;
  let oreStraordinarie = 0;
  
  if (giornoFestivo) {
    oreOrdinarie = 0;
    oreStraordinarie = oreTotali;
  } else {
    oreOrdinarie = Math.min(oreTotali, 8);
    oreStraordinarie = Math.max(0, oreTotali - 8);
  }

  // Aggiorna la visualizzazione
  document.getElementById('oreTotali').textContent = oreTotali.toFixed(2);
  document.getElementById('oreOrdinarie').textContent = oreOrdinarie.toFixed(2);
  document.getElementById('oreStraordinarie').textContent = oreStraordinarie.toFixed(2);
  document.getElementById('oreElettriche').textContent = elett.toFixed(2);
  document.getElementById('oreMeccaniche').textContent = mecc.toFixed(2);
}

// Funzioni per la gestione delle attività
function openActivitiesModal(type) {
  const hours = parseFloat(document.getElementById(type).value) || 0;
  if (hours > 0) {
    currentActivityType = type;
    document.getElementById('modalTitle').textContent = `Attività svolte per ${type.toUpperCase()}`;
    updateActivitiesView();
    document.getElementById('activitiesModal').style.display = 'block';
  } else {
    alert(`Inserire prima il numero di ore ${type.toUpperCase()}`);
  }
}

function closeModal() {
  document.getElementById('activitiesModal').style.display = 'none';
}

function updateActivitiesView() {
  const container = document.getElementById('activitiesContainer');
  container.innerHTML = '';
  
  activities[currentActivityType].forEach((activity, index) => {
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-item';
    activityDiv.innerHTML = `
      <p><strong>Attività ${index + 1}:</strong> 
      ${activity.number ? 'N° ' + activity.number : ''} 
      ${activity.description}</p>
      <button onclick="removeActivity(${index})">Elimina</button>
    `;
    container.appendChild(activityDiv);
  });
}

// Salva le ore nel database
function saveHours() {
  const manutentoreId = document.getElementById('manutentore').value;
  if (!manutentoreId) {
    alert('Seleziona un manutentore');
    return;
  }

  const data = document.getElementById('data').value;
  if (!data) {
    alert('Seleziona una data');
    return;
  }

  // Preparazione dati per il salvataggio
  const oreData = {
    data,
    giornoFestivo: document.getElementById('giornoFestivo').checked,
    ord: parseFloat(document.getElementById('ord').value) || 0,
    emgRicev: parseFloat(document.getElementById('emgRicev').value) || 0,
    emgProd: parseFloat(document.getElementById('emgProd').value) || 0,
    emgConf: parseFloat(document.getElementById('emgConf').value) || 0,
    emgImbMag: parseFloat(document.getElementById('emgImbMag').value) || 0,
    emgDepur: parseFloat(document.getElementById('emgDepur').value) || 0,
    danni: parseFloat(document.getElementById('danni').value) || 0,
    install: parseFloat(document.getElementById('install').value) || 0,
    corsi: parseFloat(document.getElementById('corsi').value) || 0,
    elett: parseFloat(document.getElementById('elett').value) || 0,
    mecc: parseFloat(document.getElementById('mecc').value) || 0,
    timestamp: serverTimestamp()
  };

  // Aggiungi le attività solo se presenti
  const activityTypes = ['ord', 'emgRicev', 'emgProd', 'emgConf', 'emgImbMag', 'emgDepur', 'danni', 'install', 'corsi'];
  activityTypes.forEach(type => {
    if (activities[type].length > 0) {
      oreData[`${type}Activities`] = activities[type];
    }
  });

  // Verifica coerenza ore
  const oreTotali = oreData.ord + oreData.emgRicev + oreData.emgProd + oreData.emgConf + 
                   oreData.emgImbMag + oreData.emgDepur + oreData.danni + oreData.install + oreData.corsi;
  
  if (oreData.elett + oreData.mecc !== oreTotali) {
    alert('La somma delle ore ELETT e MECC deve corrispondere alle ore totali inserite');
    return;
  }

  // Salvataggio con gestione errori migliorata
  const oreRef = ref(database, `ore/${manutentoreId}/${data}`);
  set(oreRef, oreData)
    .then(() => {
      alert('Ore salvate con successo!');
      resetForm();
    })
    .catch(error => {
      console.error('Errore nel salvataggio:', error);
      alert(`Errore nel salvataggio: ${error.message}`);
    });
}

// Resetta il form
function resetForm() {
  document.getElementById('oreForm').reset();
  for (const type in activities) {
    activities[type] = [];
  }
  updateSummary();
  $('#datepicker').datepicker('update', new Date());
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'index.html';
    } else {
      loadManutentori();
      // Inizializza datepicker
      $('#datepicker').datepicker({
        language: 'it',
        format: 'yyyy-mm-dd',
        autoclose: true
      }).on('changeDate', function(e) {
        $('#data').val(e.format('yyyy-mm-dd'));
      });
    }
  });

  // Gestione aggiunta attività
  document.getElementById('addActivityBtn').addEventListener('click', function() {
    const activityNumber = document.getElementById('activityNumber').value;
    const activityDescription = document.getElementById('activityDescription').value;
    
    if (!activityDescription && !activityNumber) {
      alert('Inserire almeno la descrizione o il numero attività');
      return;
    }
    
    activities[currentActivityType].push({
      number: activityNumber,
      description: activityDescription
    });
    
    updateActivitiesView();
    document.getElementById('activityNumber').value = '';
    document.getElementById('activityDescription').value = '';
  });

  // Pulsante salva
  document.getElementById('saveButton').addEventListener('click', saveHours);

  // Aggiorna il riassunto quando cambiano i valori
  document.querySelectorAll('.numeric-input').forEach(input => {
    input.addEventListener('input', updateSummary);
  });
  document.getElementById('giornoFestivo').addEventListener('change', updateSummary);
});

// Funzioni globali
window.openActivitiesModal = openActivitiesModal;
window.closeModal = closeModal;
window.removeActivity = function(index) {
  activities[currentActivityType].splice(index, 1);
  updateActivitiesView();
};
window.onclick = function(event) {
  if (event.target == document.getElementById('activitiesModal')) {
    closeModal();
  }
};