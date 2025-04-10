import React from "react";
import PropTypes from "prop-types";
import { Link, graphql } from "gatsby";
import { getImage } from "gatsby-plugin-image";
import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import Features from "../components/Features";
import BlogRoll from "../components/BlogRoll";
import FullWidthImage from "../components/FullWidthImage";
import 'bootstrap/dist/css/bootstrap.min.css';
import pianoTopView from '../../static/img/grand-piano-top-view.png'
import Img from "gatsby-image"
import SafeImg from "../components/utils/SafeImg"
import AlModal from "../components/utils/AlModal"
import Markdown from 'react-markdown'
import AOS from 'aos';
import 'aos/dist/aos.css';

// import { useEffect } from 'react';
// eslint-disable-next-line
export const OurVisionPageTemplate = ({data}) => {
  // const [bioName, setBioName] = useState([]);
  const [bioName, setBioName] = useState("");
  const [bio, setBio] = useState("");
  const [bioModalShow, setBioModalShow] = useState(false);
  const [bioImage, setBioImage] = useState("");
  const [bioLink, setBioLink] = useState("");

  // const showBio = (name, bio) => {
  //   setBioName(name);
  //   setBio(bio);
  //   setBioModalShow(true);
  // }

  useEffect(() => {
    const handleEsc = (event) => {
       if (event.key === 'Escape') {
        console.log('Close')
        setBioModalShow(false);
        console.log(bioModalShow);
      }
    };
    window.addEventListener('keydown', handleEsc);
    AOS.init();
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // useEffect(() => {
    // setBioModalShow(false);
    // setBioImage(" ");
    // setBio(" ");
    // setBioName(" ");
  // }, [bioName, bio, bioModalShow]);

  const showBio = (name, bio, image, link) => {

    if (name) {
      setBioName(name);
    } else {
      setBioName("N/A");
    }
    if (bio) {
      setBio(bio);
    } else {
      setBio("N/A");
    }
    if (image) {
      setBioImage(image);
    } else {
      setBioImage("");
    }
    if (link) {
      setBioLink(link);
    } else {
      setBioLink("");
    }

    setBioModalShow(true);
    // setBio(bio);
    // console.log("bioModalShow", bioModalShow);
    // console.log("bioName", bioName);
    // console.log("bioImage", bioImage);
  }
  // console.log(data.markdownRemark.frontmatter.title);
  console.log("front-matter", data.markdownRemark.frontmatter);
  var markdownRender = [];
  return (
    // <div className="text-css">
    //   {data.markdownRemark.frontmatter.title}
    // </div>
    <>
      <AlModal className={"bio-modal-frame"} show={bioModalShow} backgroundColor={"white"} height={"auto"} padding={"20px"}>
        <div className="al-pos-r">
          <span style={{position: "absolute", top: "0px", right: "30px", cursor: "pointer"}} onClick={() => {setBioModalShow(false);}}>Close</span>
          <div style={{width: "100%"}}>
            <div className="bio-display-image" style={{ height: "150px", width: "150px", borderRadius: "2000px", overflow: "hidden"}}>
              <SafeImg inputObj={bioImage}/>
            </div>
          </div>
          <h2 style={{fontWeight: "bold", textAlign: "center", fontSize: "20px", marginTop: "30px", marginBottom: "30px", textTransform: "uppercase"}}>{bioName}</h2>
          <div className="bio-content-display">
            <p className="bio-display" style={{width: "90%", margin: "auto"}}><Markdown>{bio}</Markdown></p>
            <a className="bio-display" style={{width: "90%", margin: "auto", display: "block", marginBottom: "20px"}} href={bioLink} target="_blank">{bioLink}</a>
          </div>
          <div className="video-frame-element" style={{width: "10px", height: "100px", left: 0, top: 0}}></div>
          <div className="video-frame-element" style={{width: "10px", height: "100px", right: 0, bottom: 0}}></div>
        </div>
      </AlModal>
      <div className="container-fluid vertical-white-space-top al-no-pad-horizonal">
        <section className="section-center al-mt-40 al-mb-40">
          <div className="row al-pos-r our-vision-row">
            <div className="vision-background-block"></div>
            <div className="col-md-5">
              <div className="featured-img-wrapper" data-aos="fade-right" data-aos-duration="1000">
                <SafeImg inputObj={data.markdownRemark.frontmatter.featuredimage}/>
              </div>
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-5 al-pos-r" style={{zIndex: 1}}>
              <h1 className="al-pos-r display-inline-block font-report-regular" style={{marginBottom: "15px"}}>{data.markdownRemark.frontmatter.title}<span className="yellow-accent"></span></h1>
              <p>{data.markdownRemark.frontmatter.openingparagraph}</p>
              <p className="al-no-margin-b opening-tagline" style={{marginTop: "20px"}}>{data.markdownRemark.frontmatter.openingtagline}</p>
              <div className="video-frame-element" style={{width: "10px", height: "25px", right: "-10px", bottom: 0, backgroundColor: "rgb(85, 150, 255)"}}></div>
              <div className="video-frame-element" style={{width: "25px", height: "10px", right: "-10px", bottom: 0, backgroundColor: "rgb(85, 150, 255)"}}></div>
            </div>
          </div>
        </section>
        <hr style={{background: "black"}}/>
        <section id="our-values" className="al-mt-40">
          <div className="display-flex d-flex-c" style={{marginBottom: "15px"}}>
            <h1 className="al-text-align-c al-pos-r display-inline-block font-report-regular">{data.markdownRemark.frontmatter.secondarytitle}<span className="yellow-accent"></span></h1>
          </div>
          <p className="al-text-align-c">{data.markdownRemark.frontmatter.secondarytagline}</p>
          <div className="section-center">
            <div className="row vertical-white-space-large">
              {data.markdownRemark.frontmatter.values
                ? (data.markdownRemark.frontmatter.values.map((value, index) => (
                  <div className="col-md-3 col-sm-6">
                    {/* <div className="value-card d-flex d-flex-col d-flex-sb" data-aos="fade-up" data-aos-duration={index*500+500}> */}
                    <div className="value-card d-flex d-flex-col d-flex-sb">
                      <div>
                        <div className="value-img-wrapper">
                          <SafeImg inputObj={value.valueimage}/>
                        </div>
                        <h6 className="al-mt-10" style={{textAlign: "center"}}>{value.valuetitle}</h6>
                      </div>
                      {/* <span>{data.markdownRemark.frontmatter.seemoretext}</span> */}
                    </div>
                  </div>
                )))
                : null
              }
              {/* <div className="col-md-6 d-flex-row d-flex d-flex-sb"> */}
              {/* {data.markdownRemark.frontmatter.keywords
                ? (data.markdownRemark.frontmatter.keywords.map((keyword, index) => (
                  <div className="keyword-box">
                    {keyword.word}
                  </div>
                )))
                : null
              } */}
              {/* </div> */}
            </div>
          </div>
        </section>
        <hr style={{background: "black"}}/>
        <section id="our-team" className="al-mt-40">
          <div className="display-flex d-flex-c" style={{marginBottom: "15px"}}>
            <h1 className="al-text-align-c al-pos-r display-inline-block font-report-regular">{data.markdownRemark.frontmatter.tertiarytitle}<span className="yellow-accent"></span></h1>
          </div>
          <p className="al-text-align-c">{data.markdownRemark.frontmatter.tertiaryparagraph}</p>
          <div className="section-center">
            <div className="row vertical-white-space-large">
              {data.markdownRemark.frontmatter.members
                ? (data.markdownRemark.frontmatter.members.map((member, index) => (
                  <div className="col-md-3 col-sm-6 al-mt-10">
                    {/* {markdownRender[index] = <Markdown>{member.memberbio}</Markdown>} */}
                    <div className="value-card d-flex d-flex-col d-flex-sb">
                      <div>
                        <h6 className="al-mt-10 member-name">{member.membername}</h6>
                        { !member.memberpagelink ?
                          <div className="member-image-wrapper al-pos-r" onClick={() => {showBio(member.membername,  member.memberbio, member.memberimage, member.memberlink)}}>
                            {member.memberbio ? 
                              // <div className="member-bio">
                              //   <p>{member.memberbio}</p>
                              // </div>
                              <></>
                              : 
                              <></>
                            }
                            <div className="video-frame-element" style={{backgroundColor: "rgba(156, 194, 255, 0)", width: "10px", height: "100px", left: 0, top: 0, zIndex: 2}}></div>
                            <span className="click-prompt" style={{}}> Click to see bio.</span>
                            {/* <div className="video-frame-element" style={{width: "100px", height: "10px", right: 0, bottom: 0, zIndex: 2}}></div> */}
                            {/* <div className="video-frame-element" style={{width: "auto", height: "auto", left: 0, bottom: "10%", zIndex: 2, padding: "5px 10px"}}> */}
                            <SafeImg inputObj={member.memberimage} imagePosition={member.memberimagealign}/>
                            {/* {preview == 0 ? 
                                member.memberimage ? <Img fluid={member.memberimage.childImageSharp.fluid}/>  : <></>
                              :
                                member.memberimage ? <img src={member.memberimage}/> : <></>
                            }
                            */}
                            {/* <Img fluid={member.memberimage.childImageSharp.fluid}/> */}
                          </div>
                          :
                          <a href={`/team-member/${member.memberpagelink}`}>
                            <div className="member-image-wrapper al-pos-r">
                              <div className="video-frame-element" style={{width: "10px", height: "100px", left: 0, top: 0, zIndex: 2}}></div>
                              <span className="click-prompt" style={{}}> Click to see bio page.</span>
                              <SafeImg inputObj={member.memberimage} imagePosition={member.memberimagealign}/>
                            </div>
                          </a> 
                        }
                      </div>
                    </div>
                  </div>
                )))
                : null
              }
              {/* <div className="col-md-6 d-flex-row d-flex d-flex-sb"> */}
              {/* {data.markdownRemark.frontmatter.keywords
                ? (data.markdownRemark.frontmatter.keywords.map((keyword, index) => (
                  <div className="keyword-box">
                    {keyword.word}
                  </div>
                )))
                : null
              } */}
              {/* </div> */}
            </div>
          </div>
        </section>
        <section id="advisors" className="al-mt-40">
          <div className="display-flex d-flex-c" style={{marginBottom: "15px"}}>
            <h1 className="al-text-align-c al-pos-r display-inline-block font-report-regular">{data.markdownRemark.frontmatter.quaternarytitle}<span className="yellow-accent"></span></h1>
          </div>
          <div className="section-center">
            <div className="row al-mb-40">
              {data.markdownRemark.frontmatter.advisors
                ? (data.markdownRemark.frontmatter.advisors.map((advisor, index) => (
                  <div className="col-md-3 col-sm-6 al-mt-10">
                    {/* {markdownRender[index] = <Markdown>{member.memberbio}</Markdown>} */}
                    <div className="value-card d-flex d-flex-col d-flex-sb">
                      <div>
                        <h6 className="al-mt-10 member-name">{advisor.advisorname}</h6>
                        <div className="member-image-wrapper al-pos-r" onClick={() => {showBio(advisor.advisorname,  advisor.advisorbio, advisor.advisorimage)}}>
                          {advisor.advisorbio ? 
                            // <div className="member-bio">
                            //   <p>{member.memberbio}</p>
                            // </div>
                            <></>
                            : 
                            <></>
                          }
                          <div className="video-frame-element" style={{backgroundColor: "transparent", width: "10px", height: "100px", left: 0, top: 0, zIndex: 2}}></div>
                          <span className="click-prompt" style={{}}> Click to see bio.</span>
                          {/* <div className="video-frame-element" style={{width: "100px", height: "10px", right: 0, bottom: 0, zIndex: 2}}></div> */}
                          {/* <div className="video-frame-element" style={{width: "auto", height: "auto", left: 0, bottom: "10%", zIndex: 2, padding: "5px 10px"}}> */}
                          <SafeImg inputObj={advisor.advisorimage} imagePosition={advisor.advisorimagealign}/>
                          {/* {preview == 0 ? 
                              member.memberimage ? <Img fluid={member.memberimage.childImageSharp.fluid}/>  : <></>
                            :
                              member.memberimage ? <img src={member.memberimage}/> : <></>
                          }
                           */}
                          {/* <Img fluid={member.memberimage.childImageSharp.fluid}/> */}
                        </div>
                      </div>
                    </div>
                  </div>
                )))
                : null
              }
              {/* <div className="col-md-6 d-flex-row d-flex d-flex-sb"> */}
              {/* {data.markdownRemark.frontmatter.keywords
                ? (data.markdownRemark.frontmatter.keywords.map((keyword, index) => (
                  <div className="keyword-box">
                    {keyword.word}
                  </div>
                )))
                : null
              } */}
              {/* </div> */}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

const OurVisionPage = ({ data }) => {
  // useEffect(() => {
  //   const script = document.createElement('script');
  //   script.src = "https://identity.netlify.com/v1/netlify-identity-widget.js";
  //   script.async = true;
  //   document.body.appendChild(script);
  //   return () => {
  //     document.body.removeChild(script);
  //   }
  // }, []);
  // const { frontmatter } = data.markdownRemark;
  // console.log(data.markdownRemark.frontmatter.title);
  console.log("index data", data);
  return (
    <Layout>
      <OurVisionPageTemplate data={data}/>
    </Layout>
  );
};


export default OurVisionPage;

export const pageQuery = graphql`
  query OurVisionPageTemplate {
    markdownRemark(frontmatter: { templateKey: { eq: "our-vision-page" } }) {
      frontmatter {
        title
        templateKey
        openingparagraph
        openingtagline
        secondarytitle
        path
        secondarytagline
        seemoretext
        tertiarytitle
        tertiaryparagraph
        quaternarytitle
        values {
          valueimage {
						childImageSharp {
              gatsbyImageData(
                quality: 100
                placeholder: NONE
                width: 200
              )
              fluid {
                ...GatsbyImageSharpFluid
              }
            }
          }
          valuetitle
          valueparagraph
        }
        members {
          memberimage {
						childImageSharp {
              gatsbyImageData(
                quality: 100
                placeholder: NONE
                width: 200
              )
              fluid {
                ...GatsbyImageSharpFluid
              }
            }
          }
          membername
          memberbio
          memberlink
          memberpagelink
          memberimagealign
        }
        advisors {
          advisorimage {
						childImageSharp {
              gatsbyImageData(
                quality: 100
                placeholder: NONE
                width: 200
              )
              fluid {
                ...GatsbyImageSharpFluid
              }
            }
          }
          advisorname
          advisorbio
          advisorimagealign
        }
        featuredimage {
          childImageSharp {
            gatsbyImageData(
              quality: 100
              placeholder: NONE
              width: 200
            )
            fluid {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
  }
`;