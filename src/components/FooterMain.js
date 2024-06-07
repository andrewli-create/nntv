import * as React from "react";
import { useState, useEffect } from "react";
import call from "../img/call.svg";
import email from "../img/email.svg";
import facebook from "../img/facebook.svg";
import instagram from "../img/instagram.svg";
import patreon from "../img/patreon.svg";
import youtube from "../img/youtube.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../style/custom-style-css.css";
import "../style/al-style.css";
import CCALogo from "../img/CCA_RGB_colour_e.svg";

function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}

const FooterMain = ({data}) => {

  const [state, setState] = React.useState({})
  const [validEmail, setValidEmail] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  var dataPack = data.allMarkdownRemark.edges[0].node.frontmatter;
  var leftBlock = dataPack.introductionblock;
  var midBlock = dataPack.subscribeblock;
  var rightBlock = dataPack.contactblock;
  var footerColor = dataPack.footercolor;

  console.log("Footer Data", data);
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value })
    if (validateEmail(e.target.value)) {
      setValidEmail(true);
    } else {
      setValidEmail(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validEmail) {
      const form = e.target
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': form.getAttribute('name'),
          ...state,
        }),
      })
        .then(() => {
          // navigate(form.getAttribute('action'))
          alert("Thank you for signing up for our newsletter!");
          setFormSubmitted(true);
        })
        .catch((error) => alert(error))
    } else {
      alert("Please enter a valid email address.");
    }
    
  }
  
  return (
    <footer id="footer" className="footer al-white-text" style={{backgroundColor: footerColor, paddingBottom: "0 !important"}}>
      <div className="container">
        <div className="row">
          <div className="col-md-4 col-sm-12">
            <div className="footer-block">
              {/* <img className="footer-logo" style={{width: "80px", marginBottom: "40px"}} src={footerLogoLarge}/> */}
              <h5 className="footer-left-title">{leftBlock.introductiontitle}</h5>
              <p>
                {leftBlock.introductionparagraph}
              </p>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 sub-email-wrapper">
            <div className="sub-email-box display-flex d-flex-c d-flex-col footer-block">
              <h5 className="footer-center-title">{midBlock.subscribetitle}</h5>
              {formSubmitted ? 
                <></>
              :
                <form 
                  name="subscribe"
                  method="post"
                  action="/thanks/"
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="sub-email-form display-flex d-flex-c"
                >
                  <input type="hidden" name="form-name" value="subscribe" />
                  <input className="sub-email-text-input" type="text" id="sub-email" name="sub-email" placeholder={midBlock.placholdertext} onChange={handleChange}/>
                  {
                    formSubmitted ? <></> 
                    :
                    <input className={validEmail ? "button-generic sub-email-button" : "button-generic sub-email-button sub-email-button-disabled"} type="submit" value={midBlock.buttontext} disabled={!validEmail}/>
                  }
                </form>
              }
            </div>
          </div>
          <div className="col-md-4 col-sm-12">
            <div className="display-flex d-flex-c d-flex-col footer-block">
              <h5 className="footer-right-title">Contact</h5>
              <div className="contact-item-wrapper">
                <div className="contact-item display-flex d-flex-fe">
                  <img src={call} style={{marginRight: "15px"}}/>
                  {/* <span>+1 &#40;647&#41; 525-5175</span> */}
                  <span>{rightBlock.phonenumber}</span>
                </div>
                <div className="contact-item display-flex d-flex-fe al-mt-10">
                  <img src={email} style={{marginRight: "15px"}}/>
                  <span>{rightBlock.emailaddress}</span>
                </div>
              </div>
              <h5 className="footer-right-title" style={{marginTop: "15px"}}>Follow Us</h5>
              <div className="social-icon-wrapper">
                <a href="https://www.facebook.com/profile.php?id=61552730172533" target="_blank">
                  <img className="social-icon" src={facebook}/>
                </a>
                <a href="https://www.instagram.com/noneedtovanish/" target="_blank">
                  <img className="social-icon" src={instagram}/>
                </a>
                <a href="https://www.youtube.com/@NoNeedtoVanish" target="_blank">
                  <img className="social-icon" src={youtube}/>
                </a>
                <a href="https://www.instagram.com/noneedtovanish/" target="_blank">
                  <img className="social-icon" src={patreon}/>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="row">
          <div className="col-md-12" style={{textAlign: "center"}}>
            <div className="acknowledgement-block">
              <a href="https://canadacouncil.ca" target="_blank" style={{width: "100%", position: "relative", display: "inline-block", marginBottom: "10px"}}>
                <img className="cca-icon" src={CCALogo}/>
              </a>
              <div style={{clear: "both"}}></div>
              <p className="al-text-align-c acknowledgement-text">We acknowledge the support of the Canada Council for the Arts.</p>
              <p className="al-text-align-c acknowledgement-text">Visit <a href="canadacouncil.ca">canadacouncil.ca</a> to learn more.</p>
            </div>
          </div>
        </div> */}
      </div>
      <div>
        <div className="acknowledgement-block">
          {/* <div className="acknowledgement-block" style={{background: "linear-gradient(180deg, " + footerColor + " 0%, rgb(235, 235, 235 , 1) 10%)"}}> */}
          <a href="https://canadacouncil.ca" target="_blank" style={{width: "100%", position: "relative", display: "inline-block", marginBottom: "10px"}}>
            <img className="cca-icon" src={CCALogo}/>
          </a>
          <div style={{clear: "both"}}></div>
          <p className="al-text-align-c acknowledgement-text">We acknowledge the support of the Canada Council for the Arts. Visit <a href="canadacouncil.ca">canadacouncil.ca</a> to learn more.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterMain;
