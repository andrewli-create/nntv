import React, { useState, useEffect } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import { GatsbyImage, getImage, StaticImage} from "gatsby-plugin-image"
import $ from 'jquery';
import Img from "gatsby-image"

const SafeImg = ({inputObj, inputAlt, imageHeight}) => {
  console.log("SafeImg Received: ", inputObj);
  return (
    <>
        {inputObj ? 
            <>
                {typeof inputObj === 'object' ? 
                    <>
                      {
                        imageHeight ?
                          <Img className="safe-img-obj" fluid={inputObj.childImageSharp.fluid} style={{height: imageHeight}}/>
                        :
                          <Img className="safe-img-obj" fluid={inputObj.childImageSharp.fluid}/>
                      }
                    </>
                    : 
                    <>
                      {
                        imageHeight ?
                          <img className="safe-img" src={inputObj} style={{height: imageHeight}}/>
                        :
                          <img className="safe-img" src={inputObj} style={{height: imageHeight}}/>
                      }
                    </>
                    
                }
            </>
            :
            <></>
        }
    </> 
  );
};

export default SafeImg;