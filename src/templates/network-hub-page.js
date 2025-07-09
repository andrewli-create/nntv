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
export const NetworkHubPageTemplate = ({data}) => {
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
      <div className="container-fluid vertical-white-space-top al-no-pad-horizonal">
        <section id="our-team" className="al-mt-40">
          <div className="display-flex d-flex-c" style={{marginBottom: "15px"}}>
            <h1 className="al-text-align-c al-pos-r display-inline-block font-report-regular">{data.markdownRemark.frontmatter.title}<span className="yellow-accent"></span></h1>            
          </div>
          <p className="al-text-align-c">{data.markdownRemark.frontmatter.openingparagraph}</p>
          <div className="section-center network-section">
            <div className="row vertical-white-space-large" style={{paddingTop: 20}}>
              {data.markdownRemark.frontmatter.members
                ? (data.markdownRemark.frontmatter.members.map((member, index) => (
                  <div className="col-md-12 col-sm-12 al-mt-10">
                    {/* {markdownRender[index] = <Markdown>{member.memberbio}</Markdown>} */}
                    <div className="value-card d-flex d-flex-col d-flex-sb">
                      <div>
                        
                        <div className="network-member-card">
                          
                            <div className="network-member-card-inner">
                              <div className="member-image-wrapper no-transition no-radius al-pos-r" style={{width: "40%"}}>
                                <div className={`video-frame-element ${index % 2 != 0 ? "video-frame-element-blue" : ""}`} style={{width: "10px", height: "100px", left: 0, top: 0, zIndex: 2}}></div>
                                {/* <span className="click-prompt" style={{}}> Click to see bio page.</span> */}
                                <SafeImg inputObj={member.memberimage} imagePosition={member.memberimagealign}/>
                              </div>
                              <div style={{width: "60%"}}>
                                <h4 className=" member-name network-member-name" style={{color: "black", fontSize: 23, padding: "20px 25px", fontWeight: 400}}>{member.membername}</h4>  
                                <div style={{padding: "10px 25px 20px 25px"}}>
                                  <p className="al-mb-20">
                                    {member.memberbio.substring(0,250)}... <a href={`/network-hub/${member.memberpagelink}`}>&#91;Read full bio&#93;</a>
                                  </p>
                                  <div className="al-mb-20">
                                    <h5 style={{marginBottom: 5, fontWeight: 600}}>Services:</h5>
                                    {/* <h5 style={{marginBottom: 5}}>Expertise:</h5> */}
                                    <div className="member-expertise-name-wrapper">
                                      {(member.memberExpertises.map((expertises, indexInner) => (
                                        indexInner < 6?
                                        <span className="member-expertise-name-block">{expertises.expertiseName}</span>
                                        :
                                        <></>
                                      )))}
                                    </div>
                                    {member.memberExpertises.length > 6 ?
                                      <a href={`/network-hub/${member.memberpagelink}#services`}>
                                        <span className="member-expertise-name-block-see-all">See {member.memberExpertises.length - 6} more services {member.membername.split(" ")[0]} offers</span>
                                      </a>
                                      :
                                      <></>
                                    }
                                  </div>
                                  <a className="button-generic button-accent responsive-network-button" style={{color: "black"}} href={`/network-hub/${member.memberpagelink}`}>See {member.membername.split(" ")[0]}'s details &amp; contact {member.membername.split(" ")[0]}</a>
                                </div> 
                              </div>
                            </div>
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

const NetworkHubPage = ({ data }) => {
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
      <NetworkHubPageTemplate data={data}/>
    </Layout>
  );
};


export default NetworkHubPage;

export const pageQuery = graphql`
  query NetworkHubPageTemplate {
    markdownRemark(frontmatter: { templateKey: { eq: "network-hub-page" } }) {
      frontmatter {
        templateKey
        title        
        openingparagraph
        members {
          membername
          memberbio
          memberpagelink
          memberimagealign
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
          memberExpertises {
            expertiseName
          }
        }
      }
    }
  }
`;