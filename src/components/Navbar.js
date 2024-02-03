import React, { useState } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import github from "../img/github-icon.svg";
import logo from "../img/logo.svg";
import nntvLogo from "../img/nntv-logo.svg";
import { GatsbyImage, getImage, StaticImage} from "gatsby-plugin-image"
// title: { eq:"NavBar, Branding" }

const Navbar = ({insertData}) => {
  const [isActive, setIsActive] = useState(false);
  var data = useStaticQuery(graphql`
    query navBarQuery {
      allMarkdownRemark(
        filter: {
          frontmatter: {
            title: { in: ["NavBar", "Branding"] }
          }
        }
      ) {
        edges {
          node {
            id
            frontmatter {
              navItem {
                pageName
                pageURL
              }
              logoImage {
                childImageSharp {
                  gatsbyImageData(
                    quality: 100
                    placeholder: NONE
                    width: 200
                  )
                }
              }
            }
          }
        }
      }
    }`
  )
  
  if (!data) {
    data = insertData;
  }

  console.log("nav-data", data);
  console.log(data.allMarkdownRemark.edges[0].node.frontmatter.navItem);
  const navItem = data.allMarkdownRemark.edges[0].node.frontmatter.navItem;
  // const brandLogo = data.allMarkdownRemark.edges[1].node.frontmatter.logoImage.childImageSharp.gatsbyImageData.images.fallback.src;
  const brandLogo = data.allMarkdownRemark.edges[1].node.frontmatter.logoImage;
  console.log(brandLogo);
  // console.log("data", data);
  return (
    <nav
      className="navbar is-transparent"
      role="navigation"
      aria-label="main-navigation"
    >
      <div className="nav-main-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item" title="Logo">
            {/* <img src={brandLogo} alt="Kaldi" style={{ width: "88px" }} /> */}
            <GatsbyImage image={getImage(brandLogo)}/>
          </Link>
          {/* Hamburger menu */}
          <h1></h1>
          <button
            className={`navbar-burger burger ${isActive && "is-active"}`}
            aria-expanded={isActive}
            onClick={() => setIsActive(!isActive)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <ul
          id="navMenu"
          // className={` navbar-start has-text-centered navbar-menu ${isActive && "is-active"}`}
          className={`nav-bar-link-wrapper ${isActive && "is-active"}`}
        >
          {/* TODO: inline override of padding is a result of refactoring to a ul for accessibilty purposes, would like to see a css re-write that makes this unneccesary.*/}
          {navItem.map((item, index) => (
            <li key={index} className="navbar-item" style={{ padding: "0px" }}>
              <Link className="navbar-item d-flex d-flex-c d-flex-col" to={item.pageURL}>
                {item.pageName}
              </Link>
            </li>
          ))}
          
        </ul>
        <div className={'nav-sign-up-button-wrapper'}>
          <button className={'nav-sign-up-button'}>
            <span>Sign Up</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

export const NavbarMirror = ({insertData}) => {
  const [isActive, setIsActive] = useState(false);
  
  console.log("nav-data", insertData);
  console.log(insertData.allMarkdownRemark.edges[0].node.frontmatter.navItem);
  const navItem = insertData.allMarkdownRemark.edges[0].node.frontmatter.navItem;
  // const brandLogo = data.allMarkdownRemark.edges[1].node.frontmatter.logoImage.childImageSharp.gatsbyImageData.images.fallback.src;
  const brandLogo = insertData.allMarkdownRemark.edges[1].node.frontmatter.logoImage;
  console.log(brandLogo);
  // console.log("data", data);
  return (
    <nav
      className="navbar is-transparent"
      role="navigation"
      aria-label="main-navigation"
    >
      <div className="nav-main-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item" title="Logo">
            {/* <img src={brandLogo} alt="Kaldi" style={{ width: "88px" }} /> */}
            <GatsbyImage image={getImage(brandLogo)}/>
          </Link>
          {/* Hamburger menu */}
          <h1></h1>
          <button
            className={`navbar-burger burger ${isActive && "is-active"}`}
            aria-expanded={isActive}
            onClick={() => setIsActive(!isActive)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <ul
          id="navMenu"
          // className={` navbar-start has-text-centered navbar-menu ${isActive && "is-active"}`}
          className={`nav-bar-link-wrapper ${isActive && "is-active"}`}
        >
          {/* TODO: inline override of padding is a result of refactoring to a ul for accessibilty purposes, would like to see a css re-write that makes this unneccesary.*/}
          {navItem.map((item, index) => (
            <li key={index} className="navbar-item" style={{ padding: "0px" }}>
              <Link className="navbar-item d-flex d-flex-c d-flex-col" to={item.pageURL}>
                {item.pageName}
              </Link>
            </li>
          ))}
          
        </ul>
        <div className={'nav-sign-up-button-wrapper'}>
          <button className={'nav-sign-up-button'}>
            <span>Sign Up</span>
          </button>
        </div>
      </div>
    </nav>
  );
};