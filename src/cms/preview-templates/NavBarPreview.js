import React from 'react'
import PropTypes from 'prop-types'
// import NavBar from '../../components/NavBar'
import PreviewPane from '../../components/PreviewPane'
import NavBarMain from "../../components/NavBarMain"
import { useState } from "react";
import { Link } from "gatsby";
import { GatsbyImage, getImage} from "gatsby-plugin-image"


const NavBarPreview = ({ entry, getAsset, fieldsMetaData }) => {
  const [isActive, setIsActive] = useState(false);
  const data = entry.getIn(['data']).toJS();
  const fields = fieldsMetaData.toJS();
  console.log("fields", fields);
  console.log("data nav", data);
  const frontmatter = structuredClone(data);
  const dataReform = {
    allMarkdownRemark:{
      edges:{
        0:{
          node:{
            frontmatter
          }
        }
      } 
    }
  };
  console.log("STH", dataReform);
  // console.log("nav-data", data);
  const navItem = data.navItem;
  const brandLogo = data.brandImage;
  // console.log("data", data);
  
  return (
    <PreviewPane>
      <NavBarMain data={dataReform}/>
    </PreviewPane>
  );
}

export default NavBarPreview
