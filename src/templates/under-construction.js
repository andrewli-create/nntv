import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import Content, { HTMLContent } from "../components/Content";

// eslint-disable-next-line
export const UnderConstructionPageTemplate = ({ data }) => {
    const header = data.allMarkdownRemark.edges[0].node.frontmatter.header;
    const subtext = data.allMarkdownRemark.edges[0].node.frontmatter.subtext;
  return (
    <>
        <div className="container">
            <div className="row" style={{minHeight: "80vh"}}>
                <div className="col-12 d-flex d-flex-c d-flex-col">
                    <h1>{header}</h1>
                    <p>{subtext}</p>
                </div>
            </div>
        </div>
    </>
  );
};

const UnderConstructionPage = ({ data }) => {

  return (
    <Layout>
      <UnderConstructionPageTemplate data={data}/>
    </Layout>
  );
};

export default UnderConstructionPage;

export const underConstructionPageQuery = graphql`
query IndexPageTemplate {
  allMarkdownRemark(
    filter: {
      frontmatter: { templateKey: { eq: "under-construction" } }
    }
  ) {
    edges {
      node {
        id
        frontmatter {
          title
          templateKey
          path
          header
          subtext
        }
      }
    }
  }
}
`;
