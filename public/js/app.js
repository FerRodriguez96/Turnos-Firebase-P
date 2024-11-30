import { config } from "./config";

// Importar Firebase y configurarlo
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, push, get, update, remove } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  databaseURL: config.databaseURL,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Validar que la fecha seleccionada sea un día entre semana
function validarFecha() {
  const fechaInput = document.getElementById("fecha");
  const selectedDate = new Date(fechaInput.value);
  const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 6 = Sábado

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    alert("Solo puedes seleccionar días entre semana (lunes a viernes).");
    fechaInput.value = ""; // Limpiar el valor si es sábado o domingo
  }
}

// Agregar el evento para validar la fecha cuando cambie
document.getElementById("fecha").addEventListener("input", validarFecha);

// Manejar el formulario de creación de turnos
document.getElementById("turnoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!nombre || !fecha || !hora) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    await createTurno(nombre, fecha, hora);
    alert("Turno creado exitosamente.");
    document.getElementById("turnoForm").reset();
    renderTurnos(); // Actualiza la lista de turnos
  } catch (error) {
    console.error("Error al crear turno:", error);
  }
});

// Crear un nuevo turno en Firebase
const createTurno = async (nombre, fecha, hora) => {
  const turnosRef = ref(db, "appointments");
  const newTurno = {
    nombre,
    fecha,
    hora,
    status: "Disponible",
    client: null
  };
  await push(turnosRef, newTurno);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0"); // Obtener el día con 2 dígitos
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Obtener el mes (0-11) y sumarle 1 para que sea (1-12)
  const year = date.getFullYear(); // Obtener el año

  return `${day}/${month}/${year}`;
};

// Renderizar la lista de turnos desde Firebase
const renderTurnos = async () => {
  const turnosRef = ref(db, "appointments");
  const snapshot = await get(turnosRef);

  const turnosList = document.getElementById("turnosList");
  turnosList.innerHTML = ""; // Limpiar la lista antes de renderizar

  if (snapshot.exists()) {
    const turnos = snapshot.val();

    Object.keys(turnos).forEach((id) => {
      const turno = turnos[id];
      const formattedDate = formatDate(turno.fecha); // Formatear la fecha

      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${turno.nombre}</strong> - ${formattedDate} a las ${turno.hora}
        <br>Status: ${turno.status}
        <br>
        <button onclick="updateTurno('${id}', 'Ocupado', '${turno.nombre}')">Marcar como ocupado</button>
        <button onclick="updateTurno('${id}', 'Disponible', null)">Marcar como disponible</button>
        <button onclick="deleteTurno('${id}')">Eliminar</button>
      `;
      turnosList.appendChild(li);
    });
  } else {
    turnosList.innerHTML = "<p>No hay turnos disponibles.</p>";
  }
};

// Actualizar el estado de un turno en Firebase
window.updateTurno = async (id, status, client = null) => {
  const turnoRef = ref(db, `appointments/${id}`);
  try {
    await update(turnoRef, { status, client });
    alert("Estado del turno actualizado.");
    renderTurnos(); // Actualizar la lista de turnos
  } catch (error) {
    console.error("Error al actualizar el turno:", error);
  }
};

// Eliminar un turno en Firebase
window.deleteTurno = async (id) => {
  const turnoRef = ref(db, `appointments/${id}`);
  try {
    await remove(turnoRef);
    alert("Turno eliminado.");
    renderTurnos(); // Actualizar la lista de turnos
  } catch (error) {
    console.error("Error al eliminar el turno:", error);
  }
};

// Inicializar la lista de turnos al cargar la página
document.addEventListener("DOMContentLoaded", renderTurnos);