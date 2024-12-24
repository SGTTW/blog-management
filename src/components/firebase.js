// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// import getFireStore from firebase/firestore
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSKH9qY4DUKZee_jHAaSQHbsOSjrxTbes",
  authDomain: "blog-management-fb31c.firebaseapp.com",
  projectId: "blog-management-fb31c",
  storageBucket: "blog-management-fb31c.firebasestorage.app",
  messagingSenderId: "53853519804",
  appId: "1:53853519804:web:de9f6ecfe8b01a48dd75b9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
