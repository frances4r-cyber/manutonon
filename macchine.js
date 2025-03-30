import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import { getDatabase, ref, get, child, update, set, remove } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

let currentMachineKey = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    loadMachines();
  }
});

function loadMachines() {
  const dbRef = ref(database);
  get(child(dbRef, `macchine`)).then(snapshot => {
    if (snapshot.exists()) {
      const machineTable = document.getElementById('machineTable').getElementsByTagName('tbody')[0];
      machineTable.innerHTML = '';
      const macchine = snapshot.val();
      const sortedKeys = Object.keys(macchine).sort((a, b) => macchine[b].annoCollaudo - macchine[a].annoCollaudo);
      for (const key of sortedKeys) {
        const macchina = macchine[key];
        const row = machineTable.insertRow();
        row.innerHTML = `
          <td>${macchina.nomeMacchina}</td>
          <td>${macchina.costruttore}</td>
          <td>${macchina.fornitore}</td>
          <td>${macchina.codiceInterno}</td>
          <td>${macchina.modello}</td>
          <td>${macchina.matricola}</td>
          <td>${macchina.settore}</td>
          <td>${macchina.annoCostruzione}</td>
          <td>${macchina.annoCollaudo}</td>
          <td>${macchina.quattroPuntoZero}</td>
          <td>${macchina.cinquePuntoZero}</td>
          <td>${macchina.altreAgevolazioni}</td>
          <td>${macchina.proprieta}</td>
          <td>
            <button onclick="editMachine('${key}')">MOD</button>
            <button onclick="manutenzioneMachine('${key}')">MAN</button>
          </td>
        `;
      }
    }
  }).catch(error => {
    console.error("Errore durante il caricamento delle macchine: ", error);
  });
}

window.editMachine = async function(key) {
  const dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, `macchine/${key}`));
    if (snapshot.exists()) {
      const macchina = snapshot.val();
      document.getElementById('editNomeMacchina').value = macchina.nomeMacchina;
      document.getElementById('editCostruttore').value = macchina.costruttore;
      document.getElementById('editFornitore').value = macchina.fornitore;
      document.getElementById('editCodiceInterno').value = macchina.codiceInterno;
      document.getElementById('editModello').value = macchina.modello;
      document.getElementById('editMatricola').value = macchina.matricola;
      document.getElementById('editSettore').value = macchina.settore;
      document.getElementById('editAnnoCostruzione').value = macchina.annoCostruzione;
      document.getElementById('editAnnoCollaudo').value = macchina.annoCollaudo;
      document.getElementById('editQuattroPuntoZero').value = macchina.quattroPuntoZero;
      document.getElementById('editCinquePuntoZero').value = macchina.cinquePuntoZero;
      document.getElementById('editAltreAgevolazioni').value = macchina.altreAgevolazioni;
      document.getElementById('editProprieta').value = macchina.proprieta;
      currentMachineKey = key;
      document.getElementById('editModal').style.display = 'block';
      populateSettoriDropdown(macchina.settore);
    }
  } catch (error) {
    console.error("Errore durante il caricamento della macchina da modificare: ", error);
  }
}

async function populateSettoriDropdown(selectedSettore) {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `settori`));
    if (snapshot.exists()) {
      const settori = snapshot.val();
      const settoreSelect = document.getElementById('editSettore');
      settoreSelect.innerHTML = '';
      for (const settore in settori) {
        const option = document.createElement('option');
        option.value = settore;
        option.textContent = settore;
        if (settore === selectedSettore) {
          option.selected = true;
        }
        settoreSelect.appendChild(option);
      }
    } else {
      console.log("Nessun settore trovato.");
    }
  } catch (error) {
    console.error("Errore durante il caricamento dei settori: ", error);
  }
}

document.getElementById('editForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const updatedMachine = {
    nomeMacchina: document.getElementById('editNomeMacchina').value,
    costruttore: document.getElementById('editCostruttore').value,
    fornitore: document.getElementById('editFornitore').value,
    codiceInterno: document.getElementById('editCodiceInterno').value,
    modello: document.getElementById('editModello').value,
    matricola: document.getElementById('editMatricola').value,
    settore: document.getElementById('editSettore').value,
    annoCostruzione: document.getElementById('editAnnoCostruzione').value,
    annoCollaudo: document.getElementById('editAnnoCollaudo').value,
    quattroPuntoZero: document.getElementById('editQuattroPuntoZero').value,
    cinquePuntoZero: document.getElementById('editCinquePuntoZero').value,
    altreAgevolazioni: document.getElementById('editAltreAgevolazioni').value,
    proprieta: document.getElementById('editProprieta').value
  };

  update(ref(database, 'macchine/' + currentMachineKey), updatedMachine).then(() => {
    alert('Macchina aggiornata con successo!');
    document.getElementById('editModal').style.display = 'none';
    loadMachines();
  }).catch(error => {
    console.error("Errore durante l'aggiornamento della macchina: ", error);
  });
});

document.getElementById('cancelEdit').addEventListener('click', function() {
  document.getElementById('editModal').style.display = 'none';
});

document.getElementById('closeEditModal').addEventListener('click', function() {
  document.getElementById('editModal').style.display = 'none';
});

window.onclick = function(event) {
  const editModal = document.getElementById('editModal');
  const manutenzioneModal = document.getElementById('manutenzioneModal');
  if (event.target == editModal) {
    editModal.style.display = 'none';
  }
  if (event.target == manutenzioneModal) {
    manutenzioneModal.style.display = 'none';
  }
}

window.manutenzioneMachine = function(key) {
  currentMachineKey = key;
  const manutenzioneContainer = document.getElementById('manutenzioneContainer');
  manutenzioneContainer.innerHTML = '';
  const dbRef = ref(database);
  get(child(dbRef, `macchine/${key}/manutenzionemac`)).then(snapshot => {
    if (snapshot.exists()) {
      const manutenzioni = snapshot.val();
      Object.keys(manutenzioni).forEach((manutenzioneKey, index) => {
        const manutenzione = manutenzioni[manutenzioneKey];
        const newManut = document.createElement('div');
        newManut.className = 'form-group';
        newManut.innerHTML = `
          <div class="form-group-row">
            <label for="manutenzione${index + 1}">Manutenzione ${index + 1}:</label>
            <input type="text" name="manutenzione" value="${manutenzione.manutenzione}" required>
            <label for="quando${index + 1}">Quando:</label>
            <select name="quando" required>
              <option value="quotidiano" ${manutenzione.quando === 'quotidiano' ? 'selected' : ''}>Quotidiano</option>
              <option value="settimanale" ${manutenzione.quando === 'settimanale' ? 'selected' : ''}>Settimanale</option>
              <option value="mensile" ${manutenzione.quando === 'mensile' ? 'selected' : ''}>Mensile</option>
              <option value="annuale" ${manutenzione.quando === 'annuale' ? 'selected' : ''}>Annuale</option>
            </select>
            <label for="ogni${index + 1}">Ogni:</label>
            <input type="number" name="ogni" value="${manutenzione.ogni}" required>
          </div>
          <div class="form-group-row date-row">
            <label for="dataInizio${index + 1}">Data inizio:</label>
            <input type="text" name="dataInizio" class="datepicker" value="${manutenzione.dataInizio}" required>
            <label for="dataProssima${index + 1}">Data prossima:</label>
            <input type="text" name="dataProssima" class="datepicker" value="${calculateDataProssima(manutenzione.dataInizio, manutenzione.quando, manutenzione.ogni)}" required readonly>
          </div>
          <button type="button" class="delete-button" onclick="deleteManutenzione(this, '${manutenzioneKey}')">Elimina</button>
        `;
        manutenzioneContainer.appendChild(newManut);
        $(`.datepicker`).datepicker();
      });
    }
    document.getElementById('manutenzioneModal').style.display = 'block';
  }).catch(error => {
    console.error("Errore durante il caricamento delle manutenzioni: ", error);
    document.getElementById('manutenzioneModal').style.display = 'block';
  });
}

document.getElementById('manutenzioneForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const manutenzioni = {};
  const manutenzioneElements = document.querySelectorAll('#manutenzioneContainer .form-group');
  manutenzioneElements.forEach((element, index) => {
    const manutenzione = element.querySelector('input[name="manutenzione"]').value;
    const quando = element.querySelector('select[name="quando"]').value;
    const ogni = element.querySelector('input[name="ogni"]').value;
    const dataInizio = element.querySelector('input[name="dataInizio"]').value;
    const dataProssima = calculateDataProssima(dataInizio, quando, ogni);
    manutenzioni[index + 1] = {
      manutenzione,
      quando,
      ogni,
      dataInizio,
      dataProssima
    };
  });

  set(ref(database, `macchine/${currentMachineKey}/manutenzionemac`), manutenzioni).then(() => {
    alert('Manutenzione programmata inserita con successo!');
    document.getElementById('manutenzioneModal').style.display = 'none';
    loadMachines();
  }).catch((error) => {
    console.error("Errore durante il salvataggio: ", error);
  });
});

document.getElementById('cancelManutenzione').addEventListener('click', function() {
  document.getElementById('manutenzioneModal').style.display = 'none';
});

document.getElementById('closeManutenzioneModal').addEventListener('click', function() {
  document.getElementById('manutenzioneModal').style.display = 'none';
});

document.getElementById('addManutenzione').addEventListener('click', function() {
  const manutenzioneContainer = document.getElementById('manutenzioneContainer');
  const lastManut = manutenzioneContainer.lastElementChild;
  if (lastManut) {
    const inputs = lastManut.querySelectorAll('input, select');
    let allFilled = true;
    inputs.forEach(input => {
      if (!input.value) {
        allFilled = false;
      }
    });

    if (!allFilled) {
      alert('Completa tutti i campi della manutenzione precedente prima di aggiungerne una nuova.');
      return;
    }
  }

  const newIndex = manutenzioneContainer.children.length + 1;
  const newManut = document.createElement('div');
  newManut.className = 'form-group';
  newManut.innerHTML = `
    <div class="form-group-row">
      <label for="manutenzione${newIndex}">Manutenzione ${newIndex}:</label>
      <input type="text" name="manutenzione" required>
      <label for="quando${newIndex}">Quando:</label>
      <select name="quando" required>
        <option value="quotidiano">Quotidiano</option>
        <option value="settimanale">Settimanale</option>
        <option value="mensile">Mensile</option>
        <option value="annuale">Annuale</option>
      </select>
      <label for="ogni${newIndex}">Ogni:</label>
      <input type="number" name="ogni" required>
    </div>
    <div class="form-group-row date-row">
      <label for="dataInizio${newIndex}">Data inizio:</label>
      <input type="text" name="dataInizio" class="datepicker" required>
      <label for="dataProssima${newIndex}">Data prossima:</label>
      <input type="text" name="dataProssima" class="datepicker" required readonly>
    </div>
    <button type="button" class="delete-button" onclick="deleteManutenzione(this)">Elimina</button>
  `;
  manutenzioneContainer.appendChild(newManut);
  $(`.datepicker`).datepicker();
});

window.deleteManutenzione = function(button, manutenzioneKey) {
  const manutenzioneContainer = document.getElementById('manutenzioneContainer');
  const manutenzioneDiv = button.parentElement;
  manutenzioneContainer.removeChild(manutenzioneDiv);
  
  if (manutenzioneKey) {
    const dbRef = ref(database, `macchine/${currentMachineKey}/manutenzionemac/${manutenzioneKey}`);
    remove(dbRef).then(() => {
      console.log(`Manutenzione ${manutenzioneKey} eliminata con successo.`);
    }).catch(error => {
      console.error("Errore durante l'eliminazione della manutenzione: ", error);
    });
  }
};

document.getElementById('searchButton').addEventListener('click', function() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const rows = document.getElementById('machineTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

  Array.from(rows).forEach(row => {
    const cells = row.getElementsByTagName('td');
    const match = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(searchTerm));
    row.style.display = match ? '' : 'none';
  });
});

document.getElementById('clearButton').addEventListener('click', function() {
  document.getElementById('searchInput').value = '';
  const rows = document.getElementById('machineTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
  Array.from(rows).forEach(row => {
    row.style.display = '';
  });
});

function calculateDataProssima(dataInizio, quando, ogni) {
  const momentDataInizio = moment(dataInizio, 'DD/MM/YYYY');
  let intervallo;
  switch (quando.toLowerCase()) {
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
  return momentDataInizio.add(ogni, intervallo).format('DD/MM/YYYY');
}