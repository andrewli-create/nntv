import React, { useState, useEffect } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import { GatsbyImage, getImage, StaticImage} from "gatsby-plugin-image"
import $ from 'jquery';
import Img from "gatsby-image"

const SafeImg = ({inputObj, inputAlt}) => {
  return (
    <>
        {inputObj ? 
            <>
                {typeof inputObj === 'object' ? 
                    <Img className="safe-img-obj" fluid={inputObj.childImageSharp.fluid}/>
                    : 
                    <img className="safe-img" src={inputObj}/>
                }
            </>
            :
            <></>
        }
    </> 
  );
};

export default SafeImg;