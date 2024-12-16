import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

import { 
  getFirestore,
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

import { 
  getDatabase, 
  ref, 
  get 
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore
const rtdb = getDatabase(app); // Realtime Database

// Función de ingresar
function ingresar(event) {
  event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
  const email = document.getElementById("email2").value;
  const clave = document.getElementById("clave2").value;

  signInWithEmailAndPassword(auth, email, clave)
    .then(async (userCredential) => {
      const user = userCredential.user;
      console.log("Inicio de sesión exitoso:", user.email);

      // Verificar y asignar roles al iniciar sesión
      await asignarRol(user.uid);

      // Redirigir al index
      location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error.message);
      alert(error.message);
    });
}

// Función para observar el estado de autenticación
function observador() {
  onAuthStateChanged(auth, (user) => {
      if (user) {
          console.log("Usuario autenticado:", user.email);
          // Puedes realizar acciones específicas según el rol del usuario aquí
      } else {
          console.log("No hay usuario autenticado");
      }
  });
}

// Función para asignar roles desde Realtime Database // opner esto en otro
async function asignarRol(userId) {
  try {
    // Leer los roles desde Realtime Database
    const rolesRef = ref(rtdb, `roles/${userId}`);
    const rolesSnapshot = await get(rolesRef);

    if (rolesSnapshot.exists()) {
      const rol = rolesSnapshot.val(); // Obtener el rol del usuario
      console.log(`Rol encontrado para el usuario ${userId}: ${rol}`);

      // Actualizar el rol del usuario en Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: rol });
      console.log("Rol actualizado en Firestore:", rol);
    } else {
      console.log(`No se encontró rol en Realtime Database para el usuario ${userId}`);
    }
  } catch (error) {
    console.error("Error al asignar rol:", error.message);
  }
}

document.getElementById("btnIngresar").addEventListener("click", ingresar);

// Iniciar el observador al cargar la página
observador();

