import React from 'react'
import PropTypes from 'prop-types'
import { IndexPageTemplate } from '../../templates/index-page'

const IndexPagePreview = ({ entry, getAsset }) => {
  
  const data = entry.getIn(['data']).toJS()
  const frontmatter = structuredClone(data);
  const dataReform = {
    markdownRemark:{
      frontmatter
  }};
  // console.log("STH", dataReform);
  if (dataReform) {
    return (
      <IndexPageTemplate data={dataReform}/>
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

export default IndexPagePreview
