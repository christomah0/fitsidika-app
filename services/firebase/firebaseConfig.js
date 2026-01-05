import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAACYWvviDcNbSwn5vzu2SG1eEggskES5U",
  authDomain: "fitsidika-app.firebaseapp.com",
  projectId: "fitsidika-app",
  storageBucket: "fitsidika-app.firebasestorage.app",
  messagingSenderId: "482315319168",
  appId: "1:482315319168:web:9432b3f0bc34f491a43365",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);