import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import Content, { HTMLContent } from "../components/Content";
import Compression from "../components/Compression"
import Delay from "../components/Delay"
import { useState, useEffect, useCallback } from "react";

// eslint-disable-next-line
export const BetaPageTemplate = ({data}) => {
  const [pw, setPw] = useState("");
  const [correct, setCorrect] = useState(false);
  const [msg, setMsg] = useState(false);

  const handleChange = (event) => {
    const value = event.target.value;
    setPw(value);
  };

  const checkPw = () => {
    if (pw == "nntv2025") {
      console.log("correct");
      setCorrect(true);
    } else {
      console.log("wrong");
      setMsg(true);
    }
  };

  return (
    <section className="section">
      {
        correct ? 
          <div className="container" style={{textAlign: "center"}}>
            <h1>This page is intended for beta testing</h1>
            <br/><br/>
            <Delay/>
          </div> 
          : 
          <div className="beta-cover-up">
            <h1>This page is intended for beta testing</h1>
            <p>Please enter the password to access the testing page</p>
            <br/><br/>
            <input type="text" onChange={handleChange} value={pw} />
            <button style={{background: "none", border: "1px grey solid", paddingLeft: 20, paddingRight: 20}} onClick={checkPw}>Submit</button>
            <br/><br/>
            {
              msg ?
              <p>Password incorrect, please try again.</p>
              :
              <></>
            }
          </div>
      }
    </section>
  );
};

const AboutPage = ({ data }) => {
  const { markdownRemark: post } = data;

  return (
    <Layout>
      <BetaPageTemplate data={data} />
    </Layout>
  );
};

AboutPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default AboutPage;

export const aboutPageQuery = graphql`
  query BetaPage($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
      }
    }
  }
`;
