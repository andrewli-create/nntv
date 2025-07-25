import React from "react";
import PropTypes from "prop-types";
import { Link, graphql } from "gatsby";
import { getImage } from "gatsby-plugin-image";
import Markdown from 'react-markdown'

import Layout from "../components/Layout";
import Features from "../components/Features";
import BlogRoll from "../components/BlogRoll";
import FullWidthImage from "../components/FullWidthImage";
import 'bootstrap/dist/css/bootstrap.min.css';
import pianoTopView from '../../static/img/grand-piano-top-view.png'
import Img from "gatsby-image"
import SafeImg from "../components/utils/SafeImg"
import noteBook from "../img/note_book.svg";
import notePad from "../img/notepad1.svg";
import penPaper from "../img/pen_paper.svg";
import openBookmark from "../img/open_bookmark_2.svg";
import playgroundIcon from "../img/playground.svg";
import bioIcon from "../img/bio.svg";
import outcomeIcon from "../img/outcome.svg";
import { useState, useEffect, useCallback } from "react";
import EQ from "../components/EQ"
import Reverb from "../components/Reverb"
import Compression from "../components/Compression"
import Delay from "../components/Delay"


// import { useEffect } from 'react';
// eslint-disable-next-line
function LinkRenderer(props) {
  return <a href={props.href} target="_blank">{props.children}</a>
}

export const ModulePageTemplate = ({pageContext, data}) => {
  // console.log(data.markdownRemark.frontmatter.title);
  const [loadAnimation, setLoadAnimation] = useState(0);
  const [loadAnimationB, setLoadAnimationB] = useState(0);
  const [notepadValue, setNotepadValue] = useState();
  const [isSaving, setIsSaving] = useState(false);

  // console.log("front-matter-Module", data.markdownRemark.frontmatter);
  var dataPack = data.markdownRemark.frontmatter;
  var modulePack = dataPack.modules;
  // console.log("front-matter-modulePack", modulePack);
  
  useEffect(() => {
    const notepadData = window.localStorage.getItem(dataPack.title + "-note");
    // console.log("notepadData", notepadData);
    if (notepadData == "" || notepadData == null) {
      setNotepadValue("");
    } else {
      setNotepadValue(notepadData);
    }
    // if (notepadData !== null && notepadData !== "" ) setNotepadValue(String(notepadData));
    setTimeout(() => {
      setLoadAnimation(1);
      setTimeout(() => {
        setLoadAnimationB(1);
      }, 250);
    }, 50);
  }, [])

  useEffect(() => {
    window.localStorage.setItem(dataPack.title + "-note", notepadValue);
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  }, [notepadValue])
  
  // console.log(this.props.pageContext);
  return (
    // <div className="text-css">
    //   {data.markdownRemark.frontmatter.title}
    // </div>
    <div className="container">
      <div className="row al-mt-40">
        <div className="col-md-12">
          <h1 className="module-title-display font-report-regular">{dataPack.title}</h1>
        </div>
      </div>
      <div className="row al-mt-40">
        <div className="col-md-1"></div>
        <div className="col-md-10" style={{minHeight: "450px"}}>
          <div className={loadAnimation == 1 ? "video-block-wrapper frame-end" : "video-block-wrapper frame-start"}>
            <div className="video-frame-element" style={{width: "10px", height: "100px", left: 0, top: 0}}></div>
            <div className="video-frame-element" style={{width: "100px", height: "10px", left: 0, top: 0}}></div>
            <div className="video-frame-element" style={{width: "10px", height: "100px", right: 0, bottom: 0}}></div>
            <div className="video-frame-element" style={{width: "100px", height: "10px", right: 0, bottom: 0}}></div>
            <iframe className={loadAnimationB == 1 ? "module-iframe show-video" : "module-iframe hide-video"} style={{width: "100%", height: "450px"}} src={dataPack.videolink}></iframe>
          </div>
        </div>
        <div className="col-md-1"></div>
        <div className="container">
          <div className="row al-mt-40">
            { dataPack.biography ? 
              <div className={dataPack.script ? "col-md-4" : "col-md-12"}>
                <div className="course-block display-flex d-flex-c-n d-flex-col" style={{height: "100%"}}>
                  <div className="intro-course-block-content">
                    {dataPack.biooutcome == "biography" ?
                      <LessonBlockHeader logo={bioIcon} header={"Biography"}/>
                      :
                      <LessonBlockHeader logo={outcomeIcon} header={"Outcome"}/>
                    }
                    
                    <p style={{maxHeight: "250px", overflow: "scroll"}}>
                      <Markdown>{dataPack.biography}</Markdown>
                    </p>
                  </div>
                </div>
              </div>
              :
              <></>
            }
            { dataPack.script ? 
              <div className={dataPack.biography ? "col-md-8 al-mt-20-mobile" : "col-md-12"}>
                <div className="course-block display-flex d-flex-c d-flex-col" style={{height: "100%"}}>
                  <div className="intro-course-block-content" style={dataPack.biography ? {height: "100%"} : {}}>
                    <LessonBlockHeader logo={noteBook} header={"Script"}/>
                    <p style={{maxHeight: "250px", overflow: "scroll"}}>
                      <Markdown>{dataPack.script}</Markdown>
                    </p>
                  </div>
                </div>
              </div>
              :
              <></>
            }
          </div>
        </div>
        <div className="container">
          <div className="row al-mt-20 al-mb-40 ">
            <div className={dataPack.interactiveToggle ? "col-md-6 col-sm-6 notepad-block" : "col-md-6 col-sm-6 notepad-block"}>
              <div className="course-block display-flex d-flex-fs d-flex-col al-c-t al-b-n" style={{position: "relative"}}>
                <LessonBlockHeader logo={penPaper} header={"Notepad"} className={"notepad-title"}/>
                <div className="notepad-background-wrapper">
                  <div className="notepad-ring-area"></div>
                  <div className="notepad-paper"></div>
                  <div className="notepad-paper notepad-paper-offset"></div>
                </div>
                <textarea className="notepad-textarea" name="notepad" rows="5" onChange={e => setNotepadValue(e.target.value)} value={notepadValue}></textarea>
                {notepadValue != "" ? <span className="saved-text">{isSaving ? "Saving..." : "Note saved!   "}</span> : <></>}
                
              </div>
            </div>
            <div className={dataPack.interactiveToggle ? "col-md-6 col-sm-12 credit-block" : "col-md-6 col-sm-12 credit-block"}>
              <div className="course-block display-flex d-flex-fs d-flex-col">
                <LessonBlockHeader logo={openBookmark} header={"Credits & Info"}/>
                <Markdown>{dataPack.creditandinfo}</Markdown>
                {/* <span className="al-mt-20">{dataPack.creditandinfo}</span> */}
              </div>
            </div>
            { dataPack.interactiveToggle ? 
              <div className="col-md-12 col-sm-12 interactive-block al-mt-20">
                <div className="course-block plugin-course-block display-flex d-flex-fs d-flex-col">
                  <LessonBlockHeader logo={playgroundIcon} header={"Playground"}/>
                  {/* <span className="al-mt-20">The interactive element is coming soon.</span> */}
                  {/* <EQ/> */}
                  {/* <Reverb/> */}
                  {(() => {
                    switch (dataPack.tool) {
                      case 'none':
                        return <span className="al-mt-20">The interactive tool is coming soon.</span>
                      case 'eq':
                        return <EQ/>
                      case 'reverb':
                        return <Reverb/> 
                      case 'compression':
                        return <Compression/> 
                      case 'delay':
                        return <Delay/> 
                      default:
                        return <span className="al-mt-20">There is no interactive tool for this module.</span>
                    }
                  })()}
                </div>
              </div>
              :
              <></>
            }
            { dataPack.resources ? 
              <div className="col-md-12 col-sm-12 credit-block al-mt-20">
                <div className="course-block display-flex d-flex-fs d-flex-col resource-block">
                  <LessonBlockHeader logo={openBookmark} header={"Resources"}/>
                  <Markdown renderers={{link: LinkRenderer}}>{dataPack.resources}</Markdown>
                  {/* <span className="al-mt-20">{dataPack.creditandinfo}</span> */}
                </div>
              </div>
              :
              <></>  
            }
            
          </div>
        </div>
      </div>
    </div>
  );
};

const ModulePage = ({ data }) => {
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
  // console.log("module data", data);
  return (
    <Layout>
      <ModulePageTemplate data={data}/>
    </Layout>
  );
};

export const LessonBlockHeader = ({logo, header, className}) => {
  return (
    <div className={"display-flex d-flex-fs d-flex-row " + className}>
      <img src={logo} style={{marginTop: 0}}/>
      <div className="display-flex d-flex-c d-flex-row" style={{marginTop: 0, marginLeft: "7px"}}>
        <h2 className="course-block-title">
          <div className="accent-underline"></div>
          <span className="al-pos-r" style={{zIndex: 1}}>
            {header}
          </span>
        </h2>
      </div>
    </div>
  );
};

export default ModulePage;
export const pageQuery = graphql`
  query ModuleByTitle($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      frontmatter {
        title
        videolink
        biooutcome
        biography
        script
        creditandinfo
        interactiveToggle
        resources
        tool
        videothumbnail {
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