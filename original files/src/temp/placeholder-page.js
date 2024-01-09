import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import Content, { HTMLContent } from "../components/Content";
import { Placeholder } from "gatsby-plugin-image";

// eslint-disable-next-line
export const AboutPageTemplate = ({ title, content, contentComponent }) => {
  const PageContent = contentComponent || Content;
  return (
    <>
    </>
  );
};

export default PlaceholderPage;
