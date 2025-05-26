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
import "swiper/css";
import "swiper/css/navigation";
import SafeImg from "../components/utils/SafeImg"
import ReactPlayer from "react-player";
import AOS from 'aos';
import 'aos/dist/aos.css';
import speakerOn from "../img/speaker_on.svg"
import speakerOff from "../img/speaker_off.svg"
import SLSLogo from "../img/SLS_Logo-Colour-Black.jpg"
import ACMLogo from "../img/ACM-U-of-T-Logo.png"
import ACCLogo from "../img/ACC-landscape-logo-pillars.png"

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
  // console.log("index preview", preview);
  // console.log(data.markdownRemark.frontmatter.title);
  // console.log("front-matter", data.markdownRemark.frontmatter.keywords[0].word);
  // console.log("data.markdownRemark.frontmatter.homeslider", data.markdownRemark.frontmatter.homeslider)
  return (
    // <div className="text-css">
    //   {data.markdownRemark.frontmatter.title}
    // </div>
    <>
      <section id="our-team" className="al-mt-40">
        <div className="display-flex d-flex-c" style={{marginTop: "85px", marginBottom: "35px"}}>
          <h1 className="al-text-align-c al-pos-r display-inline-block font-report-regular">{data.markdownRemark.frontmatter.mainheader}<span className="yellow-accent"></span></h1>
        </div>
        <div className="display-flex d-flex-c" style={{marginBottom: "55px"}}>
          <p className="al-text-align-c center-item-responsive">{data.markdownRemark.frontmatter.paragraph1}</p>
        </div>
        <hr style={{backgroundColor: "black", width: "70%", margin: "auto"}}/>
        <div className="display-flex d-flex-c" style={{marginTop: "85px", marginBottom: "25px"}}>
          <h1 className="al-text-align-c al-pos-r display-inline-block font-report-regular">Partners<span className="yellow-accent"></span></h1>
        </div>
        <div className="acknowledgement-block" style={{marginTop: 0, backgroundColor: "white"}}>
          {/* <div className="acknowledgement-block" style={{background: "linear-gradient(180deg, " + footerColor + " 0%, rgb(235, 235, 235 , 1) 10%)"}}> */}
          <div className="partner-section">
            <div className="display-flex d-flex-sa">
              <a href="https://www.soundlifescarborough.ca" target="_blank" style={{width: "100%", position: "relative", display: "inline-block", marginBottom: "10px"}}>
                <img className="cca-icon" src={SLSLogo}/>
              </a>
              <a href="https://www.utsc.utoronto.ca/acm/" target="_blank" style={{width: "100%", position: "relative", display: "inline-block", marginBottom: "10px"}}>
                <img className="cca-icon" src={ACMLogo}/>
              </a>
            </div>
            <div style={{clear: "both"}}></div>
            <p style={{marginBottom: 50}} className="al-text-align-c acknowledgement-text text-dark-blue"><a href="https://www.soundlifescarborough.ca" target="_blank">SoundLife Scarborough &#40;SLS&#41;</a> is the centre for music and community engagement at the
              University of Toronto Scarborough, and is dedicated to fostering healthy communities through participatory music-making.
            </p>
            <div className="display-flex d-flex-sa">
              <a href="https://www.soundlifescarborough.ca" target="_blank" style={{width: "100%", position: "relative", display: "inline-block", marginBottom: "10px"}}>
                <img className="cca-icon" src={ACCLogo}/>
              </a>
            </div>
            <div style={{clear: "both"}}></div>
            <p className="al-text-align-c acknowledgement-text text-dark-blue"><a href="https://auroraculturalcentre.ca" target="_blank">Aurora Cultural Centre &#40;ACC&#41;</a>
               &nbsp;is a partner of the town of Aurora, plays a leading role in the realization of their cultural objectives.
            </p>
          </div>
        </div>
        {/* <div className="display-flex d-flex-c" style={{marginBottom: "55px"}}>
          <p style={{fontWeight: "bold"}} className="al-text-align-c center-item-responsive">Coming Soon!</p>
        </div> */}
        {/* <div className="display-flex d-flex-c" style={{marginBottom: "100px"}}>
          <div className="center-item-responsive">
            <SafeImg inputObj={data.markdownRemark.frontmatter.heroimage}/>
            <div className="display-flex d-flex-fe">
              <span style={{fontSize: "10px", padding: "8px 5px 8px 10px", borderRadius: "0 0px 10px 20px", backgroundColor: "#FFBD12"}}>{data.markdownRemark.frontmatter.imagecredit}</span>
            </div>
          </div>
        </div> */}
        
      </section>
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
  query PartnersPageTemplate {
    markdownRemark(frontmatter: {templateKey: {eq: "partners-page"}}) {
      frontmatter {
        mainheader
        paragraph1
        heroimage {
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
        imagecredit
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