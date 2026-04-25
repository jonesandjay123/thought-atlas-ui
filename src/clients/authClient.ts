import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { getThoughtAtlasApp, hasFirebaseConfig } from "./firebaseApp";

export const OWNER_EMAIL = "jonesandjay123@gmail.com";

export type AuthSnapshot = {
  user: User | null;
  email: string | null;
  isOwner: boolean;
  ready: boolean;
};

export function subscribeToAuthState(callback: (snapshot: AuthSnapshot) => void) {
  if (!hasFirebaseConfig()) {
    callback({ user: null, email: null, isOwner: false, ready: true });
    return () => undefined;
  }

  const auth = getAuth(getThoughtAtlasApp());
  return onAuthStateChanged(auth, (user) => {
    const email = user?.email ?? null;
    callback({ user, email, isOwner: email === OWNER_EMAIL, ready: true });
  });
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithPopup(getAuth(getThoughtAtlasApp()), provider);
}

export async function logout() {
  await signOut(getAuth(getThoughtAtlasApp()));
}
