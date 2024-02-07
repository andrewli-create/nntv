import React, { useState } from "react";
import { Link, graphql, useStaticQuery } from "gatsby";
import github from "../img/github-icon.svg";
import logo from "../img/logo.svg";
import nntvLogo from "../img/nntv-logo.svg";
import { GatsbyImage, getImage, StaticImage} from "gatsby-plugin-image"
import NavBarMain from "./NavBarMain"
// title: { eq:"NavBar, Branding" }

const NavBar = () => {
  const [isActive, setIsActive] = useState(false);
  const data = useStaticQuery(graphql`
    query navBarQuery {
      allMarkdownRemark(
        filter: {
          frontmatter: {
            title: { in: ["NavBar"] }
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
                subNavItem {
                  subPageName
                  subPageURL
                }
                navItemToggle
              }
              brandImageAlt
              navBarColor
              brandImage {
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

  // navItem:
  // - pageName: Home
  //   pageURL: /
  //   subNavItemInstance:
  //     - subPageName: Home Sub
  //       subPageURL: /Home Sub
  //   navItemToggle: true
  console.log("nav-data-full", data);
  // console.log(data.allMarkdownRemark.edges[0].node.frontmatter.navItem);
  // const navItem = data.allMarkdownRemark.edges[0].node.frontmatter.navItem;
  // // const brandLogo = data.allMarkdownRemark.edges[1].node.frontmatter.logoImage.childImageSharp.gatsbyImageData.images.fallback.src;
  // const brandLogo = data.allMarkdownRemark.edges[0].node.frontmatter.brandImage;
  // const brandLogoAlt = data.allMarkdownRemark.edges[0].node.frontmatter.brandImageAlt;
  // console.log(brandLogo);
  // console.log("data", data);
  return (
    <NavBarMain data={data}/>
  );
};

export default NavBar;