import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import Content, { HTMLContent } from "../components/Content";
import UnderConstructionPageMain from './under-construction-main'

// eslint-disable-next-line
export const UnderConstructionPageTemplate = ({ data }) => {
  const header = data.allMarkdownRemark.edges[0].node.frontmatter.header;
  const subtext = data.allMarkdownRemark.edges[0].node.frontmatter.subtext;
  return (
    <UnderConstructionPageMain data={data}/>
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
