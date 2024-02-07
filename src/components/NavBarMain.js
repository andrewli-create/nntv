import React, { useState, useEffect } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import github from "../img/github-icon.svg";
import logo from "../img/logo.svg";
import nntvLogo from "../img/nntv-logo.svg";
import { GatsbyImage, getImage, StaticImage} from "gatsby-plugin-image"
import $ from 'jquery';
// title: { eq:"NavBar, Branding" }

const NavBarMain = ({data}) => {
  const [isActive, setIsActive] = useState(false);
  console.log("nav-data-full", data);
  console.log(data.allMarkdownRemark.edges[0].node.frontmatter.navItem);
  const navItem = data.allMarkdownRemark.edges[0].node.frontmatter.navItem;
  const brandLogoAlt = data.allMarkdownRemark.edges[0].node.frontmatter.brandImageAlt;
  const navBarColor = data.allMarkdownRemark.edges[0].node.frontmatter.navBarColor;
  // const brandLogo = data.allMarkdownRemark.edges[1].node.frontmatter.logoImage.childImageSharp.gatsbyImageData.images.fallback.src;
  const brandLogo = data.allMarkdownRemark.edges[0].node.frontmatter.brandImage;
  console.log(brandLogo);
  // console.log("data", data);
  useEffect(() => {
    $( "html" ).on( "mouseenter", ".navbar-item", function() {
      $(this).find("ul").fadeIn();
    });
    $( "html" ).on( "mouseleave", ".navbar-item", function() {
      $(".navbar-item").find("ul").fadeOut();
    });
  }, [])

  return (
    <nav
      className="navbar is-transparent"
      role="navigation"
      aria-label="main-navigation"
      style={{backgroundColor: navBarColor}}
    >
      <div className="nav-main-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item no-padding display-flex d-flex-c d-flex-col" title="Logo">
            {/* {check of image is a link or object} */}
            {typeof brandLogo == "string" ? 
              <img className="obj-fit-contain" src={brandLogo} alt={brandLogoAlt} style={{ width: "88px" }} /> 
              : 
              <GatsbyImage image={getImage(brandLogo)} alt={brandLogoAlt}/>
            }
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
            item.navItemToggle ? (
                <li key={index} className="navbar-item">
                  <Link className="navbar-item-link d-flex d-flex-c d-flex-col" to={item.pageURL}>
                    {item.pageName}
                  </Link>
                  {item.subNavItem ? 
                    (
                      <ul className="sub-navbar display-none preview-hover">
                        {item.subNavItem
                          ? (item.subNavItem.map((itemInner, index) => (
                            <li className="sub-navbar-item">
                              <Link className="d-flex d-flex-c d-flex-col" to={item.subPageURL}>
                                {itemInner.subPageName}
                              </Link>
                            </li>
                          )))
                          : null
                        }
                      </ul>
                    )
                    : 
                    null
                  }
                </li>
              )
            : null
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

export default NavBarMain;