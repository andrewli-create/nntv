import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import Footer from "./Footer";
import NavBar from "./Navbar";
import "../style/bulma-style.sass";
import "../style/custom-style.sass";
import useSiteMetadata from "./SiteMetadata";
import { withPrefix, graphql, useStaticQuery } from "gatsby";
import "../style/override-style.css";
import "../style/custom-style-css.css";
import "../style/al-style.css";
import "../style/plugin-style.css";
import audioFile from "../../static/audio/Simple_Groove.mp3"
// import { Knob, Pointer, Value, Arc } from 'rc-knob'
import { Donut, Basic } from 'react-dial-knob'
import { Knob } from 'react-rotary-knob'
import s6 from './knobskins/s6';
import s6cus from './knobskins/s6cus';
import { BasisCurve, BundleCurve } from 'react-svg-curve';
import playIcon from '../img/play_icon_white.svg'
import pauseIcon from '../img/pause_icon_yellow.svg'
import bandIcon from '../img/band_icon.svg'

// import {KnobHeadless} from 'react-knob-headless';
 
function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

// window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context;
var source;
// var isPlaying = false;
var lowPass;

var band1;
var band2;
var band3;
var band4;
var band5;
var band6;


const audioPlayFunc = async (url, isPlaying) => {
  if (!isPlaying) {
    if (!source) {
      source = context.createBufferSource();
      // source.connect(lowPass);
      
      // source.connect(band3);
      // band3.connect(context.destination);
      source.loop = true;
      source.connect(band1);
      band2.connect(band3);
      band1.connect(band2);
      band2.connect(band3);
      band3.connect(band4);
      band4.connect(band5);
      band5.connect(band6);
      band6.connect(context.destination);
      // lowPass.connect(context.destination);
      // source.connect(context.destination);
      const audioBuffer = await fetch(url)
        .then(res => res.arrayBuffer())
        .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer))
        .then(source.start());
      console.log("Audio Buffer Loaded!", audioBuffer);
      source.buffer = audioBuffer;
      isPlaying = true;
      // EQ.setPlayingState(isPlaying);
    } else {
      source.start();
      isPlaying = true;
      // EQ.setPlayingState(isPlaying);
    }
  } else {
    if (source) {
      source.stop();
      source.disconnect(band1);
      source = null;
      isPlaying = false;
      // EQ.setPlayingState(isPlaying);
    }
  }
};

const eqAdjust = (value) => {
  lowPass.frequency.value = value;
}

// const togglePlay = (toggler) => {
//   console.log("source.buffer", source.buffer);
//   if (!isPlaying) {
//     source.start();
//     isPlaying = true;
//   } else {
//     source.stop();
//     isPlaying = false;
//   }
  
//   if (toggler == true) {
//     // source.start();
//   } else {
//     // source.stop();
//   }
// }

const EQ = ({ children }) => {

  const [activeFreqTag, setActiveFreqTag] = useState(1);
  const [activeFreqClassName, setActiveFreqClassName] = useState("eq-knob-wrapper eq-knob-wrapper-1");

  // const [activeBandStat1, setActiveBandStat1] = useState({ gain: 0, freq: 40,  q: 0.7, id: 1, minF: 0, maxF: 80 });
  // const [activeBandStat2, setActiveBandStat2] = useState({ gain: 0, freq: 125,  q: 0.7, id: 2, minF: 81, maxF: 350  });
  // const [activeBandStat3, setActiveBandStat3] = useState({ gain: 0, freq: 500,  q: 0.7, id: 3, minF: 351, maxF: 1000  });
  // const [activeBandStat4, setActiveBandStat4] = useState({ gain: 0, freq: 2000,  q: 0.7, id: 4, minF: 1001, maxF: 3000  });
  // const [activeBandStat5, setActiveBandStat5] = useState({ gain: 0, freq: 4000,  q: 0.7, id: 5, minF: 3001, maxF: 6000  });
  // const [activeBandStat6, setActiveBandStat6] = useState({ gain: 0, freq: 8000,  q: 0.7, id: 6, minF: 6001, maxF: 8500  });
  const [playingState, setPlayingState] = useState(false);
  const [activeBandStat1, setActiveBandStat1] = useState({ gain: 0, freq: 40,  q: 0.7, id: 1, minF: 0, maxF: 500 });
  // const [activeBandStat1, setActiveBandStat1] = useState({ gain: 0, freq: 40,  q: 0.7, id: 1, minF: 0, maxF: 9000 });
  const [activeBandStat2, setActiveBandStat2] = useState({ gain: 0, freq: 600,  q: 0.7, id: 2, minF: 501, maxF: 1000  });
  const [activeBandStat3, setActiveBandStat3] = useState({ gain: 0, freq: 2000,  q: 0.7, id: 3, minF: 1001, maxF: 3000  });
  const [activeBandStat4, setActiveBandStat4] = useState({ gain: 0, freq: 4000,  q: 0.7, id: 4, minF: 3001, maxF: 5000  });
  const [activeBandStat5, setActiveBandStat5] = useState({ gain: 0, freq: 6000,  q: 0.7, id: 5, minF: 5001, maxF: 7000  });
  const [activeBandStat6, setActiveBandStat6] = useState({ gain: 0, freq: 7500,  q: 0.7, id: 6, minF: 7001, maxF: 8500  });

  // const [activeBandStat1, setActiveBandStat1] = useState({ gain: 0, freq: 40,  q: 0.7, id: 1, minF: 0, maxF: 100 });
  // const [activeBandStat2, setActiveBandStat2] = useState({ gain: 0, freq: 600,  q: 0.7, id: 2, minF: 101, maxF: 250  });
  // const [activeBandStat3, setActiveBandStat3] = useState({ gain: 0, freq: 2000,  q: 0.7, id: 3, minF: 251, maxF: 1000  });
  // const [activeBandStat4, setActiveBandStat4] = useState({ gain: 0, freq: 4000,  q: 0.7, id: 4, minF: 1001, maxF: 2500  });
  // const [activeBandStat5, setActiveBandStat5] = useState({ gain: 0, freq: 6000,  q: 0.7, id: 5, minF: 2501, maxF: 4000  });
  // const [activeBandStat6, setActiveBandStat6] = useState({ gain: 0, freq: 7500,  q: 0.7, id: 6, minF: 4001, maxF: 9000  });


  const pluginScreenRef = useRef(null);
  const [pluginScreenRefWidth, setPluginScreenRefWidth] = useState("");
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });
  const [dimensionW, setDimensionW] = useState("");
  const [dimensionH, setDimensionH] = useState("");

  const [EQGW, setEQGraphWidth] = useState(0);
  const divRef = useRef(null)
  var eleWidth;
  const freqMin = 40;
  const freqMax = 8000;
  const gainMax = -20;
  const gainMin = 20;


  // curveUpdate(300, input, 40, 8000);

  //curve point update
  const cP = (screenSize, inputValue, minValue, maxValue) => {
    // var targetV = scale(inputValue, minValue, maxValue, 17, 83.5);
    var targetV = scale(inputValue, minValue, maxValue, 15, 85);
    var result = ptp(screenSize, targetV);
    return result
  }

  //curve point update interpolate
  const cPI = (screenSize, inputValue, minValue, maxValue) => {
    // var targetV = scale(inputValue, minValue, maxValue, 17, 83.5);
    var targetV = interpolate(inputValue, minValue, maxValue, 15, 85, 0.5);
    var result = ptp(screenSize, targetV);
    return result
  }

  const ptp = (parentPixelWidth, targetPercent) => {
    var pixelValue = (parentPixelWidth * (targetPercent / 100));
    return pixelValue
  }

  const handleResize = () => {
    eleWidth = document.getElementById('eq-screen').offsetWidth;
    // setDivWidth(divRef.current.offsetWidth);
    setEQGraphWidth(eleWidth);
    console.log("EQGraphWidth", EQGW);
    // console.log("divRef", divRef.current);
    // console.log("divWidth", divWidth);
    console.log("eleWidth", eleWidth);
  }

  useEffect(() => {

    context = new AudioContext();
    lowPass = context.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 880;
    lowPass.Q.value = 0.7;

    band1 = context.createBiquadFilter();
    band2 = context.createBiquadFilter();
    band3 = context.createBiquadFilter();
    band4 = context.createBiquadFilter();
    band5 = context.createBiquadFilter();
    band6 = context.createBiquadFilter();

    band1.type = "peaking";
    band2.type = "peaking";
    band3.type = "peaking";
    band4.type = "peaking";
    band5.type = "peaking";
    band6.type = "peaking";

    // setDivWidth(divRef.current.clientHeight)
    window.addEventListener("resize", handleResize);
    // console.log("divWidth", divWidth);
    eleWidth = document.getElementById('eq-screen').offsetWidth;
    setEQGraphWidth(eleWidth);
    // console.log("audioContextRef", audioContextRef);
    // console.log("audioRef", audioRef);
    // console.log("audioSourceRef", audioSourceRef);
    // console.log("lowPassRef", lowPassRef);
    band1.gain.value = activeBandStat1.gain;
    band1.frequency.value = activeBandStat1.freq;
    band1.Q.value = activeBandStat1.q;

    band2.gain.value = activeBandStat2.gain;
    band2.frequency.value = activeBandStat2.freq;
    band2.Q.value = activeBandStat2.q;

    band3.gain.value = activeBandStat3.gain;
    band3.frequency.value = activeBandStat3.freq;
    band3.Q.value = activeBandStat3.q;

    band4.gain.value = activeBandStat4.gain;
    band4.frequency.value = activeBandStat4.freq;
    band4.Q.value = activeBandStat4.q;

    band5.gain.value = activeBandStat5.gain;
    band5.frequency.value = activeBandStat5.freq;
    band5.Q.value = activeBandStat5.q;

    band6.gain.value = activeBandStat6.gain;
    band6.frequency.value = activeBandStat6.freq;
    band6.Q.value = activeBandStat6.q;
    console.log("activeBandStat6", activeBandStat6);
    console.log("pluginScreenRef", pluginScreenRef);
    // setPluginScreenRefWidth(parseInt(pluginScreenRef.current.offsetWidth));
    // console.log("pluginScreenRefWidth", pluginScreenRefWidth);
    setDimensions(getWindowDimensions());
    setDimensionW(getWindowDimensions().width);
    setDimensionH(getWindowDimensions().height);
    console.log("Dimensions", dimensions);
    // setTimeout(() => {
    //   if (pluginScreenRef.current) {
    //     setDimensions({
    //       width: pluginScreenRef.current.offsetWidth,
    //       height: pluginScreenRef.current.offsetHeight
    //     });
    //   }
    //   console.log("Dimensions", dimensions);
    // }, "1000");
    
  }, [])

  const checkActiveFreq = (input) => {
    if (input > 1 && input < 6) {
      setActiveFreqClassName("eq-knob-wrapper")
    } else {
      if (input == 1) {
        setActiveFreqClassName("eq-knob-wrapper eq-knob-wrapper-1")
      } else {
        setActiveFreqClassName("eq-knob-wrapper eq-knob-wrapper-6")
      }
    }
    return activeFreqClassName
  }

  const receiveData = (data) => { // the callback. Use a better name
    console.log(data.id);
    if (data.id == 1) {
      setActiveBandStat1(data);
      band1.gain.value = activeBandStat1.gain;
      band1.frequency.value = activeBandStat1.freq;
      band1.Q.value = activeBandStat1.q;
    } else if (data.id == 2) {
      setActiveBandStat2(data);
      band2.gain.value = activeBandStat2.gain;
      band2.frequency.value = activeBandStat2.freq;
      band2.Q.value = activeBandStat2.q;
    } else if (data.id == 3) {
      setActiveBandStat3(data);
      band3.gain.value = activeBandStat3.gain;
      band3.frequency.value = activeBandStat3.freq;
      band3.Q.value = activeBandStat3.q;
    } else if (data.id == 4) {
      setActiveBandStat4(data);
      band4.gain.value = activeBandStat4.gain;
      band4.frequency.value = activeBandStat4.freq;
      band4.Q.value = activeBandStat4.q;
    } else if (data.id == 5) {
      setActiveBandStat5(data);
      band5.gain.value = activeBandStat5.gain;
      band5.frequency.value = activeBandStat5.freq;
      band5.Q.value = activeBandStat5.q;
    } else if (data.id == 6) {
      setActiveBandStat6(data);
      band6.gain.value = activeBandStat6.gain;
      band6.frequency.value = activeBandStat6.freq;
      band6.Q.value = activeBandStat6.q;
    } 
    // switch (data.id) {
    //   case 1:
    //     setActiveBandStat1(data);
    //   case 2:
    //     setActiveBandStat2(data);
    //   case 3:
    //     setActiveBandStat3(data);
    //   case 4:
    //     setActiveBandStat4(data);
    //   case 5:
    //     setActiveBandStat5(data);
    //   case 6:
    //     setActiveBandStat6(data);
    //   default:
    //     setActiveBandStat1(data);
    // }
  };
  
  return (
    <>
      <div className="plugin-wrapper">
        <h3 style={{textAlign: "center", fontSize: 30, marginTop: 10}}>Graphical EQ</h3>
        <hr className="plugin-top-bar"/>
        {/* <h2>{EQGW}</h2> */}
        <div className="plugin-content-wrapper">
          <div id="eq-screen" ref={divRef} className="plugin-screen eq-line">
            {/* <svg width="100%" height="100%">
              <BasisCurve
                data={[
                  [parseInt(ptp(EQGraphWidth, 17)), parseInt(ptp(300, 50))],
                  [parseInt(ptp(EQGraphWidth, 33)), parseInt(ptp(300, 80))],
                  [parseInt(ptp(EQGraphWidth, 50)), parseInt(ptp(300, 30))],
                  [parseInt(ptp(EQGraphWidth, 67)), parseInt(ptp(300, 50))],
                  [parseInt(ptp(EQGraphWidth, 76)), parseInt(ptp(300, 80))],
                  [parseInt(ptp(EQGraphWidth, 83.5)), parseInt(ptp(300, 30))],
                ]}
              />
            </svg> */}
            <div className="q-indicator-wrapper" style={{position: "absolute"}}>
              <div className="q-indicator" style={{opacity: scale(activeBandStat2.q, 1, 0, 0.2, 0.4) + " ", width: scale(activeBandStat2.q, 1, 0, 10, 100) + "px", left: cPI(EQGW, activeBandStat2.freq, freqMin, freqMax)}}></div>
              <div className="q-indicator" style={{opacity: scale(activeBandStat3.q, 1, 0, 0.2, 0.4) + " ", width: scale(activeBandStat3.q, 1, 0, 10, 100) + "px", left: cPI(EQGW, activeBandStat3.freq, freqMin, freqMax)}}></div>
              <div className="q-indicator" style={{opacity: scale(activeBandStat1.q, 1, 0, 0.2, 0.4) + " ", width: scale(activeBandStat1.q, 1, 0, 10, 100) + "px", left: cPI(EQGW, activeBandStat1.freq, freqMin, freqMax)}}></div>
              <div className="q-indicator" style={{opacity: scale(activeBandStat4.q, 1, 0, 0.2, 0.4) + " ", width: scale(activeBandStat4.q, 1, 0, 10, 100) + "px", left: cPI(EQGW, activeBandStat4.freq, freqMin, freqMax)}}></div>
              <div className="q-indicator" style={{opacity: scale(activeBandStat5.q, 1, 0, 0.2, 0.4) + " ", width: scale(activeBandStat5.q, 1, 0, 10, 100) + "px", left: cPI(EQGW, activeBandStat5.freq, freqMin, freqMax)}}></div>
              <div className="q-indicator" style={{opacity: scale(activeBandStat6.q, 1, 0, 0.2, 0.4) + " ", width: scale(activeBandStat6.q, 1, 0, 10, 100) + "px", left: cPI(EQGW, activeBandStat6.freq, freqMin, freqMax)}}></div>
            </div>
            <svg width="100%" height="100%">
              <BundleCurve 
                pointElement={([x, y], i) => (
                  <circle cx={x} cy={y} r="5" fill="black" stroke="white" stroke-width="2"/>
                )}
                beta={1.45}
                data={[
                  [(-50), (cP(300, 0, gainMin, gainMax))],
                  // [(cPI(EQGW, activeBandStat1.freq, 10, 1200)), (cP(300, activeBandStat1.gain, gainMin, gainMax))],
                  // [(cPI(EQGW, activeBandStat2.freq, 100, 500)), (cP(300, activeBandStat2.gain, gainMin, gainMax))],
                  [(cPI(EQGW, activeBandStat1.freq, freqMin, freqMax)), (cP(300, activeBandStat1.gain, gainMin, gainMax))],
                  [(cPI(EQGW, activeBandStat2.freq, freqMin, freqMax)), (cP(300, activeBandStat2.gain, gainMin, gainMax))],
                  [(cPI(EQGW, activeBandStat3.freq, freqMin, freqMax)), (cP(300, activeBandStat3.gain, gainMin, gainMax))],
                  [(cPI(EQGW, activeBandStat4.freq, freqMin, freqMax)), (cP(300, activeBandStat4.gain, gainMin, gainMax))],
                  [(cPI(EQGW, activeBandStat5.freq, freqMin, freqMax)), (cP(300, activeBandStat5.gain, gainMin, gainMax))],
                  [(cPI(EQGW, activeBandStat6.freq, freqMin, freqMax)), (cP(300, activeBandStat6.gain, gainMin, gainMax))],
                  [(EQGW), (cP(300, 0, gainMin, gainMax))],
                ]}
              />
            </svg>
            {/* <svg viewBox="0 0 1280 40"  x="0px" y="0px">
              <polylin style={{stroke: "black", fill: "none"}} points="47.5,20 290.5,20 504.5,20 775.5,20 980.5,20 1244.8,20 "/>
              <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
            </svg> */}

          </div>
          <div className="plugin-frequency-wrapper-outter">
            <button className={!playingState ? "play-button" : "play-button play-button-active"} onClick={() => {audioPlayFunc(audioFile, playingState); setPlayingState(!playingState)}}>{playingState ? <img className="play-icon" src={pauseIcon} /> : <img className="play-icon" src={playIcon} />}</button>
            <div className="plugin-frequency-wrapper">
              <span>200Hz</span>
              <span>2.1KHz</span>
              <span>4KHz</span>
              <span>5.9KHz</span>
              <span>7.8KHz</span>
              {/* <span>40Hz</span>
              <span>125Hz</span>
              <span>500Hz</span>
              <span>2KHz</span>
              <span>8KHz</span> */}
            </div>
            <div style={{width: "13.5%"}}></div>
          </div>
          <div className="plugin-control-wrapper">
            <div className="eq-page-wrapper">
              <span onClick={() => { setActiveFreqTag(1); checkActiveFreq(1);}} className={activeFreqTag == 1 ? "active-freq-tag" : ""}>1</span>
              <span onClick={() => { setActiveFreqTag(2); checkActiveFreq(2);}} className={activeFreqTag == 2 ? "active-freq-tag" : ""}>2</span>
              <span onClick={() => { setActiveFreqTag(3); checkActiveFreq(3);}} className={activeFreqTag == 3 ? "active-freq-tag" : ""}>3</span>
              <span onClick={() => { setActiveFreqTag(4); checkActiveFreq(4);}} className={activeFreqTag == 4 ? "active-freq-tag" : ""}>4</span>
              <span onClick={() => { setActiveFreqTag(5); checkActiveFreq(5);}} className={activeFreqTag == 5 ? "active-freq-tag" : ""}>5</span>
              <span onClick={() => { setActiveFreqTag(6); checkActiveFreq(6);}} className={activeFreqTag == 6 ? "active-freq-tag" : ""}>6</span>
            </div>
            <div className={activeFreqClassName}>
              <span className="band-select">band select</span>
              {/* <RenderControlPanel panelNumber={activeFreqTag}/> */}
              {(() => {
                switch (activeFreqTag) {
                  case 1:
                    return <ControlPanel bandNumber={1} bandData={activeBandStat1} setData={receiveData}/>;
                  case 2:
                    return <ControlPanel bandNumber={2} bandData={activeBandStat2} setData={receiveData}/>;
                  case 3:
                    return <ControlPanel bandNumber={3} bandData={activeBandStat3} setData={receiveData}/>;
                  case 4:
                    return <ControlPanel bandNumber={4} bandData={activeBandStat4} setData={receiveData}/>;
                  case 5:
                    return <ControlPanel bandNumber={5} bandData={activeBandStat5} setData={receiveData}/>;
                  case 6:
                    return <ControlPanel bandNumber={6} bandData={activeBandStat6} setData={receiveData}/>;
                  default:
                    return <ControlPanel bandNumber={1} bandData={activeBandStat1} setData={receiveData}/>;
                }
              })()}
              {/* <button onClick={() => {audioPlayFunc(audioFile); setAudioPlay(!audioPlay);}}>Play</button> */}
              
              {/* <audio id="audio_tag" src={mySound} /> */}
              {/* <audio id="audio_tag" src={audioFile} /> */}
              {/* <input type="range" min={100} max={880} onChange={(e) => eqAdjust(e.target.value)} /> */}
            </div>
          </div>
          <div>
            <h4 style={{textAlign: "right"}}>Developed by <a href="/our-vision#our-team">Andrew Li</a></h4>
          </div>
        </div>
      </div>
    </>
  );
};
export default EQ;


var knobSize = '50px';
const ControlPanel = ({ bandNumber, bandData, setData }) => {
  console.log("bandData", bandData);
  // const [controlGain, setControlGain] = useState(bandData.gain);
  // const [controlFreq, setControlFreq] = useState(bandData.freq);
  // const [controlQ, setControlQ] = useState(bandData.q);
  var controlGain = bandData.gain;
  var controlFreq = bandData.freq;
  var controlQ = bandData.q;
  var controlID = bandData.id;

  const updateKnob = (parameter, value) => {
    // console.log("updateKnob", value);
    // console.log("para", parameter);
    if (parameter == "gain") {
      // setData(value);
      // console.log("current", controlGain);
      // console.log("adjusted", value);
      // console.log("diff", (value.gain - controlGain));
      var difference = Math.abs(value.gain - controlGain);
      if (difference < 20) {
        setData(value);
      }
    } else if (parameter == "freq") {
      var difference = Math.abs(value.freq - controlFreq);
      if (difference < 200) {
        setData(value);
      }
    } else if (parameter == "q") {
      var difference = Math.abs(value.q - controlQ);
      if (difference < 0.5) {
        setData(value);
      }
    }
  }

  useEffect(() => {
    // setControlGain(bandData.gain);
    // setControlFreq(bandData.freq);
    // setControlQ(bandData.q);
    // console.log("controlGain", controlGain);
    // console.log("controlFreq", controlFreq);
    // console.log("controlQ", controlQ);
  }, [])
  
  return (
    <>
    <div className="control-panel">
      <div className="control-block">
        <span>&#40;band {bandNumber}&#41;</span>
      </div>
      <div className="control-block">
        <span>type</span>
        <div className="display-flex d-flex-c">
          <img style={{width: "60px"}} src={bandIcon}/>
        </div>
        
      </div>
      <div className="control-block">
        <span>gain</span>
        <div className="knob-single">
          <div className="knob-wrap">
            <Knob
              clampMin={0}
              clampMax={360}
              value={bandData.gain}
              style={{width: knobSize, height: knobSize}} 
              preciseMode={false} 
              skin={s6cus} 
              defaultValue={controlFreq} 
              min={-40} 
              max={20} 
              // onChange={value => { setData({ gain: Math.round(value), freq: bandData.freq,  q: bandData.q, id: bandData.id, minF: bandData.minF, maxF: bandData.maxF}) }}
              onChange={value => { updateKnob("gain", { gain: Math.round(value), freq: bandData.freq,  q: bandData.q, id: bandData.id, minF: bandData.minF, maxF: bandData.maxF}) }}
            />
          </div>
        </div>
        <span>{bandData.gain} db</span>
      </div>
      <div className="control-block">
        <span>frequency</span>
        <div className="knob-single">
          <div className="knob-wrap">
            <Knob
              clampMin={0}
              clampMax={360}
              value={bandData.freq}
              style={{width: knobSize, height: knobSize}} 
              preciseMode={false} 
              skin={s6cus} 
              defaultValue={controlFreq} 
              min={bandData.minF} 
              max={bandData.maxF} 
              // onChange={value => { setData({ gain: bandData.gain, freq: Math.round(value),  q: bandData.q, id: bandData.id, minF: bandData.minF, maxF: bandData.maxF}) }}
              onChange={value => { updateKnob("freq", { gain: bandData.gain, freq: Math.round(value),  q: bandData.q, id: bandData.id, minF: bandData.minF, maxF: bandData.maxF}) }}
            />
          </div>
        </div>
        <span>{kFormatter(bandData.freq)}Hz</span>
      </div>
      <div className="control-block">
        <span>Q</span>
        <div className="knob-single">
          <div className="knob-wrap">
            <Knob
              clampMin={0}
              clampMax={360}
              value={bandData.q}
              style={{width: knobSize, height: knobSize}} 
              preciseMode={false} 
              skin={s6cus} 
              defaultValue={controlQ} 
              min={0} 
              max={1} 
              // onChange={value => { setData({ gain: bandData.gain, freq: bandData.freq,  q: Math.round(value * 100) / 100, id: bandData.id, minF: bandData.minF, maxF: bandData.maxF}) }}
              onChange={value => { updateKnob("q", { gain: bandData.gain, freq: bandData.freq,  q: Math.round(value * 100) / 100, id: bandData.id, minF: bandData.minF, maxF: bandData.maxF}) }}
            />
          </div>
        </div>
        <span>{bandData.q}</span>
      </div>
    </div>
    </>
  );
};



function scale (number, inMin, inMax, outMin, outMax) {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function kFormatter(num) {
  return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + ' K' : Math.sign(num)*Math.abs(num)
}

/*
 * Returns a bezier interpolated value, using the given ranges
 * @param {number} value  Value to be interpolated
 * @param {number} s1 Source range start
 * @param {number} s2  Source range end
 * @param {number} t1  Target range start
 * @param {number} t2  Target range end
 * @param {number} [slope]  Weight of the curve (0.5 = linear, 0.1 = weighted near target start, 0.9 = weighted near target end)
 * @returns {number} Interpolated value
 */

function interpolate(value, s1, s2, t1, t2, slope) {
  //Default to linear interpolation
  slope = slope || 0.5;

  //If the value is out of the source range, floor to min/max target values
  if(value < Math.min(s1, s2)) {
      return Math.min(s1, s2) === s1 ? t1 : t2;
  }

  if(value > Math.max(s1, s2)) {
      return Math.max(s1, s2) === s1 ? t1 : t2;
  }

  //Reverse the value, to make it correspond to the target range (this is a side-effect of the bezier calculation)
  value = s2-value;

  var C1 = {x: s1, y:t1}; //Start of bezier curve
  var C3 = {x: s2, y:t2}; //End of bezier curve
  var C2 = {              //Control point
      x: C3.x,
      y: C1.y + Math.abs(slope) * (C3.y - C1.y)
  };

  //Find out how far the value is on the curve
  var percent = value / (C3.x-C1.x);

  return C1.y*b1(percent) + C2.y*b2(percent) + C3.y*b3(percent);

  function b1(t) { return t*t }
  function b2(t) { return 2*t*(1 - t)  }
  function b3(t) { return (1 - t)*(1 - t) }
};


class LimitedKnob extends React.Component {
  constructor() {
    super();
    this.state = {
      value: 0
    };
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  handleOnChange(val) {
    //ignore change if distance is greater than defined
    //here we use a distance of 200 because our max value is 1000
    //change if needed
    const maxDistance = 200;
    let distance = Math.abs(val - this.state.value);
    if (distance > maxDistance) {
      return;
    } else {
      this.setState({ value: val });
    }
  }
  render() {
    let { value, ...rest } = this.props;

    return (
      <Knob value={this.state.value} onChange={this.handleOnChange} {...rest} />
    );
  }
}

