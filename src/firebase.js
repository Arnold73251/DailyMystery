import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {

    apiKey:
        "AIzaSyCc7Veo50xuVYJM7fndN0I3JZW1f-kjJpg",

    authDomain:
        "dailymystery-fba86.firebaseapp.com",

    projectId:
        "dailymystery-fba86",

    storageBucket:
        "dailymystery-fba86.firebasestorage.app",

    messagingSenderId:
        "4344495651",

    appId:
        "1:4344495651:web:9995cce53af7ff4c753b96",

    measurementId:
        "G-H6C4B7WD1X"

};


const app =
    initializeApp(firebaseConfig);


export const auth =
    getAuth(app);


export const db =
    getFirestore(app);