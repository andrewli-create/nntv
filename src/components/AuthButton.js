import React, { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase"; // Verify this points cleanly to your firebase.js config file

export default function AuthButton({ className, style }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Dynamic event tracking pipeline hook
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // The button only treats verified emails as a valid session state
      if (user && user.emailVerified) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuthenticationClick = async () => {
    if (isLoggedIn) {
      try {
        await signOut(auth);
        // alert("You have successfully logged out.");
        navigate("/login");
      } catch (error) {
        console.error("We encountered an error while trying to log you out: ", error);
        // console.error("Logout execution fault:", error);
      }
    } else {
      navigate("/login");
    }
  };

  return (
    // <button
    //   onClick={handleAuthenticationClick}
    //   className={className || ""}
    //   style={{
    //     padding: "0.5rem 1.2rem",
    //     cursor: "pointer",
    //     fontWeight: "500",
    //     border: "1px solid #ccc",
    //     backgroundColor: isLoggedIn ? "#f8f9fa" : "#FFBD12",
    //     color: isLoggedIn ? "#333" : "#000",
    //     borderRadius: "4px",
    //     transition: "all 0.2s ease-in-out",
    //     ...style
    //   }}
    // >
    //   {isLoggedIn ? "Logout" : "Login"}
    // </button>
    //  <div className={'nav-sign-up-button-wrapper'}>
        <button onClick={handleAuthenticationClick} className={'nav-sign-up-button'}>
          <span>{isLoggedIn ? "Logout" : "Login"}</span>
        </button>
      // </div>
  );
}