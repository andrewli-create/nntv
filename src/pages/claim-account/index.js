import React, { useState, useEffect } from "react";
import { Link, navigate } from "gatsby";
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { deleteDoc } from "firebase/firestore"; // Ensure this is imported at the top of your file
import Layout from "../../components/Layout";
import ReactPlayer from "react-player";
import loginVideo from "../../img/login_small.mp4";
import mainLogo from "../../img/footer_logo_large.png";
import '../../style/custom-style-css.css';

export default function ClaimAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userID, setUserID] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingID, setIsCheckingID] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [idCheckColor, setIdCheckColor] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================================================
  // AUTH REDIRECT GUARD: Check if already logged in & verified
  // =========================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.role === "admin") {
            navigate("/network-hub");
          } else {
            navigate("/member-portal");
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sanitize handle to only allow lowercase letters, numbers, dashes, and dots
  const handleUserIDChange = (e) => {
    const sanitized = e.target.value
      .toLowerCase()
      .replace(/\s+/g, "-")          
      .replace(/[^a-z0-9-]/g, "");   
    setUserID(sanitized);
  };

  // =========================================================
  // REAL-TIME USER ID AVAILABILITY CHECK (CLAIM PAGE)
  // =========================================================
  useEffect(() => {
    if (!userID || userID.length < 3) {
      setIdCheckMessage("");
      return;
    }

    const checkAvailability = async () => {
      setIsCheckingID(true);
      const cleanInputEmail = email.trim().toLowerCase();
      
      try {
        const userIdRef = doc(db, "userIDs", userID);
        const userIdDoc = await getDoc(userIdRef);
        
        if (userIdDoc.exists()) {
          const data = userIdDoc.data();
          
          // 💡 NEW LOGIC: Check if this ID belongs to the email they are currently typing
          if (data.email && data.email.toLowerCase() === cleanInputEmail) {
             setIdCheckMessage("✅ ID reserved for you!");
             setIdCheckColor("#2ecc71");
             setIsCheckingID(false);
             return; // Stop checking, it's theirs!
          }

          // If it doesn't match their email, run standard taken checks
          if (data.verified === true || (data.email && !data.reservedAt)) {
            setIdCheckMessage("❌ ID taken");
            setIdCheckColor("#ff4d4d");
          } else {
            const reservedAt = data.reservedAt?.toDate();
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (reservedAt && reservedAt > twentyFourHoursAgo) {
              setIdCheckMessage("⏳ ID reserved by another user");
              setIdCheckColor("#f39c12");
            } else {
              setIdCheckMessage("✅ ID Available");
              setIdCheckColor("#2ecc71");
            }
          }
        } else {
          setIdCheckMessage("✅ ID Available");
          setIdCheckColor("#2ecc71");
        }
      } catch (err) {
        console.error("Error checking ID availability:", err);
      } finally {
        setIsCheckingID(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkAvailability();
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [userID, email]); // <-- Important: email is in the dependency array now

  // =========================================================
  // PASSWORD REQUISITE STRENGTH VALIDATION ENGINE
  // =========================================================
  const passwordRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const validRulesCount = Object.values(passwordRules).filter(Boolean).length;
  
  let strengthLabel = "Weak";
  let strengthColor = "#ff4d4d";
  if (validRulesCount === 5) {
    strengthLabel = "Strong";
    strengthColor = "#2ecc71";
  } else if (validRulesCount >= 3) {
    strengthLabel = "Medium";
    strengthColor = "#f39c12";
  }

  const handleClaim = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // Hard Rule Validation Checking
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (validRulesCount < 5) {
      setError("Your password does not satisfy all structural requirements below.");
      setLoading(false);
      return;
    }

    if (!userID || userID.length < 3) {
      setError("User ID must be at least 3 characters long.");
      setLoading(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Verify this email actually exists in your pre-imported profiles directory
      const emailDocRef = doc(db, "profiles", cleanEmail);
      const emailDocSnap = await getDoc(emailDocRef);

      if (!emailDocSnap.exists()) {
        // setError("This email address was not found in our pre-imported directory. Please use standard Sign Up or contact an administrator.");
        setError("This email address was not found in our database. Please contact the administrator if you believe this is incorrect.");
        setLoading(false);
        return;
      }

      const legacyProfileData = emailDocSnap.data();
      const legacyUserID = legacyProfileData.userID;

      // 2. Enforce Unique Constraints on the chosen User ID slug
      const userIdRef = doc(db, "userIDs", userID);
      const userIdDoc = await getDoc(userIdRef);

      if (userIdDoc.exists()) {
        const data = userIdDoc.data();
        if (data.verified === true) {
          setError("This User ID is already taken by a registered member.");
          setLoading(false);
          return;
        } else {
          const reservedAt = data.reservedAt?.toDate();
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          if (reservedAt && reservedAt > twentyFourHoursAgo) {
            setError("This User ID is currently pending verification by another user.");
            setLoading(false);
            return;
          }
        }
      }

      // 3. Create the real Firebase Authentication credentials
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // 4. Dispatch the secure verification link to their email inbox
      await sendEmailVerification(user);

      // 5. Reserve the User ID Mapping Node
      await setDoc(userIdRef, {
        uid: user.uid,
        email: cleanEmail,
        verified: false,
        reservedAt: serverTimestamp()
      });

      // 💡 NEW LOGIC: If they picked a DIFFERENT ID than the one we pre-assigned, 
      // delete the old one from the userIDs collection so it goes back to the public pool      
      if (legacyUserID && legacyUserID !== userID) {
        const oldIdRef = doc(db, "userIDs", legacyUserID);
        await deleteDoc(oldIdRef);
      }

      // 6. Stash their newly generated userID directly into the placeholder profile document
      // This ensures that member-portal.js reads it correctly during lazy migration
      await setDoc(emailDocRef, { userID: userID }, { merge: true });

      // 7. Sign out instantly because their email is not verified yet
      await signOut(auth);

      // setMessage("Account verification sent! Please check your email inbox and click the verification link to unlock your pre-imported profile.");
      setMessage("Account verification email sent! Please check your inbox (and spam box) and click the verification link verify your profile.");
      setError("");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This account has already been claimed. Please go to the Login page.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // SVG Eye Icon Components for reuse
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
  
  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  return (
    <Layout>
      <div style={{ maxWidth: "80%", margin: "0 auto", paddingTop: 40, paddingBottom: 40 }}>
        <div style={{maxWidth: 550, margin: "auto"}}>
          <h1>Claim Account</h1>
          <p style={{ color: "#666", fontSize: "14px" }}>
            {/* Verify your pre-imported administrator profile and choose your unique workspace link credentials. */}
            Existing member? Claim your account here with the email you provided to the administrator previously.
          </p>
          
          {error && <p style={{ color: "red", fontSize: 15}}>{error}</p>}
          {message && <p style={{ color: "green", fontSize: 15 }}>{message}</p>}
          
          {!message && (
            <form onSubmit={handleClaim} style={{width: "100%"}}>
              <div>
                <label>Registered Email Address <span className="required-text">*</span></label><br />
                <input className="width-100-pc" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., example@gmail.com" />
              </div>
              <br />
              <div>
                <label>User ID (Can't be changed later, only lowercase letters, numbers and '-' allowed) <span className="required-text">*</span></label><br />
                <input className="width-100-pc" type="text" required value={userID} placeholder="e.g., john-doe" onChange={handleUserIDChange} />
                <small style={{ color: "#666" }}><br />Preview: domain.com/member-hub/{userID || "your-id"}</small>
              </div>
              <br />
              <div>
                <label>Create Password <span className="required-text">*</span></label><br />
                <div style={{ position: "relative" }}>
                  <input className="width-100-pc" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <span 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </span>
                </div>
                
                {/* Dynamic strength output panel */}
                {password && (
                  <div style={{ marginTop: "5px", fontSize: "13px" }}>
                    Password Strength: <span style={{ color: strengthColor, fontWeight: "bold" }}>{strengthLabel}</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px", marginTop: "4px" }}>
                      <span style={{ color: passwordRules.length ? "#2ecc71" : "#95a5a6" }}>✕ 8+ Chars</span>
                      <span style={{ color: passwordRules.upper ? "#2ecc71" : "#95a5a6" }}>✕ ABC</span>
                      <span style={{ color: passwordRules.lower ? "#2ecc71" : "#95a5a6" }}>✕ abc</span>
                      <span style={{ color: passwordRules.number ? "#2ecc71" : "#95a5a6" }}>✕ 123</span>
                      <span style={{ color: passwordRules.special ? "#2ecc71" : "#95a5a6" }}>✕ #@$</span>
                    </div>
                  </div>
                )}
              </div>
              <br />
              <div>
                <label>Confirm Password <span className="required-text">*</span></label><br />
                <div style={{ position: "relative" }}>
                  <input type={showConfirmPassword ? "text" : "password"} className="width-100-pc" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <span 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </span>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <small style={{ color: "red" }}><br />Passwords do not match.</small>
                )}
              </div>
              <br />
              <button type="submit" disabled={loading} className="button-generic button-accent responsive-network-button">
                {loading ? "Verifying Records..." : "Claim My Account"}
              </button>
              
            </form>
          )}

          {message && (
            <Link to="/login">Go to Login</Link>
          )}
          
          {!message && <p style={{ marginTop: "1rem" }}>
            Looking to log in instead? <Link to="/login">Login here</Link>
          </p>}
        </div>
      </div>
    </Layout>
  );
}