// Firebase loads lazily — config is kept in this file to avoid module export issues.
const firebaseConfig = {
  apiKey: "AIzaSyBytHma1brDH5dInrAj1ipVuSEAJMljl8s",
  authDomain: "campus-2627b.firebaseapp.com",
  projectId: "campus-2627b",
  storageBucket: "campus-2627b.firebasestorage.app",
  messagingSenderId: "819181231425",
  appId: "1:819181231425:web:16e38be50565eeccc055c0",
  measurementId: "G-7NY8Z58JRX"
};

export const firebaseEnabled =
  !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

if (typeof window !== "undefined") {
  window.__campusFirebaseEnabled = firebaseEnabled;
}

let _fb = null; // { app, auth, db, ...methods }
let _loading = null;

export const loadFirebase = async () => {
  if (!firebaseEnabled) return null;
  if (_fb) return _fb;
  if (_loading) return _loading;
  _loading = (async () => {
    const [appMod, authMod, fsMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"),
    ]);
    const app = appMod.initializeApp(firebaseConfig);
    const auth = authMod.getAuth(app);
    const db = fsMod.getFirestore(app);
    try { await authMod.setPersistence(auth, authMod.browserLocalPersistence); } catch {}
    _fb = {
      app, auth, db,
      onAuthStateChanged: authMod.onAuthStateChanged,
      signInWithEmailAndPassword: authMod.signInWithEmailAndPassword,
      createUserWithEmailAndPassword: authMod.createUserWithEmailAndPassword,
      updateProfile: authMod.updateProfile,
      signOut: authMod.signOut,
      sendEmailVerification: authMod.sendEmailVerification,
      sendPasswordResetEmail: authMod.sendPasswordResetEmail,
      doc: fsMod.doc, getDoc: fsMod.getDoc, setDoc: fsMod.setDoc, updateDoc: fsMod.updateDoc, deleteDoc: fsMod.deleteDoc,
      collection: fsMod.collection, addDoc: fsMod.addDoc, getDocs: fsMod.getDocs,
      query: fsMod.query, where: fsMod.where, orderBy: fsMod.orderBy, limit: fsMod.limit,
      serverTimestamp: fsMod.serverTimestamp,
      onSnapshot: fsMod.onSnapshot,
    };
    return _fb;
  })();
  return _loading;
};

export const getFb = () => _fb;
