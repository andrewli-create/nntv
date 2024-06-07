import React, { useState, useEffect } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import { GatsbyImage, getImage, StaticImage} from "gatsby-plugin-image"
import $ from 'jquery';
import Img from "gatsby-image"

const SafeImg = ({inputObj, inputAlt, imageHeight, imagePosition}) => {
  // console.log("SafeImg Received: ", inputObj);
  console.log("imagePosition: ", imagePosition);
  if (!imagePosition) {
    imagePosition = "center"
  }
  return (
    <>
        {inputObj ? 
            <>
                {typeof inputObj === 'object' ? 
                    <>
                      {
                        imageHeight ?
                          <Img className="safe-img-obj" fluid={inputObj.childImageSharp.fluid} style={{height: imageHeight}}
                              imgStyle={{
                              objectPosition: imagePosition,
                            }}
                          />
                        :
                          <Img className="safe-img-obj" fluid={inputObj.childImageSharp.fluid} imgStyle={{
                              objectPosition: imagePosition,
                            }}
                          />
                      }
                    </>
                    : 
                    <>
                      {
                        imageHeight ?
                          <img className="safe-img" src={inputObj} style={{height: imageHeight, objectPosition: imagePosition}}/>
                        :
                          <img className="safe-img" src={inputObj} style={{objectPosition: imagePosition}}/>
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