import React, { useState, useEffect, useRef } from "react";
import { Link, navigate } from "gatsby";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import Layout from "../../components/Layout";
import ReactPlayer from "react-player";
import loginVideo from "../../img/login_small.mp4"
import mainLogo from "../../img/footer_logo_large.png"
import '../../style/custom-style-css.css';




export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const playerRef = useRef(null);
  const START_TIME_IN_SECONDS = 45; // Start at 0:45

  const handlePlayerReady = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(START_TIME_IN_SECONDS, 'seconds');
    }
  };

  // =========================================================
  // AUTH REDIRECT GUARD: Check if already logged in
  // =========================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        // 1. Try fetching by secure UID first
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        
        let role = null;

        if (docSnap.exists()) {
          role = docSnap.data().role;
        } else {
          // Fallback: Check if they are a newly claimed account awaiting migration
          const emailRef = doc(db, "profiles", user.email.toLowerCase().trim());
          const emailSnap = await getDoc(emailRef);
          if (emailSnap.exists()) {
            role = emailSnap.data().role;
          }
        }

        // 2. If a profile matrix was located via either path, route them forward
        if (role) {
          if (role === "admin") {
            // navigate("/admin-portal");
            navigate("/member-portal");
          } else {
            navigate("/member-portal");
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // =========================================================
      // CRITICAL GUARD: Stop unverified users early
      // =========================================================
      if (!user.emailVerified) {
        setError("Please verify your email address before logging in. Check your inbox and your spam/junk folder for the link.");
        await signOut(auth); 
        setLoading(false);
        return;
      }

      // =========================================================
      // IF VERIFIED: Safe to look up profile records
      // =========================================================
      
      // 1. Fetch profile matrix (checking UID first, falling back to Email if migrating)
      const profileRef = doc(db, "profiles", user.uid);
      let profileDoc = await getDoc(profileRef);
      let userData = null;

      if (profileDoc.exists()) {
        userData = profileDoc.data();
      } else {
        // Fallback check for unmigrated claiming flow
        const emailRef = doc(db, "profiles", user.email.toLowerCase().trim());
        const emailDoc = await getDoc(emailRef);
        if (emailDoc.exists()) {
          userData = emailDoc.data();
        }
      }
      
      if (userData) {
        const { userID, role } = userData;
        
        if (userID) {
          // 2. Lock the handle permanently in the tracking collection
          const userIdRef = doc(db, "userIDs", userID);
          await setDoc(userIdRef, { verified: true }, { merge: true });
        }

        // 3. Dynamic Portal Routing based on authorization roles
        if (role === "admin") {
          navigate("/member-portal");
          // navigate("/admin-portal");
        } else {
          navigate("/member-portal");
        }
      } else {
        setError("Profile data not found.");
        await signOut(auth); // Clean up state if document is entirely missing
      }

    } catch (err) {
      setError("Invalid email or password.");
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
      {/* <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}> */}
      <div className="container-fluid px-0">
        <div className="row gx-0">
          <div className="col-md-6 al-pos-r" style={{overflow: "hidden"}}>
            <div className="login-video-overlay" style={{}}/>
            <ReactPlayer
              ref={playerRef}
              // onReady={handlePlayerReady}
              url={loginVideo}
              playing={true}
              width={"100%"}
              height={"100%"}
              muted={true}
              controls={false}
              loop={true}
              playbackRate={1}
              playsInline={true}
              config={{
                file: {
                  playsInline: true,
                  attributes: {
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    },
                  },
                },
              }}
            />
            {/* <div style={{height: "150%", transform: "translateY(-16.75%) scale(1.7)", pointerEvents: "none"}}>
              <ReactPlayer
                url={"https://youtu.be/2kQgCti3AlA?si=VAoKzJHVx9q4LicA"}
                playing={true}
                width={"100%"}
                height={"100%"}
                muted={true}
                controls={false}
                config={{
                  youtube: {
                    playerVars: { modestbranding: 1, disablekb: 0, loop: 1, showinfo: 0 }
                  }
                }}
              /> 
            </div> */}
          </div>
          <div className="col-md-6 login-form-wrapper order-first order-md-0" style={{minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 30, paddingRight: 30}}>
            <img src={mainLogo} style={{width: 250, marginBottom: 20}}/>            
            {/* <h2 style={{marginTop: 30, fontSize: 25, fontWeight: "bold" }}>Login</h2> */}
            <h1 class=" al-pos-r display-block font-report-regular" style={{width: 70, fontWeight: "bold", marginBottom: 10}}>
              Login
              <span class="yellow-accent" style={{left: 0}}></span>
            </h1>
            <p style={{marginBottom: !error ? 15 : ""}}>Welcome to NNTV's Network Hub! Login to your profile below.</p>
            {error && <p style={{ color: "red", marginBottom: 15 }}>{error}</p>}
            
            <form onSubmit={handleLogin}>
              <div style={{ position: "relative", width: "100%", maxWidth: 500 }}>
                <label>Email</label><br />
                <input type="email" required onChange={(e) => setEmail(e.target.value)} style={{ paddingRight: "40px", width: "100%" }}/>
              </div>
              <br />
              <div>
                <label>Password</label><br />
                
                <div style={{ position: "relative", width: "100%", maxWidth: 500 }}>
                  <input type={showPassword ? "text" : "password"} required onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: "40px", width: "100%" }}/>
                  <span 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </span>
                </div>
              </div>
              <br />
              <button type="submit" disabled={loading} className="button-generic button-accent responsive-network-button">
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>
            
            <p style={{ marginTop: "1rem" }}>
              Don't have an account yet? <Link to={import.meta.env ? "/signup" : "/signup"}>Sign up here</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}