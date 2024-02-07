import React from 'react'
import PropTypes from 'prop-types'
import UnderConstructionPageMain from '../../templates/under-construction-main'
import PreviewPane from '../../components/PreviewPane'
import NavBarMain from "../../components/NavBarMain"
import { useState } from "react";
import { Link } from "gatsby";
import { GatsbyImage, getImage} from "gatsby-plugin-image"


const UnderConstructionPagePreview = ({ entry, getAsset, fieldsMetaData }) => {
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
  return (
    <PreviewPane>
      <UnderConstructionPageMain data={dataReform}/>
    </PreviewPane>
  );
}

export default UnderConstructionPagePreview
