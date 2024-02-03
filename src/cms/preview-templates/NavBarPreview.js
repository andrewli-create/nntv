import React from 'react'
import PropTypes from 'prop-types'
import NavBar from '../../components/Navbar'
import NavBarMirror from '../../components/Navbar'

const NavBarPreview = ({ entry, getAsset }) => {
  const data = entry.getIn(['data']).toJS()
  console.log("data nav", data);
  const frontmatter = structuredClone(data);
  const dataReform = {
    markdownRemark:{
      frontmatter
  }};
  console.log("STH", dataReform);
  // if (dataReform) {
  //   return (
  //     <NavBar data={dataReform}/>
  //   )
  // } else {
  //   return <div>Loading...</div>
  // }
  return (
    // <h2>Hi</h2>
    <NavBarMirror insertData={dataReform}/>
    // <NavBar/>
  )
}

export default NavBarPreview
