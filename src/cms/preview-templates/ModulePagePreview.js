import React from 'react'
import PropTypes from 'prop-types'
import { ModulePageTemplate } from '../../templates/module-page'
import SafeImg from "../../components/utils/SafeImg"

const ModulePagePreview = ({ entry, getAsset }) => {
  
  const data = entry.getIn(['data']).toJS()
  const frontmatter = structuredClone(data);
  const dataReform = {
    markdownRemark:{
      frontmatter
  }};
  console.log("RAW Datareform", data);
  console.log("Course Datareform", dataReform);
  var dataPack = dataReform.markdownRemark.frontmatter;
  var lessonsPack = dataPack.modules;
  console.log("lessonsPack", lessonsPack);
  if (dataReform) {
    return (
      // <CoursePageTemplate data={dataReform}/>
      <ModulePageTemplate data={dataReform}/>
    )
  } else {
    return <div>Loading...</div>
  }
}

// IndexPagePreview.propTypes = {
//   entry: PropTypes.shape({
//     getIn: PropTypes.func,
//   }),
//   getAsset: PropTypes.func,
// }

export default ModulePagePreview
