// Configurazione Firebase
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

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

$(document).ready(function() {
  // Inizializza il datepicker
  $('#period').datepicker({
    format: 'mm/yyyy',
    startView: 'months',
    minViewMode: 'months',
    autoclose: true
  });

  // Carica i manutentori
  loadManutentori();

  // Genera statistiche al click del pulsante
  $('#generateStats').on('click', generateStatistics);
});

// Funzione per caricare i manutentori
function loadManutentori() {
  const manutentoriSelect = $('#manutentori');
  const manutentoriRef = database.ref('manutentori');
  manutentoriRef.once('value', snapshot => {
    snapshot.forEach(childSnapshot => {
      const manutentore = childSnapshot.val();
      const option = `<option value="${childSnapshot.key}">${manutentore.nome} ${manutentore.cognome}</option>`;
      manutentoriSelect.append(option);
    });
  }).catch(error => {
    console.error('Errore durante il caricamento dei manutentori:', error);
  });
}

// Funzione per generare le statistiche
function generateStatistics() {
  const selectedPeriod = $('#period').val();
  const selectedManutentori = $('#manutentori').val();

  if (!selectedPeriod) {
    alert('Seleziona un periodo.');
    return;
  }

  if (!selectedManutentori || selectedManutentori.length === 0) {
    alert('Seleziona almeno un manutentore.');
    return;
  }

  // Recupera configurazione del reparto
  const configRef = database.ref('configurazioneReparto');
  configRef.once('value', snapshot => {
    const config = snapshot.val();
    const oreGiornaliere = config.oreGiornaliere;
    const pause = config.pausa;
    const turni = [config.turnoA, config.turnoB, config.turnoC, config.turnoG];

    // Recupera le ore lavorate nel periodo selezionato
    const oreRef = database.ref('ore');
    const manutenzioniRef = database.ref('manutenzioni');

    // Recupera ore e manutenzioni
    Promise.all([
      oreRef.once('value'),
      manutenzioniRef.once('value')
    ]).then(results => {
      const oreSnapshot = results[0];
      const manutenzioniSnapshot = results[1];

      // Filtra ore e manutenzioni per il periodo e i manutentori selezionati
      const oreLavorate = filterOreLavorate(oreSnapshot, selectedPeriod, selectedManutentori);
      const manutenzioni = filterManutenzioni(manutenzioniSnapshot, selectedPeriod);

      // Genera grafici
      generateOreLavorateChart(oreLavorate, oreGiornaliere, pause);
      generateStatoManutenzioniChart(manutenzioni);
      generateTempiMediChiusuraChart(manutenzioni);
    }).catch(error => {
      console.error('Errore durante il recupero dei dati:', error);
    });
  }).catch(error => {
    console.error('Errore durante il recupero della configurazione:', error);
  });
}

// Funzione per filtrare le ore lavorate
function filterOreLavorate(snapshot, period, manutentori) {
  const oreLavorate = [];
  snapshot.forEach(childSnapshot => {
    const ore = childSnapshot.val();
    if (manutentori.includes(childSnapshot.key) && ore.data.startsWith(period)) {
      oreLavorate.push(ore);
    }
  });
  return oreLavorate;
}

// Funzione per filtrare le manutenzioni
function filterManutenzioni(snapshot, period) {
  const manutenzioni = [];
  snapshot.forEach(childSnapshot => {
    const manutenzione = childSnapshot.val();
    if (manutenzione.dataInserimento.startsWith(period)) {
      manutenzioni.push(manutenzione);
    }
  });
  return manutenzioni;
}

// Funzione per generare il grafico delle ore lavorate
function generateOreLavorateChart(oreLavorate, oreGiornaliere, pause) {
  const ctx = document.getElementById('oreLavorateChart').getContext('2d');
  // Calcola ore lavorate per categoria
  const orePerCategoria = calcolaOrePerCategoria(oreLavorate);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(orePerCategoria),
      datasets: [{
        label: 'Ore Lavorate',
        data: Object.values(orePerCategoria),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}

// Funzione per calcolare ore lavorate per categoria
function calcolaOrePerCategoria(oreLavorate) {
  const orePerCategoria = {
    'ORD': 0,
    'EMG-RICEV': 0,
    'EMG-PROD': 0,
    'EMG-CONF': 0,
    'EMG-IMB/MAG': 0,
    'EMG-DEPUR': 0,
    'DANNI': 0,
    'INSTALL': 0,
    'RIPAR': 0,
    'CORSI': 0,
    'ELETT': 0,
    'MECC': 0
  };
  oreLavorate.forEach(ore => {
    orePerCategoria['ORD'] += ore.ord || 0;
    orePerCategoria['EMG-RICEV'] += ore.emgRicev || 0;
    orePerCategoria['EMG-PROD'] += ore.emgProd || 0;
    orePerCategoria['EMG-CONF'] += ore.emgConf || 0;
    orePerCategoria['EMG-IMB/MAG'] += ore.emgImbMag || 0;
    orePerCategoria['EMG-DEPUR'] += ore.emgDepur || 0;
    orePerCategoria['DANNI'] += ore.danni || 0;
    orePerCategoria['INSTALL'] += ore.install || 0;
    orePerCategoria['RIPAR'] += ore.ripar || 0;
    orePerCategoria['CORSI'] += ore.corsi || 0;
    orePerCategoria['ELETT'] += ore.elett || 0;
    orePerCategoria['MECC'] += ore.mecc || 0;
  });
  return orePerCategoria;
}

// Funzione per generare il grafico dello stato delle manutenzioni
function generateStatoManutenzioniChart(manutenzioni) {
  const ctx = document.getElementById('statoManutenzioniChart').getContext('2d');
  // Calcola numero di manutenzioni per stato
  const manutenzioniPerStato = calcolaManutenzioniPerStato(manutenzioni);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(manutenzioniPerStato),
      datasets: [{
        label: 'Stato Manutenzioni',
        data: Object.values(manutenzioniPerStato),
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true
    }
  });
}

// Funzione per calcolare manutenzioni per stato
function calcolaManutenzioniPerStato(manutenzioni) {
  const manutenzioniPerStato = {
    'Aperta': 0,
    'Chiusa': 0,
    'In Attesa': 0,
    'Assegnata': 0
  };
  manutenzioni.forEach(manutenzione => {
    manutenzioniPerStato[manutenzione.stato] = (manutenzioniPerStato[manutenzione.stato] || 0) + 1;
  });
  return manutenzioniPerStato;
}

// Funzione per generare il grafico dei tempi medi di chiusura delle manutenzioni
function generateTempiMediChiusuraChart(manutenzioni) {
  const ctx = document.getElementById('tempiMediChiusuraChart').getContext('2d');
  // Calcola i tempi medi di chiusura
  const tempiMedi = calcolaTempiMediChiusura(manutenzioni);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(tempiMedi),
      datasets: [{
        label: 'Tempi Medi di Chiusura (ore)',
        data: Object.values(tempiMedi),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
}

// Funzione per calcolare i tempi medi di chiusura delle manutenzioni
function calcolaTempiMediChiusura(manutenzioni) {
  const tempiMedi = {
    'MANUT': 0,
    'UTEC': 0
  };
  const count = {
    'MANUT': 0,
    'UTEC': 0
  };
  manutenzioni.forEach(manutenzione => {
    if (manutenzione.stato === 'Chiusa') {
      const assegnazione = manutenzione.assegnazione;
      const dataInserimento = moment(manutenzione.dataInserimento, 'YYYY-MM-DD');
      const dataChiusura = moment(manutenzione.timestamp, 'DD/MM/YYYY, HH:mm:ss');
      const oreChiusura = dataChiusura.diff(dataInserimento, 'hours');

      tempiMedi[assegnazione] += oreChiusura;
      count[assegnazione]++;
    }
  });

  tempiMedi['MANUT'] = tempiMedi['MANUT'] / (count['MANUT'] || 1);
  tempiMedi['UTEC'] = tempiMedi['UTEC'] / (count['UTEC'] || 1);

  return tempiMedi;
}