import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Función de ingresar
function ingresar(event) {
  event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
  const email = document.getElementById("email2").value;
  const clave = document.getElementById("clave2").value;

  signInWithEmailAndPassword(auth, email, clave)
    .then(() => {
      console.log("Inicio de sesión exitoso");
      location.href = "index.html"; // Redirigir al index
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error.message);
      alert(error.message);
    });
}

// Función de registro
function registrar(event) {
  event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
  const email = document.getElementById('email').value;
  const clave = document.getElementById('clave').value;

  // Crear usuario
  createUserWithEmailAndPassword(auth, email, clave)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Usuario registrado:", user.email);

      // Enviar correo de verificación
      sendEmailVerification(user)
        .then(() => {
          console.log("Correo de verificación enviado.");
          alert("Te hemos enviado un correo de activación. Por favor verifica tu correo.");
        })
        .catch((error) => {
          console.error("Error al enviar correo de verificación:", error.message);
        });
    })
    .catch((error) => {
      console.error("Error al registrar usuario:", error.message);
      alert(error.message);
    });
}


function observador() {
  onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname !== '/index.html') {  // Verificar si no estamos en index.html
      console.log("Usuario autenticado:", user.email);
      location.href = "index.html"; // Redirigir si ya está autenticado
    } else {
      console.log("No hay usuario autenticado");
    }
  });
}


// Enlazar eventos a los botones al cargar el DOM

  document.getElementById("btnIngresar").addEventListener("click", ingresar);
  document.getElementById("btnRegistrar").addEventListener("click", registrar);
// Mostrar el modal de registro
document.getElementById("openModal").addEventListener("click", function() {
  document.getElementById("registerModal").style.display = "block";
});

// Cerrar el modal de registro (puedes agregar un botón de cerrar en el modal si lo deseas)
document.getElementById("registerModal").addEventListener("click", function(event) {
  if (event.target === this) {  // Si el clic fue en el fondo del modal
    this.style.display = "none";
  }
});


// Iniciar el observador al cargar la página
observador();