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
// import { useEffect } from 'react';
// eslint-disable-next-line
export const IndexPageTemplate = ({data}) => {
  // console.log(data.markdownRemark.frontmatter.title);
  console.log("front-matter", data.markdownRemark.frontmatter.keywords[0].word);
  return (
    // <div className="text-css">
    //   {data.markdownRemark.frontmatter.title}
    // </div>
    <>
      <div className="container-fluid vertical-white-space-top al-no-pad-horizonal">
        <section className="section-center al-mt-40">
          <div className="row">
            <div className="col-md-6 d-flex-col d-flex d-flex-c">
              <h1 className="al-title-text">No Need to Vanish</h1>
              <p>
                Beyond Boundaries<br/>
                <span className="al-italic">
                  Inspiring the Next Wave of Musical Visionaries
                </span>
              </p>
              <button className="button-generic">
                Course
              </button>
            </div>
            <div className="col-md-6">
              <div className="display-flex d-flex-sb">
                <div className="placeholder-block al-round-border" style={{height: "500px", width: "70%"}}>
                  <img className="deco-image" src={pianoTopView}/>
                </div>
                {/* backgroundImage: `url(${pianoTopView})`} */}
                <div className="placeholder-block al-round-border" style={{height: "500px", width: "25%"}}>
                  <img className="deco-image" style={{transform: "scale(1.2)"}} src={pianoTopView}/>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="yellow-bar al-mt-40">
          <div className="section-center">
            <div className="row vertical-white-space-large">
              <div className="col-md-6 d-flex-row d-flex d-flex-sb">
              {data.markdownRemark.frontmatter.keywords
                ? (data.markdownRemark.frontmatter.keywords.map((keyword, index) => (
                  <div className="keyword-box">
                    {keyword.word}
                  </div>
                )))
                : null
              }
              </div>
              <div className="col-md-1"></div>
              <div className="col-md-5">
                <h2>{data.markdownRemark.frontmatter.yellowtitle}</h2>
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
    markdownRemark(frontmatter: { templateKey: { eq: "index-page" } }) {
      frontmatter {
        title
        image {
          childImageSharp {
            gatsbyImageData(quality: 100, layout: FULL_WIDTH)
          }
        }
        heading
        subheading
        mainpitch {
          title
          description
        }
        description
        intro {
          blurbs {
            image {
              childImageSharp {
                gatsbyImageData(width: 240, quality: 64, layout: CONSTRAINED)
              }
            }
            text
          }
          heading
          description
        }
        keywords {
          word
        }
        yellowtitle
        yellowparagraph
      }
    }
  }
`;

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