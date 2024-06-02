import React from "react";
import PropTypes from "prop-types";
import { Link, graphql } from "gatsby";
import { getImage } from "gatsby-plugin-image";

import Layout from "../components/Layout";
import Features from "../components/Features";
import BlogRoll from "../components/BlogRoll";
import FullWidthImage from "../components/FullWidthImage";
import 'bootstrap/dist/css/bootstrap.min.css';
import pianoTopView from '../../static/img/grand-piano-top-view.png'
import Img from "gatsby-image"
import SafeImg from "../components/utils/SafeImg"
import noteBook from "../img/note_book.svg";
import penPaper from "../img/pen_paper.svg";
import openBookmark from "../img/open_bookmark.svg";

// import { useEffect } from 'react';
// eslint-disable-next-line
export const ModulePageTemplate = ({pageContext, data}) => {
  // console.log(data.markdownRemark.frontmatter.title);
  console.log("front-matter-Module", data.markdownRemark.frontmatter);
  var dataPack = data.markdownRemark.frontmatter;
  var modulePack = dataPack.modules;
  console.log("front-matter-modulePack", modulePack);
  // console.log(this.props.pageContext);
  return (
    // <div className="text-css">
    //   {data.markdownRemark.frontmatter.title}
    // </div>
    <div className="container">
      <div className="row al-mt-40">
        <div className="col-md-12">
          <h1 className="module-title-display">{dataPack.title}</h1>
        </div>
      </div>
      <div className="row al-mt-40">
        <div className="col-md-2"></div>
        <div className="col-md-8">
          <iframe style={{width: "100%", height: "400px"}} src={dataPack.videolink}></iframe>
        </div>
        <div className="col-md-2"></div>
        <div className="row al-mt-40">
          <div className="col-md-12">
            <div className="course-block display-flex d-flex-c d-flex-col" style={{height: "100%"}}>
              <div className="intro-course-block-content">
                <LessonBlockHeader logo={noteBook} header={"Script"}/>
                <p>
                  {dataPack.script}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="row al-mt-20 al-mb-40 ">
            <div className="col-md-3 col-sm-6">
              <div className="course-block display-flex d-flex-c d-flex-col">
                <LessonBlockHeader logo={penPaper} header={"Notepad"}/>
                <textarea className="notepad-textarea" name="notepad" rows="5"></textarea>
              </div>
            </div>
            <div className="col-md-6 col-sm-6 interactive-block">
              <div className="course-block display-flex d-flex-fs d-flex-col">
                <LessonBlockHeader logo={noteBook} header={"Playground"}/>
                <span className="al-mt-20">No interactive element is available for this module.</span>
              </div>
            </div>
            <div className="col-md-3 col-sm-12 credit-block">
              <div className="course-block display-flex d-flex-fs d-flex-col">
                <LessonBlockHeader logo={openBookmark} header={"Credits & Info"}/>
                <span className="al-mt-20">{dataPack.creditandinfo}</span>
              </div>
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
  console.log("module data", data);
  return (
    <Layout>
      <ModulePageTemplate data={data}/>
    </Layout>
  );
};

export const LessonBlockHeader = ({logo, header}) => {
  return (
    <div className="display-flex d-flex-fs d-flex-row">
      <img src={logo} style={{marginTop: 0}}/>
      <div className="display-flex d-flex-c d-flex-row" style={{marginTop: 0, marginLeft: "7px"}}>
        <h2 style={{marginTop: "7px", fontSize: "20px", fontWeight: "bold"}}>
          {header}
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
        script
        creditandinfo
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