import React from "react";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link, graphql } from "gatsby";
import { getImage } from "gatsby-plugin-image";
import Img from "gatsby-image"

import Layout from "../components/Layout";
import Features from "../components/Features";
import BlogRoll from "../components/BlogRoll";
import FullWidthImage from "../components/FullWidthImage";
import 'bootstrap/dist/css/bootstrap.min.css';
import pianoTopView from '../../static/img/grand-piano-top-view.png'
import { register } from 'swiper/element/bundle';
import 'swiper/element/css/autoplay';
import SafeImg from "../components/utils/SafeImg"
import ReactPlayer from "react-player";
import AOS from 'aos';
import 'aos/dist/aos.css';
import speakerOn from "../img/speaker_on.svg"
import speakerOff from "../img/speaker_off.svg"

register();

// import { useEffect } from 'react';
// eslint-disable-next-line
export const IndexPageTemplate = ({data, preview}) => {
  const [stopSwiper, setStopSwiper] = useState(0);
  const [muteVideo, setMuteVideo] = useState(true);
  const swiperRef = useRef(null)

  useEffect(() => {
    AOS.init();
  }, [])
  console.log("index preview", preview);
  // console.log(data.markdownRemark.frontmatter.title);
  console.log("front-matter", data.markdownRemark.frontmatter.keywords[0].word);
  console.log("data.markdownRemark.frontmatter.homeslider", data.markdownRemark.frontmatter.homeslider)
  return (
    // <div className="text-css">
    //   {data.markdownRemark.frontmatter.title}
    // </div>
    <>
      <div className="container-fluid vertical-white-space-top al-no-pad-horizonal">
        <section className="section-center al-mt-40" >
          <div className="row">
            <div className="col-md-6 d-flex-col d-flex d-flex-c index-intro-block"  data-aos="fade-right">
              <h1 className="al-title-text font-report-regular">{data.markdownRemark.frontmatter.title}</h1>
              <p>
                {data.markdownRemark.frontmatter.heading == " " ? <></> : <>{data.markdownRemark.frontmatter.heading}<br/></>}
                <span className="al-italic">
                  {data.markdownRemark.frontmatter.tagline}
                </span>
              </p>
                <button className="button-generic" style={{marginTop: "20px"}}>
                  <a href="/course/introduction-to-music-technology-101" style={{color: "black"}}>
                    Course
                  </a>
                </button>
              
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="display-flex d-flex-sb">
                <div className="placeholder-block al-round-border" style={{height: "300px", width: "100%"}}>
                  {/* <img className="deco-image" src={pianoTopView}/> */}
                  {preview == true ?
                    <div style={{height: "100%"}} className="display-flex d-flex-c d-flex-col">
                      <h2 style={{textAlign: "center", height: "20px"}}>Slider is not visible in preview</h2>
                    </div>
                    :
                    <swiper-container ref={swiperRef} class="al-round-border" style={{overflow: "hidden", height: "100%"}} autoplay={stopSwiper == 1 ? "false" : "true"} loop="true" autoplay-delay="5000">
                      {data.markdownRemark.frontmatter.homeslider
                        ? (data.markdownRemark.frontmatter.homeslider.map((slide, index) => (
                          <swiper-slide>
                            {/* <img className="deco-image" src={pianoTopView}/> */}
                            {/* <img className="deco-image" src={slide.slideimage.childImageSharp.gatsbyImageData.images.fallback.src}/> */}
                            {/* {console.log("slide.slideimage", slide.slideimage)} */}
                            {slide.slideimage ? 
                              <SafeImg inputObj={slide.slideimage} imageHeight={"100%"}/>
                              : 
                              slide.slidevideolink ?
                              <>
                                <div className="swiper-video-wrapper" style={{position: "relative", height: "100%", width: " 100%", overflow: "hidden"}} onMouseEnter={() => swiperRef.current.swiper.autoplay.stop()} onMouseLeave={() => swiperRef.current.swiper.autoplay.start()}>
                                  <span style={{position: "absolute", bottom: 0, left: "10px", zIndex: 1, color: "white", fontSize: "10px"}}>Stay hovering to continue watching</span>
                                  {muteVideo ?
                                    <img onClick={() => setMuteVideo(!muteVideo)} style={{opacity: "0.5", cursor: "pointer", borderRadius: "10px", background: "rgba(0, 0, 0, 0.5)", position: "absolute", bottom: "15px", right: "10px", zIndex: 1, width: "35px", height: "35px"}} className="deco-image" src={speakerOff}/>
                                    : 
                                    <img onClick={() => setMuteVideo(!muteVideo)} style={{opacity: "0.5", cursor: "pointer", borderRadius: "10px", background: "rgba(0, 0, 0, 0.5)", position: "absolute", bottom: "15px", right: "10px", zIndex: 1, width: "35px", height: "35px"}} className="deco-image" src={speakerOn}/>
                                  }
                                  <div style={{height: "150%", transform: "translateY(-16.75%) scale(1.25)", pointerEvents: "none"}}>
                                    <ReactPlayer
                                      url={slide.slidevideolink}
                                      playing={true}
                                      width={"100%"}
                                      height={"100%"}
                                      muted={muteVideo}
                                      controls={false}
                                      config={{
                                        youtube: {
                                          playerVars: { modestbranding: 1, disablekb: 0, loop: 1, showinfo: 0 }
                                        }
                                      }}
                                    /> 
                                  </div>
                                </div>
                              </>
                                : 
                              <></>
                            }
                            {/* <span>{slide}</span> */}
                          </swiper-slide>
                        )))
                        : null
                      }
                    </swiper-container>
                  }
                  {/* <video width="100%" height="100%" controls >
                    <source src={data.markdownRemark.frontmatter.movie.publicURL} type="video/mp4"/>
                  </video> */}
                </div>
                {/* backgroundImage: `url(${pianoTopView})`} */}
                {/* <div className="placeholder-block al-round-border" style={{height: "500px", width: "25%"}}>
                  <img className="deco-image" style={{transform: "scale(1.2)"}} src={pianoTopView}/>
                </div> */}
              </div>
            </div>
          </div>
        </section>
        <section className="yellow-bar al-mt-40">
          <div className="section-center" style={{paddingLeft: "0px", paddingRight: "0px"}}>
            <div className="row vertical-white-space-large mobile-side-padding">
              {/* <div className="col-md-6 d-flex-row d-flex d-flex-sb value-wrapper"> */}
              <div className="col-md-6 d-flex-row d-flex d-flex-sb value-wrapper">
              {data.markdownRemark.frontmatter.keywords
                ? (data.markdownRemark.frontmatter.keywords.map((keyword, index) => (
                  <div className="keyword-box" style={{position: "relative", overflow: "hidden"}}>
                    <div style={{position: "absolute", height: "100%", width: "100%", opacity: 0.15, filter: "blur(0px)"}}>
                      <SafeImg inputObj={keyword.wordimage} imageHeight={"100%"}/>
                    </div>
                    <h6 style={{zIndex: 1, fontWeight: "bold"}}>{keyword.word}</h6>
                  </div>
                )))
                : null
              }
              </div>
              <div className="col-md-1"></div>
              <div className="col-md-5">
                <h2 className="welcome-to-nntv font-report-regular">{data.markdownRemark.frontmatter.yellowtitle}</h2>
                <p>{data.markdownRemark.frontmatter.yellowparagraph}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

const IndexPage = ({ data }) => {
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
      <IndexPageTemplate data={data}/>
    </Layout>
  );
};


export default IndexPage;

export const pageQuery = graphql`
  query IndexPageTemplate {
    markdownRemark(frontmatter: {templateKey: {eq: "index-page"}}) {
      frontmatter {
        title
        tagline
        homeslider {
          slideimage {
            childImageSharp {
              gatsbyImageData(
                quality: 100
                placeholder: NONE
                height: 200
              )
              fluid (maxWidth:500, quality:50){
                src
                srcSet
                aspectRatio
                sizes
                base64
              }
            }
          }
          slidevideolink
        }
        heading
        tagline
        keywords {
          word
          wordimage {
            childImageSharp {
              gatsbyImageData(
                quality: 100
                placeholder: NONE
                height: 200
              )
              fluid (maxWidth:500, quality:50){
                src
                srcSet
                aspectRatio
                sizes
                base64
              }
            }
          }
        }
        yellowtitle
        yellowparagraph
      }
    }
  }`;

// {item.subNavItem
//   ? (item.subNavItem.map((itemInner, index) => (
//     <li className="sub-navbar-item">
//       <Link className="d-flex d-flex-c d-flex-col" to={item.subPageURL}>
//         {itemInner.subPageName}
//       </Link>
//     </li>
//   )))
//   : null
// }