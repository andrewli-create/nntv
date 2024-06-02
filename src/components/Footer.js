import * as React from "react";
import { Link } from "gatsby";

import logo from "../img/logo.svg";
import twitter from "../img/social/twitter.svg";
import vimeo from "../img/social/vimeo.svg";
import footerLogoLarge from "../img/footer_logo_large.png";
import call from "../img/call.svg";
import email from "../img/email.svg";
import facebook from "../img/facebook.svg";
import instagram from "../img/instagram.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../style/custom-style-css.css";
import "../style/al-style.css";

function encode(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}

const Footer = () => {

  const [state, setState] = React.useState({})

  const handleChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
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
      })
      .catch((error) => alert(error))
  }
  
  return (
    <footer id="footer" className="footer has-background-black has-text-white-ter">
      <div className="container">
        <div className="row">
          <div className="col-md-4 col-sm-12">
            <div className="footer-block">
              <img className="footer-logo" style={{width: "80px", marginBottom: "40px"}} src={footerLogoLarge}/>
              <h5 className="footer-left-title">No Need to Vanish</h5>
              <p>
                Hi! We are team NNTV, a diverse collective of composers, musicians, and creators who provides an online learning source that is practical, accessible, and innovative.
              </p>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 sub-email-wrapper">
            <div className="sub-email-box display-flex d-flex-c d-flex-col footer-block">
              <h5 className="footer-center-title">Let's get in touch!</h5>
              <form 
                name="subscribe"
                method="post"
                action="/thanks/"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                className="sub-email-form display-flex d-flex-c"
              >
                <input type="hidden" name="form-name" value="subscribe" />
                <input className="sub-email-text-input" type="text" id="sub-email" name="sub-email" placeholder="Enter your email Address"/>
                <input className="button-generic sub-email-button" type="submit" value="Submit"/>
              </form> 
            </div>
          </div>
          <div className="col-md-4 col-sm-12">
            <div className="display-flex d-flex-c d-flex-col footer-block">
              <h5 className="footer-right-title">Contact</h5>
              <div className="contact-item-wrapper">
                <div className="contact-item display-flex d-flex-fe">
                  <img src={call} style={{marginRight: "15px"}}/>
                  <span>+1 &#40;647&#41; 525-5175</span>
                </div>
                <div className="contact-item display-flex d-flex-fe al-mt-10">
                  <img src={email} style={{marginRight: "15px"}}/>
                  <span>info@noneedtovanish.com</span>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
