import React, { useState, useEffect } from "react";
import { navigate } from "gatsby";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "../../firebase";
import Layout from "../../components/Layout";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function BadgeManager() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("templates");

  // Badges state management (Extended to track gradient states and order natively)
  const [badges, setBadges] = useState([]);
  const [currentBadge, setCurrentBadge] = useState({
    id: "", 
    title: "", 
    description: "", 
    backgroundColor: "#000000", 
    textColor: "#ffffff", 
    icon: "", 
    permission: "all",
    isGradient: false,
    gradientDirection: "to right",
    gradientColor1: "#000000",
    gradientColor2: "#ffffff",
    order: 0 // 👈 Added order default state
  });
  const [isEditing, setIsEditing] = useState(false);

  // Members state management
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      
      // Admin verification workflow lookup check
      const profileRef = doc(db, "profiles", currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists() && profileSnap.data().role === "admin") {
        setIsAdmin(true);
        await reloadGlobalData();
      } else {
        // alert("Access Denied: Administrative credentials missing.");
        alert("You do not have the permission to view this page. If you believe this is a mistake, please contact your administrator.");
        navigate("/member-portal");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const reloadGlobalData = async () => {
    // 1. Fetch system badge templates
    const badgeSnap = await getDocs(collection(db, "badges"));
    const badgeList = badgeSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // 👈 Added sorting mechanism: Automatically sort loaded badges by order (ascending)
    badgeList.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    setBadges(badgeList);

    // 2. Fetch registry profiles
    const profileSnap = await getDocs(collection(db, "profiles"));
    const profileList = profileSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setProfiles(profileList);

    // Refresh context link tracking selection references
    if (selectedProfile) {
      const liveProf = profileList.find(p => p.id === selectedProfile.id);
      setSelectedProfile(liveProf || null);
    }
  };

  // =========================================================
  // BADGE DEFINITION CRUD FUNCTIONS
  // =========================================================
  const handleBadgeSubmit = async (e) => {
    e.preventDefault();
    if (!currentBadge.id || !currentBadge.title) {
      alert("Please ensure Document ID string and Badge Title are populated.");
      return;
    }
    try {
      const docIdClean = currentBadge.id.trim().toLowerCase().replace(/\s+/g, "-");
      const targetRef = doc(db, "badges", docIdClean);
      
      // Generate structural CSS linear gradient rules if active
      let calculatedBackground = currentBadge.backgroundColor;
      if (currentBadge.isGradient) {
        calculatedBackground = `linear-gradient(${currentBadge.gradientDirection}, ${currentBadge.gradientColor1}, ${currentBadge.gradientColor2})`;
      }
      
      const payload = { 
        ...currentBadge, 
        id: docIdClean,
        order: Number(currentBadge.order) || 0, // 👈 Convert order input string to pure number for consistent sorting
        backgroundColor: calculatedBackground // Maintain backward compatibility field for layout engines
      };
      
      await setDoc(targetRef, payload, { merge: true });
      
      alert("System Badge Definition Synchronized Successfully!");
      clearBadgeForm();
      await reloadGlobalData();
    } catch (err) {
      alert(`CRUD Error: ${err.message}`);
    }
  };

  const handleEditSetup = (badgeObj) => {
    // Gracefully compute fallback object states for standard older legacy entries
    setCurrentBadge({
      id: badgeObj.id || "",
      title: badgeObj.title || "",
      description: badgeObj.description || "",
      backgroundColor: badgeObj.backgroundColor || "#000000",
      textColor: badgeObj.textColor || "#ffffff",
      icon: badgeObj.icon || "",
      permission: badgeObj.permission || "all",
      isGradient: badgeObj.isGradient || false,
      gradientDirection: badgeObj.gradientDirection || "to right",
      gradientColor1: badgeObj.gradientColor1 || "#000000",
      gradientColor2: badgeObj.gradientColor2 || "#ffffff",
      order: badgeObj.order !== undefined ? badgeObj.order : 0 // 👈 Retrieve current order or fallback to 0
    });
    setIsEditing(true);
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!window.confirm("Delete this badge? This does not remove it from members who already use it.")) return;
    try {
      await deleteDoc(doc(db, "badges", badgeId));
      await reloadGlobalData();
    } catch (err) {
      alert(err.message);
    }
  };

  const clearBadgeForm = () => {
    setCurrentBadge({ 
      id: "", 
      title: "", 
      description: "", 
      backgroundColor: "#000000", 
      textColor: "#ffffff", 
      icon: "", 
      permission: "all",
      isGradient: false,
      gradientDirection: "to right",
      gradientColor1: "#000000",
      gradientColor2: "#ffffff",
      order: 0 // 👈 Reset order input to 0
    });
    setIsEditing(false);
  };

  // =========================================================
  // MEMBER DISPATCHING & USER ACCESS CONTROL PERMISSIONS
  // =========================================================
  const toggleUserPermission = async (profileId, badgeId, isCurrentlyGranted) => {
    try {
      const userDocRef = doc(db, "profiles", profileId);
      if (isCurrentlyGranted) {
        await updateDoc(userDocRef, { allowedBadges: arrayRemove(badgeId) });
      } else {
        await updateDoc(userDocRef, { allowedBadges: arrayUnion(badgeId) });
      }
      await reloadGlobalData();
    } catch (err) {
      alert(`Assignment update failed: ${err.message}`);
    }
  };

  // if (loading) return <div className="container text-center py-5">Verifying Admin clearance profiles...</div>;
  if (loading) return <div className="container text-center py-5">Verifying Admin Access Permission...</div>;
  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="container py-4">
        <div className="border-bottom pb-2 mb-4 d-flex justify-content-between align-items-center">
          <div className="d-flex justify-content-between align-items-center" style={{gap: 10}}>
            <img src="https://cdn-icons-png.flaticon.com/512/9919/9919417.png" style={{width: 30}}/>
            <h2 style={{fontWeight: 'bold'}}>Badge Management Portal</h2>
          </div>
          
          {/* <button className="btn btn-outline-dark btn-sm" onClick={() => navigate("/member-portal")}>↩️ Member Portal</button> */}
          <button className="button-generic responsive-network-button" style={{padding: '2px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 5, border: 'none'}} onClick={() => navigate("/member-portal")}><img src="https://cdn-icons-png.flaticon.com/512/9283/9283458.png" style={{width: 20}}/> Return to Member Portal</button>
        </div>

        {/* Tab Selection Row Controls */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item" style={{ cursor: "pointer" }}>
            <span className={`nav-link fw-bold ${activeTab === "templates" ? "active text-primary" : "text-secondary"}`} onClick={() => setActiveTab("templates")}>
              Create/Modify Badges
            </span>
          </li>
          <li className="nav-item" style={{ cursor: "pointer" }}>
            <span className={`nav-link fw-bold ${activeTab === "members" ? "active text-primary" : "text-secondary"}`} onClick={() => setActiveTab("members")}>
              Assign Limited-Access Badges to Members
            </span>
          </li>
        </ul>

        {activeTab === "templates" ? (
          <div className="row">
            {/* Left Side: Creation/Editing Form Panel */}
            <div className="col-md-5 mb-4">
              <div className={`card shadow-sm p-3 border border-light-subtle ${isEditing ? undefined : 'bg-light'} position-sticky`} style={{ top: "20px", backgroundColor: isEditing? "rgba(255, 189, 18, 0.2)" : undefined }}>
                <h3 style={{fontWeight: "bold"}}>{isEditing ? "Editing Badge" : "Create New Badge Blueprint"}</h3>
                <p>{isEditing ? `You are currently editing the badge - ` : ""} {isEditing && currentBadge?.title ? <span style={{fontWeight: 'bold', color: 'blue'}}>{currentBadge.title}</span> : ""}</p>
                {isEditing && (
                  <p style={{fontSize: 12}}>This badge is current set to 'Limited-Access', you will need to specifically assign this badges to specific members for them to display it.</p>
                )}
                <form onSubmit={handleBadgeSubmit} className="mt-3">
                  <div className="mb-2">
                    <label className="small fw-bold">1. Badge ID (No spaces, e.g. 'jazz-master', 'music-lover')</label>
                    <label className="small">This is for internal system identification only. You will not be able to change this once the badge is created.</label>
                    <input type="text" className="form-control form-control-sm" disabled={isEditing} value={currentBadge.id} onChange={(e) => setCurrentBadge({...currentBadge, id: e.target.value})} />
                  </div>
                  <div className="row mb-2">
                    <div className="col-8">
                      <label className="small fw-bold">2. Badge Title</label>
                      <label className="small">The text displayed in the badge.</label>
                      <input type="text" className="form-control form-control-sm" value={currentBadge.title} onChange={(e) => setCurrentBadge({...currentBadge, title: e.target.value})} />
                    </div>
                    {/* 👈 New UI Field: Compact Display Order input alongside Badge Title */}
                    <div className="col-4">
                      <label className="small fw-bold">3. Order Index</label>
                      <label className="small">Order of the badge.</label>
                      <input type="number" className="form-control form-control-sm" value={currentBadge.order} onChange={(e) => setCurrentBadge({...currentBadge, order: e.target.value})} placeholder="e.g. 10" />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="small fw-bold">4. Badge Description</label>
                    <label className="small">This description will be shown when users put their mouse on top of the badge.</label>
                    <textarea rows="2" className="form-control form-control-sm" value={currentBadge.description} onChange={(e) => setCurrentBadge({...currentBadge, description: e.target.value})} />
                  </div>
                  
                  {/* Gradient Configuration Control Mode Switch */}
                  <label className="small fw-bold">5. Badge Colour</label>
                  <label className="small">Enable this option if you would like to use a gradient background for the badges.</label>
                  <div className="form-check form-switch mb-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      role="switch" 
                      id="gradientToggle"
                      checked={currentBadge.isGradient} 
                      onChange={(e) => setCurrentBadge({...currentBadge, isGradient: e.target.checked})} 
                    />
                    <label className="form-check-label small fw-bold" htmlFor="gradientToggle" style={{color: 'rgb(51, 97, 172)'}}>
                      Enable Gradient Background
                    </label>
                  </div>
                  {currentBadge.isGradient ? (
                    <>
                      {/* Gradient Parameters Content Fields */}
                      <div className="mb-2">
                        <label className="small fw-bold">Gradient Flow Direction</label>
                        <select className="form-select form-select-sm" value={currentBadge.gradientDirection} onChange={(e) => setCurrentBadge({...currentBadge, gradientDirection: e.target.value})}>
                          <option value="to right">➡️ Horizontal (Left to Right)</option>
                          <option value="to bottom">⬇️ Vertical (Top to Bottom)</option>
                          <option value="to bottom right">↘️ Diagonal (Top Left to Bottom Right)</option>
                          <option value="to top right">↗️ Diagonal (Bottom Left to Top Right)</option>
                        </select>
                      </div>
                      <div className="row mb-2">
                        <div className="col">
                          <label className="small fw-bold">Starting Colour</label>
                          <input type="color" className="form-control form-control-sm form-control-color w-100" value={currentBadge.gradientColor1} onChange={(e) => setCurrentBadge({...currentBadge, gradientColor1: e.target.value})} />
                        </div>
                        <div className="col">
                          <label className="small fw-bold">Ending Colour</label>
                          <input type="color" className="form-control form-control-sm form-control-color w-100" value={currentBadge.gradientColor2} onChange={(e) => setCurrentBadge({...currentBadge, gradientColor2: e.target.value})} />
                        </div>
                        <div className="col">
                          <label className="small fw-bold">Text Colour</label>
                          <input type="color" className="form-control form-control-sm form-control-color w-100" value={currentBadge.textColor} onChange={(e) => setCurrentBadge({...currentBadge, textColor: e.target.value})} />
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Standard Solid Colors Layout Interface Rules */
                    <div className="row mb-2">
                      <div className="col">
                        <label className="small fw-bold">Background Colour</label>
                        <input type="color" className="form-control form-control-sm form-control-color w-100" value={currentBadge.backgroundColor} onChange={(e) => setCurrentBadge({...currentBadge, backgroundColor: e.target.value})} />
                      </div>
                      <div className="col">
                        <label className="small fw-bold">Text Colour</label>
                        <input type="color" className="form-control form-control-sm form-control-color w-100" value={currentBadge.textColor} onChange={(e) => setCurrentBadge({...currentBadge, textColor: e.target.value})} />
                      </div>
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="small fw-bold">6. Badge Icon</label>
                    <label className="small">&nbsp;- URL to the icon of the badge</label>
                    <label className="small">You can grab an icon <a href="https://www.flaticon.com/" target="_blank">here</a>. Search for an icon, right click on the icon, then copy the url to the icon and paste it here. Make sure you copy the <strong>direct URL address</strong> of the icon but not the page itself.</label>
                    <input type="text" className="form-control form-control-sm" placeholder="https://..." value={currentBadge.icon} onChange={(e) => setCurrentBadge({...currentBadge, icon: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold">7. Badge Usage Permission</label>
                    <select className="form-select form-select-sm" value={currentBadge.permission} onChange={(e) => setCurrentBadge({...currentBadge, permission: e.target.value})}>
                      <option value="all">Open Access (Anyone can display it)</option>
                      <option value="limited">Limited Access (Admin assigns who can display it)</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success btn-sm w-100 fw-bold">{isEditing ? "Update Badge" : "Save Badge"}</button>
                    {isEditing && <button type="button" className="btn btn-secondary btn-sm" onClick={clearBadgeForm}>Cancel</button>}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Side: Global Badge Index List Grid */}
            <div className="col-md-7">
              <h5>All Badges ({badges.length})</h5>
              <div className="row mt-3">
                {badges.map((b) => (
                  <div key={b.id} className="col-sm-6 mb-3">
                    <div className="card h-100 shadow-sm border border-light-subtle">
                      <div className="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            {/* UPDATED STYLE: 'background' rule now securely accepts raw hex or complete linear gradients */}
                            <span className="badge px-2 py-1.5 d-inline-flex align-items-center gap-1 text-capitalize" style={{ background: b.backgroundColor, color: b.textColor }}>
                              {b.icon && <img src={b.icon} alt="" style={{ width: "14px", height: "14px" }} />}
                              {b.title}
                            </span>
                            <span className={`badge ${b.permission === "all" ? "bg-info text-dark" : "bg-warning text-dark"}`}>{b.permission === "all"? "Free Access" : "Limited Access"}</span>
                          </div>
                          {/* 👈 Added: Included the 'Order' in the badge info text card */}
                          <p className="card-text small text-muted mb-2">
                            <strong>ID:</strong> {b.id}<br />
                            <strong>Order:</strong> {b.order !== undefined ? b.order : 0}<br />
                            {b.description}
                          </p>
                        </div>
                        <div className="d-flex gap-2 border-top pt-2 mt-2">
                          <button className="button-generic button-accent responsive-network-button" style={{padding: '2px 10px'}} onClick={() => handleEditSetup(b)}>Edit</button>
                          <button className="button-generic responsive-network-button" style={{padding: '2px 10px', backgroundColor: 'red', color: 'white', border: 'none'}} onClick={() => handleDeleteBadge(b.id)}>Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* System Allocation Access Assignment Matrix Tab Panel */
          <div className="row">
            <div className="col-md-4 mb-4">
              <h5><strong>Select a Member to Assign Badges to</strong></h5>
              <label className="text-muted small">Scroll down to see more</label>
              <div className="list-group mt-3 max-vh-50 overflow-y-auto shadow-sm" style={{ maxHeight: "500px" }}>
                {profiles.map((p) => (
                  <button key={p.id} type="button" className={`list-group-item list-group-item-action text-start ${selectedProfile?.id === p.id ? "active fw-bold" : ""}`} onClick={() => setSelectedProfile(p)}>
                    <div>{p.profileName || "Unnamed Account Document"}</div>
                    <small className={selectedProfile?.id === p.id ? "text-white-50" : "text-muted"}>{p.id}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-md-8">
              {selectedProfile ? (
                <div className="card p-3 shadow-sm">
                  <h5><strong>Assigning badges to profile: <span className="text-primary">{selectedProfile.profileName}</span></strong></h5>
                  <p className="text-muted small">Manage this member's allowed list of limted access badges.</p>
                  <p className="text-muted small">Once toggled, the permission will be granted or removed, there is no confirm button for this.</p>
                  <div className="table-responsive mt-3">
                    <table className="table table-hover align-middle border">
                      <thead className="table-light">
                        <tr>
                          <th>Badge Preview</th>
                          <th>Badge Description</th>
                          <th className="text-center">
                            Badge Access Toggle<br/>
                            <span style={{fontWeight: 400, fontSize: 12}}>(It takes a second for the toggle to react, <br/>please do not repeatedly toggle it back and forth)</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {badges.filter(b => b.permission === "limited").map((badge) => {
                          const isAssigned = (selectedProfile.allowedBadges || []).includes(badge.id);
                          return (
                            <tr key={badge.id}>
                              <td>
                                {/* UPDATED STYLE: 'background' rule applies safely here too */}
                                <span className="badge px-2 py-1.5" style={{ background: badge.backgroundColor, color: badge.textColor }}>
                                  {badge.icon && <img src={badge.icon} alt="" className="me-1" style={{ width: "12px" }} />}
                                  {badge.title}
                                </span>
                              </td>
                              <td><small className="text-muted">{badge.description}</small></td>
                              <td className="text-center">
                                <div className="form-check form-switch d-inline-block">
                                  <input className="form-check-input" type="checkbox" role="switch" checked={isAssigned} onChange={() => toggleUserPermission(selectedProfile.id, badge.id, isAssigned)} style={{ cursor: "pointer" }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {badges.filter(b => b.permission === "limited").length === 0 && (
                          <tr><td colSpan="3" className="text-center p-3 text-muted">No limited badges configured yet. Set permission to 'limited' on a badge to assign it.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-5 border rounded bg-light text-muted">
                  Select a member workspace registry from the left column layout index directory to balance configuration parameters.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}