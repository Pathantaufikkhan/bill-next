// /lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyB5nLG0gnswAsLo0a8YIel9EGnymKfXirA",
    authDomain: "bill-storage-b94ee.firebaseapp.com",
    projectId: "bill-storage-b94ee",
    storageBucket: "bill-storage-b94ee.appspot.com",
    messagingSenderId: "312798363886",
    appId: "1:312798363886:web:8cef4428a39b1071e173ff",
    measurementId: "G-VHCV7XN1PZ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const storage = getStorage(app);

export { storage };
