// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import the getAuth function

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCg4QOgKCppUXLexFPb477_X8vdswrGfMs",
  authDomain: "relearn-38885.firebaseapp.com",
  projectId: "relearn-38885",
  storageBucket: "relearn-38885.firebasestorage.app",
  messagingSenderId: "1045308777393",
  appId: "1:1045308777393:web:7f92904b9406506b819390"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app); // Get the auth instance

export { auth }; // Export the auth instance for use in your application
