// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA18MkipWmozHS5X_Si8DAn4Ow8CzGnDeQ",
  authDomain: "financial-blog-2b241.firebaseapp.com",
  projectId: "financial-blog-2b241",
  storageBucket: "financial-blog-2b241.appspot.com",
  messagingSenderId: "428499045008",
  appId: "1:428499045008:web:b1cf02238f631d2dade615",
  measurementId: "G-7993LPKTFL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export default app;