import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { GoogleAuthProvider } from "firebase/auth";

export const provider = new GoogleAuthProvider();
provider.addScope("profile phone");

const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE;
if (!firebaseConfig) throw new Error("Firebase config not found");

// Initialize Firebase
export const PARSED_FIREBASE_CONFIG = JSON.parse(firebaseConfig.toString());

let app;
app = initializeApp(PARSED_FIREBASE_CONFIG as any);
export const AUTH = getAuth(app);
