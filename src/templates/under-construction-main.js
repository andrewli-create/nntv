import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import Content, { HTMLContent } from "../components/Content";

const UnderConstructionPageMain = ({ data }) => {
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

export default UnderConstructionPageMain;
