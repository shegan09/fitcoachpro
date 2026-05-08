import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBmzsec6Ezi9PzGersK03jI2Y_iYMBNMZk",
  authDomain: "fitcoachpro-5b092.firebaseapp.com",
  projectId: "fitcoachpro-5b092",
  storageBucket: "fitcoachpro-5b092.firebasestorage.app",
  messagingSenderId: "411812959421",
  appId: "1:411812959421:web:aa10bd3306149c28a5d3d4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);