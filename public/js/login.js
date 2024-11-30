import { config } from "./config";

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

  // Inicialización de Firebase
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  // Manejo del formulario de login
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert(`¡Bienvenido ${userCredential.user.email}!`);
      // Redirige a la página principal
      window.location.href = "dashboard.html";
    } catch (error) {
      alert(`Error al iniciar sesión: ${error.message}`);
    }
  });
  
  // Enlace para registrar una nueva cuenta
  document.getElementById("registerLink").addEventListener("click", () => {
    window.location.href = "register.html"; // Crear esta página para registro
  });
  
  // Enlace para restablecer la contraseña
  document.getElementById("resetPasswordLink").addEventListener("click", async () => {
    const email = prompt("Ingresa tu correo electrónico para restablecer la contraseña:");
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Correo para restablecer contraseña enviado.");
      } catch (error) {
        alert(`Error al enviar correo: ${error.message}`);
      }
    }
  });
  
  // Verificar el estado de autenticación del usuario
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Usuario autenticado:", user.email);
    } else {
      console.log("Ningún usuario autenticado.");
    }
  });
  