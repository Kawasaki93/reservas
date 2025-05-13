// Configuración de Firebase
const firebaseConfig = {
    // Aquí debes colocar tu configuración de Firebase
    // Puedes obtenerla desde la consola de Firebase
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a la base de datos
const db = firebase.database();
const reservasRef = db.ref('reservas');
const clientesRef = db.ref('clientes'); 