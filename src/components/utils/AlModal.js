import React, { useState, useEffect } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import { GatsbyImage, getImage, StaticImage} from "gatsby-plugin-image"
import $ from 'jquery';
import Img from "gatsby-image"
import "../../style/al-style.css";
const AlModal = ({children, show, padding, backgroundColor, width, height, className}) => {

  return (
    <>
        {show ? 
            <div className="al-modal-backdrop">
                <div className={`al-modal-frame ${className}`} style={{padding: padding, backgroundColor: backgroundColor, width: width, height: height}}>
                    {children}
                </div>
            </div>
            :
            <></>
        }
    </>
  );
};

export default AlModal;