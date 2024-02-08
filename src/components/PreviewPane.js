import * as React from "react";
import "../style/bulma-style.sass";
import "../style/custom-style.sass";
import "../style/override-style.css";
import "../style/preview-pane-style.css";
import mobileIcon from "../../static/img/mobile_icon.svg";
import tabletIcon from "../../static/img/tablet_icon.svg";
import monitorIcon from "../../static/img/monitor_icon.svg";
import tvIcon from "../../static/img/tv_icon.svg";
import { useState, useEffect } from "react";
import $ from 'jquery';

const PreviewPane = ({ children }) => {
  const [activeButton, setActiveButton] = useState(1);
  useEffect(() => {
    $(".preview-hover").css("display", "block !important");
  }, [])
  // const [screenSize, setActiveButton] = useState(1);

  return (
    // className={`navbar-burger burger ${isActive && "is-active"}`}
    <>
      {/* <div className="preview-button-wrapper">
        <div className="preview-button-inner">
          <button className={`preview-responsive-button ${activeButton == 1 ? "preview-responsive-button-active" : ""}`} onClick={() => setActiveButton(1)}>
            <span>Auto</span>
          </button>
          <button className={`preview-responsive-button ${activeButton == 2 ? "preview-responsive-button-active" : ""}`} onClick={() => setActiveButton(2)}>
            <img src={mobileIcon}/>
          </button>
          <button className={`preview-responsive-button ${activeButton == 3 ? "preview-responsive-button-active" : ""}`} onClick={() => setActiveButton(3)}>
            <img src={tabletIcon}/>
          </button>
          <button className={`preview-responsive-button ${activeButton == 4 ? "preview-responsive-button-active" : ""}`} onClick={() => setActiveButton(4)}>
            <img src={monitorIcon}/>
          </button>
          <button className={`preview-responsive-button ${activeButton == 5 ? "preview-responsive-button-active" : ""}`} onClick={() => setActiveButton(5)}>
            <img src={tvIcon}/>
          </button>
        </div>  
      </div> */}
      <div>{children}</div>
    </>
  );
};

export default PreviewPane;
