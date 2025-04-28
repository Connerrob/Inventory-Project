import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0K7Lbxz67NK1y2LXd9EdTMRgdl_VhF7M",
  authDomain: "inventoryapp-5d955.firebaseapp.com",
  projectId: "inventoryapp-5d955",
  storageBucket: "inventoryapp-5d955.appspot.com", // <-- fixed here
  messagingSenderId: "593660543855",
  appId: "1:593660543855:web:f92272b7b000bc2a441e9a"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
