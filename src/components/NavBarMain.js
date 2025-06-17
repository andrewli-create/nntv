import React, { useState, useEffect } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import github from "../img/github-icon.svg";
import logo from "../img/logo.svg";
import nntvLogo from "../img/nntv-logo.svg";
import { GatsbyImage, getImage, StaticImage} from "gatsby-plugin-image"
import $ from 'jquery';
// title: { eq:"NavBar, Branding" }

const NavBarMain = ({data, preview}) => {
  const [isActive, setIsActive] = useState(false);
  // console.log("nav-data-full", data);
  // console.log(data.allMarkdownRemark.edges[0].node.frontmatter.navItem);
  const navItem = data.allMarkdownRemark.edges[0].node.frontmatter.navItem;
  const brandLogoAlt = data.allMarkdownRemark.edges[0].node.frontmatter.brandImageAlt;
  const navBarColor = data.allMarkdownRemark.edges[0].node.frontmatter.navBarColor;
  // const brandLogo = data.allMarkdownRemark.edges[1].node.frontmatter.logoImage.childImageSharp.gatsbyImageData.images.fallback.src;
  // const brandLogo = data.allMarkdownRemark.edges[0].node.frontmatter.brandImage;
  // const brandLogo = data.allMarkdownRemark.edges[0].node.frontmatter.brandImage.childImageSharp.gatsbyImageData.images.fallback.src;
  // console.log("brandLogo", data.allMarkdownRemark.edges[0].node.frontmatter.brandImage.childImageSharp.gatsbyImageData.images.fallback.src);
  var brandLogo;
  if (preview == 0) {
    brandLogo = data.allMarkdownRemark.edges[0].node.frontmatter.brandImage.childImageSharp.gatsbyImageData.images.fallback.src;
  } else {
    brandLogo = data.allMarkdownRemark.edges[0].node.frontmatter.brandImage;
  }
  
  // console.log("data", data);
  useEffect(() => {
    $( "html" ).on( "mouseenter", ".navbar-item", function() {
      $(this).find("ul").css("display", "block").removeClass("sub-navbar-hidden");
    });
    $( "html" ).on( "mouseleave", ".navbar-item", function() {
      $(".navbar-item").find("ul").css("display", "").addClass("sub-navbar-hidden");;
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
            {/* {typeof brandLogo == "string" ? 
              <img className="obj-fit-contain" src={brandLogo} alt={brandLogoAlt} style={{ width: "88px" }} /> 
              : 
              <GatsbyImage image={getImage(brandLogo)} alt={brandLogoAlt}/>
            } */}
            <img className="obj-fit-contain" src={brandLogo} alt={brandLogoAlt} style={{ width: "88px" }} /> 
          </Link>
          <ul
          id="navMenu-mobile"
          // className={` navbar-start has-text-centered navbar-menu ${isActive && "is-active"}`}
          className={`nav-bar-link-wrapper-mobile ${isActive && "is-active"}`}
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
                        <ul className="sub-navbar sub-navbar-hidden preview-hover">
                          {item.subNavItem
                            ? (item.subNavItem.map((itemInner, index) => (
                              <li className={itemInner.subPageName.length < 15 ? "sub-navbar-item" : "sub-navbar-item-wide"}>
                                <Link className="d-flex d-flex-c d-flex-col" to={itemInner.subPageURL}>
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
          className={`nav-bar-link-wrapper`}
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
                      <ul className="sub-navbar sub-navbar-hidden preview-hover">
                        {item.subNavItem
                          ? (item.subNavItem.map((itemInner, index) => (
                            <li className={itemInner.subPageName.length < 15 ? "sub-navbar-item" : "sub-navbar-item-wide"}>
                              <Link className="d-flex d-flex-c d-flex-col" to={itemInner.subPageURL}>
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
        <div className={'nav-sign-up-button-wrapper button-disable-appearance'}>
          <button className={'nav-sign-up-button'}>
            <span>Sign Up</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBarMain;