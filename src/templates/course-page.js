import React from "react";
import Markdown from 'react-markdown'
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
import linksIcon from "../img/links.svg"
import lightbulb from "../img/lightbulb.svg"
import checkmarks from "../img/checkmarks.svg"
import modules from "../img/modules.svg"
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// eslint-disable-next-line
export const CoursePageTemplate = ({data}) => {
  useEffect(() => {
    AOS.init({disable: 'mobile'});
  }, [])
  // console.log(data.markdownRemark.frontmatter.title);
  console.log("all data", data);
  console.log("front-matter-Course", data.markdownRemark.frontmatter);
  console.log("front-matter-Course-html", data.markdownRemark.html);
  var dataPack = data.markdownRemark.frontmatter;
  var lessonsPack;
  if (data.lessons) {
    console.log("front-matter-Course-lessons", data.lessons.nodes);
    lessonsPack = data.lessons.nodes;
    // lessonsPack = data.markdownRemark.frontmatter.modules;
  } else {
    // lessonsPack = dataPack.modules;
  }

  var displayModules = [];
  var hasModules = false;
  for (var i = 0; i < dataPack.modules.length; i++) {
    // displayModules.push(<span className='indent' key={i}>{dataPack.modules[i].lessons}</span>);
    for (var x = 0; x < data.lessons.nodes.length; x++) {
      console.log("check against", dataPack.modules[i].lessons + " | " + data.lessons.nodes[x].frontmatter.title)
      if (data.lessons.nodes[x].frontmatter.title == dataPack.modules[i].lessons) {
        hasModules = true;
        displayModules.push(
          <div className="col-md-4 col-sm-6 video-block-select-wrapper">
            <a href={"/module/" + data.lessons.nodes[x].frontmatter.title.replace(/ /g,"-").toLowerCase()}>
              <div className="video-block-select" data-aos="zoom-in">
                {dataPack.modules[i].displaynew == true ? <div className="new-icon"><span>NEW</span></div> : <></>}
                <SafeImg inputObj={data.lessons.nodes[x].frontmatter.videothumbnail}/>
                <div className="video-overlay">
                  <h6 className="module-title">{("0" + (i + 1)).slice(-2) + " - "}{data.lessons.nodes[x].frontmatter.title}</h6>
                </div>
              </div>
            </a>
          </div>
        );
      }
    }
  }

  if (!hasModules) {
    displayModules.push(<h5>No modules are currently available.</h5>);
  }
  
  return (
    // <div className="text-css">
    //   {data.markdownRemark.frontmatter.title}
    // </div>
    <>
      <div className="container">
        <div className="row al-mt-20">
          <div className="col-md-7">
            <div className="course-block display-flex d-flex-c d-flex-col" style={{height: "100%"}} data-aos="fade-right">
                <div className="intro-course-block-content al-pos-r">
                  <div className="video-frame-element" style={{width: "25px", height: "10px", right: 0, bottom: 0, backgroundColor: "rgb(85, 150, 255)"}}></div>
                  <div className="video-frame-element" style={{width: "10px", height: "25px", right: 0, bottom: 0, backgroundColor: "rgb(85, 150, 255)"}}></div>
                  <h2 className="al-pos-r" style={{fontSize: "20px", fontWeight: "bold", display: "inline-block"}}>
                    <div className="accent-underline"></div>
                    <span className="al-pos-r font-report-regular" style={{zIndex: 1}}>
                      {dataPack.title}
                    </span>
                  </h2>
                  <p>
                    {dataPack.introduction}
                  </p>
                  <a href="#modules">
                    <button className="button-generic button-accent">Start Now →</button>
                  </a>
                </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="course-block mobile-top-spacing" data-aos="fade-left" style={{padding: 0, overflow: "hidden"}}>
              <SafeImg inputObj={dataPack.coursethumbnail}/>
            </div>
          </div>
        </div>
        <div className="row al-mt-20">
          <div className="col-md-12">
            <div className="course-block element-block display-flex d-flex-c">
              <div className="display-flex d-flex-sb al-pos-r lesson-element-wrapper" style={{width: "90%"}}>
                <LessonElement logo={alarmClock} header={"Duration"} input={dataPack.duration} additionalText={" min"} aosData="fade-right" aosDuration={150}/>
                <LessonElement logo={createChart} header={"Level"} input={dataPack.level} additionalText={""} aosData="zoom-in" aosDuration={300}/>
                <LessonElement logo={videoPlayerMovie} header={"Lessons"} input={dataPack.numberofmodules} additionalText={" Modules"} aosData="zoom-in" aosDuration={450}/>
                <LessonElement logo={bookOpen} header={"Interviews"} input={dataPack.resources} additionalText={""} aosData="zoom-in" aosDuration={600}/>
                {/* <LessonElement logo={wifi} header={"Access"} input={dataPack.Requireaccessto} additionalText={""}/> */}
                <LessonElement logo={linksIcon} header={"Resources"} input={dataPack.Requireaccessto} additionalText={""} aosData="fade-left" aosDuration={750}/>
              </div>
            </div>
          </div>
        </div>
        <div className="row al-mt-20">
          <div className="col-md-6">
            <div className="course-block block-min-300">
              <img src={lightbulb}/>
              <h5 className="course-block-title">
                <div className="accent-underline"></div>
                <span className="al-pos-r" style={{zIndex: 1}}>
                  About
                </span>
              </h5>
              <Markdown>{dataPack.about}</Markdown>
            </div>
          </div>
          <div className="col-md-6">
            <div className="course-block mobile-top-spacing block-min-300" style={{height: "100%"}}>
              <img src={checkmarks}/>
              <h5 className="course-block-title">
                <div className="accent-underline"></div>
                <span className="al-pos-r" style={{zIndex: 1}}>
                  Outcome
                </span>
              </h5>
              {/* <p>{dataPack.outcomes}</p> */}
              {/* <div dangerouslySetInnerHTML={{ __html: dataPack.outcomes}} /> */}
              <Markdown>{dataPack.outcomes}</Markdown>
            </div>
          </div>
        </div>
        <div id="modules" className="row al-mt-20">
          <div className="col-md-12">
            <div className="course-block">
              <img src={modules}/>
              <h5 className="course-block-title">
                <div className="accent-underline"></div>
                <span className="al-pos-r" style={{zIndex: 1}}>
                  Modules
                </span>
              </h5>
              <hr/>
              <section>
                <div className="row">
                  {displayModules}
                  {/* {lessonsPack
                    ? (lessonsPack.map((lesson, index) => (
                      <>
                        {
                          ((dataPack.modules.find(e => e.lessons === lesson.frontmatter.title))) ?
                          <>
                            <div className="col-md-4 col-sm-6 video-block-select-wrapper">
                              <a href={"/module/" + lesson.frontmatter.title.replace(/ /g,"-").toLowerCase()}>
                                <div className="video-block-select">
                                  <SafeImg inputObj={lesson.frontmatter.videothumbnail}/>
                                  <div className="video-overlay"></div>
                                  <h6 className="module-title">{("0" + (index + 1)).slice(-2) + " - "}{lesson.frontmatter.title}</h6>
                                </div>
                              </a>
                            </div>
                          </>
                          :
                          <></>
                        }
                      </>
                      
                    )))
                    : <h5>No modules are currently available.</h5>
                  } */}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const LessonElement = ({logo, header, input, additionalText, aosData, aosDuration}) => {
  return (
    // <div className="course-element display-flex d-flex-c d-flex-row" data-aos={aosData} data-aos-duration={aosDuration}>
    <div className="course-element display-flex d-flex-c d-flex-row">
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
      html
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
        modules {
          lessons
          displaynew
        }
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