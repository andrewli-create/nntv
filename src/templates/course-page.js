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
import alarmClock from "../img/alarm_clock.svg";
import createChart from "../img/create_chart.svg";
import videoPlayerMovie from "../img/video_player_movie.svg";
import bookOpen from "../img/book_open.svg";
import wifi from "../img/wifi.svg"
import lightbulb from "../img/lightbulb.svg"
import checkmarks from "../img/checkmarks.svg"
import modules from "../img/modules.svg"
// import { useEffect } from 'react';
// eslint-disable-next-line
export const CoursePageTemplate = ({data}) => {
  // console.log(data.markdownRemark.frontmatter.title);
  console.log("all data", data);
  console.log("front-matter-Course", data.markdownRemark.frontmatter);
  var dataPack = data.markdownRemark.frontmatter;
  var lessonsPack;
  if (data.lessons) {
    console.log("front-matter-Course-lessons", data.lessons.nodes);
    lessonsPack = data.lessons.nodes;
  } else {
    // lessonsPack = dataPack.modules;
  }
  
  return (
    // <div className="text-css">
    //   {data.markdownRemark.frontmatter.title}
    // </div>
    <>
      <div className="container">
        <div className="row al-mt-20">
          <div className="col-md-7">
            <div className="course-block display-flex d-flex-c d-flex-col" style={{height: "100%"}}>
                <div className="intro-course-block-content">
                  <h2 style={{fontSize: "20px", fontWeight: "bold"}}>
                    {dataPack.title}
                  </h2>
                  <p>
                    {dataPack.introduction}
                  </p>
                  <a href="#modules">
                    <button className="button-generic">Start Now →</button>
                  </a>
                </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="course-block mobile-top-spacing" style={{padding: 0, overflow: "hidden"}}>
              <SafeImg inputObj={dataPack.coursethumbnail}/>
            </div>
          </div>
        </div>
        <div className="row al-mt-20">
          <div className="col-md-12">
            <div className="course-block element-block display-flex d-flex-c">
              <div className="display-flex d-flex-sb" style={{width: "90%"}}>
                <LessonElement logo={alarmClock} header={"Duration"} input={dataPack.duration} additionalText={" min"}/>
                <LessonElement logo={createChart} header={"Level"} input={dataPack.level} additionalText={""}/>
                <LessonElement logo={videoPlayerMovie} header={"Lessons"} input={dataPack.numberofmodules} additionalText={" Modules"}/>
                <LessonElement logo={bookOpen} header={"Resources"} input={dataPack.resources} additionalText={""}/>
                <LessonElement logo={wifi} header={"Access"} input={dataPack.Requireaccessto} additionalText={""}/>
              </div>
            </div>
          </div>
        </div>
        <div className="row al-mt-20">
          <div className="col-md-6">
            <div className="course-block block-min-300">
              <img src={lightbulb}/>
              <h5>About</h5>
              <p>{dataPack.about}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="course-block mobile-top-spacing block-min-300">
              <img src={checkmarks}/>
              <h5>Outcomes</h5>
              <p>{dataPack.outcomes}</p>
            </div>
          </div>
        </div>
        <div id="modules" className="row al-mt-20">
          <div className="col-md-12">
            <div className="course-block">
              <img src={modules}/>
              <h5>Modules</h5>
              <hr/>
              <section>
                <div className="row">
                  {lessonsPack
                    ? (lessonsPack.map((lesson, index) => (
                      <div className="col-md-4 col-sm-6">
                        <a href={"/module/" + lesson.frontmatter.title.replace(/ /g,"-").toLowerCase()}>
                          <div className="video-block">
                            <SafeImg inputObj={lesson.frontmatter.videothumbnail}/>
                            <div className="video-overlay"></div>
                            <h6 className="module-title">{("0" + (index + 1)).slice(-2) + " - "}{lesson.frontmatter.title}</h6>
                            {/* <iframe style={{width: "100%"}} src={module.videolink + '?frameborder="0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen'}></iframe> */}
                            {/* <iframe style={{width: "100%"}} src={module.videolink + '?modestbranding=1&autohide=1&showinfo=0&controls=0'}></iframe> */}
                            
                            {/* {console.log("LOG", module.videothumbnail.childImageSharp.gatsbyImageData.images.fallback.src)} */}
                            {/* <img src={module.videothumbnail.childImageSharp.gatsbyImageData.images.fallback.src}/> */}
                          </div>
                        </a>
                      </div>
                    )))
                    : <h5>No modules are currently available.</h5>
                  }
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const LessonElement = ({logo, header, input, additionalText}) => {
  return (
    <div className="course-element display-flex d-flex-sb d-flex-row">
      <div className="course-element-icon display-flex d-flex-row d-flex-c ">
        <img src={logo}/>
      </div>
      <div className="course-element-info-wrapper">
        <h6>{header}</h6>
        <span>{input}{additionalText}</span>
      </div>
    </div>
  );
};

const CoursePage = ({ data }) => {
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
  // console.log("index data", data);
  return (
    <Layout>
      <CoursePageTemplate data={data}/>
    </Layout>
  );
};


export default CoursePage;

export const pageQuery = graphql`
  query CourseByID($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      frontmatter {
        title
        introduction
        duration
        level
        numberofmodules
        resources
        Requireaccessto
        about
        outcomes
        coursethumbnail {
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
    lessons: allMarkdownRemark(filter: {frontmatter: {templateKey: {eq: "module-page"}}}) {
      nodes {
        frontmatter {
          title
          videolink
          videothumbnail  {
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
  }
`;