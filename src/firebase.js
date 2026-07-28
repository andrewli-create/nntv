// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCQRf5-3eaF7-Z5RpAq9gqku96g-hgul5M",
//   authDomain: "noneedtovanish.firebaseapp.com",
//   projectId: "noneedtovanish",
//   storageBucket: "noneedtovanish.firebasestorage.app",
//   messagingSenderId: "947318550815",
//   appId: "1:947318550815:web:0d5eb022133e817263002a",
//   measurementId: "G-3NSN9L88WE"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);


import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Replace these with your actual Firebase config object from the console
  apiKey: "AIzaSyCQRf5-3eaF7-Z5RpAq9gqku96g-hgul5M",
  authDomain: "noneedtovanish.firebaseapp.com",
  projectId: "noneedtovanish",
  storageBucket: "noneedtovanish.firebasestorage.app",
  messagingSenderId: "947318550815",
  appId: "1:947318550815:web:0d5eb022133e817263002a",
  measurementId: "G-3NSN9L88WE"
};

// Initialize only once (prevents errors during Gatsby's hot-reloading)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);