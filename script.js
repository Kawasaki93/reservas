// Array para almacenar las reservas
let reservas = [];

// Elementos del DOM
const reservaForm = document.getElementById('reservaForm');
const listaReservas = document.getElementById('listaReservas');
const zonaBtns = document.querySelectorAll('.zona-btn');
const zonaSeleccionada = document.getElementById('zonaSeleccionada');
const filtroFecha = document.getElementById('filtroFecha');
const navBtns = document.querySelectorAll('.nav-btn');
const fechaAnterior = document.getElementById('fechaAnterior');
const fechaPosterior = document.getElementById('fechaPosterior');

// Elementos del DOM para la agenda
const listaAgenda = document.getElementById('listaAgenda');
const buscarCliente = document.getElementById('buscarCliente');

// Elementos del DOM para el modal
const modalNuevoCliente = document.getElementById('modalNuevoCliente');
const formNuevoCliente = document.getElementById('formNuevoCliente');
const btnCloseModal = document.querySelector('.btn-close');

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
    const vip = document.getElementById('vipCliente').checked;

    const reserva = {
        id: Date.now().toString(), // Convertir a string para Firebase
        nombre,
        telefono,
        fechaEntrada,
        fechaSalida,
        numHamacas,
        zona,
        notas,
        vip,
        fechaCreacion: new Date().toISOString()
    };

    // Agregar a Firebase
    reservasRef.child(reserva.id).set(reserva)
        .then(() => {
            reservas.push(reserva);
            mostrarReservas();
            reservaForm.reset();
            zonaBtns.forEach(btn => btn.classList.remove('selected'));
            zonaSeleccionada.value = '';
            document.getElementById('vipCliente').checked = false;
            mostrarNotificacion('Reserva creada con éxito');
        })
        .catch(error => {
            console.error('Error al crear reserva:', error);
            mostrarNotificacion('Error al crear la reserva');
        });
}

// Función para obtener la fecha actual en formato YYYY-MM-DD
function obtenerFechaActual() {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    try {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);

        // Asegurarse de que la notificación se elimine después de 3 segundos
        setTimeout(() => {
            if (notificacion && notificacion.parentNode) {
                notificacion.remove();
            }
        }, 3000);
    } catch (error) {
        console.error('Error al mostrar notificación:', error);
    }
}

// Función para mostrar las reservas
function mostrarReservas() {
    listaReservas.innerHTML = '';

    let reservasFiltradas = [...reservas];

    // Si no hay fecha seleccionada, usar la fecha actual
    const fechaFiltro = filtroFecha.value || obtenerFechaActual();
    const fechaFiltroDate = new Date(fechaFiltro);
    
    reservasFiltradas = reservasFiltradas.filter(r => {
        const fechaEntrada = new Date(r.fechaEntrada);
        const fechaSalida = new Date(r.fechaSalida);
        return fechaFiltroDate >= fechaEntrada && fechaFiltroDate <= fechaSalida;
    });

    // Ordenar por fecha de entrada
    reservasFiltradas.sort((a, b) => new Date(a.fechaEntrada) - new Date(b.fechaEntrada));

    reservasFiltradas.forEach(reserva => {
        const duracion = calcularDuracion(reserva.fechaEntrada, reserva.fechaSalida);
        const fechaSalida = new Date(reserva.fechaSalida);
        const esFechaSalida = fechaSalida.toISOString().split('T')[0] === fechaFiltro && !reserva.notificacionSalidaEliminada;
        
        const reservaElement = document.createElement('div');
        reservaElement.className = `reserva-item ${esFechaSalida ? 'reserva-salida' : ''}`;
        
        let contenidoHTML = '';
        
        if (esFechaSalida) {
            contenidoHTML = `
                <div class="aviso-salida">
                    <span class="aviso-texto">⚠️ ${reserva.nombre}</span>
                    <button onclick="eliminarNotificacionSalida(${reserva.id})" class="btn-cerrar-notificacion">&times;</button>
                </div>
            `;
        } else {
            contenidoHTML = `
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
        }

        reservaElement.innerHTML = contenidoHTML;
        listaReservas.appendChild(reservaElement);
    });
}

// Función para eliminar una reserva
function eliminarReserva(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
        // Eliminar de Firebase
        reservasRef.child(id).remove()
            .then(() => {
                reservas = reservas.filter(reserva => reserva.id !== id);
                mostrarReservas();
                mostrarNotificacion('Reserva eliminada');
            })
            .catch(error => {
                console.error('Error al eliminar reserva:', error);
                mostrarNotificacion('Error al eliminar la reserva');
            });
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
        document.getElementById('vipCliente').checked = reserva.vip || false;
        
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

// Función para cambiar la fecha
function cambiarFecha(dias) {
    const fechaActual = new Date(filtroFecha.value);
    fechaActual.setDate(fechaActual.getDate() + dias);
    filtroFecha.value = fechaActual.toISOString().split('T')[0];
    mostrarReservas();
}

// Event Listeners
reservaForm.addEventListener('submit', crearReserva);
zonaBtns.forEach(btn => btn.addEventListener('click', seleccionarZona));
filtroFecha.addEventListener('change', mostrarReservas);
navBtns.forEach(btn => btn.addEventListener('click', cambiarVista));

// Event listeners para los botones de fecha
fechaAnterior.addEventListener('click', () => cambiarFecha(-1));
fechaPosterior.addEventListener('click', () => cambiarFecha(1));

// Event Listeners adicionales
buscarCliente.addEventListener('input', mostrarAgenda);

// Event listener para el botón de nuevo cliente
document.getElementById('nuevoClienteBtn').addEventListener('click', () => {
    // Limpiar el formulario
    reservaForm.reset();
    zonaBtns.forEach(btn => btn.classList.remove('selected'));
    zonaSeleccionada.value = '';
    
    // Cambiar a la vista de nueva reserva
    document.querySelector('[data-view="nueva"]').click();
    
    // Scroll al formulario
    document.querySelector('.reserva-form').scrollIntoView({ behavior: 'smooth' });
});

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('ServiceWorker registrado:', registration);
        } catch (error) {
            console.error('Error al registrar ServiceWorker:', error);
        }
    });
}

// Función para guardar reservas en Firebase
function guardarReservas() {
    try {
        // Guardar en Firebase
        reservasRef.set(reservas)
            .then(() => {
                console.log('Reservas guardadas en Firebase');
            })
            .catch(error => {
                console.error('Error al guardar en Firebase:', error);
                mostrarNotificacion('Error al guardar los datos');
            });
    } catch (error) {
        console.error('Error al guardar reservas:', error);
        mostrarNotificacion('Error al guardar los datos');
    }
}

// Función para cargar reservas desde Firebase
function cargarReservas() {
    try {
        reservasRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                reservas = Object.values(data);
                mostrarReservas();
                mostrarAgenda();
            }
        }, (error) => {
            console.error('Error al cargar desde Firebase:', error);
            mostrarNotificacion('Error al cargar los datos');
        });
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        mostrarNotificacion('Error al cargar los datos');
    }
}

// Modificar la función inicializarApp
function inicializarApp() {
    try {
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
        cargarReservas();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        mostrarNotificacion('Error al inicializar la aplicación');
    }
}

// Modificar el event listener de DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        inicializarApp();
    } catch (error) {
        console.error('Error en DOMContentLoaded:', error);
    }
});

// Función para abrir el modal
function abrirModal() {
    modalNuevoCliente.style.display = 'block';
    document.getElementById('nombreCliente').focus();
}

// Función para cerrar el modal
function cerrarModal() {
    modalNuevoCliente.style.display = 'none';
    formNuevoCliente.reset();
}

// Función para guardar nuevo cliente
function guardarNuevoCliente(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreCliente').value;
    const telefono = document.getElementById('telefonoCliente').value;
    
    // Crear una reserva vacía para el cliente
    const reserva = {
        id: Date.now(),
        nombre,
        telefono,
        fechaEntrada: obtenerFechaActual(),
        fechaSalida: obtenerFechaActual(),
        numHamacas: 1,
        zona: 'disponible',
        notas: '',
        fechaCreacion: new Date().toISOString()
    };
    
    reservas.push(reserva);
    guardarReservas();
    mostrarAgenda();
    cerrarModal();
    mostrarNotificacion('Cliente agregado con éxito');
}

// Event Listeners para el modal
document.getElementById('nuevoClienteBtn').addEventListener('click', abrirModal);
btnCloseModal.addEventListener('click', cerrarModal);
formNuevoCliente.addEventListener('submit', guardarNuevoCliente);

// Cerrar modal al hacer clic fuera de él
window.addEventListener('click', (e) => {
    if (e.target === modalNuevoCliente) {
        cerrarModal();
    }
});

// Función para eliminar notificación de salida
function eliminarNotificacionSalida(id) {
    const reserva = reservas.find(r => r.id === id);
    if (reserva) {
        reserva.notificacionSalidaEliminada = true;
        guardarReservas();
        mostrarReservas();
    }
} 