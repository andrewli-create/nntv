import * as React from "react";
import { Helmet } from "react-helmet";
import Footer from "../components/Footer";
import NavBar from "./Navbar";
import "../style/bulma-style.sass";
import "../style/custom-style.sass";
import useSiteMetadata from "./SiteMetadata";
import { withPrefix, graphql, useStaticQuery } from "gatsby";
import "../style/override-style.css";
import "../style/custom-style-css.css";
import "../style/al-style.css";

const TemplateWrapper = ({ children }) => {
  const { title, description } = useSiteMetadata();
  const data = useStaticQuery(graphql`
    query brandingQuery {
      allMarkdownRemark(
        filter: {
          frontmatter: {
            title: { in: ["SEO"] }
          }
        }
      ) {
        edges {
          node {
            id
            frontmatter {
              faviconColor
              siteTitle
              siteDescription
            }
          }
        }
      }
    }`
  )

  console.log("branding", data.allMarkdownRemark.edges[0]);
  const faviconColor = data.allMarkdownRemark.edges[0].node.frontmatter.faviconColor;
  const siteTitle = data.allMarkdownRemark.edges[0].node.frontmatter.siteTitle;
  const siteDescription = data.allMarkdownRemark.edges[0].node.frontmatter.siteDescription;
  return (
    <div className="page-wrapper">
      <Helmet>
        <html lang="en" />
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${withPrefix("/")}img/apple-touch-icon.png`}
        />
        <link
          rel="icon"
          type="image/png"
          href={`${withPrefix("/")}img/favicon-32x32.png`}
          sizes="32x32"
        />
        <link
          rel="icon"
          type="image/png"
          href={`${withPrefix("/")}img/favicon-16x16.png`}
          sizes="16x16"
        />

        <link
          rel="mask-icon"
          href={`${withPrefix("/")}img/safari-pinned-tab.svg`}
          // color="#ff4400"
          color={faviconColor}
        />
        <meta name="theme-color" content="#fff" />

        <meta property="og:type" content="business.business" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:url" content="/" />
        <meta
          property="og:image"
          content={`${withPrefix("/")}img/og-image.jpg`}
        />
        <script type="text/javascript" src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
      </Helmet>
      <NavBar />
      <div>{children}</div>
      <Footer />
    </div>
  );
};

export default TemplateWrapper;
