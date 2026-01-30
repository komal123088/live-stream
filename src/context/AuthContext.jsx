import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  // 📌 Email + Password Register
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // 📌 Email + Password Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // 📌 Google Login
  const googleLogin = () => signInWithPopup(auth, googleProvider);

  // 📌 Facebook Login
  const facebookLogin = () => signInWithPopup(auth, facebookProvider);

  // 📩 OTP / Magic Link
  const sendOTPToEmail = async (email) => {
    const actionCodeSettings = {
      url: window.location.origin + "/complete-signup",
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);
    alert("Check your email! Verification link sent 😊");
  };

  // 🔐 Confirm OTP
  const confirmOTPLogin = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) email = window.prompt("Please confirm your email:");
      const result = await signInWithEmailLink(
        auth,
        email,
        window.location.href
      );
      window.localStorage.removeItem("emailForSignIn");
      return result.user;
    }
  };

  // 🚪 Logout
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        googleLogin,
        facebookLogin,
        sendOTPToEmail,
        confirmOTPLogin,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
