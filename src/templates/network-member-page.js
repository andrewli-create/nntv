import React, { useEffect, useState } from "react";
import { graphql } from "gatsby";
import Markdown from 'react-markdown';
import Layout from "../components/Layout";
import 'bootstrap/dist/css/bootstrap.min.css';
import "swiper/css";
import "swiper/css/navigation";
import ReactPlayer from "react-player";
import 'aos/dist/aos.css';
import placeholder from "../img/placeholder.png";
import bioIcon from "../img/bio.svg";
import phone from "../img/phone.svg";
import email from "../img/email_icon.svg";
import website from "../img/website.svg";
import music_note from "../img/music_note_icon.svg";
import star from "../img/star_icon.svg";
import language from "../img/language_icon.svg";
import defaultAvatar from "../img/default-avatar.svg"

// Import Firebase dependencies for client-side live override updates
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; 

import { LessonBlockHeader } from "./module-page";

// Robust conversion utility to clean various timestamp types across Gatsby / Web SDK interfaces
const parseFirebaseDate = (dateVal) => {
  if (!dateVal) return null;
  if (typeof dateVal.toDate === 'function') return dateVal.toDate();
  if (dateVal.seconds || dateVal._seconds) {
    const s = dateVal.seconds || dateVal._seconds;
    return new Date(s * 1000);
  }
  return new Date(dateVal);
};

export const getContrastYIQ = (hex, isTransparent) => {
  // Handle shorthand hex (e.g., #F00) and remove leading #
  let cleanHex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, '#$1$1$2$2$3$3');
  cleanHex = cleanHex.replace(/^#/, '');

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // YIQ formula: weighted sum of RGB channels
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  if (isTransparent) {
    return yiq >= 128 ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.8)';
  } else {
    return yiq >= 128 ? 'black' : 'white';
  }
}

// Helper utility to apply hex transparency dynamically
const hexToRgba = (hex, alpha) => {
  if (!hex) return "rgba(255, 255, 255, 0.8)";
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map(char => char + char).join("");
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

export const NetworkMemberPageTemplate = ({ data, systemBadges, userTheme }) => {
  // 1. Check if data came from Firestore or falling back to Markdown
  const firestoreData = data?.firestoreProfiles;
  const markdownData = data?.markdownRemark?.frontmatter;
  let detailSectionCol = 0;

  // 2. LIVE INTERCEPTOR CHECKS: Immediate real-time data gatekeepers
  if (firestoreData) {
    if (firestoreData.private === true) {
      return (
        <div className="container text-center" style={{ marginTop: "120px", marginBottom: "120px" }}>
          <h3 style={{ fontWeight: 300, color: "#666" }}>This profile is private.</h3>
        </div>
      );
    }

    // 💡 Bypass expiry processing block if user is set to permanent
    if (firestoreData.expiryDate && firestoreData.memberType !== "permanent") {
      const parsedExpiry = parseFirebaseDate(firestoreData.expiryDate);
      if (parsedExpiry && new Date() > parsedExpiry) {
        return (
          <div className="container text-center" style={{ marginTop: "120px", marginBottom: "120px" }}>
            <h3 style={{ fontWeight: 300, color: "#e63946" }}>This profile has expired.</h3>
          </div>
        );
      }
    }

    const isReviewed = firestoreData.profileStatus === "reviewed";
    const isVerifiedOrPermanent = ["permanent", "verified"].includes(firestoreData.memberType);
    
    if (!isReviewed && !isVerifiedOrPermanent) {
      if (firestoreData.profileStatus === "pending") {
        return (
          <div className="container text-center" style={{ marginTop: "120px", marginBottom: "120px" }}>
            <h3 style={{ fontWeight: 300, color: "#FFBD12" }}>This profile is currently under review.</h3>
          </div>
        );
      }
      // Catch-all safety restriction gate
      return (
        <div className="container text-center" style={{ marginTop: "120px", marginBottom: "120px" }}>
          <h3 style={{ fontWeight: 300, color: "#666" }}>This profile is currently unavailable.</h3>
        </div>
      );
    }
  }
  console.log("userTheme", userTheme);
  // 3. Unify fields into a single predictable data architecture
  const pageData = firestoreData 
    ? {
        title: firestoreData.profileName,
        about: firestoreData.about,
        bio: firestoreData.bio,
        bioPicture: firestoreData.profileImage || "/img/profile_placeholder.png", 
        coverImage: firestoreData.coverImage || "", 
        degrees: firestoreData.degrees || [],
        contacts: firestoreData.contacts || [],
        preferredContact: firestoreData.preferredContact || {},
        portfolioLink: firestoreData.portfolioLink || "",
        services: firestoreData.services || [],
        expertises: firestoreData.expertises || [],
        languages: firestoreData.languages || [],
        sampleOfWorks: firestoreData.sampleOfWorks || [],
        displayingBadges: firestoreData.displayingBadges || [],
        images: firestoreData.images || [],
        theme: userTheme || null,

        enableImageCrop: firestoreData.enableImageCrop ?? false,
        profileImageSize: firestoreData.profileImageSize ?? 100,
        profileImagePosX: firestoreData.profileImagePosX ?? 50,
        profileImagePosY: firestoreData.profileImagePosY ?? 50,
      } 
    : markdownData 
    ? {
        title: markdownData.title,
        bio: markdownData.bio,
        bioPicture: markdownData.bioPicture?.publicURL || "",
        degrees: markdownData.degrees || [],
        contacts: markdownData.contacts || [],
        preferredContact: markdownData.preferredContact || {},
        portfolioLink: markdownData.portfolioLink || "",
        services: markdownData.services || [],
        expertises: markdownData.expertises || [],
        languages: markdownData.languages || [],
        sampleOfWorks: markdownData.sampleOfWorks || [],
        displayingBadges: [],
        images: markdownData.images || [],
        theme: null,

        enableImageCrop: false,
        profileImageSize: 100,
        profileImagePosX: 50,
        profileImagePosY: 50,
      }
    : null;

  console.log("Unified Page Data Setup:", pageData);

  // If no data matches, return a fallback message gracefully
  if (!pageData) {
    return <div className="container al-mt-40 text-center">Loading profile data...</div>;
  } else {
    if (pageData.services && pageData.services.length > 0) {
      detailSectionCol++;
    }
    if (pageData.expertises && pageData.expertises.length > 0) {
      detailSectionCol++;
    }
    if (pageData.languages && pageData.languages.length > 0) {
      detailSectionCol++;
    }
    if (detailSectionCol <= 0) {
      detailSectionCol = 1;
    }
  }

  // Map systemic badges settings onto user allowed displays selection array
  const activeDisplayBadgesObjects = (pageData.displayingBadges || [])
    .map(id => systemBadges.find(b => b.id === id))
    .filter(Boolean);

  // 4. Resolve Dynamic Container Theme Styles
  let containerStyle = {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)"
  };
  let containerOverlayStyle = {
    background: "rgba(255, 255, 255, 0)",
    backdropFilter: "blur(0px)",
  };
  let themeColor;

  if (pageData.theme) {
    const {
      backgroundType,
      backgroundColor,
      backgroundImageUrl,
      gradientColor1,
      gradientColor2,
      gradientDirection,
      blur,
      transparency
    } = pageData.theme;

    themeColor = pageData?.theme?.themeColor;
    let resolvedBackground = "";
    const alpha = (transparency !== undefined && transparency !== null) ? transparency : 0.8;

    if (backgroundType === "color") {
      resolvedBackground = hexToRgba(backgroundColor || "#ffffff", alpha);
    } else if (backgroundType === "gradient") {
      const direction = gradientDirection || "to right";
      const c1 = gradientColor1 || "#667eea";
      const c2 = gradientColor2 || "#764ba2";
      resolvedBackground = `linear-gradient(${direction}, ${c1}, ${c2})`;
    } else if (backgroundType === "image") {
      if (backgroundImageUrl) {
        resolvedBackground = `url('${backgroundImageUrl}') center/cover no-repeat`;
      } else {
        resolvedBackground = hexToRgba(backgroundColor || "#ffffff", alpha);
      }
    } else {
      resolvedBackground = "rgba(255, 255, 255, 0.8)";
    }

    const blurVal = (blur !== undefined && blur !== null) ? `${blur}px` : "20px";

    containerStyle = {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      background: resolvedBackground,
      zIndex: -2,
      display: transparency == 0 || transparency == "0" ? "none" : undefined,
    };
    containerOverlayStyle = {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      backdropFilter: `blur(${blurVal})`,
      WebkitBackdropFilter: `blur(${blurVal})`,
      background: `rgba(255, 255, 255, ${1 - transparency})`,
      zIndex: -1,
      display: transparency == 0 || transparency == "0" ? "none" : undefined,
    }
  }

  const isCustomAvatar = pageData.bioPicture && !pageData.bioPicture.includes("profile_placeholder.png");
  
  let avatarStyles = {
    backgroundImage: `url("${pageData.bioPicture}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  if (isCustomAvatar && pageData.enableImageCrop) {
    avatarStyles.backgroundSize = `${pageData.profileImageSize}%`;
    avatarStyles.backgroundPosition = `${pageData.profileImagePosX}% ${pageData.profileImagePosY}%`;
  }

  return (
    <>
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
          background: inherit;
          border-left: 1px solid rgba(255, 255, 255, 0.25); border-top: 1px solid rgba(255, 255, 255, 0.25); z-index: -1;
        }
        .badge-hover-container:hover .badge-custom-tooltip { visibility: visible; opacity: 1; transform: translateX(-50%) translateY(8px); }

        /* PHOTO GALLERY GRID SYSTEM CONFIGURATIONS WITH TEXT OVERLAYS */
        .member-gallery-fluid-grid {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          gap: 2px;
        }
        .member-gallery-card-item {
          position: relative;
          overflow: hidden;
          flex: 1 1 calc(50% - 16px); /* Mobile default sizing: 2 items max per row */
          height: 240px;
          max-height: 280px;
        }
        .member-gallery-img-layer {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .member-gallery-caption-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 45px 15px 15px 15px; /* Added higher top padding for clean gradient headroom transition */
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 100%);
          color: #ffffff;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 2px;
          pointer-events: none; /* Prevents text elements from impeding browser gestures */
        }
        .gallery-caption-title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
        }
        .gallery-caption-desc {
          font-size: 0.85rem;
          margin: 0;
          opacity: 0.9;
          line-height: 1.2;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        }
        @media (min-width: 768px) {
          .member-gallery-card-item {
            flex: 1 1 calc(33.333% - 16px); /* Desktop Layout Breakpoint Overrides: 3 items max per row */
            height: 320px;
            max-height: 350px;
          }
          .gallery-caption-title {
            font-size: 1.15rem;
          }
          .gallery-caption-desc {
            font-size: 0.9rem;
          }
        }
      `}</style>

      {
        pageData?.coverImage?
          <div style={{position: "fixed", width: "100vw", height: "100vh", top: 0, left: 0, overflow: "visible"}}>
            <img style={{position: "absolute", width: "100%", height: "110%", top: 0, left: 0, objectFit: "cover", objectPosition: `0px -${ScrollTracker()/10}px`}} src={pageData?.coverImage} alt=""/>
            <div style={{position: "absolute", width: "100vw", height: "100vh", top: 0, left: 0}}/>
          </div>
          :
          <></>
      }
      
      <div className="container" style={{background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", position: "relative", overflow: "hidden"}}>
        {/* <div style={{...containerStyle, backgroundPosition: `center -${ScrollTracker()/ScrollTracker()}px`, transform: "scale(1.1)"}}></div> */}
        <div style={{...containerStyle}}></div>
        <div style={containerOverlayStyle}></div>
        <div className="row al-pt-40 al-pos-r member-top-row">
          {/* <div style={containerStyle}></div>
          <div style={containerOverlayStyle}></div> */}
          <div className="col-md-5">
            {/* <div 
              className="team-member-bio-pic" 
              style={{ backgroundImage: `url("${pageData.bioPicture}")`, backgroundColor: '#f0f0f0', backgroundSize: 'cover', backgroundPosition: 'center' }}
            ></div> */}
            {
              isCustomAvatar ? 
                <div style={{position: "relative"}}>
                  <div style={{position: "absolute", width: "100%", height: "100%", backgroundImage: `url(${pageData.bioPicture})`, top: 0, left: 0, backgroundSize: "cover"}}></div>
                  <div style={{position: "absolute", width: "100%", height: "100%", top: 0, left: 0, backdropFilter: "blur(20px)"}}></div>
                  <div 
                    className={`team-member-bio-pic mx-auto shadow-sm profile-avatar-preview`}
                    style={{...avatarStyles, position: "relative"}}
                  />
                </div>
              :
                <div 
                  className="team-member-bio-pic" 
                  style={{ backgroundImage: `url("${defaultAvatar}")`, backgroundColor: 'rgb(208, 208, 208)', backgroundSize: 'cover', backgroundPosition: '50% 20%', backgroundRepeat: 'no-repeat' }}
                ></div>
            }
          </div>
          <div className="col-md-7">
            <div style={{paddingLeft: 10, paddingRight: 10, paddingBottom: 15, background: pageData?.theme?.transparency == "0" || pageData?.theme?.transparency == 0 ? "" : "rgba(255, 255, 255, 0.9)", backdropFilter: pageData?.theme?.transparency == "0" || pageData?.theme?.transparency == 0 ? "" : "blur(10px)", borderRadius: 12}}>
              <h1 className="course-block-title al-text-align-c al-mb-10 member-name-title" style={{ marginBottom: 0, width: "100%", fontWeight: 300 }}>
                {pageData.title}
              </h1>
              {pageData.about ? <p className="al-mb-20 al-text-align-c">{pageData.about}</p> : <></>}
              
              {activeDisplayBadgesObjects.length > 0 && (
                <div className="al-mb-20 d-flex flex-wrap justify-content-center gap-1">
                  {activeDisplayBadgesObjects.map((badge) => (
                    <div 
                      key={`member-view-badge-${badge.id}`} 
                      className="badge px-2 py-1.5 d-flex align-items-center gap-1 shadow-sm text-capitalize badge-hover-container"
                      style={{ background: badge.backgroundColor, color: badge.textColor, fontSize: "11px", padding: 10 }}
                    >
                      {badge.icon && <img src={badge.icon} alt="" style={{ width: "12px", height: "12px" }} />}
                      {badge.title}
                      <div className="badge-custom-tooltip" style={{ background: badge.backgroundColor, color: badge.textColor }}>
                        <div className="badge-custom-tooltip-arrow" />
                        {badge.description || "No description provided."}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="degree-wrapper al-dp-auto al-mb-20 al-dp-auto-2">
                {
                  pageData.degrees.map((degree, index) => (
                    <span key={`degree-${index}`} className="al-d-block al-text-align-c" style={{ width: `${100 / (pageData.degrees.length || 1) - 1}%` }}>
                      {degree.degreeName}
                    </span>
                  ))
                }
              </div>
              <div className="contact-wrapper al-dp-auto" style={{ justifyContent: (pageData.contacts.length > 2 ? "" : "center") }}>
                {
                  pageData.contacts.map((contact, index) => (
                    <span key={`contact-${index}`} className="al-d-block al-text-align-c" style={{ display: "flex", flexDirection: "column" }}>
                      <div>
                        {{
                          'Email': <img src={email} alt="Email" style={{ width: 40, marginTop: 0, marginRight: 10 }} />,
                          'Phone': <img src={phone} alt="Phone" style={{ width: 40, marginTop: 0, marginRight: 10 }} />,
                          'Website': <img src={website} alt="Website" style={{ width: 40, marginTop: 0, marginRight: 10 }} />
                        }[contact.contactType] || <>No Icon</>}
                      </div>
                      {(contact.content || "").replace("https://", "").replace("http://", "")}
                    </span>
                  ))
                }
              </div>
              <div style={{ border: themeColor ? `solid 1.5px ${themeColor}`: "1.5px solid #FFBD12", backgroundColor: themeColor || "#FFBD12", height: 1.5, marginTop: 5, marginBottom: 20 }} />
              <Markdown>
                {pageData.bio}
              </Markdown>
              <div className="buttons-wrapper al-mt-20">
                {pageData.preferredContact?.content && (
                  <a target="_blank" rel="noreferrer" href={`${pageData.preferredContact.contactType === "Email" ? `mailto:${pageData.preferredContact.content}` : (pageData.preferredContact.contactType === "Phone" ? `tel:${pageData.preferredContact.content}` : `${pageData.preferredContact.content}`)}`}>
                    <button className="contact-button" style={{ border: "none", backgroundColor: themeColor || "#FFBD12", color: themeColor ? getContrastYIQ(themeColor) : "inherit" }}>
                      Contact {(pageData.title || "").split(" ")[0]} →
                    </button>
                  </a>
                )}
                {pageData.portfolioLink && (
                  <a href={pageData.portfolioLink} target="_blank" rel="noreferrer">
                    <button className="contact-button">
                      Portfolio
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* PHOTO GALLERY SHOWCASE MODULE WITH EMBEDDED TEXT CAPTIONS */}
        {pageData.images && pageData.images.length > 0 && (
          <div className="row al-mt-20-no al-pos-r" style={{paddingTop: 10, paddingBottom: 10}}>
            {/* <div style={{...containerStyle, transform: "scaleY(-1)"}}></div>
            <div style={containerOverlayStyle}></div> */}
            <div className="col-md-12">
              <div className="member-gallery-fluid-grid">
                {pageData.images.map((imgObj, index) => {
                  const resolvedUrl = typeof imgObj === "string" ? imgObj : imgObj?.url;
                  const hasOverlay = imgObj?.title || imgObj?.description;

                  return resolvedUrl ? (
                    <div key={`public-gallery-item-node-${index}`} className="member-gallery-card-item shadow-sm animate-fade-in">
                      <img 
                        src={resolvedUrl} 
                        alt={imgObj?.title || `${pageData.title || "Member"} Showcase Item #${index + 1}`} 
                        className="member-gallery-img-layer"
                      />
                      {hasOverlay && (
                        <div className="member-gallery-caption-overlay">
                          {imgObj.title && <h5 className="gallery-caption-title">{imgObj.title}</h5>}
                          {imgObj.description && <p className="gallery-caption-desc">{imgObj.description}</p>}
                        </div>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}
        
        <div className="row al-pos-r">
          {/* <div style={containerStyle}></div>
          <div style={containerOverlayStyle}></div> */}
          {pageData.services && pageData.services.length > 0 ? (
            <div id="services" className={`col-md-${12/detailSectionCol} al-mt-20 al-text-align-c-non-b`} >
              <div className="member-card course-block display-flex d-flex-fs d-flex-col al-height-100pc" style={{backgroundColor: "rgba(255, 255, 255, 0.9)"}}>
                <LessonBlockHeader logo={music_note} header={"Services Offered"}  color={themeColor}/>
                <div className="member-card-body">
                  {pageData.services.map((service, index) => (
                    <span key={`service-${index}`} className="member-card-item">- {service.serviceName}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          
          {pageData.expertises && pageData.expertises.length > 0 ? (
            <div className={`col-md-${12/detailSectionCol} al-mt-20 al-text-align-c-non-b`}>
              <div className="member-card course-block display-flex d-flex-fs d-flex-col al-height-100pc" style={{backgroundColor: "rgba(255, 255, 255, 0.9)"}}>
                <LessonBlockHeader logo={star} header={"Areas of Expertise"}  color={themeColor}/>
                <div className="member-card-body">
                  {pageData.expertises.map((expertise, index) => (
                    <span key={`expertise-${index}`} className="member-card-item">- {expertise.expertiseName}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          
          {pageData.languages && pageData.languages.length > 0 ? (
            <div className={`col-md-${12/detailSectionCol} al-mt-20 al-text-align-c-non-b`}>
              <div className="member-card course-block display-flex d-flex-fs d-flex-col al-height-100pc" style={{backgroundColor: "rgba(255, 255, 255, 0.9)"}}>
                <LessonBlockHeader logo={language} header={"Language(s)"}  color={themeColor}/>
                <div className="member-card-body">
                  {pageData.languages.map((lang, index) => (
                    <span key={`lang-${index}`} className="member-card-item">- {lang.languageName}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {pageData.sampleOfWorks && pageData.sampleOfWorks.length > 0 ? (
          <div className="row al-mt-20 al-pb-40">
            <div className="col-md-12">
              <div className="course-block display-flex d-flex-c d-flex-col" style={{background: "rgba(255, 255, 255, 0.9)"}}>
                <LessonBlockHeader logo={bioIcon} header={"Featured Works & Portfolio"} color={themeColor} />
                <div className="col-md-12 row">
                  {pageData.sampleOfWorks.map((work, index) => (
                    work.type === "youtube" ? (
                      <div key={`work-${index}`} className="col-md-4 col-12 col-sm-12">
                        <div className="video-block-select-wrapper bg-img-default" style={{ backgroundImage: `url("${placeholder}")` }}>
                          <div className="video-block-select margin-top-0" style={{ width: "100%" }} >
                            <ReactPlayer
                              url={work.link.trim()} playing={false} width={"100%"} height={"100%"} muted={false} controls={true}
                            /> 
                          </div> 
                        </div>
                      </div>
                    ) : (
                      <div key={`work-${index}`} className="col-md-4 col-12 col-sm-12">
                        <div className="video-block-select-wrapper bg-img-default" style={{ backgroundImage: `url("${placeholder}")` }}>
                          <div className="" style={{ width: "100%" }} >
                            <a href={work.link} target="_blank" rel="noreferrer">
                              <div className="video-block-select margin-top-0" >
                                <div className="video-overlay op-1">
                                  <h6 className="module-title">{work.title}</h6>
                                </div>
                              </div>
                            </a>
                          </div> 
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

const NetworkMemberPage = ({ data }) => {
  const [liveOverrideData, setLiveOverrideData] = useState(null);
  const [systemBadges, setSystemBadges] = useState([]);
  const [userTheme, setUserTheme] = useState(null);

  useEffect(() => {
    const fetchSystemBadges = async () => {
      try {
        const querySnap = await getDocs(collection(db, "badges"));
        const badgesArr = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSystemBadges(badgesArr);
      } catch (err) {
        console.error("Failed to retrieve system badges:", err);
      }
    };
    fetchSystemBadges();

    const firestoreUID = data?.firestoreProfiles?.userID;
    if (firestoreUID) {
      const profilesRef = collection(db, "profiles");
      const q = query(profilesRef, where("userID", "==", firestoreUID));
      
      getDocs(q)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            setLiveOverrideData(querySnapshot.docs[0].data());
          }
        })
        .catch(err => console.error("Error updating live profile hydration layer:", err));
    }
  }, [data]);

  // 3. Dynamically query User-Selected Theme once profile hydration finishes
  useEffect(() => {
    const activeThemeId = liveOverrideData?.selectedTheme || data?.firestoreProfiles?.selectedTheme;
    if (activeThemeId) {
      const fetchTheme = async () => {
        try {
          const themesRef = collection(db, "themes");
          const q = query(themesRef, where("id", "==", activeThemeId));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            setUserTheme(querySnap.docs[0].data());
          }
        } catch (err) {
          console.error("Failed to fetch user theme:", err);
        }
      };
      fetchTheme();
    }
  }, [liveOverrideData, data]);

  const dynamicMergedData = liveOverrideData 
    ? { ...data, firestoreProfiles: { ...data.firestoreProfiles, ...liveOverrideData } }
    : data;

  return (
    <Layout>
      <NetworkMemberPageTemplate data={dynamicMergedData} systemBadges={systemBadges} userTheme={userTheme} />
    </Layout>
  );
};

export default NetworkMemberPage;

export const pageQuery = graphql`
  query NetworkMemberByID($id: String!) {
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        title
        bio
        bioPicture {
          publicURL
        }
        degrees {
          degreeName
        }
        contacts {
          contactType  
          content
        }
        preferredContact {
          content
          contactType
        }
        portfolioLink
        services {
          serviceName
        }
        expertises {
          expertiseName
        }
        languages {
          languageName
        }
        sampleOfWorks {
          type
          title
          link
        }
      }
    }
    firestoreProfiles(id: { eq: $id }) {
      userID
      profileName
      about
      bio
      profileImage
      coverImage
      displayingBadges
      private
      expiryDate
      profileStatus
      memberType
      selectedTheme

      enableImageCrop
      profileImageSize
      profileImagePosX
      profileImagePosY

      images {
        url
        title
        description
      }
      degrees {
        degreeName
      }
      contacts {
        contactType
        content
      }
      preferredContact {
        contactType
        content
      }
      portfolioLink
      services {
        serviceName
      }
      expertises {
        expertiseName
      }
      languages {
        languageName
      }
      sampleOfWorks {
        type
        title
        link
      }
    }
  }
`;

const ScrollTracker = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => setScrollPosition(window.scrollY);
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);
  return scrollPosition;
};