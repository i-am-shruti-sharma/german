import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig =  {
    apiKey: "AIzaSyCs2zlg5s10BZIFMMeiJTyzoq3gHyzA9lE",
    authDomain: "german-dict.firebaseapp.com",
    projectId: "german-dict",
    storageBucket: "german-dict.firebasestorage.app",
    messagingSenderId: "1070600099592",
    appId: "1:1070600099592:web:d2241e8c17bf46a2fafebd",
    measurementId: "G-J8QQ2ZXJP1"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
