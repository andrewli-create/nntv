import React, { useEffect, useState, useRef } from "react";
import { graphql, navigate } from "gatsby";
import Layout from "../components/Layout";
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/custom-style-css.css';
import defaultAvatar from "../img/default-avatar.svg"
import { serverTimestamp } from "firebase/firestore";

// 💡 Firebase imports for live dynamic role checking and setting records
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";

export const NetworkHubPageTemplate = ({ title, openingParagraph, buildTimeProfiles }) => {
  const [displayProfiles, setDisplayProfiles] = useState(buildTimeProfiles || []);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Drag and Drop Refs
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    // AOS.init();
    AOS.init({
      offset: 0, // default is 120; lower number triggers earlier
    });

    const auth = getAuth();
    const db = getFirestore();

    // 1. Dynamic Check: Verify if logged-in runtime viewer is an administrator
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const profileSnap = await getDoc(doc(db, "profiles", currentUser.uid));
          if (profileSnap.exists() && profileSnap.data().role === "admin") {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error("Admin verification error:", e);
        }
      } else {
        setIsAdmin(false);
      }
    });

    // 2. Client-side Hydration & Data Source Alignment
    const fetchLiveProfiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "profiles"));
        const mergedList = [...buildTimeProfiles];

        querySnapshot.forEach((docSnap) => {
          const liveUser = docSnap.data();
          if (!liveUser.userID) return;
          
          const cleanKey = liveUser.userID.toLowerCase().trim();
          const targetIdx = mergedList.findIndex(p => p.userID?.toLowerCase().trim() === cleanKey);

          if (targetIdx !== -1) {
            mergedList[targetIdx] = { ...mergedList[targetIdx], ...liveUser, firebaseDocId: docSnap.id };
          } else {
            mergedList.push({ id: docSnap.id, firebaseDocId: docSnap.id, ...liveUser });
          }
        });

        setDisplayProfiles(mergedList);
      } catch (error) {
        console.error("Failed to dynamically hydrate profiles snapshot:", error);
      }
    };

    fetchLiveProfiles();
    return () => unsubscribeAuth();
  }, [buildTimeProfiles]);

  // Administrative routine to initialize a clean placeholder member structure
  const handleCreateProfile = async () => {
    if (typeof window !== 'undefined') {
      const userID = window.prompt("Please provide a custom unique User ID for the new profile, this ID can only contain lowercase letters, numbers or '-' (e.g., john-doe-1998). This cannot be changed later:");
      if (!userID || userID.trim() === "") return;
      const profileName = window.prompt("Enter Full Member Name (e.g., Dr. John Doe):");
      if (!profileName || profileName.trim() === "") return;

      const emailAddress = window.prompt("Enter Registration Contact Email Address:");
      if (!emailAddress || emailAddress.trim() === "") return;

      const cleanEmail = emailAddress.toLowerCase().trim();
      const cleanUserID = userID.toLowerCase().trim();
      const cleanName = profileName.trim();

      try {
        const db = getFirestore();

        // 1. Put document into the profiles collection utilizing the Email reference string as the Key ID
        const newProfileDocRef = doc(db, "profiles", cleanEmail);
        const initialProfilePayload = {
          userID: cleanUserID,
          profileName: cleanName,
          profileStatus: "pending", 
          memberType: "regular",
          private: false,
          bio: "",
          about: "",
          services: [],
          expertises: [],
          languages: [],
          degrees: [],
          contacts: [],
          sampleOfWorks: [],
          images: []
        };
        await setDoc(newProfileDocRef, initialProfilePayload, { merge: true });

        // 2. Put tracking metadata directly into the validation userIDs verification repository
        const newUserIDDocRef = doc(db, "userIDs", cleanUserID);
        const verificationTokenPayload = {
          email: cleanEmail,
          // reservedAt: new Date().toISOString(),
          reservedAt: serverTimestamp(),
          displayOrder: "200"
        };
        await setDoc(newUserIDDocRef, verificationTokenPayload, { merge: true });

        alert(`Success! Entry provisioned for ${cleanName}. They can now link this data during authentication.`);
        
        // Instantly apply changes onto current view state so hard refresh is unnecessary
        setDisplayProfiles(prev => [
          ...prev, 
          { 
            id: cleanEmail, 
            firebaseDocId: cleanEmail, 
            ...initialProfilePayload 
          }
        ]);
      } catch (err) {
        alert(`Database operation rejected: ${err.message}`);
      }
    }
  };

  const truncateString = (str, maxLength) => {
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + '...';
    }
    return str;
  }

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    // Slight transparency effect while dragging
    e.target.style.opacity = '0.5';
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = async (e) => {
    e.target.style.opacity = '1'; // Reset opacity

    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    setIsSavingOrder(true);

    // 1. Clone the locally sorted active items
    const newOrderedProfiles = [...activeProfiles];
    
    // 2. Remove the dragged item and insert it at the new position
    const draggedItemContent = newOrderedProfiles.splice(dragItem.current, 1)[0];
    newOrderedProfiles.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;

    // 3. Normalize: Assign clean, sequential string numbers, fixing duplicates/nulls
    const db = getFirestore();
    const updates = [];
    const updatedDisplayProfiles = [...displayProfiles];

    newOrderedProfiles.forEach((profile, index) => {
      const newOrderStr = String(index + 1); // Ensure it's a string!

      // If the order changed (or was missing/duplicate), track it for Firestore
      if (profile.displayOrder !== newOrderStr) {
        // Find this profile in the main state array and update it
        const dpIndex = updatedDisplayProfiles.findIndex(p => p.id === profile.id);
        if (dpIndex !== -1) {
          updatedDisplayProfiles[dpIndex] = { ...updatedDisplayProfiles[dpIndex], displayOrder: newOrderStr };
        }

        // Queue for Firestore update (Make sure we have a firebaseDocId)
        if (profile.firebaseDocId) {
          updates.push({ docId: profile.firebaseDocId, newOrderStr });
        }
      }
    });

    // 4. Update UI instantly
    setDisplayProfiles(updatedDisplayProfiles);

    // 5. Sync to Firestore in the background
    try {
      await Promise.all(updates.map(update => {
        const docRef = doc(db, "profiles", update.docId);
        return setDoc(docRef, { displayOrder: update.newOrderStr }, { merge: true });
      }));
    } catch (error) {
      console.error("Error saving new profile order:", error);
      alert("There was an issue saving the new order. Please refresh and try again.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const getProfileSlug = (userID) => {
    if (!userID) return "";
    return userID.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const parseFlexibleDate = (expiryDate) => {
    if (!expiryDate) return null;
    if (typeof expiryDate.toDate === "function") return expiryDate.toDate();
    const seconds = expiryDate.seconds || expiryDate._seconds;
    if (seconds) return new Date(seconds * 1000);
    return new Date(expiryDate);
  };

  // Process item rules mapping reasons dynamically onto elements
  const processedProfiles = displayProfiles.map((profile) => {
    let statusFlag = "visible";
    let reasonText = "";

    if (profile.private === true) {
      statusFlag = "hidden";
      reasonText = "User set profile to private.";
    } else if (profile.expiryDate && profile.memberType !== "permanent") {
      const expiryDateObj = parseFlexibleDate(profile.expiryDate);
      if (expiryDateObj && new Date() > expiryDateObj) {
        statusFlag = "hidden";
        reasonText = "Profile Expired";
      }
    }

    const isReviewed = profile.profileStatus === "reviewed";
    const isVerifiedOrPermanent = ["permanent", "verified"].includes(profile.memberType);
    
    if (statusFlag === "visible" && !isReviewed && !isVerifiedOrPermanent) {
      statusFlag = "hidden";
      reasonText = profile.profileStatus === "pending" ? "Pending Admin Review" : `Status Hidden (${profile.profileStatus || "unverified"})`;
    }

    return { ...profile, statusFlag, reasonText };
  });

  // Filter: Admins view EVERY record, standard visitors only view 'visible' records
  const activeProfiles = processedProfiles
    .filter(p => isAdmin || p.statusFlag === "visible")
    .sort((a, b) => {
      const orderA = a.displayOrder !== undefined && a.displayOrder !== null ? parseInt(a.displayOrder, 10) : Infinity;
      const orderB = b.displayOrder !== undefined && b.displayOrder !== null ? parseInt(b.displayOrder, 10) : Infinity;
      return orderA - orderB;
    });

  return (
    <div className="container-fluid vertical-white-space-top al-no-pad-horizonal">
      <section id="our-team" className="al-mt-40">
        <div className="display-flex d-flex-c" style={{ marginBottom: "15px" }}>
          <h1 className="al-text-align-c al-pos-r display-inline-block font-report-regular">
            {title || "Network Hub"}
            <span className="yellow-accent"></span>
          </h1>            
        </div>
        <p className="al-text-align-c">{openingParagraph}</p>
        
        <div className="section-center network-section">
          <div className="row vertical-white-space-large network-hub-mobile-content" style={{ paddingTop: 20 }}>
            {isAdmin && (
              <div className="text-center p-3 rounded shadow-sm mx-auto position-relative" style={{ width: "100%", border: "none", backgroundColor: "rgb(231, 231, 231)" }}>
                <h3 style={{fontSize: 20, fontWeight: "bold"}}>Administrative Panel</h3>
                <p className="mb-2 text-muted" >You may add new profiles or edit any existing profiles here. You can also drag and drop cards to reorder them.</p>
                {isSavingOrder && <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3">Saving Order...</span>}
                <button type="button" className="add-btn-custom px-4" onClick={handleCreateProfile}>
                  + Add New Member Profile
                </button>
              </div>
            )}

            {activeProfiles.map((profile, index) => {
              const profileSlug = getProfileSlug(profile.userID);
              const targetUrl = `/network-hub/${profileSlug}`;
              const firstName = (profile.profileName || "Member").split(" ")[0];
              const expertisesList = profile.services || [];
              const bioText = profile.bio || profile.about || "No biography provided yet.";
              const isCardHidden = profile.statusFlag === "hidden";

              // Custom Profile Image & Cropping Logic
              const isCustomAvatar = profile.profileImage && typeof profile.profileImage === "string" && !profile.profileImage.includes("profile_placeholder.png");
              
              let avatarStyles = {
                backgroundImage: `url("${profile.profileImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: "100%",
                height: "100%",
                top: 0,
                left: 0
              };

              if (isCustomAvatar && profile.enableImageCrop) {
                avatarStyles.backgroundSize = `${profile.profileImageSize ?? 100}%`;
                avatarStyles.backgroundPosition = `${profile.profileImagePosX ?? 50}% ${profile.profileImagePosY ?? 50}%`;
              }

              return (
                <div 
                  key={profile.id || profile.userID} 
                  className="col-md-12 col-sm-12 al-mt-10" 
                  // data-aos="fade-up"
                  // Draggable Attributes Added Here
                  draggable={isAdmin}
                  onDragStart={(e) => isAdmin && handleDragStart(e, index)}
                  onDragEnter={(e) => isAdmin && handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  style={isAdmin ? { cursor: 'grab' } : {}}
                >
                  <div className="value-card d-flex d-flex-col d-flex-sb position-relative" style={{ transition: "all 0.2s ease" }}>
                    
                    {/* Admin Drag Handle Icon */}
                    {isAdmin && (
                      <div className="position-absolute top-50 start-0 translate-middle-y ms-2 d-flex align-items-center justify-content-center text-muted" style={{ zIndex: 10, cursor: 'grab', width: '30px', backgroundColor: "#FFBD12", paddingTop: 10, paddingBottom: 10, height: "100%", borderRadius: "10px 0 0 10px" }} title="Drag to reorder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
                        </svg>
                      </div>
                    )}

                    {/* Admin Visibility Badge Tag Indicator */}
                    {isAdmin && isCardHidden && (
                      <span className="badge bg-danger position-absolute top-0 end-0 m-3 z-3 shadow-sm px-2.5 py-1.5 fs-7">
                        This profile is current not visible on the platform. Check reason(s) below.
                      </span>
                    )}
                    {/* Admin Order Number Display (Helpful for admins to see changes) */}
                    {isAdmin && (
                      <span className="badge bg-secondary position-absolute bottom-0 end-0 m-3 z-3 shadow-sm px-2 py-1 fs-7">
                        Order: {profile.displayOrder || "None"}
                      </span>
                    )}

                    <div className={`network-member-card ${isAdmin ? 'ms-4' : ''}`} style={{height: isAdmin ? 600 : 450}}> {/* Added margin if admin to make room for drag handle */}
                      <div className="network-member-card-inner">
                        
                        <div className="member-image-wrapper no-transition no-radius al-pos-r" style={{ width: "40%", minHeight: "220px", backgroundColor: "#949494", overflow: "hidden" }}>
                          <div 
                            className={`video-frame-element ${index % 2 !== 0 ? "video-frame-element-blue" : ""} ${isCardHidden ? "striped-red-gradient" : ""}`} 
                            style={{ width: "10px", height: "100px", left: 0, top: 0, zIndex: 2 }}
                          />
                          
                          {/* Image Render Logic Block */}
                          {isCustomAvatar ? (
                            <div style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, zIndex: 1 }}>
                              <div style={{ position: "absolute", width: "100%", height: "100%", backgroundImage: `url(${profile.profileImage})`, top: 0, left: 0, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                              <div style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, backdropFilter: "blur(20px)" }}></div>
                              <div style={{ ...avatarStyles, position: "absolute" }} />
                            </div>
                          ) : (
                            <div 
                              style={{ 
                                position: "absolute", width: "100%", height: "100%", top: 0, left: 0, zIndex: 1,
                                backgroundImage: `url("${defaultAvatar}")`, 
                                backgroundColor: 'rgb(208, 208, 208)', 
                                backgroundSize: 'cover', 
                                backgroundPosition: '50% 20%', 
                                backgroundRepeat: 'no-repeat' 
                              }}
                            ></div>
                          )}
                          
                        </div>

                        <div style={{ width: "60%" }}>
                          <h4 className={`member-name network-member-name ${isCardHidden ? "striped-red-gradient" : ""}`} style={{ color: "black", fontSize: 23, padding: "20px 25px", fontWeight: 400} }>
                            {profile.profileName}
                          </h4>  
                          <div style={{ padding: "10px 25px 20px 25px" }}>
                            <p className="al-mb-20">
                              {bioText.length > 250 ? `${bioText.substring(0, 250)}...` : bioText}{" "}
                              <a href={targetUrl}>&#91;Read full bio&#93;</a>
                            </p>
                            
                            <div className="al-mb-20">
                              <h5 style={{ marginBottom: 5, fontWeight: 600 }}>Services:</h5>
                              <div className={`member-expertise-name-wrapper${expertisesList?.length < 3? "-wide" : ""}`}>
                                {expertisesList.map((exp, indexInner) => {
                                  const name = typeof exp === "string" ? exp : exp.serviceName || exp.expertiseName;
                                  if (indexInner >= 6 || !name) return null;
                                  return (
                                    <span key={indexInner} className="member-expertise-name-block">
                                      {truncateString(name, 30)}
                                    </span>
                                  );
                                })}
                              </div>
                              {expertisesList.length > 6 && (
                                <a href={`${targetUrl}#services`}>
                                  <span className="member-expertise-name-block-see-all">
                                    See {expertisesList.length - 6} more services {firstName} offers
                                  </span>
                                </a>
                              )}
                            </div>

                            <div className="d-flex flex-column gap-2">
                              <a className="button-generic button-accent responsive-network-button" style={{ color: "black" }} href={targetUrl}>
                                See {firstName}'s details &amp; contact {firstName}
                              </a>

                              {isAdmin && (
                                <button 
                                  onClick={() => navigate(`/member-portal?userID=${profile.userID}`)}
                                  className="button-generic button-accent button-accent-blue responsive-network-button"
                                >
                                  Edit {firstName}'s Profile as Admin
                                </button>
                              )}
                            </div>

                            {/* Display hidden reason tag criteria string block at base container card */}
                            {isAdmin && isCardHidden && (
                              <div className="mt-3 text-danger small border-top pt-2">
                                <strong>Reason(s) for Profile being hidden:</strong> {profile.reasonText}
                              </div>
                            )}

                          </div> 
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeProfiles.length === 0 && (
              <div className="text-center py-5 text-muted fst-italic">
                No verified network hub profiles are currently available.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const NetworkHubPage = ({ data }) => {
  const markdownCopy = data?.markdownRemark?.frontmatter || {};
  const firestoreNodes = data?.allFirestoreProfiles?.nodes || [];

  return (
    <Layout>
      <NetworkHubPageTemplate 
        title={markdownCopy.title}
        openingParagraph={markdownCopy.openingparagraph}
        buildTimeProfiles={firestoreNodes} 
      />
    </Layout>
  );
};

export default NetworkHubPage;

export const pageQuery = graphql`
  query NetworkHubCombinedQuery {
    markdownRemark(frontmatter: { templateKey: { eq: "network-hub-page" } }) {
      frontmatter {
        title        
        openingparagraph
      }
    }
    allFirestoreProfiles {
      nodes {
        id
        userID
        profileName
        bio
        about
        profileImage
        enableImageCrop
        profileImageSize
        profileImagePosX
        profileImagePosY
        profileStatus
        memberType
        private
        displayOrder
        expertises {
          expertiseName
        }
        expiryDate 
        services {
          serviceName
        }
      }
    }
  }
`;