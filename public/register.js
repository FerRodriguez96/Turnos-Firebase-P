import { firebaseConfig } from "./config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore Database

// Función de registro
function registrar(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const clave = document.getElementById("clave").value;

    // Crear usuario
    createUserWithEmailAndPassword(auth, email, clave)
        .then(async (userCredential) => {
            const user = userCredential.user;
            console.log("Usuario registrado:", user.email);

            // Guardar el usuario en Firestore con el nombre incluido
            await setDoc(doc(db, "users", user.uid), {
                nombre: nombre,
                email: user.email,
                role: "guest" // Asignar un rol por defecto
            });

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


document.getElementById("btnRegistrar").addEventListener("click", registrar);

