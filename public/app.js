import { firebaseConfig } from "./config.js";

// Importar Firebase y configurarlo
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, push, get, update, remove } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

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
      li.className = "turno-item"; // Clase para aplicar estilos

      // Contenedor para el contenido principal (nombre, fecha y hora)
      const infoContainer = document.createElement("div");
      infoContainer.className = "turno-info";

      // Nombre
      const nameElement = document.createElement("strong");
      nameElement.textContent = turno.nombre;

      // Fecha y hora
      const detailsElement = document.createElement("span");
      detailsElement.textContent = ` - ${formattedDate} a las ${turno.hora}`;

      // Estado
      const statusElement = document.createElement("span");
      statusElement.textContent = `Estado: ${turno.status}`;
      statusElement.className = "turno-status";

      // Botones (Ocupado, Disponible, Eliminar)
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "button-group";

      const ocupadoButton = document.createElement("button");
      ocupadoButton.className = "btn-ocupado";
      ocupadoButton.textContent = "Ocupado";
      ocupadoButton.onclick = () => updateTurno(id, "Ocupado", turno.nombre);

      const disponibleButton = document.createElement("button");
      disponibleButton.className = "btn-disponible";
      disponibleButton.textContent = "Disponible";
      disponibleButton.onclick = () => updateTurno(id, "Disponible", null);

      const eliminarButton = document.createElement("button");
      eliminarButton.className = "btn-eliminar";
      eliminarButton.textContent = "Eliminar";
      eliminarButton.onclick = () => deleteTurno(id);

      // Añadir los botones al contenedor de botones
      buttonContainer.appendChild(ocupadoButton);
      buttonContainer.appendChild(disponibleButton);
      buttonContainer.appendChild(eliminarButton);

      // Añadir elementos al contenedor de información
      infoContainer.appendChild(nameElement);
      infoContainer.appendChild(detailsElement);

      // Añadir todos los elementos al `li`
      li.appendChild(infoContainer);
      li.appendChild(statusElement);
      li.appendChild(buttonContainer);

      // Añadir el elemento `li` a la lista
      turnosList.appendChild(li);


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

// Observador de estado de autenticación
function observador() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.emailVerified) {
        console.log("Usuario autenticado y correo verificado:", user.email);
        document.getElementById("contenido").innerHTML = `
          <h1>Bienvenido, ${user.email}</h1>
          <button id="cerrarSesion">Cerrar sesión</button>
        `;
        document
          .getElementById("cerrarSesion")
          .addEventListener("click", cerrarSesion);
      } else {
        alert("Debes verificar tu correo antes de acceder al contenido.");
        signOut(auth).then(() => {
          location.href = "login.html"; // Redirigir al login si no está verificado
        });
      }
    } else {
      console.log("No hay usuario autenticado");
      location.href = "login.html";
    }
  });
}

// Función para cerrar sesión
function cerrarSesion() {
  signOut(auth)
    .then(() => {
      console.log("Sesión cerrada");
      location.href = "login.html";
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error.message);
    });
}
// Verificar si el usuario está autenticado
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("nombreUsuario").textContent = user.displayName || "Usuario";
    document.getElementById("navbar").style.display = "block";
    document.getElementById("turnosSection").style.display = "block";
  } else {
    window.location.replace("/login.html");
  }
});

// Exponer cerrarSesion para usarlo en el HTML
window.cerrarSesion = cerrarSesion;

// Ejecutar el observador al cargar la página
document.addEventListener("DOMContentLoaded", observador);

// Inicializar la lista de turnos al cargar la página
document.addEventListener("DOMContentLoaded", renderTurnos);