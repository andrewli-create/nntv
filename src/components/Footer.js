import * as React from "react";
import { useState, useEffect } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";

import logo from "../img/logo.svg";
import twitter from "../img/social/twitter.svg";
import vimeo from "../img/social/vimeo.svg";
import footerLogoLarge from "../img/footer_logo_large.png";
import call from "../img/call.svg";
import email from "../img/email.svg";
import facebook from "../img/facebook.svg";
import instagram from "../img/instagram.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../style/custom-style-css.css";
import "../style/al-style.css";
import FooterMain from "./FooterMain";

const Footer = () => {
  const data = useStaticQuery(graphql`
    query footerQuery {
      allMarkdownRemark(filter: {frontmatter: {title: {in: ["Footer"]}}}) {
        edges {
          node {
            id
            frontmatter {
              footercolor
              introductionblock {
                introductiontitle
                introductionparagraph
              }
              subscribeblock {
                subscribetitle
                placholdertext
                buttontext
              }
              contactblock {
                emailaddress
                phonenumber
              }
            }
          }
        }
      }
    }`
  )
  
  return (
    <FooterMain data={data}/>
  );
};

export default Footer;
