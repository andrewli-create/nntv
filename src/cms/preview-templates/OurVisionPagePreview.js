import React from 'react'
import PropTypes from 'prop-types'
import { OurVisionPageTemplate } from '../../templates/our-vision-page'

const OurVisionPagePreview = ({ entry, getAsset }) => {
  
  const data = entry.getIn(['data']).toJS()
  const frontmatter = structuredClone(data);
  const dataReform = {
    markdownRemark:{
      frontmatter
  }};
  console.log("STH Vision", dataReform);
  if (dataReform) {
    return (
      <OurVisionPageTemplate data={dataReform}/>
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

export default OurVisionPagePreview
