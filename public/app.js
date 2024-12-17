import { firebaseConfig } from "./config.js";

// Importar Firebase y configurarlo
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, push, get, update, remove } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const dbfb = getFirestore(app);

// Verificación en consola
console.log("Firebase y Firestore inicializados correctamente.");

// Función auxiliar para mostrar errores
const mostrarError = (mensaje) => {
  console.error(mensaje);
  alert(`Error: ${mensaje}`);
};

// Función para validar que la fecha seleccionada sea un día entre semana y no sea anterior a hoy
const validarFecha = () => {
  const fechaInput = document.getElementById("fecha");
  const selectedDate = new Date(fechaInput.value);
  const dayOfWeek = selectedDate.getDay();
  const today = new Date();
  
  // Establecer la hora de "hoy" a 00:00 para evitar la comparación de las horas
  today.setHours(0, 0, 0, 0);
  
  // Comprobar si la fecha seleccionada es anterior a hoy o si es sábado (6) o domingo (0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    alert("Solo puedes seleccionar días entre semana (lunes a viernes).");
    fechaInput.value = "";
  } else if (selectedDate < today) {
    alert("No puedes seleccionar una fecha anterior al día de hoy.");
    fechaInput.value = "";
  }
};


// Funcion para validar que la hora seleccionada este entre las 7 y las 19:00
const validarHora = () => {
  const horaInput = document.getElementById("hora").value;
  const [hora, minuto] = horaInput.split(":").map(Number);

  if (hora < 7 || hora > 19 || (hora === 19 && minuto > 0)) {
    alert("La hora debe estar entre las 7:00 hs y las 19:00 hs.");
    document.getElementById("hora").value = "";
  }
};

// Evento para validar hora
document.getElementById("hora").addEventListener("input", validarHora);

// Evento para validar la fecha
document.getElementById("fecha").addEventListener("input", validarFecha);

// Crear un nuevo turno
const createTurno = async (data) => {
  const turnosRef = ref(db, "appointments");
  try {
    await push(turnosRef, data);
  } catch (error) {
    mostrarError("No se pudo crear el turno.");
  }
};

// Función para manejar el formulario
document.getElementById("turnoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const especialidad = document.getElementById("especialidad").value;
  const profesional = document.getElementById("profesional").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  

  if (!especialidad || !profesional || !fecha || !hora) {
    alert("Por favor, completa todos los campos.");
    return;
  }

    // Obtener el ID del usuario actual de Firebase Authentication
    const user = getAuth().currentUser;

    if (!user) {
      alert("Debes estar autenticado para crear un turno.");
      return;
    }
  
    const userId = user.uid;  // Obtener el ID del usuario actual

  const turno = {
    especialidad,
    profesional,
    fecha,
    hora,
    status: "Disponible",
    client: null,
    createdBy: userId
  };

  await createTurno(turno);
  alert("Turno creado exitosamente.");

  document.getElementById("turnoForm").reset();
  renderTurnos();
});

// Función para obtener especialistas
const obtenerEspecialistas = async () => {
  const especialidadSeleccionada = document.getElementById("especialidad").value;
  const usersRef = collection(dbfb, "users");
  
  try {
    // Realizar la consulta para obtener los especialistas con la especialidad seleccionada
    const q = query(
      usersRef,
      where("role", "==", "specialist"),
      where("especialidad", "==", especialidadSeleccionada)
    );

    const querySnapshot = await getDocs(q);
    const specialists = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nombre: doc.data().nombre,
    }));

    // Llenar el select con los especialistas obtenidos
    rellenarSelectEspecialistas(specialists);
  } catch (error) {
    console.error("Error obteniendo los especialistas: ", error);
    alert("No se pudieron obtener los especialistas.");
  }
};

// Función para llevar los especialistas al select del HTML
const rellenarSelectEspecialistas = (specialists) => {
  const select = document.getElementById("profesional");
  select.innerHTML = "<option value=''>Seleccione un profesional</option>";
  specialists.forEach((specialist) => {
    const option = document.createElement("option");
    option.value = specialist.id;
    option.textContent = specialist.nombre;
    select.appendChild(option);
  });
};

// Paso 1: Agregar el event listener al select de especialidad
document.getElementById("especialidad").addEventListener("change", function() {
  obtenerEspecialistas();
});

// Renderizar turnos
const renderTurnos = async () => {
  const turnosRef = ref(db, "appointments");
  const turnosList = document.getElementById("turnosList");
  turnosList.innerHTML = "<p>Cargando...</p>";

  try {
    const snapshot = await get(turnosRef);
    turnosList.innerHTML = ""; // Limpiar lista

    if (!snapshot.exists()) {
      turnosList.innerHTML = "<p>No hay turnos disponibles.</p>";
      return;
    }

    const turnos = snapshot.val();
    Object.keys(turnos).forEach((id) => {
      const turno = turnos[id];
      turnosList.appendChild(crearTurnoDOM(id, turno));
    });
  } catch (error) {
    mostrarError("No se pudieron cargar los turnos.");
  }
};

// Crear DOM para un turno
const crearTurnoDOM = (id, turno) => {
  const li = document.createElement("li");
  li.className = "turno-item";

  const formattedDate = formatDate(turno.fecha);
  li.innerHTML = `
    <div>
      <strong>${turno.especialidad}</strong>
      <p>
      ${formattedDate} a las ${turno.hora}
    </div>
    <span class="turno-status">Estado: ${turno.status}</span>
    <div class="button-group">
      <button class="btn-ocupado" onclick="updateTurno('${id}', 'Ocupado')">Ocupado</button>
      <button class="btn-disponible" onclick="updateTurno('${id}', 'Disponible')">Disponible</button>
      <button class="btn-eliminar" onclick="deleteTurno('${id}')">Eliminar</button>
    </div>
  `;
  return li;
};

// Actualizar un turno
window.updateTurno = async (id, status) => {
  try {
    await update(ref(db, `appointments/${id}`), { status });
    alert("Turno actualizado.");
    renderTurnos();
  } catch (error) {
    mostrarError("No se pudo actualizar el turno.");
  }
};

// Eliminar un turno
window.deleteTurno = async (id) => {
  try {
    await remove(ref(db, `appointments/${id}`));
    alert("Turno eliminado.");
    renderTurnos();
  } catch (error) {
    mostrarError("No se pudo eliminar el turno.");
  }
};

// Función auxiliar para formatear fecha
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

// Observador de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("nombreUsuario").textContent = user.displayName || "Usuario";
    obtenerEspecialistas();
    renderTurnos();
  } else {
    window.location.replace("/login.html");
  }
});

// Función para cerrar sesión
window.cerrarSesion = () => {
  signOut(auth)
    .then(() => {
      location.href = "login.html";
    })
    .catch((error) => mostrarError("No se pudo cerrar sesión."));
};

// Ejecutar al cargar
document.addEventListener("DOMContentLoaded", () => {
  obtenerEspecialistas();
  renderTurnos();
});
