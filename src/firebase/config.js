// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCc0cL3rcfrGeC-b1j3qQf6C6AZSN6L8v8",
  authDomain: "llega-unimet.firebaseapp.com",
  projectId: "llega-unimet",
  storageBucket: "llega-unimet.firebasestorage.app",
  messagingSenderId: "3835931466",
  appId: "1:3835931466:web:f13bd07386f3f8b7bbafb3",
  measurementId: "G-2KBB3V67W5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);