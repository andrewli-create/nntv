import React, { useState, useEffect } from "react";
import { navigate } from "gatsby";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "../../firebase";
import Layout from "../../components/Layout";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ThemeManager() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("templates");

  // Themes list and layout form state
  const [themes, setThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState({
    id: "",
    title: "",
    description: "",
    icon: "",
    permission: "all",
    backgroundType: "color", // Options: "color", "image", "gradient"
    backgroundColor: "#ffffff",
    backgroundImageUrl: "",
    gradientDirection: "to right",
    gradientColor1: "#667eea",
    gradientColor2: "#764ba2",
    themeColor: "",
    transparency: 1, 
    blur: 0,
    order: 0, // 👈 Added Order Field
    // Added 5 Graphic Image URL Fields
    graphic1: "",
    graphic2: "",
    graphic3: "",
    graphic4: "",
    graphic5: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);

  // Independent upload progress tracking for Graphic 1 to 5
  const [uploadProgress, setUploadProgress] = useState({
    graphic1: 0,
    graphic2: 0,
    graphic3: 0,
    graphic4: 0,
    graphic5: 0
  });

  // Profile assignment directory targets
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      
      const profileRef = doc(db, "profiles", currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists() && profileSnap.data().role === "admin") {
        setIsAdmin(true);
        await reloadGlobalData();
      } else {
        alert("Access Denied: Administrative credentials missing.");
        navigate("/member-portal");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const reloadGlobalData = async () => {
    // 1. Fetch system theme definitions
    const themeSnap = await getDocs(collection(db, "themes"));
    const themeList = themeSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setThemes(themeList);

    // 2. Fetch runtime system profile entries
    const profileSnap = await getDocs(collection(db, "profiles"));
    const profileList = profileSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setProfiles(profileList);

    if (selectedProfile) {
      const liveProf = profileList.find(p => p.id === selectedProfile.id);
      setSelectedProfile(liveProf || null);
    }
  };

  // Helper calculation to compute background dynamically on change for the active form preview
  const getLiveComputedBackground = () => {
    if (currentTheme.backgroundType === "image") {
      return `url('${currentTheme.backgroundImageUrl}') center/cover no-repeat`;
    } else if (currentTheme.backgroundType === "gradient") {
      return `linear-gradient(${currentTheme.gradientDirection}, ${currentTheme.gradientColor1}, ${currentTheme.gradientColor2})`;
    }
    return currentTheme.backgroundColor;
  };

  // =========================================================
  // IMGBB IMAGE UPLOAD HANDLER
  // =========================================================
  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    const IMGBB_API_KEY = "b472f6b787bcc8fd6c376c4abcd09c7d"; 

    try {
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 50 })); 
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { 
        method: "POST", 
        body: formData 
      });
      const result = await response.json();

      if (result.success) {
        const directImageUrl = result.data.url;
        setCurrentTheme((prev) => ({
          ...prev,
          [fieldName]: directImageUrl
        }));
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      alert("Upload error.");
    } finally {
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 0 }));
    }
  };

  // =========================================================
  // THEME GENERATION ENGINE AND DATABASE WRITES
  // =========================================================
  const handleThemeSubmit = async (e) => {
    e.preventDefault();
    if (!currentTheme.id || !currentTheme.title) {
      alert("Please ensure the Unique Document ID and Theme Title are populated.");
      return;
    }

    try {
      const docIdClean = currentTheme.id.trim().toLowerCase().replace(/\s+/g, "-");
      const targetRef = doc(db, "themes", docIdClean);

      const payload = {
        ...currentTheme,
        id: docIdClean,
        background: getLiveComputedBackground(), // Use our helper engine to write to DB
        themeColor: currentTheme.themeColor.trim(),
        transparency: Number(currentTheme.transparency), 
        blur: Number(currentTheme.blur),                 
        order: Number(currentTheme.order) || 0 // 👈 Ensure parsed as a clean Number
      };

      await setDoc(targetRef, payload, { merge: true });
      alert("System Layout Theme Synchronized Successfully!");
      clearThemeForm();
      await reloadGlobalData();
    } catch (err) {
      alert(`Database rejected modification setup: ${err.message}`);
    }
  };

  const handleEditSetup = (themeObj) => {
    setCurrentTheme({
      id: themeObj.id || "",
      title: themeObj.title || "",
      description: themeObj.description || "",
      icon: themeObj.icon || "",
      permission: themeObj.permission || "all",
      backgroundType: themeObj.backgroundType || "color",
      backgroundColor: themeObj.backgroundColor || "#ffffff",
      backgroundImageUrl: themeObj.backgroundImageUrl || "",
      gradientDirection: themeObj.gradientDirection || "to right",
      gradientColor1: themeObj.gradientColor1 || "#667eea",
      gradientColor2: themeObj.gradientColor2 || "#764ba2",
      themeColor: themeObj.themeColor || "",
      transparency: themeObj.transparency !== undefined ? themeObj.transparency : 1, 
      blur: themeObj.blur !== undefined ? themeObj.blur : 0,
      order: themeObj.order !== undefined ? themeObj.order : 0, // 👈 Populate Order Field
      graphic1: themeObj.graphic1 || "",
      graphic2: themeObj.graphic2 || "",
      graphic3: themeObj.graphic3 || "",
      graphic4: themeObj.graphic4 || "",
      graphic5: themeObj.graphic5 || ""
    });
    setIsEditing(true);
  };

  const handleDeleteTheme = async (themeId) => {
    if (!window.confirm("Delete this theme? Members currently utilizing it will lose their layout values.")) return;
    try {
      await deleteDoc(doc(db, "themes", themeId));
      await reloadGlobalData();
    } catch (err) {
      alert(err.message);
    }
  };

  const clearThemeForm = () => {
    setCurrentTheme({
      id: "",
      title: "",
      description: "",
      icon: "",
      permission: "all",
      backgroundType: "color",
      backgroundColor: "#ffffff",
      backgroundImageUrl: "",
      gradientDirection: "to right",
      gradientColor1: "#667eea",
      gradientColor2: "#764ba2",
      themeColor: "" ,
      transparency: 1, 
      blur: 0,
      order: 0, // 👈 Reset Order Field
      graphic1: "",
      graphic2: "",
      graphic3: "",
      graphic4: "",
      graphic5: ""
    });
    setIsEditing(false);
  };

  // =========================================================
  // ADMIN CONTROL HUB ASSIGNMENT LOGIC
  // =========================================================
  const toggleThemePermission = async (profileId, themeId, isCurrentlyGranted) => {
    try {
      const userDocRef = doc(db, "profiles", profileId);
      if (isCurrentlyGranted) {
        await updateDoc(userDocRef, { allowedThemes: arrayRemove(themeId) });
      } else {
        await updateDoc(userDocRef, { allowedThemes: arrayUnion(themeId) });
      }
      await reloadGlobalData();
    } catch (err) {
      alert(`Assignment update failed: ${err.message}`);
    }
  };

  if (loading) return <div className="container text-center py-5">Verifying Admin clearance profiles...</div>;
  if (!isAdmin) return null;

  // Sorting logic helper to sort previews by the "order" number ascendently
  const sortedThemes = [...themes].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  return (
    <Layout>
      <div className="container py-4">
        <div className="border-bottom pb-2 mb-4 d-flex justify-content-between align-items-center">
          <h2>🛡️ Dynamic Theme Customization Hub</h2>
          <button className="btn btn-outline-dark btn-sm" onClick={() => navigate("/member-portal")}>↩️ Member Portal</button>
        </div>

        {/* Tab Row Elements Selection Controls */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item" style={{ cursor: "pointer" }}>
            <span className={`nav-link fw-bold ${activeTab === "templates" ? "active text-primary" : "text-secondary"}`} onClick={() => setActiveTab("templates")}>
              🎨 Manage Custom Visual Layouts
            </span>
          </li>
          <li className="nav-item" style={{ cursor: "pointer" }}>
            <span className={`nav-link fw-bold ${activeTab === "members" ? "active text-primary" : "text-secondary"}`} onClick={() => setActiveTab("members")}>
              👥 Assign Limited Premium Themes
            </span>
          </li>
        </ul>

        {activeTab === "templates" ? (
          <div className="row">
            {/* Left Column: Form Controls */}
            <div className="col-md-5 mb-4">
              <div className="card shadow-sm p-3 bg-light position-sticky" style={{ top: "20px", maxHeight: "90vh", overflowY: "auto" }}>
                <h5>{isEditing ? "✏️ Edit Layout Blueprint" : "✨ Create Theme Engine Matrix"}</h5>
                <form onSubmit={handleThemeSubmit} className="mt-3">
                  <div className="mb-2">
                    <label className="small fw-bold">Theme Document ID ID (e.g. 'cyberpunk-neon')</label>
                    <input type="text" className="form-control form-control-sm" disabled={isEditing} value={currentTheme.id} onChange={(e) => setCurrentTheme({...currentTheme, id: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="small fw-bold">Display Title Name</label>
                    <input type="text" className="form-control form-control-sm" value={currentTheme.title} onChange={(e) => setCurrentTheme({...currentTheme, title: e.target.value})} />
                  </div>
                  
                  {/* DISPLAY ORDER FORM FIELD */}
                  <div className="mb-2">
                    <label className="small fw-bold">Portal Display Order (Lower values display first)</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      placeholder="0" 
                      value={currentTheme.order} 
                      onChange={(e) => setCurrentTheme({...currentTheme, order: e.target.value})} 
                    />
                  </div>

                  <div className="mb-2">
                    <label className="small fw-bold">Layout Description Context Summary</label>
                    <textarea rows="2" className="form-control form-control-sm" value={currentTheme.description} onChange={(e) => setCurrentTheme({...currentTheme, description: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="small fw-bold">Selection Circle Preview Icon URL Link</label>
                    <input type="text" className="form-control form-control-sm" placeholder="https://.../icon.png" value={currentTheme.icon} onChange={(e) => setCurrentTheme({...currentTheme, icon: e.target.value})} />
                  </div>

                  {/* FRONT-END ACCENT UI COLOR SELECTOR INTERFACE */}
                  <div className="mb-2">
                    <label className="small fw-bold">UI Accent Color (HEX, leave blank for default look)</label>
                    <div className="d-flex gap-1.5 align-items-center">
                      <input 
                        type="text" 
                        maxLength="7"
                        className="form-control form-control-sm text-uppercase font-monospace" 
                        placeholder="#CCCCCC or blank" 
                        value={currentTheme.themeColor} 
                        onChange={(e) => setCurrentTheme({...currentTheme, themeColor: e.target.value})} 
                      />
                      <input 
                        type="color" 
                        className="form-control form-control-sm form-control-color" 
                        style={{ width: "42px", padding: "2px", cursor: "pointer" }}
                        value={currentTheme.themeColor && /^#[0-9A-F]{6}$/i.test(currentTheme.themeColor) ? currentTheme.themeColor : "#ffffff"} 
                        onChange={(e) => setCurrentTheme({...currentTheme, themeColor: e.target.value})} 
                      />
                      {currentTheme.themeColor && (
                        <button 
                          type="button" 
                          className="btn btn-outline-danger btn-sm px-2 py-0.5 leading-none"
                          style={{ fontSize: "11px" }}
                          onClick={() => setCurrentTheme({...currentTheme, themeColor: ""})}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BACKGROUND TRANSPARENCY SLIDER CONTROL */}
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="small fw-bold">Background Opacity</label>
                      <span className="badge bg-secondary font-monospace">{(currentTheme.transparency * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" 
                      className="form-range" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={currentTheme.transparency} 
                      onChange={(e) => setCurrentTheme({...currentTheme, transparency: parseFloat(e.target.value)})} 
                    />
                  </div>

                  {/* BACKGROUND BLUR SLIDER CONTROL */}
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="small fw-bold">Background Backdrop Blur</label>
                      <span className="badge bg-secondary font-monospace">{currentTheme.blur}px</span>
                    </div>
                    <input 
                      type="range" 
                      className="form-range" 
                      min="0" 
                      max="20" 
                      step="1" 
                      value={currentTheme.blur} 
                      onChange={(e) => setCurrentTheme({...currentTheme, blur: parseInt(e.target.value, 10)})} 
                    />
                  </div>

                  <div className="mb-2">
                    <label className="small fw-bold">CSS Background Canvas Style Mode</label>
                    <select className="form-select form-select-sm" value={currentTheme.backgroundType} onChange={(e) => setCurrentTheme({...currentTheme, backgroundType: e.target.value})}>
                      <option value="color">🎨 Solid Background Color Hex Fill</option>
                      <option value="image">🖼️ Remote Background Asset Image URL</option>
                      <option value="gradient">🌈 Structural Linear Gradient Engine</option>
                    </select>
                  </div>

                  {/* Render Configuration Fields Based on Selected Canvas Style Mode */}
                  {currentTheme.backgroundType === "color" && (
                    <div className="mb-2">
                      <label className="small fw-bold">Select Fill Hex Color Code</label>
                      <input type="color" className="form-control form-control-sm form-control-color w-100" value={currentTheme.backgroundColor} onChange={(e) => setCurrentTheme({...currentTheme, backgroundColor: e.target.value})} />
                    </div>
                  )}

                  {currentTheme.backgroundType === "image" && (
                    <div className="mb-2">
                      <label className="small fw-bold">Absolute Background Image Resource URL</label>
                      <input type="text" className="form-control form-control-sm" placeholder="https://images.unsplash.com/photo-..." value={currentTheme.backgroundImageUrl} onChange={(e) => setCurrentTheme({...currentTheme, backgroundImageUrl: e.target.value})} />
                    </div>
                  )}

                  {currentTheme.backgroundType === "gradient" && (
                    <>
                      <div className="mb-2">
                        <label className="small fw-bold">Gradient Direction Angle</label>
                        <select className="form-select form-select-sm" value={currentTheme.gradientDirection} onChange={(e) => setCurrentTheme({...currentTheme, gradientDirection: e.target.value})}>
                          <option value="to right">➡️ Horizontal (Left to Right)</option>
                          <option value="to bottom">⬇️ Vertical (Top to Bottom)</option>
                          <option value="to bottom right">↘️ Diagonal (Top Left to Bottom Right)</option>
                          <option value="to top right">↗️ Diagonal (Bottom Left to Top Right)</option>
                        </select>
                      </div>
                      <div className="row mb-2">
                        <div className="col">
                          <label className="small fw-bold">Color Stop 1</label>
                          <input type="color" className="form-control form-control-sm form-control-color w-100" value={currentTheme.gradientColor1} onChange={(e) => setCurrentTheme({...currentTheme, gradientColor1: e.target.value})} />
                        </div>
                        <div className="col">
                          <label className="small fw-bold">Color Stop 2</label>
                          <input type="color" className="form-control form-control-sm form-control-color w-100" value={currentTheme.gradientColor2} onChange={(e) => setCurrentTheme({...currentTheme, gradientColor2: e.target.value})} />
                        </div>
                      </div>
                    </>
                  )}

                  {/* GRAPHIC ASSETS FIELDSET */}
                  <div className="border-top pt-3 mt-3 mb-3">
                    <h6 className="fw-bold text-secondary mb-3">🖼️ Theme Graphic Assets</h6>
                    
                    {[1, 2, 3, 4, 5].map((num) => {
                      const fieldName = `graphic${num}`;
                      const progress = uploadProgress[fieldName];
                      return (
                        <div className="mb-3 border p-2 rounded bg-white shadow-sm" key={fieldName}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="small fw-bold text-dark">Graphic {num}</label>
                            {currentTheme[fieldName] && (
                              <button
                                type="button"
                                className="btn btn-link text-danger btn-sm p-0 mb-0"
                                style={{ fontSize: "11px", textDecoration: "none" }}
                                onClick={() => setCurrentTheme({ ...currentTheme, [fieldName]: "" })}
                              >
                                Clear Graphic
                              </button>
                            )}
                          </div>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            {currentTheme[fieldName] ? (
                              <img
                                src={currentTheme[fieldName]}
                                alt={`Graphic ${num} Preview`}
                                className="rounded border"
                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                className="rounded border d-flex align-items-center justify-content-center text-muted bg-light"
                                style={{ width: "40px", height: "40px", fontSize: "10px" }}
                              >
                                None
                              </div>
                            )}
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Paste image URL here..."
                                value={currentTheme[fieldName] || ""}
                                onChange={(e) => setCurrentTheme({ ...currentTheme, [fieldName]: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="btn btn-outline-primary btn-sm mb-0 w-100 text-center" style={{ cursor: "pointer", fontSize: "11px" }}>
                              ⚙️ Upload Graphic {num} {progress > 0 && `(${progress}%)`}
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => handleImageUpload(e, fieldName)}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-3">
                    <label className="small fw-bold">Theme Permission Availability Scope</label>
                    <select className="form-select form-select-sm" value={currentTheme.permission} onChange={(e) => setCurrentTheme({...currentTheme, permission: e.target.value})}>
                      <option value="all">Open Access (Claimable by everyone)</option>
                      <option value="limited">Limited Scope (Admin explicitly assigns access)</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success btn-sm w-100 fw-bold">{isEditing ? "Update Theme" : "Save Theme Blueprint"}</button>
                    {isEditing && <button type="button" className="btn btn-secondary btn-sm" onClick={clearThemeForm}>Cancel</button>}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Previews Grid (Sorted dynamically by order) */}
            <div className="col-md-7">
              <h5>System Layout Template Indices ({sortedThemes.length})</h5>
              <div className="row mt-3">
                {sortedThemes.map((savedTheme) => {
                  // REAL-TIME OVERRIDE DETECTION
                  const isCurrentlyBeingEdited = isEditing && currentTheme.id === savedTheme.id;
                  const t = isCurrentlyBeingEdited ? {
                    ...currentTheme,
                    background: getLiveComputedBackground() // dynamically compile CSS value on render
                  } : savedTheme;

                  return (
                    <div key={savedTheme.id} className="col-sm-6 mb-3">
                      <div className={`card h-100 shadow-sm border overflow-hidden ${isCurrentlyBeingEdited ? "border-primary ring ring-primary-subtle" : "border-light-subtle"}`}>
                        {/* Theme Canvas Preview Box wrapper block strip */}
                        <div style={{ height: "70px", width: "100%" }} className="border-bottom position-relative d-flex align-items-center px-3 justify-content-between overflow-hidden">
                          
                          {/* DETACHED BACKGROUND RENDER ENGINE FOR TRANSPARENCY & BLUR PREVIEWS */}
                          <div 
                            style={{
                              background: t.background,
                              opacity: t.transparency !== undefined ? t.transparency : 1,
                              filter: `blur(${t.blur || 0}px)`,
                              position: "absolute",
                              top: 0, left: 0, right: 0, bottom: 0,
                              zIndex: 0,
                              transform: (t.blur || 0) > 0 ? "scale(1.1)" : "none",
                              transition: isCurrentlyBeingEdited ? "none" : "background 0.2s opacity 0.2s"
                            }}
                          />

                          {/* Foreground Layout Elements */}
                          <div className="position-relative w-100 d-flex align-items-center justify-content-between" style={{ zIndex: 1 }}>
                            {t.icon ? (
                              <img src={t.icon} alt="" className="rounded-circle bg-white border shadow-sm" style={{ width: "36px", height: "36px", objectFit: "cover" }} />
                            ) : (
                              <div className="rounded-circle bg-white border d-flex align-items-center justify-content-center shadow-sm font-monospace fw-bold text-muted" style={{ width: "36px", height: "36px", fontSize: "11px" }}>CSS</div>
                            )}
                            <div className="d-flex align-items-center gap-1">
                              {isCurrentlyBeingEdited && <span className="badge bg-primary text-uppercase font-monospace animate-pulse" style={{ fontSize: '9px' }}>Editing Live</span>}
                              
                              {/* DISPLAY ORDER BADGE */}
                              <span className="badge bg-info text-dark font-monospace" title="Portal Display Order Position">
                                # {t.order !== undefined ? t.order : 0}
                              </span>

                              <span className={`badge border ${t.permission === 'all' ? 'bg-light text-dark' : 'bg-dark text-warning'}`}>{t.permission}</span>
                            </div>
                          </div>

                        </div>
                        <div className="card-body p-3 d-flex flex-column justify-content-between">
                          <div>
                            {/* Title Element with Dynamic Colored Accent Preview Square */}
                            <div className="d-flex align-items-center gap-1.5 mb-1">
                              <h6 className="fw-bold mb-0 text-dark">{t.title}</h6>
                              {t.themeColor && (
                                <span 
                                  className="d-inline-block rounded-circle border shadow-inner" 
                                  title={`Accent Color: ${t.themeColor}`}
                                  style={{ backgroundColor: t.themeColor, width: "11px", height: "11px" }} 
                                />
                              )}
                            </div>
                            <p className="card-text small text-muted mb-2" style={{ fontSize: "12px" }}>
                              <strong>ID:</strong> {t.id} <br />
                              <span className={isCurrentlyBeingEdited ? "text-primary fw-semibold" : "text-secondary"}>
                                Opacity: {((t.transparency !== undefined ? t.transparency : 1) * 100).toFixed(0)}% | Blur: {t.blur || 0}px
                              </span>
                              <br />
                              {t.description || "No clear metadata summary parameters declared."}
                            </p>

                            {/* CARD PREVIEW: 5 GRAPHICS GRID */}
                            <div className="mt-2 pt-2 border-top">
                              <span className="text-muted d-block mb-1 font-monospace text-uppercase fw-bold" style={{ fontSize: "9px", letterSpacing: "0.5px" }}>
                                Graphics Assets Index
                              </span>
                              <div className="d-flex gap-1 flex-wrap">
                                {[1, 2, 3, 4, 5].map((num) => {
                                  const imgUrl = t[`graphic${num}`];
                                  return (
                                    <div 
                                      key={num} 
                                      className="border rounded bg-light overflow-hidden d-flex align-items-center justify-content-center position-relative shadow-sm"
                                      style={{ width: "32px", height: "32px" }}
                                      title={`Graphic ${num} ${imgUrl ? `(Active)` : `(Empty)`}`}
                                    >
                                      {imgUrl ? (
                                        <img 
                                          src={imgUrl} 
                                          alt={`Graphic ${num}`} 
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                        />
                                      ) : (
                                        <span className="text-muted fw-bold font-monospace" style={{ fontSize: "10px" }}>{num}</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-2 border-top pt-2 mt-3">
                            <button className={`btn btn-sm py-0 px-2 ${isCurrentlyBeingEdited ? "btn-primary disabled" : "btn-outline-primary"}`} onClick={() => handleEditSetup(savedTheme)}>✏️ Edit</button>
                            <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => handleDeleteTheme(savedTheme.id)}>🗑️ Delete</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Premium Theme Access Allocation Matrix Tab Panel */
          <div className="row">
            <div className="col-md-4 mb-4">
              <h5>Select Member Profile</h5>
              <div className="list-group mt-3 shadow-sm" style={{ maxHeight: "500px", overflowY: "auto" }}>
                {profiles.map((p) => (
                  <button 
                    key={p.id} 
                    type="button" 
                    className={`list-group-item list-group-item-action text-start ${selectedProfile?.id === p.id ? "active fw-bold" : ""}`} 
                    onClick={() => setSelectedProfile(p)}
                  >
                    <div>{p.profileName || "Unnamed Account Document"}</div>
                    <span className="small text-muted">{p.role || "member"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="col-md-8">
              {selectedProfile ? (
                <div className="card p-3 shadow-sm">
                  <h5>Access Privileges Matrix: <span className="text-primary">{selectedProfile.profileName}</span></h5>
                  <p className="text-muted small">Toggle premium design access. Assigned items will show up as options in their member portal options dashboard.</p>
                  
                  <div className="table-responsive mt-3">
                    <table className="table table-hover align-middle border">
                      <thead className="table-light">
                        <tr>
                          <th>Visual Theme Identity</th>
                          <th>Canvas Rules Metadata Summary</th>
                          <th className="text-center">Authorized Access Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {themes.filter(t => t.permission === "limited").map((theme) => {
                          const isAssigned = (selectedProfile.allowedThemes || []).includes(theme.id);
                          return (
                            <tr key={theme.id}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  {/* Miniature Preview Window Using Saved Layout Effects */}
                                  <div className="position-relative rounded border shadow-sm overflow-hidden" style={{ width: "32px", height: "32px" }}>
                                    <div 
                                      style={{
                                        background: theme.background,
                                        opacity: theme.transparency !== undefined ? theme.transparency : 1,
                                        filter: `blur(${theme.blur || 0}px)`,
                                        position: "absolute",
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        transform: (theme.blur || 0) > 0 ? "scale(1.2)" : "none"
                                      }}
                                    />
                                  </div>
                                  <div className="d-flex flex-column">
                                    <span className="fw-bold text-dark small leading-none mb-0.5">{theme.title}</span>
                                    {theme.themeColor && <code className="text-muted font-monospace" style={{ fontSize: "10px" }}>Accent: {theme.themeColor}</code>}
                                  </div>
                                </div>
                              </td>
                              <td><small className="text-muted text-wrap d-block" style={{ maxWidth: "300px" }}>{theme.description}</small></td>
                              <td className="text-center">
                                <div className="form-check form-switch d-inline-block">
                                  <input className="form-check-input" type="checkbox" role="switch" checked={isAssigned} onChange={() => toggleThemePermission(selectedProfile.id, theme.id, isAssigned)} style={{ cursor: "pointer" }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {themes.filter(t => t.permission === "limited").length === 0 && (
                          <tr><td colSpan="3" className="text-center p-3 text-muted">No premium/limited themes exist yet. Update a theme layout parameters to 'limited' scope to manage permissions.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-5 border rounded bg-light text-muted">
                  Select a member workspace registry from the left column directory index list view panel to balance structural data values.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}