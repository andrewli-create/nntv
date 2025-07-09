import React from "react";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link, graphql } from "gatsby";
import { getImage } from "gatsby-plugin-image";
import Img from "gatsby-image"
import Markdown from 'react-markdown'
import Layout from "../components/Layout";
import Features from "../components/Features";
import BlogRoll from "../components/BlogRoll";
import FullWidthImage from "../components/FullWidthImage";
import 'bootstrap/dist/css/bootstrap.min.css';
import pianoTopView from '../../static/img/grand-piano-top-view.png'
import { register } from 'swiper/element/bundle';
import 'swiper/element/css/autoplay';
import "swiper/css";
import "swiper/css/navigation";
import SafeImg from "../components/utils/SafeImg"
import ReactPlayer from "react-player";
import AOS from 'aos';
import 'aos/dist/aos.css';
import speakerOn from "../img/speaker_on.svg"
import speakerOff from "../img/speaker_off.svg"
import placeholder from "../img/placeholder.png"
import bioIcon from "../img/bio.svg";
import phone from "../img/phone.svg";
import email from "../img/email_icon.svg";
import website from "../img/website.svg";
import music_note from "../img/music_note_icon.svg";
import star from "../img/star_icon.svg";
import language from "../img/language_icon.svg";

import { LessonBlockHeader } from "./module-page"
// import { urlMetadata } from 'url-metadata'

export const TeamMemberPageTemplate = ({data}) => {
  var pageData = data?.markdownRemark?.frontmatter;
  console.log("PageData", pageData);
  useEffect(() => {
  }, []);
    
  return (
    <>
      <div className="container">
        <div className="row al-mt-40">
          <div className="col-md-5">
            <div className="team-member-bio-pic" style={{backgroundImage: `url("${pageData.bioPicture.publicURL}")`}}></div>
          </div>
          <div className="col-md-7">
            <h1 className="course-block-title al-text-align-c al-mb-20 member-name-title" style={{marginBottom: 0, width: "100%", fontWeight: 300 }}>
              {pageData.title}
            </h1>
            <div className="degree-wrapper al-dp-auto al-mb-20 al-dp-auto-2">
              {
                pageData.degrees.map((degree, index) => (
                  <span className="al-d-block al-text-align-c" style={{width: `${100/pageData.degrees.length - 1}%`}}>
                    {degree.degreeName}
                  </span>
                ))
              }
            </div>
            <div className="contact-wrapper al-dp-auto" style={{justifyContent: (pageData.contacts.length > 2 ? "" : "center")}}>
              {
                pageData.contacts.map((contact, index) => (
                  <span className="al-d-block al-text-align-c" style={{display: "flex", flexDirection: "column"}}>
                    <div>
                      {{
                        'Email': <img src={email} style={{width: 40, marginTop: 0, marginRight: 10}}/>,
                        'Phone': <img src={phone} style={{width: 40, marginTop: 0, marginRight: 10}}/>,
                        'Website': <img src={website} style={{width: 40, marginTop: 0, marginRight: 10}}/>
                      }[contact.contactType || <>No Icon</>]}
                    </div>
                    {contact.content.replace("https://", "").replace("http://", "")}
                  </span>
                ))
              }
            </div>
            <div style={{border: "1.5px solid #FFBD12", backgroundColor: "#FFBD12", height: 1.5, marginTop: 5, marginBottom: 20}}/>
            <Markdown>
              {pageData.bio}
            </Markdown>
            <div className="buttons-wrapper al-mt-20">
              <a target="_blank" href={`${pageData.preferredContact.contactType == "Email" ? `mailto:${pageData.preferredContact.content}` : (pageData.preferredContact.contactType == "Phone" ? `tel:${pageData.preferredContact.content}` : `${pageData.preferredContact.content}`)}`}>
                <button className="contact-button" style={{border: "none", backgroundColor: "#FFBD12"}}>
                  Contact {pageData.title.split(" ")[0]} →
                </button>
              </a>
              <a href={pageData.portfolioLink} target="_blank">
                <button className="contact-button">
                  Portfolio
                </button>
              </a>
               
            </div>
          </div>
        </div>
        <div className="row">
          { pageData.services?
            <div id="services" className="col-md-4 al-mt-20">
              <div className="member-card course-block display-flex d-flex-fs d-flex-col al-height-100pc">
                <LessonBlockHeader logo={music_note} header={"Services Offered"}/>
                <div className="member-card-body">
                  {
                    pageData.services?.map((service, index) => (
                      <span className="member-card-item">- {service.serviceName}</span>
                    ))
                  }
                </div>
              </div>
            </div>
            : <></>
          }
          { pageData.expertises?
            <div className="col-md-4 al-mt-20">
              <div className="member-card course-block display-flex d-flex-fs d-flex-col al-height-100pc">
              <LessonBlockHeader logo={star} header={"Areas of Expertise"}/>
                <div className="member-card-body">
                  {
                    pageData.expertises?.map((expertise, index) => (
                      <span className="member-card-item">- {expertise.expertiseName}</span>
                    ))
                  }
                </div>
              </div>
            </div>
            : <></>
          }
          { pageData.languages?
            <div className="col-md-4 al-mt-20">
              <div className="member-card course-block display-flex d-flex-fs d-flex-col al-height-100pc">
                <LessonBlockHeader logo={language} header={"Language(s)"}/>
                <div className="member-card-body">
                  {
                    pageData.languages?.map((language, index) => (
                      <span className="member-card-item">- {language.languageName}</span>
                    ))
                  }
                </div>
              </div>
            </div>
            : <></>
          }
        </div>
        { pageData.sampleOfWorks?
          <div className="row al-mt-20 al-mb-40">
            <div className="col-md-12">
              <div className="course-block display-flex d-flex-c d-flex-col">
                <LessonBlockHeader logo={bioIcon} header={"Featured Works & Portfolio"}/>
                <div className="col-md-12 row">
                  {
                    pageData.sampleOfWorks?.map((work, index) => (
                      work.type == "youtube"?
                        <div className=" col-md-4 col-12 col-sm-12">
                          <div className="video-block-select-wrapper bg-img-default" style={{backgroundImage: `url("${placeholder}")`}}>
                            <div className="video-block-select margin-top-0" style={{width: "100%"}} >
                              <ReactPlayer
                                url={work.link}
                                playing={false}
                                width={"100%"}
                                height={"100%"}
                                muted={false}
                                controls={true}
                                config={{
                                  youtube: {
                                    playerVars: { modestbranding: 1, disablekb: 0, loop: 1, showinfo: 0 }
                                  }
                                }}
                              /> 
                            </div> 
                          </div>
                        </div>
                      :
                        <div className=" col-md-4 col-12 col-sm-12" >
                          <div className="video-block-select-wrapper bg-img-default"  style={{backgroundImage: `url("${placeholder}")`}}>
                            <div className="" style={{width: "100%"}} >
                              <a href={work.link} target="_blank">
                                <div className="video-block-select margin-top-0" >
                                  <div className="video-overlay op-1">
                                    <h6 className="module-title">{work.title}</h6>
                                  </div>
                                </div>
                              </a>
                            </div> 
                          </div>
                        </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
          :
          <></>
        }
      </div>
    </>
  );
};

const TeamMemberPage = ({ data }) => {
  console.log("index data", data);
  return (
    <Layout>
      <TeamMemberPageTemplate data={data}/>
    </Layout>
  );
};


export default TeamMemberPage;

export const pageQuery = graphql`
  query TeamMemberByID($id: String!) {
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        title
        bio
        bioPicture {
          publicURL
          childImageSharp {
            gatsbyImageData(quality: 100, placeholder: NONE, width: 200)
            fluid {
              ...GatsbyImageSharpFluid
            }
          }
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
  }
`;