import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDt_3SBhHf5yilNo-Uzykb_Slj4NGm8Zdc",
  authDomain: "webcarros-e7079.firebaseapp.com",
  projectId: "webcarros-e7079",
  storageBucket: "webcarros-e7079.firebasestorage.app",
  messagingSenderId: "910254814129",
  appId: "1:910254814129:web:8b2f8f1370983ae22b4390"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage }