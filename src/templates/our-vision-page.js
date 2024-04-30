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
// import { useEffect } from 'react';
// eslint-disable-next-line
export const OurVisionPageTemplate = ({data}) => {
  // console.log(data.markdownRemark.frontmatter.title);
  console.log("front-matter", data.markdownRemark.frontmatter);
  return (
    // <div className="text-css">
    //   {data.markdownRemark.frontmatter.title}
    // </div>
    <>
      <div className="container-fluid vertical-white-space-top al-no-pad-horizonal">
        <section className="section-center al-mt-40 al-mb-40">
          <div className="row al-pos-r">
            <div className="vision-background-block"></div>
            <div className="col-md-5">
              <div className="featured-img-wrapper">
                <Img fluid={data.markdownRemark.frontmatter.featuredimage.childImageSharp.fluid}/>
              </div>
            </div>
            <div className="col-md-1"></div>
            <div className="col-md-5" style={{zIndex: 1}}>
              <h1>{data.markdownRemark.frontmatter.title}</h1>
              <p>{data.markdownRemark.frontmatter.openingparagraph}</p>
              <p className="al-no-margin-b opening-tagline">{data.markdownRemark.frontmatter.openingtagline}</p>
            </div>
          </div>
        </section>
        <hr/>
        <section className="al-mt-40">
          <h1 className="al-text-align-c">{data.markdownRemark.frontmatter.secondarytitle}</h1>
          <p className="al-text-align-c">{data.markdownRemark.frontmatter.secondarytagline}</p>
          <div className="section-center">
            <div className="row vertical-white-space-large">
              {data.markdownRemark.frontmatter.values
                ? (data.markdownRemark.frontmatter.values.map((value, index) => (
                  <div className="col-md-3 col-sm-6">
                    <div className="value-card d-flex d-flex-col d-flex-sb">
                      <div>
                        <div className="value-img-wrapper">
                          <Img fluid={value.valueimage.childImageSharp.fluid}/>
                        </div>
                        <h6 className="al-mt-10">{value.valuetitle}</h6>
                      </div>
                      <span>{data.markdownRemark.frontmatter.seemoretext}</span>
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