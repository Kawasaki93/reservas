// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAyxiEgoXxIStqOoWT8CCZutzTNKFQE050",
    authDomain: "reservas-app-d3de8.firebaseapp.com",
    databaseURL: "https://reservas-app-d3de8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "reservas-app-d3de8",
    storageBucket: "reservas-app-d3de8.firebasestorage.app",
    messagingSenderId: "624791584781",
    appId: "1:624791584781:web:3f2166b210a29b3950d544"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a la base de datos
const db = firebase.database();
const reservasRef = db.ref('reservas');
const clientesRef = db.ref('clientes'); 