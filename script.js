// Array para almacenar las reservas
let reservas = [];

// Elementos del DOM
const reservaForm = document.getElementById('reservaForm');
const listaReservas = document.getElementById('listaReservas');
const zonaBtns = document.querySelectorAll('.zona-btn');
const zonaSeleccionada = document.getElementById('zonaSeleccionada');
const filtroZona = document.getElementById('filtroZona');
const filtroFecha = document.getElementById('filtroFecha');
const navBtns = document.querySelectorAll('.nav-btn');

// Elementos del DOM para la agenda
const listaAgenda = document.getElementById('listaAgenda');
const buscarCliente = document.getElementById('buscarCliente');

// Función para formatear la fecha
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para calcular la duración de la estancia
function calcularDuracion(fechaEntrada, fechaSalida) {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const diffTime = Math.abs(salida - entrada);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Función para seleccionar zona
function seleccionarZona(e) {
    const btn = e.target;
    zonaBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    zonaSeleccionada.value = btn.dataset.zona;
}

// Función para crear una nueva reserva
function crearReserva(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const fechaEntrada = document.getElementById('fechaEntrada').value;
    const fechaSalida = document.getElementById('fechaSalida').value;
    const numHamacas = document.getElementById('numHamacas').value;
    const zona = zonaSeleccionada.value;
    const notas = document.getElementById('notas').value;

    const reserva = {
        id: Date.now(),
        nombre,
        telefono,
        fechaEntrada,
        fechaSalida,
        numHamacas,
        zona,
        notas,
        fechaCreacion: new Date().toISOString()
    };

    reservas.push(reserva);
    guardarReservas();
    mostrarReservas();
    reservaForm.reset();
    zonaBtns.forEach(btn => btn.classList.remove('selected'));
    zonaSeleccionada.value = '';

    // Mostrar notificación
    mostrarNotificacion('Reserva creada con éxito');
}

// Función para obtener la fecha actual en formato YYYY-MM-DD
function obtenerFechaActual() {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
}

// Función para inicializar la aplicación
function inicializarApp() {
    // Establecer fecha actual en el filtro
    filtroFecha.value = obtenerFechaActual();
    
    // Seleccionar "Disponible" como zona predeterminada
    zonaBtns.forEach(btn => {
        if (btn.dataset.zona === 'disponible') {
            btn.classList.add('selected');
            zonaSeleccionada.value = 'disponible';
        }
    });

    // Cargar reservas guardadas
    const reservasGuardadas = localStorage.getItem('reservas');
    if (reservasGuardadas) {
        reservas = JSON.parse(reservasGuardadas);
        mostrarReservas();
    }
}

// Función para mostrar las reservas
function mostrarReservas() {
    listaReservas.innerHTML = '';

    let reservasFiltradas = [...reservas];

    // Aplicar filtros
    if (filtroZona.value !== 'todas') {
        reservasFiltradas = reservasFiltradas.filter(r => r.zona === filtroZona.value);
    }

    // Si no hay fecha seleccionada, usar la fecha actual
    const fechaFiltro = filtroFecha.value || obtenerFechaActual();
    reservasFiltradas = reservasFiltradas.filter(r => {
        const fechaEntrada = new Date(r.fechaEntrada);
        const fechaSalida = new Date(r.fechaSalida);
        const fechaFiltroDate = new Date(fechaFiltro);
        return fechaFiltroDate >= fechaEntrada && fechaFiltroDate <= fechaSalida;
    });

    // Ordenar por fecha de entrada
    reservasFiltradas.sort((a, b) => new Date(a.fechaEntrada) - new Date(b.fechaEntrada));

    reservasFiltradas.forEach(reserva => {
        const duracion = calcularDuracion(reserva.fechaEntrada, reserva.fechaSalida);
        const reservaElement = document.createElement('div');
        reservaElement.className = 'reserva-item';
        reservaElement.innerHTML = `
            <h3>${reserva.nombre}</h3>
            <p>📞 ${reserva.telefono}</p>
            <p>📅 Entrada: ${formatearFecha(reserva.fechaEntrada)}</p>
            <p>📅 Salida: ${formatearFecha(reserva.fechaSalida)}</p>
            <p>⏱️ Duración: ${duracion} días</p>
            <p>🪑 Hamacas: ${reserva.numHamacas}</p>
            <p>📍 Zona: ${reserva.zona}</p>
            ${reserva.notas ? `<p>📝 Notas: ${reserva.notas}</p>` : ''}
            <div class="reserva-actions">
                <button onclick="editarReserva(${reserva.id})" class="btn-secondary">Editar</button>
                <button onclick="eliminarReserva(${reserva.id})" class="btn-danger">Eliminar</button>
            </div>
        `;
        listaReservas.appendChild(reservaElement);
    });
}

// Función para eliminar una reserva
function eliminarReserva(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
        reservas = reservas.filter(reserva => reserva.id !== id);
        guardarReservas();
        mostrarReservas();
        mostrarNotificacion('Reserva eliminada');
    }
}

// Función para editar una reserva
function editarReserva(id) {
    const reserva = reservas.find(r => r.id === id);
    if (reserva) {
        document.getElementById('nombre').value = reserva.nombre;
        document.getElementById('telefono').value = reserva.telefono;
        document.getElementById('fechaEntrada').value = reserva.fechaEntrada;
        document.getElementById('fechaSalida').value = reserva.fechaSalida;
        document.getElementById('numHamacas').value = reserva.numHamacas;
        document.getElementById('notas').value = reserva.notas || '';
        
        zonaBtns.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.zona === reserva.zona);
        });
        zonaSeleccionada.value = reserva.zona;

        // Eliminar la reserva actual
        eliminarReserva(id);
        
        // Scroll al formulario
        document.querySelector('.reserva-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

// Función para mostrar la agenda
function mostrarAgenda() {
    listaAgenda.innerHTML = '';
    
    // Obtener clientes únicos de las reservas
    const clientes = new Map();
    reservas.forEach(reserva => {
        if (!clientes.has(reserva.nombre)) {
            clientes.set(reserva.nombre, {
                nombre: reserva.nombre,
                telefono: reserva.telefono,
                observaciones: reserva.notas || '',
                ultimaReserva: new Date(reserva.fechaEntrada)
            });
        } else {
            const cliente = clientes.get(reserva.nombre);
            const fechaReserva = new Date(reserva.fechaEntrada);
            if (fechaReserva > cliente.ultimaReserva) {
                cliente.ultimaReserva = fechaReserva;
                cliente.observaciones = reserva.notas || cliente.observaciones;
            }
        }
    });

    // Convertir a array y ordenar por nombre
    const clientesArray = Array.from(clientes.values()).sort((a, b) => 
        a.nombre.localeCompare(b.nombre)
    );

    // Filtrar por búsqueda si existe
    const busqueda = buscarCliente.value.toLowerCase();
    const clientesFiltrados = busqueda 
        ? clientesArray.filter(cliente => 
            cliente.nombre.toLowerCase().includes(busqueda) ||
            cliente.telefono.includes(busqueda))
        : clientesArray;

    // Mostrar clientes
    clientesFiltrados.forEach(cliente => {
        const clienteElement = document.createElement('div');
        clienteElement.className = 'cliente-card';
        clienteElement.innerHTML = `
            <div class="cliente-header">
                <span class="cliente-nombre">${cliente.nombre}</span>
                <a href="tel:${cliente.telefono}" class="cliente-telefono">
                    📞 ${cliente.telefono}
                </a>
            </div>
            ${cliente.observaciones ? `
                <div class="cliente-observaciones">
                    📝 ${cliente.observaciones}
                </div>
            ` : ''}
            <div class="cliente-acciones">
                <button onclick="crearReservaDesdeAgenda('${cliente.nombre}', '${cliente.telefono}')" class="btn-secondary">
                    Nueva Reserva
                </button>
                <button onclick="editarCliente('${cliente.nombre}')" class="btn-secondary">
                    Editar
                </button>
            </div>
        `;
        listaAgenda.appendChild(clienteElement);
    });
}

// Función para crear una reserva desde la agenda
function crearReservaDesdeAgenda(nombre, telefono) {
    document.getElementById('nombre').value = nombre;
    document.getElementById('telefono').value = telefono;
    
    // Cambiar a la vista de nueva reserva
    document.querySelector('[data-view="nueva"]').click();
    
    // Scroll al formulario
    document.querySelector('.reserva-form').scrollIntoView({ behavior: 'smooth' });
}

// Función para editar cliente
function editarCliente(nombre) {
    const cliente = Array.from(new Map(reservas.map(r => [r.nombre, r])).values())
        .find(r => r.nombre === nombre);
    
    if (cliente) {
        document.getElementById('nombre').value = cliente.nombre;
        document.getElementById('telefono').value = cliente.telefono;
        document.getElementById('notas').value = cliente.notas || '';
        
        // Cambiar a la vista de nueva reserva
        document.querySelector('[data-view="nueva"]').click();
        
        // Scroll al formulario
        document.querySelector('.reserva-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// Función para cambiar de vista
function cambiarVista(e) {
    const vista = e.target.dataset.view;
    navBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // Ocultar todas las secciones
    document.querySelector('.reserva-form').style.display = 'none';
    document.querySelector('.reservas-lista').style.display = 'none';
    document.querySelector('.agenda-section').style.display = 'none';

    // Mostrar la sección seleccionada
    if (vista === 'nueva') {
        document.querySelector('.reserva-form').style.display = 'block';
    } else if (vista === 'lista') {
        document.querySelector('.reservas-lista').style.display = 'block';
        mostrarReservas();
    } else if (vista === 'agenda') {
        document.querySelector('.agenda-section').style.display = 'block';
        mostrarAgenda();
    }
}

// Event Listeners
reservaForm.addEventListener('submit', crearReserva);
zonaBtns.forEach(btn => btn.addEventListener('click', seleccionarZona));
filtroZona.addEventListener('change', mostrarReservas);
filtroFecha.addEventListener('change', mostrarReservas);
navBtns.forEach(btn => btn.addEventListener('click', cambiarVista));

// Event Listeners adicionales
buscarCliente.addEventListener('input', mostrarAgenda);

// Modificar el event listener de DOMContentLoaded
document.addEventListener('DOMContentLoaded', inicializarApp);

// Guardar reservas en localStorage
function guardarReservas() {
    localStorage.setItem('reservas', JSON.stringify(reservas));
}

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registrado:', registration);
            })
            .catch(error => {
                console.log('Error al registrar ServiceWorker:', error);
            });
    });
} 