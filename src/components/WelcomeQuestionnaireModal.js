import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path to your firebase config
import Modal from "./Modal"; // Adjust path to your Modal component
import "../style/al-style.css"
import "../style/custom-style-css.css"
import welcome0 from "../img/nntv_welcome_0.png"
import welcome1 from "../img/nntv_welcome_1.png"
import welcome2 from "../img/nntv_welcome_2.png"
import welcome3 from "../img/nntv_welcome_3.png"
import welcome4 from "../img/nntv_welcome_4.png"
import welcome5 from "../img/nntv_welcome_5.png"
import welcome6 from "../img/nntv_welcome_6.png"

// --- Standard Options Definitions ---
const SOCIAL_PLATFORMS = ["Instagram", "Facebook", "TikTok", "X (Twitter)", "YouTube", "SoundCloud", "Spotify", "Apple Music", "Bandcamp", "LinkedIn", "Other"];
const YEARS_EXP = ["0-2 years", "3-5 years", "5-10 years", "10-15 years", "15+ years"];
const TRAINING_OPTS = ["University / College", "Conservatory", "Self-Taught", "Industry Experience", "Community Practice", "Apprenticeship / Mentorship", "Hobbyist", "Ameteur", "Prefer not to tell"];
const RELEASED_OPTS = ["Singles", "EPs", "Albums", "Film / Media Projects", "Installations", "Interactive Projects", "No released project yet"];
const COLLAB_OPTS = ["Collaboration", "Finding Collaborators", "Recording Sessions", "Learning Opportunities", "Workshops", "Mentorship", "Live Performance", "Remote Collaboration", "Community Events", "Networking"];
const SERVICE_OPTS = ["Composition", "Songwriting", "Lyric Writing", "Recording", "Mixing", "Mastering", "Sound Design", "Music Production", "Instrument Performance", "Vocals", "Live Performance", "Arranging", "Teaching / Mentorship", "Video / Multimedia"];
const EXPERTISE_OPTS = ["Classical", "Electronic Music", "Experimental", "Pop", "Film / Media", "Hip-Hop", "Jazz", "Ambient", "Folk", "Vocals", "Improvisation", "Game Audio", "Spatial Audio", "Interactive Media", "XR / VR"];

const WelcomeQuestionnaireModal = ({ isOpen, onClose, user, onRefreshRequested, targetProfileId }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  // Animation States
  const [prevPageNum, setPrevPageNum] = useState(null);
  const [direction, setDirection] = useState("next"); // 'next' or 'prev'

  // Core Form State
  const [formData, setFormData] = useState({
    profileName: "",
    artistName: "",
    pronouns: "",
    location: "",
    portfolioLink: "",
    socialMedia: [], 
    yearsOfExperience: "",
    trainingAndBackground: [],
    releasedWork: [],
    collaborationInterests: [],
    services: [], 
    expertises: [] 
  });

  // "Other" Textfield States 
  const [otherTraining, setOtherTraining] = useState("");
  const [otherReleased, setOtherReleased] = useState("");
  const [otherCollab, setOtherCollab] = useState("");
  
  const [customServices, setCustomServices] = useState([]); 
  const [customExpertises, setCustomExpertises] = useState([]); 

  const totalPages = 6;

  // --- 1. Fetch Data on Open ---
  useEffect(() => {
    // if (!isOpen || !user) return;
    if (!isOpen || !targetProfileId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        // const docRef = doc(db, "profiles", user.uid);
        // const snap = await getDoc(docRef);
        const docRef = doc(db, "profiles", targetProfileId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          
          setFormStatus(data.welcomeFormStatus || null); // Capture previous completion status

          const dbTraining = data.trainingAndBackground || [];
          const dbReleased = data.releasedWork || [];
          const dbCollab = data.collaborationInterests || [];
          
          const dbServices = (data.services || []).map(s => s.serviceName);
          const dbExpertises = (data.expertises || []).map(e => e.expertiseName);

          setFormData({
            profileName: data.profileName || "",
            artistName: data.artistName || "",
            pronouns: data.pronouns || "",
            location: data.location || "",
            portfolioLink: data.portfolioLink || "",
            socialMedia: data.socialMedia || [],
            yearsOfExperience: data.yearsOfExperience || "",
            trainingAndBackground: dbTraining.filter(t => TRAINING_OPTS.includes(t)),
            releasedWork: dbReleased.filter(r => RELEASED_OPTS.includes(r)),
            collaborationInterests: dbCollab.filter(c => COLLAB_OPTS.includes(c)),
            services: dbServices.filter(s => SERVICE_OPTS.includes(s)),
            expertises: dbExpertises.filter(e => EXPERTISE_OPTS.includes(e)),
          });

          setOtherTraining(dbTraining.filter(t => !TRAINING_OPTS.includes(t)).join(", "));
          setOtherReleased(dbReleased.filter(r => !RELEASED_OPTS.includes(r)).join(", "));
          setOtherCollab(dbCollab.filter(c => !COLLAB_OPTS.includes(c)).join(", "));

          setCustomServices(dbServices.filter(s => !SERVICE_OPTS.includes(s)));
          setCustomExpertises(dbExpertises.filter(e => !EXPERTISE_OPTS.includes(e)));
        }
      } catch (err) {
        console.error("Error fetching data for welcome form:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    setCurrentPage(0); 
    setPrevPageNum(null);
  }, [isOpen, user, targetProfileId]);

  // Clean up animation state after timing out
  useEffect(() => {
    let timer;
    if (prevPageNum !== null) {
      timer = setTimeout(() => setPrevPageNum(null), 400); 
    }
    return () => clearTimeout(timer);
  }, [prevPageNum]);

  // --- 2. Handlers ---
  const handleTextChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleCheckboxChange = (field, option, isChecked) => {
    setFormData(prev => {
      const currentList = prev[field];
      if (isChecked) return { ...prev, [field]: [...currentList, option] };
      return { ...prev, [field]: currentList.filter(item => item !== option) };
    });
  };

  const handleNextPage = () => {
    setDirection("next");
    setPrevPageNum(currentPage);
    setCurrentPage(p => p + 1);
  };

  const handlePrevPage = () => {
    setDirection("prev");
    setPrevPageNum(currentPage);
    setCurrentPage(p => p - 1);
  };

  const handleModalClose = async () => {
    if (saving) return;
    
    // If they already completed it before, we just confirm abandoning edits.
    if (formStatus === "completed") {
      if (typeof window !== "undefined") {
        if (window.confirm("Are you sure you want to close this window? Any unsaved changes will be lost.")) {
          onClose(); 
        }
      } else {
        onClose(); // Fallback for Gatsby build
      }
    } else {
      // If it's a first-time setup or skipped before, trigger the 'Skip' sequence
      await handleSkip(); 
    }
  };

  // const handleSkip = async () => {
  //   if (saving) return; 
  //   if (typeof window !== "undefined") {
  //     if (!window.confirm("Are you sure you want to skip the questionnaire for now? You can always come back to it on your profile page. (What you have entered so far will not be saved)")) {
  //       return; // User cancelled
  //     }
  //   }
    
  //   await updateFirebaseStatus("skipped");
  //   onRefreshRequested(); 
  //   onClose(); 
  // };
  const handleSkip = async () => {
    if (saving) return; 
    if (typeof window !== "undefined") {
      if (!window.confirm("Are you sure you want to skip the questionnaire for now? You can always come back to it on your profile page. (What you have entered so far will not be saved)")) {
        return; // User cancelled
      }
    }
    
    await updateFirebaseStatus("skipped");
    
    // ✨ PASS THE UPDATE TO THE PARENT
    onRefreshRequested({ welcomeFormStatus: "skipped" }); 
    onClose(); 
  };

  const updateFirebaseStatus = async (status, mergeData = {}) => {
    setSaving(true);
    try {
      // const docRef = doc(db, "profiles", user.uid);
      const docRef = doc(db, "profiles", targetProfileId);
      await setDoc(docRef, { welcomeFormStatus: status, ...mergeData }, { merge: true });
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  // const submitForm = async () => {
  //   const finalTraining = [...formData.trainingAndBackground, ...(otherTraining.trim() ? [otherTraining.trim()] : [])];
  //   const finalReleased = [...formData.releasedWork, ...(otherReleased.trim() ? [otherReleased.trim()] : [])];
  //   const finalCollab = [...formData.collaborationInterests, ...(otherCollab.trim() ? [otherCollab.trim()] : [])];
    
  //   const finalServices = [...formData.services, ...customServices.filter(s => s.trim() !== "")]
  //     .map(serviceName => ({ serviceName }));
  //   const finalExpertises = [...formData.expertises, ...customExpertises.filter(e => e.trim() !== "")]
  //     .map(expertiseName => ({ expertiseName }));

  //   const payload = {
  //     profileName: formData.profileName,
  //     artistName: formData.artistName,
  //     pronouns: formData.pronouns,
  //     location: formData.location,
  //     portfolioLink: formData.portfolioLink,
  //     socialMedia: formData.socialMedia,
  //     yearsOfExperience: formData.yearsOfExperience,
  //     trainingAndBackground: finalTraining,
  //     releasedWork: finalReleased,
  //     collaborationInterests: finalCollab,
  //     services: finalServices,
  //     expertises: finalExpertises
  //   };

  //   await updateFirebaseStatus("completed", payload);
  //   onRefreshRequested(); 
  //   onClose();
  // };
  const submitForm = async () => {
    const finalTraining = [...formData.trainingAndBackground, ...(otherTraining.trim() ? [otherTraining.trim()] : [])];
    const finalReleased = [...formData.releasedWork, ...(otherReleased.trim() ? [otherReleased.trim()] : [])];
    const finalCollab = [...formData.collaborationInterests, ...(otherCollab.trim() ? [otherCollab.trim()] : [])];
    
    const finalServices = [...formData.services, ...customServices.filter(s => s.trim() !== "")]
      .map(serviceName => ({ serviceName }));
    const finalExpertises = [...formData.expertises, ...customExpertises.filter(e => e.trim() !== "")]
      .map(expertiseName => ({ expertiseName }));

    const payload = {
      profileName: formData.profileName,
      artistName: formData.artistName,
      pronouns: formData.pronouns,
      location: formData.location,
      portfolioLink: formData.portfolioLink,
      socialMedia: formData.socialMedia,
      yearsOfExperience: formData.yearsOfExperience,
      trainingAndBackground: finalTraining,
      releasedWork: finalReleased,
      collaborationInterests: finalCollab,
      services: finalServices,
      expertises: finalExpertises
    };

    await updateFirebaseStatus("completed", payload);
    
    // ✨ PASS THE FULL PAYLOAD TO THE PARENT
    onRefreshRequested({ welcomeFormStatus: "completed", ...payload }); 
    onClose();
  };

  // --- 3. Validation ---
  const isPageValid = () => {
    switch (currentPage) {
      case 0: {
        return true;
      }
      case 1: {
        const nameValid = formData.profileName.trim() !== "";
        // Social Media blocks progressing if they added an entry but left it blank
        const socialValid = formData.socialMedia.every(
          (sm) => sm.platform.trim() !== "" && sm.url.trim() !== ""
        );
        return nameValid && socialValid;
      }
      case 2: {
        const expValid = formData.yearsOfExperience !== "";
        const trainingSelected = formData.trainingAndBackground.length > 0 || otherTraining.trim() !== "";
        const otherTrainingValid = otherTraining === "" || otherTraining.trim() !== "";
        return expValid && trainingSelected && otherTrainingValid;
      }
      case 3: {
        const releasedSelected = formData.releasedWork.length > 0 || otherReleased.trim() !== "";
        const otherReleasedValid = otherReleased === "" || otherReleased.trim() !== "";
        return releasedSelected && otherReleasedValid;
      }
      case 4: {
        const collabSelected = formData.collaborationInterests.length > 0 || otherCollab.trim() !== "";
        const otherCollabValid = otherCollab === "" || otherCollab.trim() !== "";
        return collabSelected && otherCollabValid;
      }
      case 5: {
        const servicesSelected = formData.services.length > 0 || customServices.some(s => s.trim() !== "");
        const customServicesValid = customServices.every(s => s.trim() !== "");
        return servicesSelected && customServicesValid;
      }
      case 6: {
        const expertisesSelected = formData.expertises.length > 0 || customExpertises.some(e => e.trim() !== "");
        const customExpertisesValid = customExpertises.every(e => e.trim() !== "");
        return expertisesSelected && customExpertisesValid;
      }
      default: return true;
    }
  };

  // UI Prompt Wrapper Handlers
  const handleNextPageClick = () => {
    if (!isPageValid()) {
      if (typeof window !== "undefined") {
        window.alert("Please remove all empty fields and complete all the questions before going to the next page.");
      }
      return;
    }
    handleNextPage();
  };

  const handleSubmitClick = () => {
    if (!isPageValid()) {
      if (typeof window !== "undefined") {
        window.alert("Please complete all the questions before submission.");
      }
      return;
    }
    submitForm();
  };

  // --- 4. Render Helpers ---
  const renderCheckboxes = (options, fieldName, otherVal, setOtherVal) => {
    const isOtherChecked = otherVal !== ""; 
    const displayValue = otherVal === " " ? "" : otherVal;

    return (
      <div className="mb-3">
        {options.map(opt => (
          <div key={opt} className="form-check">
            <input className="form-check-input" type="checkbox" id={`${fieldName}-${opt}`} 
              checked={formData[fieldName].includes(opt)} 
              onChange={(e) => handleCheckboxChange(fieldName, opt, e.target.checked)} 
            />
            <label className="form-check-label" htmlFor={`${fieldName}-${opt}`}>{opt}</label>
          </div>
        ))}
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id={`${fieldName}-other-check`} 
            checked={isOtherChecked} 
            onChange={(e) => {
              if (e.target.checked) {
                setOtherVal(" ");
              } else {
                setOtherVal("");
              }
            }} 
          />
          <label className="form-check-label" htmlFor={`${fieldName}-other-check`}>Other</label>
        </div>
        {isOtherChecked && (
           <input type="text" className="form-control mt-2" placeholder="Please specify..." 
             value={displayValue} 
             onChange={(e) => setOtherVal(e.target.value === "" ? " " : e.target.value)} 
             autoFocus
           />
        )}
      </div>
    );
  };

  const renderMultiOtherCheckboxes = (options, fieldName, customArr, setCustomArr) => (
    <div className="mb-3">
      {options.map(opt => (
        <div key={opt} className="form-check">
          <input className="form-check-input" type="checkbox" id={`${fieldName}-${opt}`} 
            checked={formData[fieldName].includes(opt)} 
            onChange={(e) => handleCheckboxChange(fieldName, opt, e.target.checked)} 
          />
          <label className="form-check-label" htmlFor={`${fieldName}-${opt}`}>{opt}</label>
        </div>
      ))}
      <hr style={{margin: 8}} />
      <p className="mb-2" style={{fontSize: "0.9rem", fontWeight: "600"}}>Others (You may add items not listed above):</p>
      {/* <p className="mb-2" style={{fontSize: "0.9rem", fontWeight: "600"}}>Additional Custom Items (Other):</p> */}
      {customArr.map((val, i) => (
        <div key={i} className="d-flex mb-2">
          <input type="text" className="form-control me-2" value={val} placeholder="Input your item..."
            onChange={(e) => {
              const newArr = [...customArr];
              newArr[i] = e.target.value;
              setCustomArr(newArr);
            }} 
          />
          <button className="btn btn-outline-danger btn-sm" onClick={() => setCustomArr(customArr.filter((_, idx) => idx !== i))}>✕</button>
        </div>
      ))}
      <button className="btn btn-outline-secondary btn-sm mt-1" onClick={() => setCustomArr([...customArr, ""])}>+ Add Other</button>
    </div>
  );

  const getPageContent = (pageNum) => {
    switch (pageNum) {
      case 0: return (
        <div style={{minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <img src={welcome0} style={{marginLeft: "auto", marginRight: "auto", marginBottom: 50, height: "350px", display: "block", objectFit: "contain"}}/>
          <h3 style={{textAlign: "center", fontWeight: "bold", fontSize: 30}}>WELCOME TO NNTV!</h3>
          <p style={{textAlign: "center"}}>Let's get started building your profile!</p>
          <button 
            className="button-generic button-accent responsive-network-button" 
            onClick={handleNextPageClick} 
            disabled={saving || prevPageNum !== null}
            style={{ opacity: (!isPageValid() && !saving && prevPageNum === null) ? 0.65 : 1, marginLeft: "auto", marginRight: "auto", display: "block", width: 250, marginTop: 30 }}
          >
            Start
          </button>
          {formStatus !== "completed" ? (
            <button style={{margin: "auto", display: "block", color: "rgba(0, 0, 0, 0.4)", background: "transparent", border: "none", textDecoration: "underline", marginTop: 20}} className="" onClick={handleSkip} disabled={saving}>
              Skip Questionnaire
            </button>
          ) : (
            <div></div> /* Empty div to preserve flexbox spacing */
          )}
        </div>
      );
      case 1: return (
        <div className="welcome-row">
          <div className="welcome-row-question-image-wrapper">
            <div class="background-animation">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="welcome-row-question-image" style={{backgroundImage: `url(${welcome1})`}}/>
          </div>
          <div className="welcome-row-question-wrapper">
            <h5 className="mb-0 welcome-modal-page-title">Personal Information</h5>
            <p className="mb-4">Your basic information which will be displayed on your profile.</p>
            <div className="mb-3">
              <label className="form-label">Name <span className="required-text">*</span></label>
              <input type="text" className="form-control" name="profileName" value={formData.profileName} onChange={handleTextChange} placeholder="Your name" />
            </div>
            <div className="mb-3">
              <label className="form-label">Artist Name <span className="optional-text ">(Optional)</span></label>
              <input type="text" className="form-control" name="artistName" value={formData.artistName} onChange={handleTextChange} placeholder="Your artist name..." />
            </div>
            <div className="mb-3">
              <label className="form-label">Pronouns <span className="optional-text ">(Optional)</span></label>
              <input type="text" className="form-control" name="pronouns" value={formData.pronouns} onChange={handleTextChange} placeholder="Your pronouns..." />
            </div>
            <div className="mb-3">
              <label className="form-label">Location <span className="optional-text ">(Optional)</span></label>
              <input type="text" className="form-control" name="location" value={formData.location} onChange={handleTextChange} placeholder="City, Country" />
            </div>
            <div className="mb-3">
              <label className="form-label">Portfolio / Artist Website <span className="optional-text ">(Optional)</span></label>
              <input type="url" className="form-control" name="portfolioLink" value={formData.portfolioLink} onChange={handleTextChange} placeholder="https://" />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Social Media Links <span className="optional-text ">(Optional)</span></label>
              {formData.socialMedia.map((sm, i) => (
                <div key={i} className="d-flex mb-2 gap-2">
                  <select className="form-select" style={{width: '40%'}} value={sm.platform} 
                    onChange={(e) => {
                      const updated = [...formData.socialMedia];
                      updated[i].platform = e.target.value;
                      setFormData({...formData, socialMedia: updated});
                    }}>
                    <option value="">Platform</option>
                    {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="url" className="form-control" placeholder="https://" value={sm.url}
                    onChange={(e) => {
                      const updated = [...formData.socialMedia];
                      updated[i].url = e.target.value;
                      setFormData({...formData, socialMedia: updated});
                    }} />
                  <button className="btn btn-outline-danger" onClick={() => {
                    setFormData({...formData, socialMedia: formData.socialMedia.filter((_, idx) => idx !== i)});
                  }}>✕</button>
                </div>
              ))}
              <button className="btn btn-outline-primary btn-sm mt-1 al-d-block" onClick={() => setFormData({...formData, socialMedia: [...formData.socialMedia, {platform: "", url: ""}]})}>
                + Add Social Link
              </button>
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="welcome-row">
          <div className="welcome-row-question-image-wrapper">
            <div class="background-animation">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="welcome-row-question-image" style={{backgroundImage: `url(${welcome2})`}}/>
          </div>
          <div className="welcome-row-question-wrapper">
            {/* <h5 className="mb-4">Experience & Background</h5> */}
            <h5 className="mb-0 welcome-modal-page-title">Experience & Background</h5>
            <p className="mb-4">Share with us your experience and level in your craft.</p>
            <div className="mb-4">
              <label className="form-label">Years of Experience <span className="required-text">*</span></label>
              <select className="form-select" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleTextChange}>
                <option value="">Select...</option>
                {YEARS_EXP.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Training & Background <span className="required-text">*</span> (Please select at least one and all that apply)</label>
              {renderCheckboxes(TRAINING_OPTS, "trainingAndBackground", otherTraining, setOtherTraining)}
            </div>
          </div>
        </div>
      );
      case 3: return (
        <div className="welcome-row">
          <div className="welcome-row-question-image-wrapper">
            <div class="background-animation">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="welcome-row-question-image" style={{backgroundImage: `url(${welcome3})`}}/>
          </div>
          <div className="welcome-row-question-wrapper">
            {/* <h5 className="mb-4">Creative Portfolio</h5> */}
            <h5 className="mb-0 welcome-modal-page-title">Creative Portfolio</h5>
            <p className="mb-4">Share with us your work.</p>
            <label className="form-label">Have you publicly released work? <span className="required-text">*</span> (Please select at least one)</label>
            {renderCheckboxes(RELEASED_OPTS, "releasedWork", otherReleased, setOtherReleased)}
          </div>
        </div>
      );
      case 4: return (
        <div className="welcome-row">
          <div className="welcome-row-question-image-wrapper">
            <div class="background-animation">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="welcome-row-question-image" style={{backgroundImage: `url(${welcome4})`}}/>
          </div>
          <div className="welcome-row-question-wrapper">
            {/* <h5 className="mb-4">Collaboration Interests</h5> */}
            <h5 className="mb-0 welcome-modal-page-title">Collaboration Interests</h5>
            <p className="mb-4">NNTV is built for artists just like you! What would you like to do here?</p>
            <label className="form-label">What are your interests in collaborating on our platform? <span className="required-text">*</span></label>
            {renderCheckboxes(COLLAB_OPTS, "collaborationInterests", otherCollab, setOtherCollab)}
          </div>
        </div>
      );
      case 5: return (
        <div className="welcome-row">
          <div className="welcome-row-question-image-wrapper">
            <div class="background-animation">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="welcome-row-question-image" style={{backgroundImage: `url(${welcome5})`}}/>
          </div>
          <div className="welcome-row-question-wrapper">
            {/* <h5 className="mb-4">Services</h5> */}
            <h5 className="mb-0 welcome-modal-page-title">Services</h5>
            {/* <p className="mb-4">Share with us your work.</p> */}
            <label className="form-label">What are some services that you offer? <span className="required-text">*</span> (Please select at least one)</label>
            {renderMultiOtherCheckboxes(SERVICE_OPTS, "services", customServices, setCustomServices)}
          </div>
        </div>
      );
      case 6: return (
        <div className="welcome-row">
          <div className="welcome-row-question-image-wrapper">
            <div class="background-animation">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="welcome-row-question-image" style={{backgroundImage: `url(${welcome6})`}}/>
          </div>
          <div className="welcome-row-question-wrapper">
            {/* <h5 className="mb-4">Expertise</h5> */}
            <h5 className="mb-0 welcome-modal-page-title">Expertise</h5>
            <label className="form-label">What are your areas of expertise? <span className="required-text">*</span> (Please select at least one)</label>
            {renderMultiOtherCheckboxes(EXPERTISE_OPTS, "expertises", customExpertises, setCustomExpertises)}
          </div>
        </div>
      );
      default: return null;
    }
  };

  // --- 5. Main Render ---
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleModalClose} 
      // title={`Welcome! Let's build your profile (${currentPage}/${totalPages})`} 
      title={`Welcom to NNTV! Let's start building your profile!`} 
      maxWidth="90%"
    >
      {/* CSS Keyframes for Next/Prev Sliding Animations */}
      <style>{`
        @keyframes slide-out-left {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-50px); opacity: 0; }
        }
        @keyframes slide-in-from-right {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-out-right {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(50px); opacity: 0; }
        }
        @keyframes slide-in-from-left {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div>

      </div>
      <div style={{width: "100%", margin: "auto", height: "auto"}}>
        {loading ? (
          <div className="text-center py-5">Loading...</div>
        ) : (
          <div className="d-flex flex-column" style={{ maxHeight: "75vh", justifyContent: "space-between", height: "100%" }}>
            
            {/* Scrollable Content Container */}
            {/* <div className="flex-grow-1 pe-2 pb-2"> */}
            <div className="flex-grow-1">
              
              {/* Grid wrapper overlaps exiting and entering elements in identical spaces */}
              <div style={{ display: "grid" }}>
                
                {/* Animating OUT Page */}
                {prevPageNum !== null && (
                  <div
                    key={`page-${prevPageNum}`}
                    style={{
                      // gridArea: "1 / 1",
                      animation: direction === "next"
                        ? "slide-out-left 0.25s forwards ease-in-out"
                        : "slide-out-right 0.25s forwards ease-in-out"
                    }}
                  >
                    {getPageContent(prevPageNum)}
                  </div>
                )}

                {/* Animating IN Page */}
                <div
                  key={`page-${currentPage}`}
                  style={{
                    gridArea: "1 / 1",
                    animation: prevPageNum !== null 
                      ? (direction === "next" 
                          ? "slide-in-from-right 0.25s forwards ease-in-out" 
                          : "slide-in-from-left 0.25s forwards ease-in-out") 
                      : "none"
                  }}
                >
                  {getPageContent(currentPage)}
                </div>
                
              </div>
            </div>

            {/* Sticky Footer Controls - separated via flex-shrink-0 */}
            {currentPage > 0 ?
              <div className="d-flex justify-content-between align-items-center mt-3-no pt-3 border-top flex-shrink-0 bg-white" style={{marginTop: 0, paddingLeft: "24px", paddingRight: "24px", paddingBottom: "auto"}}>
              
                {/* Only show skip if form has NOT been completed before */}
                <div style={{display: "flex", flexDirection: "row", gap: 30}}>
                  <span>Page {currentPage} / {totalPages}</span>
                  {formStatus !== "completed" ? (
                    <button style={{color: "rgba(0, 0, 0, 0.4)", background: "transparent", border: "none", textDecoration: "underline"}} className="" onClick={handleSkip} disabled={saving}>
                      Skip Questionnaire
                    </button>
                  ) : (
                    <div></div> /* Empty div to preserve flexbox spacing */
                  )}
                </div>
                
                <div className="d-flex gap-2">
                  {currentPage > 1 && (
                    <button className="btn btn-secondary" onClick={handlePrevPage} disabled={saving || prevPageNum !== null}>
                      Previous
                    </button>
                  )}
                  
                  {/* Note: the html 'disabled' flag is removed for pure validation so onClick triggers the alert. 
                      Opacity is adjusted instead to visually cue the user */}
                  {currentPage < totalPages ? (
                    <button 
                      className="button-generic button-accent responsive-network-button" 
                      onClick={handleNextPageClick} 
                      disabled={saving || prevPageNum !== null}
                      style={{ opacity: (!isPageValid() && !saving && prevPageNum === null) ? 0.65 : 1 }}
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      className="btn btn-success" 
                      onClick={handleSubmitClick} 
                      disabled={saving || prevPageNum !== null}
                      style={{ opacity: (!isPageValid() && !saving && prevPageNum === null) ? 0.65 : 1 }}
                    >
                      {saving ? "Saving..." : "Submit"}
                    </button>
                  )}
                </div>
              </div>
              :
              <></>
            }            
          </div>
        )}
      </div>
    </Modal>
  );
};

export default WelcomeQuestionnaireModal;