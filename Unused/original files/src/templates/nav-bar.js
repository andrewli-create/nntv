import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import Content, { HTMLContent } from "../components/Content";

// eslint-disable-next-line
export const NavBarTemplate = ({ }) => {
  return (
    <>
    </>
  );
};

const NavBar = ({}) => {

  return (
    <>
      <h1>Hello</h1>
    </>
  );
};

NavBar.propTypes = {
  data: PropTypes.object.isRequired,
};

export default NavBar;
