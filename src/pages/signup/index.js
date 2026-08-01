import React, { useState, useEffect } from "react";
import { Link, navigate } from "gatsby";
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import Layout from "../../components/Layout";
import ReactPlayer from "react-player";
import loginVideo from "../../img/login_small.mp4";
import mainLogo from "../../img/footer_logo_large.png";
import '../../style/custom-style-css.css';

export default function SignUp() {
  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userID, setUserID] = useState("");
  const [refCode, setRefCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // New states for the requested features
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isCheckingID, setIsCheckingID] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [idCheckColor, setIdCheckColor] = useState("");

  // =========================================================
  // AUTH REDIRECT GUARD: Check if already logged in
  // =========================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.role === "admin") {
            navigate("/admin-portal");
          } else {
            navigate("/member-portal");
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sanitize handle to only allow lowercase letters, numbers, dashes
  const handleUserIDChange = (e) => {
    const sanitized = e.target.value
      .toLowerCase()
      .replace(/\s+/g, "-")          
      .replace(/[^a-z0-9-]/g, ""); 
    setUserID(sanitized);
  };

  // =========================================================
  // REAL-TIME USER ID AVAILABILITY CHECK
  // =========================================================
  useEffect(() => {
    if (!userID) {
      return;
    } else if (userID.length < 3) {
      setIdCheckMessage("At least 3 characters");
      setIdCheckColor("#ff4d4d");
      return;
    }

    const checkAvailability = async () => {
      setIsCheckingID(true);
      try {
        const userIdRef = doc(db, "userIDs", userID);
        const userIdDoc = await getDoc(userIdRef);
        
        if (userIdDoc.exists()) {
          const data = userIdDoc.data();
          
          // 💡 NEW LOGIC: Check for verified OR Legacy accounts
          // If there is no reservedAt, we assume it's a manually imported legacy ID
          if (data.verified === true || (data.email && !data.reservedAt)) {
            setIdCheckMessage("❌ ID taken");
            setIdCheckColor("#ff4d4d");
          } else {
            
            // 💡 THE FIX: Safely parse the date whether it's a Firestore Timestamp OR a String
            let reservedAtDate = null;
            if (data.reservedAt) {
              reservedAtDate = typeof data.reservedAt.toDate === 'function' 
                ? data.reservedAt.toDate() 
                : new Date(data.reservedAt);
            }

            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            if (reservedAtDate && reservedAtDate > twentyFourHoursAgo) {
              // setIdCheckMessage("⏳ ID reserved by another user, please check back later");
              setIdCheckMessage("⏳ ID reserved");
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

    // Debounce the check so it doesn't spam the database on every keystroke
    const timeoutId = setTimeout(() => {
      checkAvailability();
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [userID]);

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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TEMPORARY BETA RESTRICTION
    const allowedBetaCodes = ["NNTV2026", "UOFT", "MTDM", "STUDENT"]; // Add more codes here as needed
    if (!allowedBetaCodes.includes(refCode.toUpperCase())) {
      setError("Our platform is currently beta and registration is restricted. Please provide a valid reference code.");
      // setError("Registration is currently restricted to beta testers. Invalid code.");
      setLoading(false);
      return;
    }

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

    try {
      // 1. Enforce Unique Constraints & Anti-Squatting Logic
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

      // 2. Create Auth Account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Send Verification Email
      await sendEmailVerification(user);

      // 4. Reserve the User ID
      await setDoc(userIdRef, {
        uid: user.uid,
        email: email,
        verified: false,
        reservedAt: serverTimestamp()
      });

      // 5. Setup Firestore Profile
      const profileRef = doc(db, "profiles", user.uid);
      const existingMigrationRef = doc(db, "profiles", email); 
      const existingDoc = await getDoc(existingMigrationRef);

      let profileData = {};

      if (existingDoc.exists()) {
        profileData = existingDoc.data();
        profileData.userID = userID; 
        profileData.profileName = profileName; 
      } else {
        // let yearsToAdd = refCode.toUpperCase() === "STUDENT" ? 2 : 1;
        let yearsToAdd = refCode.toUpperCase() === "InvalidCode" ? 2 : 1;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + yearsToAdd);

        profileData = {
          email: email,
          userID: userID, 
          profileName: profileName, 
          role: "member", 
          memberType: "regular",
          profileStatus: "pending",
          joinDate: new Date().toISOString(),
          expiryDate: expiryDate.toISOString(),
          bio: "",
          profileImage: "",
          coverImage: "",
          referenceCode: refCode || "",
        };
      }

      await setDoc(profileRef, profileData);
      
      // Clean up the local storage state session instantly since they are unverified
      await signOut(auth);

      alert("Account created! Please check your email inbox (and spam box!) for the verification link.");
      navigate("/login");

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("We found an account with this email. Please log in.");
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
      <div className="container-fluid px-0">
        <div className="row gx-0">
          <div className="col-md-6 al-pos-r">
            <div className="login-video-overlay" style={{}}/>
            <ReactPlayer
              url={loginVideo}
              playing={true}
              width={"100%"}
              height={"100%"}
              muted={true}
              controls={false}
              loop={true}
              // playbackRate={1}
              playsInline={true}
              config={{
                file: {
                  attributes: {
                    webkitPlaysInline: true,
                    playsInline: true,
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    },
                  },
                },
              }}
            /> 
          </div>
          <div className="col-md-6 login-form-wrapper order-first order-md-0" style={{minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
            <img src={mainLogo} style={{width: 250, marginBottom: 20}} alt="Main Logo"/>   
            <h1 className="al-pos-r display-block font-report-regular signup-title" style={{fontWeight: "bold", marginBottom: 10}}>
              Sign Up
              <span className="yellow-accent" style={{left: 0}}></span>
            </h1>
            <p style={{marginBottom: !error? 15 : 0}}>Welcome to NNTV's Network Hub! Start by creating your account below.</p>
            {error && <p style={{ color: "red", marginBottom: 15 }}>{error}</p>}
            
            <form onSubmit={handleSignUp}>
              <div className="signup-form-row">
                <div>
                  <label>Full Display Name <span className="required-text">*</span></label><br />
                  <input type="text" required onChange={(e) => setProfileName(e.target.value)} placeholder="e.g., John Doe" />
                </div>
                <div>
                  <label>User ID (Can't be changed later) <span className="required-text">*</span></label><br />
                  <div style={{display: "flex", flexDirection: "row", gap:5}}>
                    <input className="user-id-field" type="text" required value={userID} placeholder="e.g., john-doe" onChange={handleUserIDChange} />                  
                    {/* Real-time ID check output */}
                    {idCheckMessage && (
                      <small className="hide-from-mobile" style={{ color: idCheckColor, marginTop: "4px" }}>
                        {isCheckingID ? "Checking..." : idCheckMessage}
                      </small>
                    )}
                  </div>
                  <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                    <small style={{ color: "#666" }}>Your URL: /network-hub/{userID || "john-doe"}</small>
                    {idCheckMessage && (
                      <small className="hide-from-laptop" style={{ color: idCheckColor, marginTop: "4px" }}>
                        {isCheckingID ? "Checking..." : idCheckMessage}
                      </small>
                    )}
                  </div>
                </div>
              </div>
              <div className="signup-form-row mt-3">
                <div>
                  <label>Email <span className="required-text">*</span></label><br />
                  <input type="email" required onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label>Reference Code <span className="required-text">*</span></label><br />
                  <input type="text" required onChange={(e) => setRefCode(e.target.value)} placeholder="Enter your invite code" />
                </div>
              </div>
              <div className="signup-form-row">
                <div>
                  <label>Password <span className="required-text">*</span></label><br />
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      style={{ paddingRight: "40px", width: "100%" }}
                    />
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
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px", marginTop: "4px" }}>
                        <span style={{ color: passwordRules.length ? "#2ecc71" : "#95a5a6" }}>{passwordRules.length ? "✓" : "✕"} 8+ Chars</span>
                        <span style={{ color: passwordRules.upper ? "#2ecc71" : "#95a5a6" }}>{passwordRules.upper ? "✓" : "✕"} ABC</span>
                        <span style={{ color: passwordRules.lower ? "#2ecc71" : "#95a5a6" }}>{passwordRules.lower ? "✓" : "✕"} abc</span>
                        <span style={{ color: passwordRules.number ? "#2ecc71" : "#95a5a6" }}>{passwordRules.number ? "✓" : "✕"} 123</span>
                        <span style={{ color: passwordRules.special ? "#2ecc71" : "#95a5a6" }}>{passwordRules.special ? "✓" : "✕"} #@$</span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label>Confirm Password</label><br />
                  <div style={{ position: "relative" }}>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      style={{ paddingRight: "40px", width: "100%" }}
                    />
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
                
              </div>
              <br />
              <button type="submit" disabled={loading || isCheckingID || (idCheckColor === "#ff4d4d")} className="button-generic button-accent responsive-network-button">
                {loading ? "Registering..." : "Sign Up"}
              </button>
            </form>
            
            <p style={{ marginTop: "1rem" }}>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}