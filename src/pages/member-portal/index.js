import React, { useState, useEffect, useRef } from "react";
import { navigate } from "gatsby";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore"; 
import { auth, db } from "../../firebase";
import Layout from "../../components/Layout";
import Markdown from "react-markdown";

import 'bootstrap/dist/css/bootstrap.min.css';
import placeholder from "../../img/placeholder.png";
import music_note from "../../img/music_note_icon.svg";
import star from "../../img/star_icon.svg";
import language from "../../img/language_icon.svg";
import { getContrastYIQ } from "../../templates/network-member-page"
import formIcon from "../../img/form_icon_2.svg"
import binIcon from "../../img/bin_icon.svg"
import uploadIcon from "../../img/upload_icon_centered.svg"
import cropIcon from "../../img/resize_icon.svg"
import defaultAvatar from "../../img/default-avatar.svg"
import WelcomeQuestionnaireModal from "../../components/WelcomeQuestionnaireModal"; // Adjust path as needed

// Set your maximum limit here (5MB is highly recommended for quick load times)
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export default function MemberPortal() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [markdownTab, setMarkdownTab] = useState("write"); 

  const [originalProfileData, setOriginalProfileData] = useState(null);
  
  // Admin-specific workspace state tracking variables
  const [isActingAsAdmin, setIsActingAsAdmin] = useState(false);
  const [targetFirebaseDocId, setTargetFirebaseDocId] = useState("");
  const [customStatusInput, setCustomStatusInput] = useState("");
  const [customTypeInput, setCustomTypeInput] = useState("");

  const [systemThemes, setSystemThemes] = useState([]);

  const bioRef = useRef(null);

  const ABOUT_LIMIT = 160;   
  const BIO_LIMIT = 4000;    

  const [systemBadges, setSystemBadges] = useState([]);

  const [profileData, setProfileData] = useState({
    profileName: "",
    about: "", 
    bio: "",
    profileImage: "",
    coverImage: "",
    portfolioLink: "",
    profileStatus: "pending", 
    memberType: "regular",
    private: false,          
    expiryDate: null,
    joinDate: null,
    allowedBadges: [],       
    displayingBadges: [],    
    selectedTheme: "",
    allowedThemes: [],
    degrees: [],
    contacts: [],
    preferredContact: { contactType: "Email", content: "" },
    services: [],
    expertises: [],
    languages: [],
    sampleOfWorks: [],
    images: [],
    enableImageCrop: false,
    profileImageSize: 100,
    profileImagePosX: 50,
    profileImagePosY: 50,
  });
  const [hasConfirmedDateEdit, setHasConfirmedDateEdit] = useState(false);

  const [tempProfileUrl, setTempProfileUrl] = useState("");
  const [tempCoverUrl, setTempCoverUrl] = useState("");
  const [profileProgress, setProfileProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [galleryProgress, setGalleryProgress] = useState({});

  const formatHumanReadableDate = (dateValue) => {
    if (!dateValue) return "N/A";
    if (typeof dateValue.toDate === "function") {
      return dateValue.toDate().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    }
    if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    }
    const parsedDate = new Date(dateValue);
    return isNaN(parsedDate.getTime()) ? "N/A" : parsedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // --- CLICK HANDLER ---
  const handleDateClick = (e) => {
    if (!hasConfirmedDateEdit) {
      e.preventDefault(); // Temporarily blocks the calendar picker from opening
      if (typeof window !== "undefined") {
        const confirmEdit = window.confirm("You are trying to modify the join date/expiry date of this member, are you sure you would like to continue?");
        if (confirmEdit) {
          setHasConfirmedDateEdit(true);
        } else {
          e.target.blur(); // Remove focus if they cancel
        }
      }
    }
  };

  // Helper to safely convert Firebase dates or strings into JS Date objects
  const normalizeDate = (dateValue) => {
    if (!dateValue) return null;
    let d = typeof dateValue.toDate === "function" ? dateValue.toDate() : (dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue));
    if (isNaN(d.getTime())) return null;
    return d;
  };

  // Calculates the exact difference in years, months, and days
  const calculateDateDifference = (startDate, endDate) => {
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);

    if (!start || !end || start > end) return null;

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    // If days are negative, we borrow a month and get the exact days of the previous month
    if (days < 0) {
      months -= 1;
      const previousMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += previousMonthDays;
    }

    // If months are negative, we borrow a year
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days };
  };

  // Formats the calculated object into a clean English string
  const formatDurationString = (duration) => {
    if (!duration) return "";
    const { years, months, days } = duration;
    if (years === 0 && months === 0 && days === 0) return "0 days";

    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    return `${parts[0]}, ${parts[1]} and ${parts[2]}`;
  };

  // Helper parsing routine converting incoming Firestore timestamps safely for HTML5 date controls
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return "";
    let d = typeof dateValue.toDate === "function" ? dateValue.toDate() : (dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue));
    if (isNaN(d.getTime())) return "";
    return d.toISOString().substring(0, 10);
  };

  const getMembershipBadgeStyles = (type) => {
    switch (String(type).toLowerCase()) {
      case "permanent": return { backgroundColor: "#6f42c1", color: "#ffffff", fontWeight: "600" }; 
      case "verified": return { backgroundColor: "#198754", color: "#ffffff", fontWeight: "600" }; 
      default: return { backgroundColor: "#6c757d", color: "#ffffff", fontWeight: "600" }; 
    }
  };

  // --- DATE CALCULATIONS ---
  const joinDateObj = normalizeDate(profileData.joinDate);
  const expiryDateObj = normalizeDate(profileData.expiryDate);
  const now = new Date();

  // Calculate Total Length
  const totalLengthDiff = calculateDateDifference(joinDateObj, expiryDateObj);
  const totalLengthStr = totalLengthDiff ? formatDurationString(totalLengthDiff) : "Unknown length";

  // Calculate Expiry Message
  let expiryMessage = "";
  if (expiryDateObj) {
    if (expiryDateObj > now) {
      const timeUntilDiff = calculateDateDifference(now, expiryDateObj);
      expiryMessage = `${formatDurationString(timeUntilDiff)} until profile expires`;
    } else {
      expiryMessage = "Profile has already expired";
    }
  }

  // Abstract the fetch logic so we can call it on load AND after the modal closes
  const fetchAndSetUserData = async (currentUser, uidQueryOverride = null) => {
    // Note: Use currentUser from props, and uidQueryOverride from the URL if applicable
    let searchParams;
    if (typeof window !== "undefined") {
      searchParams = new URLSearchParams(window.location.search);
    }
    const urlQueryUserID = uidQueryOverride || searchParams.get("userID");

    const badgeCollectionSnap = await getDocs(collection(db, "badges"));
    const sortedBadges = badgeCollectionSnap.docs
      .map(docDoc => ({ id: docDoc.id, ...docDoc.data() }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setSystemBadges(sortedBadges);

    const themeCollectionSnap = await getDocs(collection(db, "themes"));
    const sortedThemes = themeCollectionSnap.docs
      .map(docDoc => ({ id: docDoc.id, ...docDoc.data() }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setSystemThemes(sortedThemes);
    // console.log("systemThemes", sortedThemes);
    
    const ownProfileRef = doc(db, "profiles", currentUser.uid);
    const ownProfileSnap = await getDoc(ownProfileRef);
    const viewerIsAdmin = ownProfileSnap.exists() && ownProfileSnap.data().role === "admin";

    let finalProfileData = null;
    let targetDocIdToSet = currentUser.uid;

    if (urlQueryUserID && urlQueryUserID.trim() !== "") {
      if (!viewerIsAdmin) {
        alert("Security Rejection: Administrative authorization credentials missing.");
        navigate("/member-portal");
        return;
      }
      const profilesRef = collection(db, "profiles");
      const q = query(profilesRef, where("userID", "==", urlQueryUserID.trim()));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        finalProfileData = querySnap.docs[0].data();
        targetDocIdToSet = querySnap.docs[0].id; 
        setIsActingAsAdmin(true);
        setTargetFirebaseDocId(targetDocIdToSet);
      } else {
        alert(`Query Error: Target profile reference string '${urlQueryUserID}' not found.`);
        navigate("/member-portal");
        return;
      }
    } else {
      if (ownProfileSnap.exists()) {
        finalProfileData = ownProfileSnap.data();
      } else {
        const preImportedEmail = currentUser.email.toLowerCase().trim();
        const emailDocRef = doc(db, "profiles", preImportedEmail);
        const emailDocSnap = await getDoc(emailDocRef);

        if (emailDocSnap.exists()) {
          finalProfileData = emailDocSnap.data();
          await setDoc(ownProfileRef, finalProfileData);
          await setDoc(doc(db, "userIDs", finalProfileData.userID), { verified: true }, { merge: true });
          await deleteDoc(emailDocRef);
          alert("Welcome! Your details have been linked to your workspace.");
        } else {
          finalProfileData = {};
        }
      }
    }

    // Check Welcome Form Status
    if (!urlQueryUserID && (!finalProfileData.welcomeFormStatus || finalProfileData.welcomeFormStatus === "pending")) {
      setShowWelcomeModal(true);
    }

    // ==========================================
    // ✨ NEW LOGIC STARTS HERE
    // ==========================================

    const rawImages = finalProfileData.images || [];
    const structuredImages = rawImages.map(img => {
      if (typeof img === "string") return { url: img, tempUrl: img, title: "", description: "" };
      return { url: img.url || "", tempUrl: img.tempUrl || img.url || "", title: img.title || "", description: img.description || "" };
    });

    const defaultStatuses = ["pending", "reviewed"];
    if (finalProfileData.profileStatus && !defaultStatuses.includes(finalProfileData.profileStatus)) {
      setCustomStatusInput(finalProfileData.profileStatus);
    }
    const defaultTypes = ["regular", "verified", "permanent"];
    if (finalProfileData.memberType && !defaultTypes.includes(finalProfileData.memberType)) {
      setCustomTypeInput(finalProfileData.memberType);
    }

    console.log("finalProfileData", finalProfileData)
    // 1. Build the object outside of the setter
    const compiledState = {
      ...profileData, // Keeps your initial empty default state intact
      ...finalProfileData,
      about: finalProfileData.about || "", 
      profileStatus: finalProfileData.profileStatus || "pending",
      memberType: finalProfileData.memberType || "regular",
      private: finalProfileData.private ?? false,
      expiryDate: finalProfileData.expiryDate || null,
      joinDate: finalProfileData.joinDate || null,
      allowedBadges: finalProfileData.allowedBadges || [],
      displayingBadges: finalProfileData.displayingBadges || [],
      selectedTheme: finalProfileData.selectedTheme || "",
      allowedThemes: finalProfileData.allowedThemes || [],
      degrees: finalProfileData.degrees || [],
      contacts: finalProfileData.contacts || [],
      preferredContact: finalProfileData.preferredContact || { contactType: "Email", content: "" },
      services: finalProfileData.services || [],
      expertises: finalProfileData.expertises || [],
      languages: finalProfileData.languages || [],
      sampleOfWorks: finalProfileData.sampleOfWorks || [],
      images: structuredImages,
      userID: finalProfileData?.userID,

      // Handle Image Adjustment Properties Hydration
      enableImageCrop: finalProfileData.enableImageCrop ?? false,
      profileImageSize: finalProfileData.profileImageSize ?? 100,
      profileImagePosX: finalProfileData.profileImagePosX ?? 50,
      profileImagePosY: finalProfileData.profileImagePosY ?? 50,
    };

    // 2. Set both states using the exact same compiled object
    setProfileData(compiledState);
    // setOriginalProfileData(compiledState); // ✨ The new baseline for your auto-revert!
    setOriginalProfileData(JSON.parse(JSON.stringify(compiledState)));
    
    // ==========================================
    // ✨ NEW LOGIC ENDS HERE
    // ==========================================
    
    setTempProfileUrl(finalProfileData.profileImage || "");
    setTempCoverUrl(finalProfileData.coverImage || "");
    setLoading(false);
  };

  // ✨ NEW: Auto-hide the dirty toast if the user manually reverts their changes
  useEffect(() => {
    if (originalProfileData) {
      // If the current data strictly matches the original data, isChanged becomes false!
      const isChanged = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
      setIsDirty(isChanged);
    }
    // console.log("profileData: ", profileData);
  }, [profileData, originalProfileData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      if (!currentUser.emailVerified) {
        alert("Please verify your email address first.");
        navigate("/login");
        return;
      }

      setUser(currentUser);
      await fetchAndSetUserData(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleBeforeUnload)        
      }
    };
  }, [isDirty]);

  const insertMarkdown = (syntaxType) => {
    const textarea = bioRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end);

    let injectedString = "";
    switch (syntaxType) {
      case "bold": injectedString = `**${selectedText || "bold text"}**`; break;
      case "italic": injectedString = `*${selectedText || "italic text"}*`; break;
      case "code": injectedString = `\`${selectedText || "code block"}\``; break;
      case "heading": injectedString = `\n### ${selectedText || "Heading Element"}\n`; break;
      case "link": injectedString = `[${selectedText || "Hyperlink Text"}](https://example.com)`; break;
      case "quote": injectedString = `\n> ${selectedText || "Blockquote content"}\n`; break;
      case "bullet": injectedString = `\n- ${selectedText || "List item"}\n`; break;
      case "number": injectedString = `\n1. ${selectedText || "List item"}\n`; break;
      default: return;
    }

    const calculatedPayload = currentText.substring(0, start) + injectedString + currentText.substring(end);
    if (calculatedPayload.length > BIO_LIMIT) {
      alert("Formatting this selection would exceed the maximum text threshold size.");
      return;
    }

    setIsDirty(true);
    setProfileData(prev => ({ ...prev, bio: calculatedPayload }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + injectedString.length, start + injectedString.length);
    }, 0);
  };

  const handleApplyUrl = async (fieldName, urlValue) => {
    // Get the previously saved URL to revert to if needed
    const previousUrl = profileData[fieldName] || "";

    if (urlValue) {
      // 1. Check if the URL is a valid, reachable image
      const isValid = await checkIsValidImage(urlValue);
      if (!isValid) {
        handleInvalidUrlWarning(previousUrl, (revertUrl) => {
          if (fieldName === "profileImage") setTempProfileUrl(revertUrl);
          if (fieldName === "coverImage") setTempCoverUrl(revertUrl);
        });
        return; // Stop execution
      }

      // 2. Check the size of the image
      const size = await checkImageUrlSize(urlValue);
      if (size > MAX_IMAGE_SIZE_BYTES) {
        handleOversizedUrlWarning(previousUrl, (revertUrl) => {
          if (fieldName === "profileImage") setTempProfileUrl(revertUrl);
          if (fieldName === "coverImage") setTempCoverUrl(revertUrl);
        });
        return; // Stop execution
      }
    }

    setIsDirty(true);
    setProfileData((prev) => ({ ...prev, [fieldName]: urlValue }));
    if (typeof window !== "undefined") {
      window.alert(`${fieldName === "profileImage" ? "Profile" : "Cover"} image preview updated!`);
    }
  };

  const handleDirectFieldChange = (field, value) => {
    setIsDirty(true);
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedObjectChange = (parentField, key, value) => {
    setIsDirty(true);
    setProfileData(prev => ({ ...prev, [parentField]: { ...prev[parentField], [key]: value } }));
  };

  // const handleArrayItemChange = (section, index, key, value) => {
  //   setIsDirty(true);
  //   const updatedArray = [...profileData[section]];
  //   updatedArray[index][key] = value;
  //   setProfileData(prev => ({ ...prev, [section]: updatedArray }));
  // };
  const handleArrayItemChange = (section, index, key, value) => {
    // We don't need setIsDirty(true) here anymore because our useEffect handles it automatically!
    setProfileData(prev => {
      const updatedArray = [...prev[section]];
      
      // ✨ Create a brand new copy of the object at this index so we don't mutate the original memory reference
      updatedArray[index] = { ...updatedArray[index], [key]: value };
      
      return { ...prev, [section]: updatedArray };
    });
  };

  const addArrayItem = (section, templateObject) => {
    setIsDirty(true);
    setProfileData(prev => ({ ...prev, [section]: [...prev[section], templateObject] }));
  };

  // const removeArrayItem = (section, index) => {
  //   if (typeof window !== "undefined") {
  //     if (!window.confirm("Are you sure you want to remove this item?")) return;
  //   }
  //   setIsDirty(true);
  //   setProfileData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  // };
  const removeArrayItem = (section, index) => {
    // 1. Grab the item we are trying to delete from state
    const item = profileData[section] ? profileData[section][index] : null;
    let shouldBypassPrompt = false;

    // 2. Check if the item is blank or just the default text
    if (item) {
      switch (section) {
        case "services":
          shouldBypassPrompt = !item.serviceName || item.serviceName.trim() === "" || item.serviceName === "New Service";
          break;
        case "expertises":
          shouldBypassPrompt = !item.expertiseName || item.expertiseName.trim() === "" || item.expertiseName === "New Expertise";
          break;
        case "languages":
          shouldBypassPrompt = !item.languageName || item.languageName.trim() === "" || item.languageName === "New Language";
          break;
        case "degrees":
          shouldBypassPrompt = !item.degreeName || item.degreeName.trim() === "" || item.degreeName === "New Degree";
          break;
        case "contacts":
          shouldBypassPrompt = !item.content || item.content.trim() === "" || item.content === "New Contact";
          break;
        case "sampleOfWorks":
          shouldBypassPrompt = !item.link || item.link.trim() === "";
          break;
        // Images or any other sections not listed will default to false (prompt will show)
        default:
          shouldBypassPrompt = false;
      }
    }

    // 3. Show prompt ONLY if it's a filled-out item
    if (!shouldBypassPrompt && typeof window !== "undefined") {
      if (!window.confirm("Are you sure you want to remove this item?")) return;
    }

    // 4. Proceed with removing the item
    setIsDirty(true);
    setProfileData(prev => ({ 
      ...prev, 
      [section]: prev[section].filter((_, i) => i !== index) 
    }));
  };

  const handleDragStart = (e, section, index) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ section, index }));
  };

  const handleDrop = (e, targetSection, targetIndex) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.section !== targetSection) return;
      setIsDirty(true);
      const reorderedArray = [...profileData[targetSection]];
      const [movedItem] = reorderedArray.splice(data.index, 1);
      reorderedArray.splice(targetIndex, 0, movedItem);
      setProfileData(prev => ({ ...prev, [targetSection]: reorderedArray }));
    } catch (err) {}
  };

  const addBadgeToDisplayPayload = (badgeId) => {
    const currentDisplays = profileData.displayingBadges || [];
    if (currentDisplays.length >= 10) {
      alert("You can only exhibit a maximum of 10 profile badges simultaneously.");
      return;
    }
    if (currentDisplays.includes(badgeId)) return;
    setIsDirty(true);
    setProfileData(prev => ({ ...prev, displayingBadges: [...currentDisplays, badgeId] }));
  };

  const removeBadgeFromDisplayPayload = (badgeId) => {
    setIsDirty(true);
    setProfileData(prev => ({ ...prev, displayingBadges: (prev.displayingBadges || []).filter(id => id !== badgeId) }));
  };

  const handleImageItemChange = (index, value) => {
    setIsDirty(true);
    const updatedImages = [...(profileData.images || [])];
    updatedImages[index].tempUrl = value;
    setProfileData(prev => ({ ...prev, images: updatedImages }));
  };

  const handleApplyImageItemUrl = async (index) => {
    const updatedImages = [...(profileData.images || [])];
    const urlValue = updatedImages[index].tempUrl;
    const previousUrl = updatedImages[index].url || "";

    if (urlValue) {
      // 1. Check if the URL is a valid, reachable image
      const isValid = await checkIsValidImage(urlValue);
      if (!isValid) {
        handleInvalidUrlWarning(previousUrl, (revertUrl) => {
          handleImageItemChange(index, revertUrl);
        });
        return; // Stop execution
      }

      // 2. Check the size of the image
      const size = await checkImageUrlSize(urlValue);
      if (size > MAX_IMAGE_SIZE_BYTES) {
        handleOversizedUrlWarning(previousUrl, (revertUrl) => {
          handleImageItemChange(index, revertUrl);
        });
        return; // Stop execution
      }
    }

    // If size is good (or CORS blocked the check), proceed with applying
    updatedImages[index].url = urlValue;
    setIsDirty(true);
    setProfileData((prev) => ({ ...prev, images: updatedImages }));
    if (typeof window !== "undefined") {
      window.alert(`Gallery photo #${index + 1} preview configuration updated!`);
    }
  };

  const handleGalleryMetadataChange = (index, field, value) => {
    setIsDirty(true);
    const updatedImages = [...(profileData.images || [])];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setProfileData(prev => ({ ...prev, images: updatedImages }));
  };

  const handleAddGalleryImage = () => {
    const maxLimit = profileData.memberType === "permanent" ? 20 : 5;
    if ((profileData.images || []).length >= maxLimit) {
      alert(`Your membership tier allows a maximum of ${maxLimit} gallery photos.`);
      return;
    }
    addArrayItem("images", { url: "", tempUrl: "", title: "", description: "" });
  };

  // Helper to remove entirely blank items (handles both strings and objects)
  const removeBlankItems = (arr) => {
    return (arr || []).filter(item => {
      if (!item) return false;
      if (typeof item === "string") return item.trim() !== "";
      if (typeof item === "object") {
        // If it's an object, keep it if at least one string property has text
        return Object.values(item).some(val => val && String(val).trim() !== "");
      }
      return true;
    });
  };

  // Helper to clear images with a Gatsby-safe prompt
  const handleClearImage = (fieldName) => {
    if (typeof window !== "undefined") {
      const isConfirmed = window.confirm(`Are you sure you want to remove this ${fieldName === "profileImage" ? "profile" : "cover"} image? This will clear the URL.`);
      if (isConfirmed) {
        setIsDirty(true);
        setProfileData((prev) => ({ ...prev, [fieldName]: "" }));
        if (fieldName === "profileImage") setTempProfileUrl("");
        if (fieldName === "coverImage") setTempCoverUrl("");
      }
    }
  };

  // Helper to check remote URL size
  const checkImageUrlSize = async (url) => {
    try {
      // First try a lightweight HEAD request to get the content-length
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          return parseInt(contentLength, 10);
        }
      }
      // If HEAD fails or doesn't return length, try fetching the whole blob
      const getResponse = await fetch(url);
      const blob = await getResponse.blob();
      return blob.size;
    } catch (error) {
      console.warn("Could not determine remote image size (likely due to CORS restrictions). Bypassing size check.");
      // Return -1 to indicate unknown size so we don't accidentally block valid images
      return -1; 
    }
  };

  // Helper to verify the URL actually points to a reachable image
  const checkIsValidImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // Helper for invalid/unreachable URL warnings
  const handleInvalidUrlWarning = (previousUrl, revertCallback) => {
    if (typeof window !== "undefined") {
      if (previousUrl) {
        const userWantsToRevert = window.confirm("We are unable to retrieve image data from your URL, would you like to revert back to the previously selected image?");
        if (userWantsToRevert) {
          revertCallback(previousUrl);
        }
      } else {
        window.alert("We are unable to retrieve image data from your URL, please provide an alternate image.");
      }
    }
  };

  // Helper to handle the prompt logic you requested
  const handleOversizedUrlWarning = (previousUrl, revertCallback) => {
    if (typeof window !== "undefined") {
      if (previousUrl) {
        const userWantsToRevert = window.confirm("The image you provided is too big and it can not be used, would you like to revert back to the previously selected image?");
        if (userWantsToRevert) {
          revertCallback(previousUrl);
        }
      } else {
        window.alert("The image you provided is too big and it can not be used, please provide an alternate image.");
      }
    }
  };

  const handleImageUpload = async (e, fieldName, setProgress, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size before uploading
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      if (typeof window !== "undefined") {
        window.alert(`The selected file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please select an image under ${MAX_IMAGE_SIZE_MB}MB.`);
      }
      // Clear the input so the user can select a different file
      e.target.value = null; 
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    const IMGBB_API_KEY = "b472f6b787bcc8fd6c376c4abcd09c7d"; 

    try {
      setProgress(50); 
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
      const result = await response.json();

      if (result.success) {
        const directImageUrl = result.data.url;
        setIsDirty(true);
        if (index !== null && fieldName === "images") {
          setProfileData((prev) => {
            const updatedImages = [...(prev.images || [])];
            if (updatedImages[index]) {
              updatedImages[index] = { ...updatedImages[index], url: directImageUrl, tempUrl: directImageUrl };
            }
            return { ...prev, images: updatedImages };
          });
        } else {
          setProfileData((prev) => ({ ...prev, [fieldName]: directImageUrl }));
          if (fieldName === "profileImage") setTempProfileUrl(directImageUrl);
          if (fieldName === "coverImage") setTempCoverUrl(directImageUrl);
        }
      } else {
        if (typeof window !== "undefined") window.alert("Upload failed.");
      }
    } catch (err) {
      if (typeof window !== "undefined") window.alert("Upload error.");
    } finally {
      setProgress(0);
      e.target.value = null; // Reset input after upload finishes
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // --- 1. ARRAY CLEANUP (Remove Blank Items Before Saving) ---
    const cleanDegrees = removeBlankItems(profileData.degrees);
    const cleanContacts = (profileData.contacts || []).filter(
      c => c && c.content && c.content.trim() !== ""
    );
    const cleanServices = removeBlankItems(profileData.services);
    const cleanExpertises = removeBlankItems(profileData.expertises);
    const cleanLanguages = removeBlankItems(profileData.languages);

    const cleanSampleOfWorks = (profileData.sampleOfWorks || []).filter(
      s => s && s.title?.trim() && s.link?.trim()
    );

    const cleanImagesArray = (profileData.images || [])
      .filter(img => img.url || img.tempUrl)
      .map(img => {
        const finalUrl = img.url || img.tempUrl || "";
        return {
          url: finalUrl,
          tempUrl: finalUrl, 
          title: img.title || "",
          description: img.description || ""
        };
      });

    // --- 2. VALIDATION CHECKS ---
    const errors = [];
    
    if (!profileData.profileName || !profileData.profileName.trim()) {
      errors.push("- Profile Name is a required field.");
    }
    if (profileData.about && profileData.about.length > ABOUT_LIMIT) {
      errors.push(`- The About section must be ${ABOUT_LIMIT} characters or less.`);
    }
    if (profileData.bio && profileData.bio.length > BIO_LIMIT) {
      errors.push(`- The Bio must be ${BIO_LIMIT} characters or less.`);
    }
    if (!profileData.preferredContact?.contactType || !profileData.preferredContact?.content?.trim()) {
      errors.push("- Preferred Contact (both contact type and contact details) is required.");
    }

    // ✨ Added Range Validation Checks for Image Adjustments
    if (profileData.enableImageCrop) {
      if (profileData.profileImageSize < 50 || profileData.profileImageSize > 300) {
        errors.push("- Profile Image size must be between 50% and 300%.");
      }
      if (profileData.profileImagePosX < -100 || profileData.profileImagePosX > 200) {
        errors.push("- Profile Image X position must be between -100% and 200%.");
      }
      if (profileData.profileImagePosY < -100 || profileData.profileImagePosY > 200) {
        errors.push("- Profile Image Y position must be between -100% and 200%.");
      }
    }

    if (errors.length > 0) {
      if (typeof window !== "undefined") {
        window.alert("Please fix the following issues before saving:\n\n" + errors.join("\n"));
      }
      return; 
    }

    // --- 3. PROCEED WITH SAVING ---
    setSaving(true);
    try {
      const targetId = isActingAsAdmin ? targetFirebaseDocId : user.uid;
      const docRef = doc(db, "profiles", targetId);
      
      let finalStatus = profileData.profileStatus;
      if (finalStatus === "other") finalStatus = customStatusInput.trim() || "other";
      
      let finalType = profileData.memberType;
      if (finalType === "other") finalType = customTypeInput.trim() || "other";

      const payloadToSave = {
        ...profileData,
        degrees: cleanDegrees,
        contacts: cleanContacts,
        services: cleanServices,
        expertises: cleanExpertises,
        languages: cleanLanguages,
        sampleOfWorks: cleanSampleOfWorks,
        profileStatus: finalStatus,
        memberType: finalType,
        images: cleanImagesArray
      };

      await setDoc(docRef, payloadToSave, { merge: true });
      
      // ✨ NEW: Netlify Build Trigger Logic
      // Check if Admin just changed the status to "approved" (or your active status string)
      // We check originalProfileData to make sure we don't trigger a build on EVERY save, only when it newly becomes approved.
      let shouldTriggerBuild = false;
      if (isActingAsAdmin) {
        if ((payloadToSave?.memberType === "verified" || payloadToSave?.memberType === "permanent") && !(originalProfileData.memberType == "verified" || originalProfileData.memberType == "permanent")) {
          shouldTriggerBuild = true;
        } else if (payloadToSave.profileStatus === "reviewed" && originalProfileData.profileStatus !== "reviewed") {
          shouldTriggerBuild = true;
        }

        if (shouldTriggerBuild) {
          const buildHookUrl = process.env.GATSBY_NETLIFY_BUILD_HOOK;

          // ONLY fire if we are in production AND the URL exists
          if (process.env.NODE_ENV === "production" && buildHookUrl) {
            fetch(buildHookUrl, { method: "POST" })
              .then(() => console.log("Netlify build triggered successfully!"))
              .catch(err => console.error("Failed to trigger build webhook", err));
          } else {
            // This will log in your local terminal/console during development so you know your logic worked!
            console.log("🛠️ Build hook condition met, but skipped (Development mode or missing ENV var).");
          }
        }
      }
      

      // Update local state 
      setProfileData(payloadToSave);
      setOriginalProfileData(JSON.parse(JSON.stringify(payloadToSave)));
      
      // Trigger the success animation 
      setIsDirty(false); 
      setSaveSuccess(true); 

      // Wait 2 seconds, slide out the toast, then show the alert
      setTimeout(() => {
        setSaveSuccess(false); 
        
        setTimeout(() => {
          if (typeof window !== "undefined") {
            // window.alert("Your changes have been saved! It will now go through a review before it goes live.");
          }
        }, 400);
      }, 2000);

    } catch (err) {
      if (typeof window !== "undefined") {
        window.alert(`Save failed: ${err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAccountAdminOverride = async () => {
    if (!isActingAsAdmin || !targetFirebaseDocId) return;
    
    const confirmationPromptString = `You are attempting to delete ${profileData.profileName || "this member"}'s account, please type "Remove" to confirm this.`;
    let userConfirmationInput;

    if (typeof window !== "undefined") {
      userConfirmationInput = window.prompt(confirmationPromptString);
    }
    
    if (userConfirmationInput === "Remove") {
      setSaving(true);
      try {
        await deleteDoc(doc(db, "profiles", targetFirebaseDocId));
        if (profileData.userID) {
          await deleteDoc(doc(db, "userIDs", profileData.userID));
        }
        alert("Account records successfully purged from database. Redirecting...");
        setIsDirty(false);
        navigate("/network-hub-page");
      } catch (err) {
        alert(`Deletion routine encountered an error: ${err.message}`);
      } finally {
        setSaving(false);
      }
    } else if (userConfirmationInput !== null) {
      alert("Confirmation mismatch string. Action cancelled.");
    }
  };

  if (loading) {
    return <Layout><div className="container text-center py-5" style={{minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center"}}>Loading your profile, please wait...</div></Layout>;
    // return <div className="container text-center py-5">Loading Workspace Configuration...</div>;
  }

  const isReviewed = profileData.profileStatus === "reviewed";
  const isVerifiedOrPermanent = ["permanent", "verified"].includes(profileData.memberType);
  const isPublishedInGatsby = !profileData.private && (isReviewed || isVerifiedOrPermanent);

  const userAllowedBadges = systemBadges.filter(b => b.permission === "all" || (profileData.allowedBadges || []).includes(b.id));
  const activeDisplayBadgesObjects = (profileData.displayingBadges || []).map(id => userAllowedBadges.find(b => b.id === id)).filter(Boolean);
  const availableBadgePoolObjects = userAllowedBadges.filter(b => !(profileData.displayingBadges || []).includes(b.id));

  const statusOptions = ["pending", "reviewed", "other"];
  const currentStatusValue = statusOptions.includes(profileData.profileStatus) ? profileData.profileStatus : "other";

  const typeOptions = ["regular", "verified", "permanent", "other"];
  const currentTypeValue = typeOptions.includes(profileData.memberType) ? profileData.memberType : "other";

  const mapRange = (value, low1, high1, low2, high2) => {
    return low2 + ((value - low1) * (high2 - low2)) / (high1 - low1);
  };

  return (
    <Layout>
      {/* <WelcomeQuestionnaireModal 
        isOpen={showWelcomeModal}
        user={user}
        onClose={() => setShowWelcomeModal(false)}
        onRefreshRequested={() => fetchAndSetUserData(user)}
      /> */}
      {/* <WelcomeQuestionnaireModal 
        isOpen={showWelcomeModal}
        user={user}
        onClose={() => setShowWelcomeModal(false)}
        onRefreshRequested={(modalUpdates) => {
          // If the modal gives us specific updates, merge them surgically!
          if (modalUpdates) {
            // 1. Update the active working state (preserves unsaved changes in other fields)
            setProfileData(prev => ({ ...prev, ...modalUpdates }));
            
            // 2. Update the baseline state so these new modal changes are considered "Saved"
            setOriginalProfileData(prev => {
              const newBaseline = { ...prev, ...modalUpdates };
              // Deep clone to prevent array mutation bugs
              return JSON.parse(JSON.stringify(newBaseline)); 
            });
          } else {
            // Fallback safety net just in case
            fetchAndSetUserData(user);
          }
        }}
      /> */}
      <WelcomeQuestionnaireModal 
        isOpen={showWelcomeModal}
        user={user}
        // 💡 NEW: Pass the correct target ID based on whether we are in Admin Mode
        targetProfileId={isActingAsAdmin ? targetFirebaseDocId : (user ? user.uid : null)}
        onClose={() => setShowWelcomeModal(false)}
        onRefreshRequested={(modalUpdates) => {
          if (modalUpdates) {
            setProfileData(prev => ({ ...prev, ...modalUpdates }));
            setOriginalProfileData(prev => {
              const newBaseline = { ...prev, ...modalUpdates };
              return JSON.parse(JSON.stringify(newBaseline)); 
            });
          } else {
            fetchAndSetUserData(user);
          }
        }}
      />
      <style>{`
        .badge-hover-container { position: relative !important; }
        .badge-custom-tooltip {
          visibility: hidden; opacity: 0; position: absolute; top: 100%; left: 50%;
          transform: translateX(-50%) translateY(0px); padding: 6px 12px; border-radius: 6px;
          font-size: 11px; line-height: 1.4; font-weight: 400; text-transform: none;
          white-space: normal; min-width: 160px; max-width: 220px; text-align: center;
          z-index: 1090; box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          border: 1px solid rgba(255, 255, 255, 0.25);
          transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s; pointer-events: none;
        }
        .badge-custom-tooltip-arrow {
          position: absolute; top: -4px; left: 50%; transform: translateX(-50%) rotate(45deg);
          width: 8px; height: 8px; background-color: inherit;
          border-left: 1px solid rgba(255, 255, 255, 0.25); border-top: 1px solid rgba(255, 255, 255, 0.25); z-index: -1;
        }
        .badge-hover-container:hover .badge-custom-tooltip { visibility: visible; opacity: 1; transform: translateX(-50%) translateY(8px); }
      `}</style>

      {/* Save Floating Overlay Alert */}
      {/* {isDirty && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000, background: "#fff", padding: "1rem", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "2px solid #FFBD12" }}>
          <span style={{ marginRight: "1rem", fontWeight: "bold" }}>You have unsaved changes!</span>
          <button className="btn btn-warning btn-sm" disabled={saving} onClick={handleSaveProfile}>
            {saving ? "Saving Changes..." : "Save Now"}
          </button>
        </div>
      )} */}
      {/* Save Floating Overlay Alert */}
      <div 
        style={{ 
          position: "fixed", 
          bottom: 20, 
          right: 20, 
          zIndex: 3, 
          background: saveSuccess ? "#d1e7dd" : "#fff", 
          padding: "1rem", 
          borderRadius: "8px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", 
          border: `2px solid ${saveSuccess ? "#198754" : "#FFBD12"}`,
          
          /* ✨ ANIMATION LOGIC: Visible if dirty OR successful, otherwise pushed off-screen to the right */
          transform: (isDirty || saveSuccess) ? "translateX(0)" : "translateX(150%)",
          opacity: (isDirty || saveSuccess) ? 1 : 0,
          transition: "all 0.4s ease-in-out",
          display: "flex",
          alignItems: "center"
        }}
      >
        {saveSuccess ? (
          /* GREEN SUCCESS STATE */
          <span style={{ fontWeight: "bold", color: "#198754", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Saved Successfully!
          </span>
        ) : (
          /* YELLOW WARNING STATE */
          <>
            <span style={{ marginRight: "1rem", fontWeight: "bold" }}>You have unsaved changes!</span>
            <button className="btn btn-warning btn-sm" disabled={saving} onClick={handleSaveProfile}>
              {saving ? "Saving Changes..." : "Save Now"}
            </button>
          </>
        )}
      </div>

      {/* Admin Action Header Context banner panel */}
      {isActingAsAdmin && (
        <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
          <span className="fw-bold text-warning">
            {/* 🛠️ Admin Override Mode: Editing {profileData.profileName || "External User"}'s Workspace */}
            Editing {profileData.profileName || "Unknown User"}'s Profile as Admin.
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/network-hub")}>
              {/* ↩️ Return to Hub */}
              Return to Network Hub
            </button>
            <button className="btn btn-danger btn-sm fw-bold" onClick={handleRemoveAccountAdminOverride}>
              {/* 🗑️ Delete Account */}
              Delete Profile
            </button>
          </div>
        </div>
      )}

      {/* Cover Backdrop Block Display */}
      <div style={{ height: "230px", background: profileData.coverImage ? `url(${profileData.coverImage}) center/cover` : "#e9ecef", position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", flexDirection: "column", paddingBottom: 15 }}>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end", width: "90%", gap: 10}}>
          <div className="">
            <div className="input-group input-group-sm mx-auto" style={{ maxWidth: "100%" }}>
              <span className="input-group-text-custom bg-secondary text-white" style={{display: "flex", alignItems: "center"}}>Cover Image</span>
              {/* <input type="text" className="form-control" style={{width: 250}} placeholder="Paste direct file URL link..." value={tempCoverUrl} onChange={(e) => setTempCoverUrl(e.target.value)} /> */}
              <input type="text" className="form-control" style={{width: 250}} placeholder="Input cover image URL..." value={tempCoverUrl} onChange={(e) => setTempCoverUrl(e.target.value)} />
              <button className="btn btn-primary" type="button" onClick={() => handleApplyUrl("coverImage", tempCoverUrl)}>Apply</button>
              <label className="btn btn-dark btn-sm shadow-sm" style={{ cursor: "pointer", opacity: 1, padding: "4px 10px" }}>
                <div>{coverProgress <= 0 ? <img src={uploadIcon} style={{width: 30}}/> : <></>}{coverProgress > 0 && `(${profileProgress}%)`}</div>
                <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, "coverImage", setCoverProgress)} />
              </label>
              {/* NEW CLEAR BUTTON */}
              <button className="btn btn-danger" type="button" onClick={() => handleClearImage("coverImage")}>Clear</button>
            </div>
          </div>

          {/* <label className="btn btn-light btn-sm shadow-sm btn-custom" style={{ cursor: "pointer", opacity: 1, padding: "4px 10px" }}>
            Upload Image {coverProgress > 0 && `(${coverProgress}%)`}
            <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, "coverImage", setCoverProgress)} />
          </label> */}
        </div>
      </div>

     

      {/* SYSTEM VALIDATION WORKFLOW NOTICES BLOCK */}
      <div className="">
        {/* {profileData.private && (
          <div className="alert alert-danger border shadow-sm mb-3 p-3">
            <div className="fw-bold d-flex align-items-center gap-2 mb-1">🔒 Profile Visibility Hidden (Private Mode Active)</div>
            <div className="small">This account layout will be entirely suppressed from build production loops.</div>
          </div>
        )} */}

        {/* <div className="alert alert-warning border shadow-sm mb-0 p-3 container mt-3" style={{ backgroundColor: "#fff3cd", borderColor: "#ffe69c" }}>
          <div className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">⚠️ This profile is pending review.</div>
          <div className="small text-secondary">Your profile is not published yet, it will be published once reviewed or verified.</div>
        </div> */}
        {/* {(!isReviewed || !isPublishedInGatsby) && !profileData.private && (
          <div className="alert alert-warning border shadow-sm mb-0 p-3 container mt-3" style={{ backgroundColor: "#fff3cd", borderColor: "#ffe69c" }}>
            {!isReviewed && <div className="fw-bold text-dark d-flex align-items-center gap-2 mb-1">⚠️ This profile is pending review.</div>}
            {!isPublishedInGatsby && <div className="small text-secondary">Your profile is not published yet, it will be published once reviewed or verified.</div>}
          </div>
        )} */}
      </div>

      <div className={`container mt-4 ${isActingAsAdmin ? "pt-3" : ""}`}>
        <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 10, background: systemThemes?.find(item => item.id === profileData?.selectedTheme)?.background || "", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0, pointerEvents: "none"}}/>
        <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 10, backdropFilter: "blur(2px)", zIndex: 0, pointerEvents: "none"}}/>
        {/* ADMIN CONTROL HUB INPUT MATRIX GRID */}
        {isActingAsAdmin && (
          <div className="text-center p-3 rounded shadow-sm mx-auto al-pos-r" style={{ width: "100%", border: "none", backgroundColor: "rgb(231, 231, 231)"}}>
            <h3 style={{fontSize: 20, fontWeight: "bold"}}>Administrative Panel</h3>
            <div className="row g-3">
              
              {/* Profile Status Menu selectors */}
              <div className="col-md-2">
                <label className="form-label small fw-bold">Profile Visibility Status</label>
                <select 
                  className="form-select form-select-sm" 
                  value={currentStatusValue}
                  onChange={(e) => handleDirectFieldChange("profileStatus", e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="other">Other (Custom Text)</option>
                </select>
                {currentStatusValue === "other" && (
                  <input 
                    type="text" 
                    className="form-control form-control-sm mt-2" 
                    placeholder="Enter custom status text..."
                    value={customStatusInput}
                    onChange={(e) => { setCustomStatusInput(e.target.value); setIsDirty(true); }}
                  />
                )}
              </div>

              {/* Membership Tier Type menu selectors */}
              <div className="col-md-2">
                <label className="form-label small fw-bold">Membership Access Tier</label>
                <select 
                  className="form-select form-select-sm" 
                  value={currentTypeValue}
                  onChange={(e) => handleDirectFieldChange("memberType", e.target.value)}
                >
                  <option value="regular">Regular</option>
                  <option value="verified">Verified</option>
                  <option value="permanent">Permanent (Ignore Expiry)</option>
                  <option value="other">Other (Custom Text)</option>
                </select>
                {currentTypeValue === "other" && (
                  <input 
                    type="text" 
                    className="form-control form-control-sm mt-2" 
                    placeholder="Enter custom tier text..."
                    value={customTypeInput}
                    onChange={(e) => { setCustomTypeInput(e.target.value); setIsDirty(true); }}
                  />
                )}
              </div>

              {/* Display Order Sequence Position Parameter Field */}
              <div className="col-md-2">
                <label className="form-label small fw-bold">Hub Display Order</label>
                <input 
                  type="number" 
                  min="1"
                  step="1"
                  className="form-control form-control-sm"
                  placeholder="e.g., 1, 2, 3..."
                  value={profileData.displayOrder !== undefined && profileData.displayOrder !== null ? profileData.displayOrder : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleDirectFieldChange("displayOrder", val === "" ? null : val);
                  }}
                />
              </div>

              {/* Join Date select parameters */}
              <div className="col-md-3">
                <label className="form-label small fw-bold">Account Registration Join Date</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm"
                  value={formatDateForInput(profileData.joinDate)}
                  onClick={handleDateClick}
                  onChange={(e) => handleDirectFieldChange("joinDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>

              {/* Expiry Date select parameters */}
              <div className="col-md-3">
                <label className="form-label small fw-bold">Account Verification Expiry Date</label>
                <input 
                  type="date" 
                  className="form-control form-control-sm"
                  disabled={profileData.memberType === "permanent"}
                  value={formatDateForInput(profileData.expiryDate)}
                  onClick={handleDateClick}
                  onChange={(e) => handleDirectFieldChange("expiryDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
              
            </div>

            {/* 💡 NEW: Membership Duration Readout */}
            {(profileData.joinDate || profileData.expiryDate) && (
              <div className="row mt-3">
                <div className="col-12 text-center text-muted small">
                  {joinDateObj && expiryDateObj && (
                    <span className="me-2 fw-medium">Membership length: {totalLengthStr}.</span>
                  )}
                  {expiryDateObj && profileData.memberType !== "permanent" && (
                    <span className="fst-italic text-secondary">{expiryMessage}</span>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        <div className="row" style={{paddingTop: 10, position: "relative"}}>
          <div className="col-md-5 text-center mb-4">
            {/* <div className="team-member-bio-pic mx-auto shadow-sm" style={{ backgroundImage: `url("${profileData.profileImage || defaultAvatar}")`, backgroundColor: '#d0d0d0', backgroundSize: profileData.profileImage ? 'cover' : "80%", backgroundPosition: profileData.profileImage ? 'center': "50% 20px", height: "350px", width: "100%", borderRadius: "8px", backgroundRepeat: "no-repeat" }} /> */}
            {/* <label className="btn btn-dark btn-sm mt-2" style={{ cursor: "pointer" }}>
              📷 Upload Profile Photo {profileProgress > 0 && `(${profileProgress}%)`}
              <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, "profileImage", setProfileProgress)} />
            </label> */}
            {/* Profile Image Preview Box Context */}
            {(() => {
              // Determine if we are rendering a custom asset string or fallback asset graphics
              const hasCustomAvatar = profileData.profileImage && profileData.profileImage.trim() !== "";
              
              // Conditionally assign custom sizing matrix adjustments dynamically
              const avatarStyles = {};
              if (hasCustomAvatar) {
                avatarStyles.backgroundImage = `url(${profileData.profileImage})`;
                avatarStyles.backgroundRepeat = `no-repeat`;
                
                if (profileData.enableImageCrop) {
                  avatarStyles.backgroundSize = `${profileData.profileImageSize}%`;
                  avatarStyles.backgroundPosition = `${profileData.profileImagePosX}% ${profileData.profileImagePosY}%`;
                } else {
                  avatarStyles.backgroundSize = "cover";
                  avatarStyles.backgroundPosition = "center center";
                }
              } else {
                avatarStyles.backgroundImage = `url(${defaultAvatar})`;
                avatarStyles.backgroundColor = `#d0d0d0`;
              }

              return (
                <>
                  {
                    hasCustomAvatar ? 
                      <div style={{position: "relative"}}>
                        <div style={{position: "absolute", width: "100%", height: "100%", backgroundImage: `url(${profileData.profileImage})`, top: 0, left: 0, backgroundSize: "cover", backgroundPosition: "center, center"}}></div>
                        <div style={{position: "absolute", width: "100%", height: "100%", top: 0, left: 0, backdropFilter: "blur(20px)"}}></div>
                        <div 
                          className={`team-member-bio-pic mx-auto shadow-sm profile-avatar-preview ${!hasCustomAvatar ? 'default-avatar-placeholder' : ''}`}
                          style={{...avatarStyles, position: "relative"}}
                        />
                      </div>
                    :
                      <div 
                        className={`team-member-bio-pic mx-auto shadow-sm profile-avatar-preview ${!hasCustomAvatar ? 'default-avatar-placeholder' : ''}`}
                        style={avatarStyles}
                      />
                  }
                </>                
              );
            })()}
            <div className="input-group input-group-sm mt-3 px-3">
              {/* <input type="text" className="form-control" placeholder="Paste direct profile image link..." value={tempProfileUrl} onChange={(e) => setTempProfileUrl(e.target.value)} /> */}
              <input type="text" className="form-control" placeholder="Input profile image URL..." value={tempProfileUrl} onChange={(e) => setTempProfileUrl(e.target.value)} />
              <button className="btn btn-outline-primary-no btn-primary" type="button" onClick={() => handleApplyUrl("profileImage", tempProfileUrl)}>Apply</button>
              <label className="btn btn-dark btn-sm shadow-sm" style={{ cursor: "pointer", opacity: 1, padding: "4px 10px" }}>
                <div>{profileProgress <= 0 ? <img src={uploadIcon} style={{width: 30}}/> : <></>}{profileProgress > 0 && `(${profileProgress}%)`}</div>
                <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, "profileImage", setProfileProgress)} />
              </label>
              {profileData.profileImage && (
                <label className="btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", backgroundColor: profileData.enableImageCrop ? "#FFBD12" : "#fff8e9", borderBottom: "1px solid #FFBD12", borderTop: "1px solid #FFBD12" }}>
                  <input 
                    type="checkbox"
                    checked={profileData.enableImageCrop}
                    onChange={(e) => setProfileData(prev => ({ ...prev, enableImageCrop: e.target.checked }))}
                    style={{display: "none"}}
                  />
                  <img src={cropIcon} style={{width: 30}}/>
                </label>
              )}
              <button className="btn btn-danger" type="button" onClick={() => handleClearImage("profileImage")}>Clear</button>
            </div>
            {profileData.profileImage && profileData.enableImageCrop && (
              <div className="card" style={{ marginTop: "1rem", padding: 10}}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  {/* <input 
                    type="checkbox"
                    checked={profileData.enableImageCrop}
                    onChange={(e) => setProfileData(prev => ({ ...prev, enableImageCrop: e.target.checked }))}
                  /> */}
                  {/* Enable Custom Image Adjustments & Zoom */}
                  Adjust Image Size & Crop
                </label>

                {profileData.enableImageCrop && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <small style={{textAlign: "left", color: "#7d7d7d", display: "block", fontSize: 13, marginTop: 0, marginBottom: "0.25rem"}}>
                      Your profile image size and crop might look different depending on the browser window size. By turning adjustment off, the system will automatically calculate the image size to fill out the whole frame.
                    </small>                  
                    {/* Size / Scale Adjuster Slider */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                        <span>Image Zoom Scale:</span>
                        <div style={{display: "flex", flexDirection: "row", gap: 5}}>
                          <div className="shadow-sm img-adj-button-wrapper " style={{display: "flex", flexDirection: "row"}}>
                            <button className={`img-adj-button ${profileData && profileData?.profileImageSize && profileData?.profileImageSize == 50 ? "img-adj-button-active" : ""}`} onClick={(e) => setProfileData(prev => ({ ...prev, profileImageSize: parseInt(50, 10) }))}>
                              Small
                            </button>
                            <button className={`img-adj-button ${profileData && profileData?.profileImageSize && profileData?.profileImageSize == 100 ? "img-adj-button-active" : ""}`} onClick={(e) => setProfileData(prev => ({ ...prev, profileImageSize: parseInt(100, 10) }))}>
                              Fit
                            </button>
                            <button className={`img-adj-button ${profileData && profileData?.profileImageSize && profileData?.profileImageSize == 300 ? "img-adj-button-active" : ""}`} onClick={(e) => setProfileData(prev => ({ ...prev, profileImageSize: parseInt(300, 10) }))}>
                              Max Zoom
                            </button>
                          </div>     
                          <strong style={{display: "flex", alignItems: "center"}}>{profileData.profileImageSize}%</strong>
                        </div>     
                        {/* <strong>{profileData.profileImageSize}%</strong> */}
                      </div>
                      <input 
                        type="range"
                        min="50"
                        max="300"
                        value={profileData.profileImageSize}
                        style={{ width: "100%" }}
                        onChange={(e) => setProfileData(prev => ({ ...prev, profileImageSize: parseInt(e.target.value, 10) }))}
                      />
                    </div>

                    {/* X Horizontal Positioning Axis Slider */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>                    
                        <span>Horizontal Position (X):</span>  
                        <div style={{display: "flex", flexDirection: "row", gap: 5}}>
                          <div className="shadow-sm img-adj-button-wrapper " style={{display: "flex", flexDirection: "row"}}>
                            <button className={`img-adj-button ${profileData?.profileImagePosX == 0 ? "img-adj-button-active" : ""}`} onClick={(e) => setProfileData(prev => ({ ...prev, profileImagePosX: parseInt(0, 10) }))}>
                              Left
                            </button>  
                            <button className={`img-adj-button ${profileData && profileData?.profileImagePosX && profileData?.profileImagePosX == 50 ? "img-adj-button-active" : ""}`} onClick={(e) => setProfileData(prev => ({ ...prev, profileImagePosX: parseInt(50, 10) }))}>
                              Center
                            </button>  
                            <button className={`img-adj-button ${profileData && profileData?.profileImagePosX && profileData?.profileImagePosX == 100 ? "img-adj-button-active" : ""}`} onClick={(e) => setProfileData(prev => ({ ...prev, profileImagePosX: parseInt(100, 10) }))}>
                              Right
                            </button>  
                          </div>     
                          <strong style={{display: "flex", alignItems: "center"}}>{profileData.profileImagePosX}%</strong>
                        </div>       
                      </div>
                      <small style={{textAlign: "left", color: "#7d7d7d", display: "block", fontSize: 13, marginTop: 0, marginBottom: "0.25rem"}}>This won't have any effect if current image size is a perfect fit.</small>
                      <input 
                        type="range"
                        min="-100"
                        max="200"
                        value={profileData.profileImagePosX}
                        style={{ width: "100%" }}
                        onChange={(e) => setProfileData(prev => ({ ...prev, profileImagePosX: parseInt(e.target.value, 10) }))}
                      />
                    </div>

                    {/* Y Vertical Positioning Axis Slider */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                        <span>Vertical Position (Y):</span>
                        <div style={{display: "flex", flexDirection: "row", gap: 5}}>
                          <div className="shadow-sm img-adj-button-wrapper " style={{display: "flex", flexDirection: "row"}}>
                            <button className={`img-adj-button ${profileData?.profileImagePosY == 0 ? "img-adj-button-active" : ""}`} onClick={(e) => setProfileData(prev => ({ ...prev, profileImagePosY: parseInt(0, 10) }))}>
                              Top
                            </button>  
                            <button className={`img-adj-button ${profileData && profileData?.profileImagePosY && profileData?.profileImagePosY == 50 ? "img-adj-button-active" : ""}`} onClick={(e) => setProfileData(prev => ({ ...prev, profileImagePosY: parseInt(50, 10) }))}>
                              Center
                            </button>  
                            <button className={`img-adj-button ${profileData && profileData?.profileImagePosY && profileData?.profileImagePosY == 100 ? "img-adj-button-active" : ""}`} onClick={(e) => setProfileData(prev => ({ ...prev, profileImagePosY: parseInt(100, 10) }))}>
                              Bottom
                            </button>  
                          </div>     
                          <strong style={{display: "flex", alignItems: "center"}}>{profileData.profileImagePosY}%</strong>
                        </div>  
                      </div>
                      <small style={{textAlign: "left", color: "#7d7d7d", display: "block", fontSize: 13, marginTop: 0, marginBottom: "0.25rem"}}>This won't have any effect if current image size is a perfect fit.</small>
                      <input 
                        type="range"
                        min="-100"
                        max="200"
                        value={profileData.profileImagePosY}
                        style={{ width: "100%" }}
                        onChange={(e) => setProfileData(prev => ({ ...prev, profileImagePosY: parseInt(e.target.value, 10) }))}
                      />
                    </div>

                    {/* Reset Adjustment Configuration Parameters Button */}
                    <div style={{display: "flex", flexDirection: "row", gap: 5, justifyContent: "flex-end", marginTop: "0.25rem"}}>
                      <button
                        type="button"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          // color: "#FFBD12",
                          // backgroundColor: "#fee2e2",
                          backgroundColor: "#FFBD12",
                          // border: "#FFBD12 solid 1px",
                          border: "none",
                          borderRadius: "0.375rem",
                          cursor: "pointer",
                          fontWeight: "500",
                          alignSelf: "flex-start"
                        }}
                        onClick={(e) => setProfileData(prev => ({ ...prev, enableImageCrop: false }))}
                      >
                        Disable resize and crop
                      </button>
                      <button
                        type="button"
                        className="danger-btn-custom"
                        onClick={() => setProfileData(prev => ({
                          ...prev,
                          profileImageSize: 100,
                          profileImagePosX: 50,
                          profileImagePosY: 50
                        }))}
                      >
                        {/* Reset Alignment Defaults */}
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="col-md-7">
            <div className=" bg-light p-2 rounded border border-light-subtle mb-2">
              <div className="d-flex flex-wrap gap-1" style={{flexDirection: "row", justifyContent: "space-around"}}>
                <div className="small text-muted" style={{display: "flex", alignItems: "center"}}><strong>Join Date: </strong> {formatHumanReadableDate(profileData.joinDate)}</div>
                <div className="small text-muted" style={{display: "flex", alignItems: "center"}}><strong>Expiry Date: </strong> {profileData.memberType === "permanent" ? "Lifetime (Permanent)" : formatHumanReadableDate(profileData.expiryDate)}</div>
                <div className="form-check form-switch align-items-center justify-content-center" style={{display: "flex", padding: 0, alignItems: "center"}}>
                  <div style={{display: "flex", flexDirection: "row", gap: 10, justifyContent: "flex-end"}}>
                    <span className="small" style={{fontWeight: profileData.private? "bold" : "", color: profileData.private? "#ff6912" : undefined}}>{profileData.private ? "Profile is private" : "Hide Profile Page"}</span>
                    <input className="form-check-input ms-0" type="checkbox" role="switch" id="privateProfileToggle" style={{ width: "2.5em", height: "1.25em", cursor: "pointer", marginTop: 2 }} checked={profileData.private || false} onChange={(e) => handleDirectFieldChange("private", e.target.checked)} />
                  </div>
                </div>
                <button className="form-icon-btn" onClick={()=>{setShowWelcomeModal(true)}} style={{padding: 0, border: "none", background: "none", backgroundColor: "#FFBD12", borderRadius: 30, position: "relative"}}>
                  {profileData?.welcomeFormStatus !== "completed" && (
                    <div className="notification-bubble"></div>
                  )}
                  <img src={formIcon} style={{width: 35, height: 35, transform: "translate(2px, 2px)"}}/>
                </button>
              </div>
              {/* <div className="small" style={{color: "rgb(214 167 47)", textAlign: "center"}}>Your profile is not published yet, it will be published once reviewed or verified.</div>               */}
              {(!isReviewed || !isPublishedInGatsby) && !profileData.private && (
                <div className="small" style={{color: "rgb(214 167 47)", textAlign: "center"}}>Your profile is not published yet, it will be published once reviewed or verified.</div>                
              )}
            </div>

            {/* <div className="form-check form-switch mb-3 p-3 border rounded bg-white shadow-sm d-flex align-items-center justify-content-between">
              <div>
                <label className="form-check-label fw-bold mb-0" htmlFor="privateProfileToggle" style={{ cursor: "pointer" }}>
                  {profileData.private ? "🔒 Set Status to Public" : "🔓 Temporarily Hide Profile Page"}
                </label>
                <div className="small text-muted">Instantly suppress static build routines to take data offline.</div>
              </div>
              <input className="form-check-input ms-0" type="checkbox" role="switch" id="privateProfileToggle" style={{ width: "2.5em", height: "1.25em", cursor: "pointer" }} checked={profileData.private || false} onChange={(e) => handleDirectFieldChange("private", e.target.checked)} />
            </div> */}

            <div className="card nice-shadow" style={{ padding: 10}}>
              <div className="form-group mb-3">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <label style={{ fontWeight: "bold", margin: 0 }}>Profile Name <span className="required-text">*</span></label>
                  <span className="badge px-2.5 py-1.5 rounded-pill text-capitalize" style={getMembershipBadgeStyles(profileData.memberType)}>{profileData.memberType || "Regular"} Member</span>
                  {profileData?.userID && <a target="_blank" className="add-btn-custom" style={{width: "auto", margin: 0, marginLeft: "auto", padding: 2}} href={`/network-hub/${profileData?.userID}`}>View your page ➤</a>}
                  
                  {/* <div className="d-inline-flex flex-wrap gap-1 ms-2">
                    {activeDisplayBadgesObjects.map((badge) => (
                      <div key={`top-badge-${badge.id}`} className="badge px-2 py-1.5 d-flex align-items-center gap-1 shadow-sm text-capitalize badge-hover-container" style={{ background: badge.backgroundColor, color: badge.textColor, fontSize: "11px" }}>
                        {badge.icon && <img src={badge.icon} alt="" style={{ width: "12px", height: "12px" }} />}
                        {badge.title}
                        <div className="badge-custom-tooltip" style={{ background: badge.backgroundColor, color: badge.textColor }}><div className="badge-custom-tooltip-arrow" />{badge.description || "No description provided."}</div>
                      </div>
                    ))}
                  </div> */}
                </div>
                <input type="text" className="form-control form-control-lg-no course-block-title al-text-align-c al-mb-10" style={{fontWeight: 400, margin: 0, fontSize: 40}} value={profileData.profileName} onChange={(e) => handleDirectFieldChange("profileName", e.target.value)} />
              </div>

              <div className="form-group mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  {/* <label style={{ fontWeight: "bold" }}>About Me (Short headline summary)</label> */}
                  <label style={{ fontWeight: "bold", margin: 0 }}>About (Short summary about yourself)</label>
                  <span className={`small fw-bold ${profileData.about.length >= ABOUT_LIMIT ? "text-danger" : "text-muted"}`}>{profileData.about.length} / {ABOUT_LIMIT}</span>
                </div>
                <input type="text" className="form-control" maxLength={ABOUT_LIMIT} value={profileData.about} onChange={(e) => handleDirectFieldChange("about", e.target.value)} />
              </div>

              {/* BADGES DISPLAY MATRIX OVERRIDES CONFIGURATION GRID */}
              <div className="card bg-light p-3 border mb-4 rounded shadow-sm">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  {/* <h6 className="m-0 fw-bold">🏷️ Configure Your Profile Badges</h6> */}
                  <label style={{ fontWeight: "bold", margin: 0 }}>Select your badges to display</label>
                  <span className={`small fw-bold ${(profileData.displayingBadges || []).length >= 10 ? "text-danger" : "text-muted"}`}>{(profileData.displayingBadges || []).length} / 10 Selected</span>
                </div>

                {/* <label className="small fw-bold text-secondary mb-1">Active Showcase Layout (Drag to sort):</label> */}
                <label className="small fw-bold text-secondary mb-1">Active Badges (Drag to rearrange):</label>
                <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-white min-height-badges mb-3 align-items-center" style={{ minHeight: "52px" }} onDragOver={(e) => e.preventDefault()}>
                  {activeDisplayBadgesObjects.map((badge, idx) => (
                    <div key={`active-node-${badge.id}`} draggable onDragStart={(e) => handleDragStart(e, "displayingBadges", idx)} onDrop={(e) => handleDrop(e, "displayingBadges", idx)} className="badge py-1 px-2.5 border rounded-3 d-flex align-items-center gap-1 text-capitalize shadow-sm position-relative badge-hover-container" style={{ background: badge.backgroundColor, color: badge.textColor, cursor: "move", userSelect: "none" }}>
                      <span style={{ fontSize: "10px", opacity: 0.6 }}>☰</span>
                      {badge.icon && <img src={badge.icon} alt="" style={{ width: "13px", height: "13px" }} />}
                      {badge.title}
                      <button type="button" onClick={() => removeBadgeFromDisplayPayload(badge.id)} className="btn p-0 border-0 bg-transparent ms-1 leading-none fw-bold text-white" style={{ fontSize: "12px", color: "inherit", opacity: 0.7 }}>×</button>
                      <div className="badge-custom-tooltip" style={{ background: badge.backgroundColor, color: badge.textColor }}><div className="badge-custom-tooltip-arrow" />{badge.description || "No description provided."}</div>
                    </div>
                  ))}
                  {activeDisplayBadgesObjects.length === 0 && <span className="text-muted small fst-italic p-1">No badges added yet.</span>}
                </div>

                {/* <label className="small fw-bold text-secondary mb-1">Your Available Badge Pool (Click to add):</label> */}
                <label className="small fw-bold text-secondary mb-1">Your Available Badges (Click "+" to add):</label>
                <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-white-50" style={{ backgroundColor: "rgba(255,255,255,0.4)" }}>
                  {availableBadgePoolObjects.map((badge) => (
                    <button key={`pool-node-${badge.id}`} type="button" onClick={() => addBadgeToDisplayPayload(badge.id)} className="btn badge py-2 px-2.5 rounded-3 d-flex align-items-center gap-1 text-capitalize shadow-sm border-0 position-relative badge-hover-container" style={{ background: badge.backgroundColor, color: badge.textColor }}>
                      ➕ {badge.icon && <img src={badge.icon} alt="" style={{ width: "13px", height: "13px" }} />}
                      {badge.title}
                      <div className="badge-custom-tooltip" style={{ background: badge.backgroundColor, color: badge.textColor }}><div className="badge-custom-tooltip-arrow" />{badge.description || "No description provided."}</div>
                    </button>
                  ))}
                  {availableBadgePoolObjects.length === 0 && <span className="text-muted small fst-italic p-1">All allowed options are active.</span>}
                </div>
              </div>

              {/* DEGREES LIST ARRAY */}
              <div className="mb-4">
                {/* <label style={{ fontWeight: "bold" }}>Education & Degrees (Drag to sort)</label> */}
                <label style={{ fontWeight: "bold" }}>Education & Degrees (Drag to rearrange)</label>
                <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-light" onDragOver={(e) => e.preventDefault()}>
                  {profileData.degrees.map((degree, index) => (
                    <div key={`degree-${index}`} draggable onDragStart={(e) => handleDragStart(e, "degrees", index)} onDrop={(e) => handleDrop(e, "degrees", index)} className="p-2 border bg-white rounded d-flex align-items-center gap-2" style={{ cursor: "move", userSelect: "none", width: "100%" }}>
                      <span style={{ color: "#888" }}>☰</span>
                      <input type="text" className="form-control form-control-sm border-0 bg-transparent p-0" value={degree.degreeName} onChange={(e) => handleArrayItemChange("degrees", index, "degreeName", e.target.value)} />
                      {/* <button type="button" className="btn-no p-0-no ms-2-no text-danger-no bin-button" onClick={() => removeArrayItem("degrees", index)}>
                        🗑️
                        <img src={binIcon} style={{width: 35, height: 35}}/>
                      </button> */}
                      <button className="bin-btn-custom" onClick={() => removeArrayItem("degrees", index)}>✕</button>
                    </div>
                  ))}
                  {profileData?.degrees?.length <= 0 && (
                    <span className="text-muted small fst-italic p-1">No degrees added yet.</span>
                  )}
                  {/* <button type="button" className="btn btn-outline-primary btn-sm ms-auto" onClick={() => addArrayItem("degrees", { degreeName: "New Degree" })}>➕ Add</button> */}
                  <button type="button" className="add-btn-custom" onClick={() => addArrayItem("degrees", { degreeName: "New Degree" })}>+ Add New Degree</button>
                </div>
              </div>

              {/* CONTACT CHANNELS */}
              <div className="mb-4">
                <label style={{ fontWeight: "bold" }}>Contact Channels (Drag to rearrange)</label>
                <div className="p-2 border rounded bg-light" onDragOver={(e) => e.preventDefault()}>
                  {profileData.contacts.map((contact, index) => (
                    <div key={`contact-${index}`} draggable onDragStart={(e) => handleDragStart(e, "contacts", index)} onDrop={(e) => handleDrop(e, "contacts", index)} className="p-2 border bg-white rounded mb-2 d-flex align-items-center gap-2" style={{ cursor: "move" }}>
                      <span style={{ color: "#888" }}>☰</span>
                      <select className="form-select form-select-sm" style={{ width: "120px" }} value={contact.contactType} onChange={(e) => handleArrayItemChange("contacts", index, "contactType", e.target.value)}>
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="Website">Website</option>
                      </select>
                      {/* <input type="text" className="form-control form-control-sm" value={contact.content} onChange={(e) => handleArrayItemChange("contacts", index, "content", e.target.value)} /> */}
                      <input type="text" className="form-control form-control-sm border-0 bg-transparent p-0" value={contact.content} onChange={(e) => handleArrayItemChange("contacts", index, "content", e.target.value)} />
                      {/* <button type="button" className="btn p-0 text-danger" onClick={() => removeArrayItem("contacts", index)}>🗑️</button> */}
                      {/* <button type="button" className="bin-button" onClick={() => removeArrayItem("contacts", index)}>
                        <img src={binIcon} style={{width: 35, height: 35}}/>
                      </button> */}
                      <button className="bin-btn-custom" onClick={() => removeArrayItem("contacts", index)}>✕</button>
                    </div>
                  ))}
                  {profileData?.contacts?.length <= 0 && (
                    <span className="text-muted small fst-italic p-1">No contact method added yet, we recommend adding at least one.</span>
                  )}
                  {/* <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => addArrayItem("contacts", { contactType: "Email", content: "" })}>➕ Add Contact</button> */}
                  {/* <button type="button" className="btn btn-outline-primary btn-sm ms-auto" onClick={() => addArrayItem("contacts", { contactType: "Email", content: "" })}>➕ Add Contact</button> */}
                  <button type="button" className="add-btn-custom" onClick={() => addArrayItem("contacts", { contactType: "Email", content: "" })}>+ Add New Contact</button>
                </div>
              </div>

              {/* PREFERRED ACTION ROUTER */}
              <div className="p-3 border rounded mb-4" style={{ backgroundColor: "#fff9db", borderColor: "#FFBD12" }}>
                {/* <label style={{ fontWeight: "bold", color: "#b07d00" }}>⭐ Preferred Profile Call-To-Action Button</label> */}
                <label style={{ fontWeight: "bold", color: "#b07d00" }}>Preferred Contact <span className="required-text">*</span></label>
                <p className="text-muted small mb-3">
                  This will be the link of your call-to-action button. It is recommended to put in a contact method that you check frequently.
                </p>
                <div className="d-flex gap-2 mt-2">
                  <select className="form-select" style={{ width: "130px" }} value={profileData.preferredContact?.contactType || "Email"} onChange={(e) => handleNestedObjectChange("preferredContact", "contactType", e.target.value)}>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone Number</option>
                    <option value="Website">External URL</option>
                  </select>
                  <input placeholder={profileData.preferredContact?.contactType == "Email" ? "example@gmail.com" : profileData.preferredContact?.contactType == "Phone" ? "1231231234" : "www.example.com"} type={profileData.preferredContact?.contactType == "Email" ? "email" : profileData.preferredContact?.contactType == "Phone" ? "tel" : "url"} className="form-control" value={profileData.preferredContact?.content || ""} onChange={(e) => handleNestedObjectChange("preferredContact", "content", e.target.value)} />
                </div>
              </div>

              <div className="form-group mb-3">
                <label style={{ fontWeight: "bold" }}>Portfolio Link Field</label>
                <input type="text" className="form-control" value={profileData.portfolioLink} placeholder="https://...   |   www..." onChange={(e) => handleDirectFieldChange("portfolioLink", e.target.value)} />
              </div>

              {/* BIOGRAPHY MARKDOWN INPUT EDITOR */}
              <div className="form-group mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label style={{ fontWeight: "bold", margin: 0 }}>Bio Summary</label>
                  {/* <label style={{ fontWeight: "bold", margin: 0 }}>Bio Summary (Markdown Enabled)</label> */}
                  {/* <div className="btn-group btn-group-sm">
                    <button type="button" className={`btn ${markdownTab === "write" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setMarkdownTab("write")}>✏️ Edit Mode</button>
                    <button type="button" className={`btn ${markdownTab === "preview" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setMarkdownTab("preview")}>👁️ Preview Mode</button>
                  </div> */}
                  <div className="btn-group btn-group-sm">
                    <button type="button" className={`btn ${markdownTab === "write" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setMarkdownTab("write")}>Edit</button>
                    <button type="button" className={`btn ${markdownTab === "preview" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setMarkdownTab("preview")}>Preview</button>
                  </div>
                </div>

                {markdownTab === "write" ? (
                  <div className="border rounded bg-white overflow-hidden">
                    <div className="p-2 border-bottom bg-light d-flex flex-wrap gap-1 align-items-center">
                      <div className="btn-group btn-group-sm me-2">
                        <button type="button" className="btn btn-outline-secondary fw-bold" onClick={() => insertMarkdown("bold")}>B</button>
                        <button type="button" className="btn btn-outline-secondary fst-italic" onClick={() => insertMarkdown("italic")}>I</button>
                        {/* <button type="button" className="btn btn-outline-secondary font-monospace" onClick={() => insertMarkdown("code")}>&lt;&gt;</button> */}
                        <button type="button" className="btn btn-outline-secondary" onClick={() => insertMarkdown("link")}>🔗</button>
                      </div>
                      {/* <div className="btn-group btn-group-sm me-2">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => insertMarkdown("heading")}>H</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => insertMarkdown("link")}>🔗</button>
                        <button type="button" className="btn btn-outline-secondary fw-bold" onClick={() => insertMarkdown("quote")}>”</button>
                      </div> */}
                      {/* <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => insertMarkdown("bullet")}>List</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => insertMarkdown("number")}>1.</button>
                      </div> */}
                      <span className={`ms-auto small fw-bold px-2 ${profileData.bio.length >= BIO_LIMIT ? "text-danger" : "text-muted"}`}>{profileData.bio.length} / {BIO_LIMIT} chars</span>
                    </div>
                    <textarea ref={bioRef} className="form-control border-0 rounded-0" rows="8" maxLength={BIO_LIMIT} style={{ outline: "none", boxShadow: "none", resize: "vertical" }} value={profileData.bio} onChange={(e) => handleDirectFieldChange("bio", e.target.value)} />
                  </div>
                ) : (
                  <div className="p-3 border rounded bg-white" style={{ minHeight: "235px", maxHeight: "350px", overflowY: "auto" }}>
                    {profileData.bio ? <div className="markdown-preview-output"><Markdown>{profileData.bio}</Markdown></div> : <span className="text-muted fst-italic">Nothing typed yet.</span>}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ==================== ADDED: THEME SELECTION PANEL ==================== */}
        <div className="container mt-4 px-0">
          <div className="card shadow-sm p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              {/* <h4 className="mb-0 d-flex align-items-center gap-2">🎨 Choose Profile Theme</h4> */}
              <h4 className="mb-0 d-flex align-items-center gap-2">Choose Your Profile Theme</h4>
              {profileData.selectedTheme && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setIsDirty(true);
                    setProfileData(prev => ({ ...prev, selectedTheme: "" }));
                  }}
                >
                  Reset Theme
                </button>
              )}
            </div>
            
            <p className="text-muted small mb-3">
              {/* Customize the look and feel of your public profile layout. Premium styles are locked unless granted special access. */}
              Customize the look and feel of your public profile layout. Certain themes are only accessible by selected members.
            </p>

            <div className="row g-3">
              {systemThemes.map((theme) => {
                // Rule: Users can select 'all' permission themes or premium themes included in allowedThemes
                const isAllowed = theme.permission === "all" || (profileData.allowedThemes || []).includes(theme.id);
                const isSelected = profileData.selectedTheme === theme.id;

                return (
                  <div key={theme.id} className="col-md-4 col-sm-6">
                    <div
                      style={{
                        background: theme?.background || "",
                        backgroundSize: "cover",
                        justifyContent: "space-between",
                        borderRadius: 5,
                        cursor: isAllowed ? "pointer" : "not-allowed",
                        opacity: isAllowed ? 1 : 0.6,
                        filter: isAllowed ? "none" : "grayscale(25%)",
                        outline: isSelected? "solid rgba(255, 160, 27, 0.8) 2px" : ""
                      }}
                    >
                      <div
                        onClick={() => {
                          if (isAllowed) {
                            setIsDirty(true);
                            setProfileData(prev => ({ ...prev, selectedTheme: theme.id }));
                          }
                        }}
                        className={`card h-100 position-relative ${
                          // isSelected ? "border-primary border-2 bg-light shadow-sm" : "border-muted"
                          isSelected ? "border-primary border-2 shadow-sm" : "border-muted"
                        }`}
                        style={{
                          transition: "all 0.2s ease-in-out",
                          backgroundColor: getContrastYIQ(theme?.themeColor, true) || "rgba(255, 255, 255, 0.8)",
                          // backgroundColor: "rgba(255, 255, 255, 0.8)",
                          border: "none",
                          backdropFilter: "blur(20px)",
                          maxWidth: "80%",
                          minHeight: 75,
                          // margin: "auto"
                        }}
                      >
                        {/* Locked Indicator Badge */}
                        {!isAllowed && (
                          <span 
                            className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark fw-bold shadow-sm"
                            style={{ fontSize: "10px" }}
                          >
                            Locked
                            {/* 👑 Premium */}
                          </span>
                        )}

                        <div className="d-flex align-items-center gap-3" style={{justifyContent: "space-between"}}>
                          {/* Theme Visual Color Indicator */}
                          <div 
                            className="d-flex align-items-center gap-3 p-3"
                          >
                            <div style={{
                              border: "2px solid #fff",
                              padding: 3,
                              borderRadius: 500,
                              width: "34px", 
                              height: "34px",
                              position: "relative", 
                              overflow: "hidden"
                            }}>
                              <div 
                                className="shadow-sm" 
                                style={{ 
                                  width: "100%", 
                                  height: "100%", 
                                  backgroundColor: !theme?.icon? (theme?.primaryColor || "#6c757d") : '', // Assumes your themes collection may track primary hex codes
                                  backgroundImage: theme?.icon? `url('${theme?.icon}')` : '',
                                  backgroundSize: "cover",
                                }} 
                              />
                            </div>
                            
                            <div className="flex-grow-1" style={{width: "50%"}}>
                              <h6 className={`mb-0 fw-bold ${!theme?.themeColor? "text-dark" : ""}`} style={{color: theme?.themeColor || "inherit"}}>{theme.title || "Unnamed Theme"}</h6>
                              <p className={`${!theme?.themeColor? "text-muted" : ""} mb-0 small`} style={{ fontSize: "11px", color: theme?.themeColor || "inherit" }}>
                                {theme.description || "No description provided."}
                              </p>
                            </div>
                          </div>

                          <div className="form-check m-0">
                            {isAllowed ? 
                              <input
                                type="radio"
                                className="form-check-input"
                                checked={isSelected}
                                disabled={!isAllowed}
                                readOnly
                                style={{ pointerEvents: "none" }}
                              />
                              :
                              <></>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {systemThemes.length === 0 && (
                <div className="col-12 text-center py-4 text-muted small border rounded bg-light">
                  No visual themes available at this time.
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ==================== END OF THEME SELECTION PANEL ==================== */}
        
        {/* IMAGES REORDERABLE GALLERY MANIFEST PANEL */}
        <div className="container mt-2 px-0">
          <div className="card shadow-sm p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              {/* <h4 className="mb-0 d-flex align-items-center gap-2">🖼️ Photo Gallery Showcase (Drag to reorder)</h4> */}
              <div>
                <h4 className="mb-0 d-flex align-items-center gap-2">Photo Gallery (Drag to rearrange)</h4>
                <p className="text-muted small mb-3">
                  This your image gallery, images will be displayed in a 3-column grid.
                </p>
              </div>
              {/* <button type="button" className="btn btn-warning btn-sm" disabled={(profileData.images || []).length >= (profileData.memberType === "permanent" ? 20 : 5)} onClick={handleAddGalleryImage}>➕ Add Gallery Image</button> */}
              <button type="button" className="add-btn-custom-gallery" disabled={(profileData.images || []).length >= (profileData.memberType === "permanent" ? 20 : 5)} onClick={handleAddGalleryImage}>+ Add Gallery Image</button>
            </div>

            <div className="row g-3">
              {(profileData.images || []).map((image, index) => (
                <div key={`gallery-image-node-${index}`} className="col-12" draggable onDragStart={(e) => handleDragStart(e, "images", index)} onDrop={(e) => handleDrop(e, "images", index)} onDragOver={(e) => e.preventDefault()}>
                  <div className="p-3 border rounded bg-light d-flex align-items-start gap-3 shadow-sm" style={{ cursor: "move" }}>
                    <span className="text-muted fw-bold fs-5 align-self-center px-1" style={{ cursor: "grab" }}>☰</span>
                    <div className="border rounded shadow-inner mt-1" style={{ width: "110px", height: "110px", background: image.url ? `url("${image.url}") center/cover no-repeat` : `url("${placeholder}") center/cover no-repeat`, backgroundColor: "#e9ecef", flexShrink: 0 }} />
                    
                    <div className="flex-grow-1 d-flex flex-column gap-2">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-dark text-white-50">Photo #{index + 1} URL</span>
                        <input type="text" className="form-control" value={image.tempUrl || ""} onChange={(e) => handleImageItemChange(index, e.target.value)} />
                        <button className="btn btn-primary" type="button" onClick={() => handleApplyImageItemUrl(index)}>Apply</button>
                        <label className="btn btn-dark d-flex align-items-center mb-0" style={{ cursor: "pointer", padding: "0px 5px" }}>
                          {/* {galleryProgress[index] > 0 ? `⏳ ${galleryProgress[index]}%` : "📷 Upload"} */}
                          {galleryProgress[index] > 0 ? `⏳ ${galleryProgress[index]}%` : <img src={uploadIcon} style={{width: 30}}/>}
                          <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, "images", (p) => setGalleryProgress(prev => ({ ...prev, [index]: p })), index)} />
                        </label>
                        {/* <button type="button" className="btn btn-danger" onClick={() => removeArrayItem("images", index)}>🗑️</button> */}
                        <button type="button" className="bin-btn-custom" onClick={() => removeArrayItem("images", index)}>✕</button>
                      </div>

                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-secondary text-white" style={{ width: "95px", justifyContent: "center" }}>Title</span>
                        <input type="text" className="form-control" value={image.title || ""} onChange={(e) => handleGalleryMetadataChange(index, "title", e.target.value)} />
                      </div>

                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-secondary text-white" style={{ width: "95px", justifyContent: "center" }}>Description</span>
                        <input type="text" className="form-control" value={image.description || ""} onChange={(e) => handleGalleryMetadataChange(index, "description", e.target.value)} />
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
            {(profileData.images || []).length === 0 && <div className="text-center py-4 border rounded bg-light text-muted small">No images added yet.</div>}
          </div>
        </div>

        {/* METADATA SUB-GRID SECTIONS PANELS */}
        <div className="row mt-4 gx-2">
          <div className="col-md-4 mb-3">
            <div className="card h-100 p-3 bg-light" onDragOver={(e) => e.preventDefault()}>
              <h5 className="d-flex align-items-center gap-2">
                <img src={music_note} alt="" style={{ width: 24 }} /> Services Offered
              </h5>
              <div className="card-body p-0 mt-2">
                {profileData.services.map((service, index) => (
                  <div 
                    key={`service-${index}`} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, "services", index)}
                    onDrop={(e) => handleDrop(e, "services", index)}
                    className="bg-white p-2 border rounded mb-2 d-flex align-items-center"
                    style={{ cursor: "move" }}
                  >
                    <span className="me-2 text-muted">☰</span>
                    <input 
                      type="text" 
                      className="form-control form-control-sm border-0 p-0 bg-transparent" 
                      value={service.serviceName} 
                      onChange={(e) => handleArrayItemChange("services", index, "serviceName", e.target.value)} 
                    />
                    {/* <button type="button" className="btn p-0 text-danger ms-2" onClick={() => removeArrayItem("services", index)}>🗑️</button> */}
                    <button type="button" className="bin-btn-custom" onClick={() => removeArrayItem("services", index)}>✕</button>
                  </div>
                ))}
                {/* <button type="button" className="btn btn-sm btn-outline-secondary w-100 mt-2" onClick={() => addArrayItem("services", { serviceName: "New Service" })}>➕ Add Service</button> */}
                <button type="button" className="add-btn-custom" onClick={() => addArrayItem("services", { serviceName: "New Service" })}>+ Add Service</button>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card h-100 p-3 bg-light" onDragOver={(e) => e.preventDefault()}>
              <h5 className="d-flex align-items-center gap-2">
                <img src={star} alt="" style={{ width: 24 }} /> Areas of Expertise
              </h5>
              <div className="card-body p-0 mt-2">
                {profileData.expertises.map((expertise, index) => (
                  <div 
                    key={`expertise-${index}`} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, "expertises", index)}
                    onDrop={(e) => handleDrop(e, "expertises", index)}
                    className="bg-white p-2 border rounded mb-2 d-flex align-items-center"
                    style={{ cursor: "move" }}
                  >
                    <span className="me-2 text-muted">☰</span>
                    <input 
                      type="text" 
                      className="form-control form-control-sm border-0 p-0 bg-transparent" 
                      value={expertise.expertiseName} 
                      onChange={(e) => handleArrayItemChange("expertises", index, "expertiseName", e.target.value)} 
                    />
                    {/* <button type="button" className="btn p-0 text-danger ms-2" onClick={() => removeArrayItem("expertises", index)}>🗑️</button> */}
                    <button type="button" className="bin-btn-custom" onClick={() => removeArrayItem("expertises", index)}>✕</button>
                  </div>
                ))}
                {/* <button type="button" className="btn btn-sm btn-outline-secondary w-100 mt-2" onClick={() => addArrayItem("expertises", { expertiseName: "New Expertise" })}>➕ Add Expertise</button> */}
                <button type="button" className="add-btn-custom" onClick={() => addArrayItem("expertises", { expertiseName: "New Expertise" })}>+ Add Expertise</button>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card h-100 p-3 bg-light" onDragOver={(e) => e.preventDefault()}>
              <h5 className="d-flex align-items-center gap-2">
                <img src={language} alt="" style={{ width: 24 }} /> Spoken Languages
              </h5>
              <div className="card-body p-0 mt-2">
                {profileData.languages.map((lang, index) => (
                  <div 
                    key={`lang-${index}`} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, "languages", index)}
                    onDrop={(e) => handleDrop(e, "languages", index)}
                    className="bg-white p-2 border rounded mb-2 d-flex align-items-center"
                    style={{ cursor: "move" }}
                  >
                    <span className="me-2 text-muted">☰</span>
                    <input 
                      type="text" 
                      className="form-control form-control-sm border-0 p-0 bg-transparent" 
                      value={lang.languageName} 
                      onChange={(e) => handleArrayItemChange("languages", index, "languageName", e.target.value)} 
                    />
                    {/* <button type="button" className="btn p-0 text-danger ms-2" onClick={() => removeArrayItem("languages", index)}>🗑️</button> */}
                    <button type="button" className="bin-btn-custom" onClick={() => removeArrayItem("languages", index)}>✕</button>
                  </div>
                ))}
                {/* <button type="button" className="btn btn-sm btn-outline-secondary w-100 mt-2" onClick={() => addArrayItem("languages", { languageName: "New Language" })}>➕ Add Language</button> */}
                <button type="button" className="add-btn-custom" onClick={() => addArrayItem("languages", { languageName: "New Language" })}>+ Add Language</button>
              </div>
            </div>
          </div>
        </div>

        {/* PORTFOLIO WORKS MEDIA CARDS GALLERY INTERACTIVE GRID */}
        <div className="row mb-2">
          <div className="col-md-12">
            <div className="card p-3 bg-light" onDragOver={(e) => e.preventDefault()}>
              <h5 className="mb-3">Featured Showcases & Works (Drag to reorder)</h5>
              <div className="row">
                {profileData.sampleOfWorks.map((work, index) => (
                  <div 
                    key={`work-${index}`} 
                    className="col-md-4 mb-3"
                    draggable
                    onDragStart={(e) => handleDragStart(e, "sampleOfWorks", index)}
                    onDrop={(e) => handleDrop(e, "sampleOfWorks", index)}
                  >
                    <div className="p-3 border bg-white rounded position-relative" style={{ cursor: "move" }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        {/* <span style={{ fontWeight: "bold", fontSize: "14px", color: "#555" }}>☰ Portfolio Block</span> */}
                        <span style={{ fontWeight: "bold", fontSize: "14px", color: "#555" }}>☰ Portfolio Card</span>
                        {/* <button type="button" className="btn btn-sm p-0 text-danger" onClick={() => removeArrayItem("sampleOfWorks", index)}>🗑️ Delete Block</button> */}
                        <button className="bin-btn-custom" onClick={() => removeArrayItem("sampleOfWorks", index)}>✕</button>
                      </div>
                      
                      <select 
                        className="form-select form-select-sm mb-2" 
                        value={work.type}
                        onChange={(e) => handleArrayItemChange("sampleOfWorks", index, "type", e.target.value)}
                      >
                        {/* <option value="website">Standard Website Link</option> */}
                        <option value="website">Geneal Website URL</option>
                        <option value="youtube">Embedded YouTube Video</option>
                      </select>
                      
                      <input 
                        type="text" 
                        className="form-control form-control-sm mb-2" 
                        // placeholder="Block Title / Label" 
                        placeholder="Website / Video Title" 
                        value={work.title} 
                        onChange={(e) => handleArrayItemChange("sampleOfWorks", index, "title", e.target.value)}
                      />
                      
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        // placeholder="Target Resource URL Link" 
                        placeholder="URL Link" 
                        value={work.link} 
                        onChange={(e) => handleArrayItemChange("sampleOfWorks", index, "link", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-2 justify-content-center mt-2">
                {/* <button type="button" className="btn btn-sm btn-primary" onClick={() => addArrayItem("sampleOfWorks", { type: "website", title: "", link: "" })} >➕ Add Web Card</button> */}
                {/* <button type="button" className="btn btn-sm btn-danger" onClick={() => addArrayItem("sampleOfWorks", { type: "youtube", title: "", link: "" })} >➕ Add YouTube Video Card</button> */}
                <div style={{display: "flex", justifyContent: "center", gap: 10}}>
                  <button style={{width: "auto"}} type="button" className="add-btn-custom" onClick={() => addArrayItem("sampleOfWorks", { type: "website", title: "", link: "" })} >+ Add a Website</button>
                  <button style={{width: "auto", backgroundColor: "#FF0000", color: "white"}} type="button" className="add-btn-custom" onClick={() => addArrayItem("sampleOfWorks", { type: "youtube", title: "", link: "" })}>+ Add a YouTube Video</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Submission Trigger CTA */}
        <div className="text-center">
          {/* <button className="btn btn-success btn-lg px-5 al-pos-r" disabled={saving} onClick={handleSaveProfile}>
            {saving ? "Processing Database Changes..." : "Save Profile Details"}
          </button> */}
          <button style={{width: "100%", color: "black", padding: "20px 0px", fontSize: 20 }} type="button" className="add-btn-custom al-pos-r mb-2 save-profile-details-btn" disabled={saving} onClick={handleSaveProfile} >
            {saving ? "Processing Database Changes..." : "Save Profile Details"}
          </button>
        </div>

      </div>
    </Layout>
  );
}