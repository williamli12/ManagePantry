// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzL4-k8Ot4-RNsUKxhUZv_N15qMFyHaZE",
  authDomain: "inventorymanagement-project.firebaseapp.com",
  projectId: "inventorymanagement-project",
  storageBucket: "inventorymanagement-project.appspot.com",
  messagingSenderId: "545192176249",
  appId: "1:545192176249:web:69cda95644d3742bb382a8",
  measurementId: "G-Z9ZXSCG4E1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore};