import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
// Make sure to import your db instance correctly based on your file structure
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase"; // Adjust this import path to your firebase config
import NetworkMemberPageTemplate from "../templates/network-member-page";

const NotFoundPage = ({ location }) => {
  const [dynamicProfile, setDynamicProfile] = useState(null);
  const [systemBadges, setSystemBadges] = useState([]);
  const [userTheme, setUserTheme] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [isProfileRoute, setIsProfileRoute] = useState(false);

  useEffect(() => {
    // Safety check for SSR build
    if (!location) return;

    const pathParts = location.pathname.split("/").filter(Boolean);
    
    // Check if URL is like /network/some-user-id
    if (pathParts[0] === "network-hub" && pathParts[1]) {
      setIsProfileRoute(true);
      const urlId = pathParts[1];

      const fetchDynamicData = async () => {
        try {
          // 1. Fetch System Badges
          const badgesSnap = await getDocs(collection(db, "badges"));
          const badgesArr = badgesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSystemBadges(badgesArr);

          // 2. Fetch Profile by matching userID to the URL slug
          const profilesRef = collection(db, "profiles");
          const q = query(profilesRef, where("userID", "==", urlId));
          const profileSnap = await getDocs(q);

          if (!profileSnap.empty) {
            const liveProfileData = profileSnap.docs[0].data();
            
            // Format it exactly how GraphQL would output it for the template
            setDynamicProfile({ firestoreProfiles: liveProfileData });

            // 3. Fetch User Theme if they have one selected
            if (liveProfileData.selectedTheme) {
              const themesRef = collection(db, "themes");
              const themeQ = query(themesRef, where("id", "==", liveProfileData.selectedTheme));
              const themeSnap = await getDocs(themeQ);
              
              if (!themeSnap.empty) {
                setUserTheme(themeSnap.docs[0].data());
              }
            }
          }
        } catch (err) {
          console.error("Error fetching dynamic fallback profile:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchDynamicData();
    } else {
      setLoading(false);
    }
  }, [location]);

  // --- RENDER 1: Loading State for Profile Routes ---
  if (isProfileRoute && loading) {
    return (
      // <Layout>
        <div style={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <h2>Loading Profile...</h2>
        </div>
      // </Layout>
    );
  }

  // --- RENDER 2: The Found Dynamic Profile! ---
  if (isProfileRoute && dynamicProfile) {
    return (
      // <Layout>
        <NetworkMemberPageTemplate 
          data={dynamicProfile} 
          systemBadges={systemBadges} 
          userTheme={userTheme} 
        />
      // </Layout>
    );
  }

  // --- RENDER 3: The True 404 Page (Not a profile route, or profile didn't exist) ---
  return (
    <Layout>
      {/* <div>
        <h1>NOT FOUND</h1>
        <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      </div> */}
      <div className="display-flex d-flex-c d-flex-row" style={{ minHeight: "60vh" }}>
        <div className="display-flex d-flex-c d-flex-col">
          <div style={{ width: "100%", padding: "0 35px" }} className="display-flex d-flex-c d-flex-col">
            <h1 style={{ marginBottom: "20px" }}>Sorry, the page you are looking for does not exist.</h1>
            <p style={{ marginBottom: "20px" }}>Please check if the URL you typed is correct.</p>
            <a href="/">
              <button className="button-generic">Back to Home Page</button>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;