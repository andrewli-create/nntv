import * as React from "react";
import Layout from "../components/Layout";

const NotFoundPage = () => (
  <Layout>
    {/* <div>
      <h1>NOT FOUND</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </div> */}
    <div className="display-flex d-flex-c d-flex-row" style={{minHeight: "60vh"}}>
      <div className="display-flex d-flex-c d-flex-col">
        <div style={{width: "100%", padding: "0 35px"}} className="display-flex d-flex-c d-flex-col">
          <h1 style={{marginBottom: "20px"}}>Sorry, the page you are looking for does not exist.</h1>
          <p style={{marginBottom: "20px"}}>Please check if the URL you typed is correct.</p>
          <a href="/">
            <button className="button-generic">Back to Home Page</button>
          </a>
        </div>
      </div>
    </div>
  </Layout>
);

export default NotFoundPage;
