import React from 'react'
import PropTypes from 'prop-types'
// import NavBar from '../../components/NavBar'
import PreviewPane from '../../components/PreviewPane'
import NavBarMain from "../../components/NavBarMain"
import FooterMain from "../../components/FooterMain"
import { useState } from "react";
import { Link } from "gatsby";
import { GatsbyImage, getImage} from "gatsby-plugin-image"

const FooterPreview = ({ entry, getAsset, fieldsMetaData }) => {
  const [isActive, setIsActive] = useState(false);
  const data = entry.getIn(['data']).toJS();
  const fields = fieldsMetaData.toJS();
  console.log("fields", fields);
  console.log("data nav", data);
  const frontmatter = structuredClone(data);
  console.log("raw frontmatter", frontmatter);
  var edges = [];
  edges[0] = {
    node:{
      frontmatter
    }
  }
  const dataReform = {
    allMarkdownRemark:{
      edges
    }
  };
  console.log("Footer Preview", dataReform);
  // console.log("nav-data", data);
  // console.log("data", data);
  
  return (
    <FooterMain data={dataReform}/>
  );
}

export default FooterPreview
