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
import playIcon from '../img/play_icon_yellow.svg'
import pauseIcon from '../img/pause_icon_yellow.svg'
import bandIcon from '../img/band_icon.svg'
import faderIcon from '../img/fader.svg'
import {Noise, Effect, Filter} from './WebAudio.js'

// import {KnobHeadless} from 'react-knob-headless';
 
function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}


// const context = new AudioContext();
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();
// const context = window.AudioContext = window.AudioContext || window.webkitAudioContext;
// = window.AudioContext = window.AudioContext || window.webkitAudioContext;
var source;
// var isPlaying = false;
var lowPass = context.createBiquadFilter();
lowPass.type = "lowpass";
lowPass.frequency.value = 880;
lowPass.Q.value = 0.7;

var band1 = context.createBiquadFilter();
var band2 = context.createBiquadFilter();
var band3 = context.createBiquadFilter();
var band4 = context.createBiquadFilter();
var band5 = context.createBiquadFilter();
var band6 = context.createBiquadFilter();
var inputGainNode = context.createGain();
var verb;
var wetGain = context.createGain();
var dryGain = context.createGain();
var combinedGain = context.createGain();
var splitter = context.createChannelSplitter(2);

band1.type = "peaking";
band2.type = "peaking";
band3.type = "peaking";
band4.type = "peaking";
band5.type = "peaking";
band6.type = "peaking";

const audioPlayFunc = async (url, isPlaying) => {
  if (!isPlaying) {
    if (!source) {
      source = context.createBufferSource();
      // verb = new AdvancedReverb(context);
      // source.connect(lowPass);
      
      // source.connect(band3);
      // band3.connect(context.destination);
      // verb.connect(source);
      source.loop = true;
      source.connect(inputGainNode);
      inputGainNode.connect(verb.input);
      inputGainNode.connect(dryGain);
      verb.connect(wetGain);
      wetGain.connect(combinedGain);
      dryGain.connect(combinedGain);
      combinedGain.connect(context.destination);
      // source.connect(band1);
      // band2.connect(band3);
      // band1.connect(band2);
      // band2.connect(band3);
      // band3.connect(band4);
      // band4.connect(band5);
      // band5.connect(band6);
      // band6.connect(context.destination);
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
      source.disconnect(inputGainNode);
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

const Reverb = ({ children }) => {

  const [inputGain, setInputGain] = useState(0);
  const [timing, setTiming] = useState(0);
  const [volume, setVolume] = useState(0);
  const [beta, setBeta] = useState(true);
  


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
  const [reverbDecay, setReverbDecay] = useState(0.1);
  const [reverbTimeState, setReverbTimeState] = useState(0.1);
  const [earlyVolume, setEarlyVolume] = useState(0.2);
  const [dryWet, setDryWet] = useState(0);
  
  const [reverbWetGain, setReverbWetGain] = useState(1);

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
    eleWidth = document.getElementById('reverb-screen').offsetWidth;
    // setDivWidth(divRef.current.offsetWidth);
    setEQGraphWidth(eleWidth);
    console.log("EQGraphWidth", EQGW);
    // console.log("divRef", divRef.current);
    // console.log("divWidth", divWidth);
    console.log("eleWidth", eleWidth);
  }

  useEffect(() => {
    verb = new AdvancedReverb(context);
    verb.reverbTime = 0.1;
    console.log("verb Initiated!", verb);
    
  }, [])
  useEffect(() => {
    verb.decay = reverbDecay;
    verb.reverbTime = reverbTimeState/1;
    verb.renderTail();
    verb.wet.gain.value = reverbWetGain;
    verb.multitapGain.gain.value = earlyVolume;
    console.log("verb", verb);
    console.log("source-node", inputGainNode);
    // if (source) {
    //   // source.gain.value = inputGain;
    // }
    inputGainNode.gain.value = inputGain;
    wetGain.gain.value = scale(dryWet, 0, 100, 0, 1);
    dryGain.gain.value = scale(dryWet, 0, 100, 1, 0);
  }, [reverbDecay, reverbWetGain, reverbTimeState, earlyVolume, inputGain, dryWet])


  // const changeReverbTime = (value) => {
  //   setReverbTimeState(value);
  //   verb.reverbTime = 2;
  //   verb.release = 2;
  //   verb.decay = value;
  //   console.log("updateVerb", verb);
  // }

  return (
    <>
      <div className="plugin-wrapper">
        {beta ? 
          <div className="beta">
            <h2>
              This tool is currently in beta. Some settings may be different in the future.
            </h2>
            <button className="beta-ok" onClick={() => {setBeta(false)}}>Ok</button>
          </div>
          : 
          <></>
        }
        <hr className="plugin-top-bar"/>
        {/* <h2>{EQGW}</h2> */}
        <div className="plugin-content-wrapper">
          <div id="reverb-screen" ref={divRef}>
          <div className="reverb-type-block display-flex d-flex-c" style={{position: "relative"}}>
            {/* <span>abc</span> */}
            <button style={{right: "10%"}} className="play-button" onClick={() => {audioPlayFunc(audioFile, playingState); setPlayingState(!playingState)}}>{playingState ? <img className="play-icon" src={pauseIcon} /> : <img className="play-icon" src={playIcon} />}</button>
            <span style={{paddingLeft: 20, paddingRight: 20}}>reverb type</span>
            <div className="reverb-type-select plugin-border">
              <span>room</span>
            </div>
          </div>
          <div className="display-flex d-flex-sb" style={{marginTop: 20}}>
            <div className="reverb-half-block">
              <div className="reverb-screen plugin-border" style={{position: "relative"}}>
              <svg width="100%" height="180px" xmlns="http://www.w3.org/2000/svg">
                <g id="early_reflections" data-name="early reflections">
                  <line className="cls-1" x1={(scale(reverbTimeState, 0, 3, 5, 15) + "%")} y1="50%" x2={(scale(reverbTimeState, 0, 3, 5, 15) + "%")} y2="100%"/>
                  <line className="cls-1" x1={(scale(reverbTimeState, 0, 2, 15, 25) + "%")} y1="60%" x2={(scale(reverbTimeState, 0, 2, 15, 25) + "%")} y2="100%"/>
                  <line className="cls-1" x1={(scale(reverbTimeState, 0, 1.2, 25, 35) + "%")} y1="68%" x2={(scale(reverbTimeState, 0, 1.2, 25, 35) + "%")} y2="100%"/>
                  <line className="cls-1" x1={(scale(reverbTimeState, 0, 1, 35, 45) + "%")} y1="35%" x2={(scale(reverbTimeState, 0, 1, 35, 45) + "%")} y2="100%"/>
                  <line className="cls-1" x1={(scale(reverbTimeState, 0, 0.7, 45, 55) + "%")} y1="40%" x2={(scale(reverbTimeState, 0, 0.7, 45, 55) + "%")} y2="100%"/>
                  <line className="cls-1" x1={(scale(reverbTimeState, 0, 0.5, 55, 65) + "%")} y1="60%" x2={(scale(reverbTimeState, 0, 0.5, 55, 65) + "%")} y2="100%"/>
                  <line className="cls-1" x1={(scale(reverbTimeState, 0, 0.35, 65, 75) + "%")} y1="80%" x2={(scale(reverbTimeState, 0, 0.35, 65, 75) + "%")} y2="100%"/>
                </g>
              </svg>
                <div className="reverb-screen-text-wrapper">
                  <span>early reflection</span>
                </div>
              </div>
              <div className="reverb-control-panel">
                <div className="display-flex d-flex-c" style={{width: "33%", paddingTop: "20px"}}>
                  <div>
                    <div className="display-flex d-flex-c" >
                      <div className="fader">
                        <div className="fader-line"></div>
                        <img className="fader-handle" src={faderIcon} style={{bottom: scale(inputGain, 0, 5, 10, 90)+"%"}}/>
                        <input min="0" max="5" value={inputGain} onChange={(e) => setInputGain(e.target.value)} className="fader-slider" type="range" step="0.1" orient="vertical" />
                      </div>
                      {/* <span>{inputGain}</span> */}
                    </div>
                    <h6>input gain</h6>
                  </div>
                </div>
                <div className="display-flex d-flex-sa reverb-section" style={{width: "50%", paddingTop: "20px"}}>
                  <div>
                    <div className="display-flex d-flex-c" >
                      <div className="fader">
                        <div className="fader-line"></div>
                        <img className="fader-handle" src={faderIcon} style={{bottom: scale(reverbTimeState, 0.1, 3, 10, 90)+"%"}}/>
                        <input min="0.1" max="3" value={timing} onChange={(e) => setReverbTimeState(e.target.value)} className="fader-slider" type="range" step="0.1" orient="vertical" />
                      </div>
                      {/* <span>{reverbTimeState}</span> */}
                    </div>
                    <h6>timing</h6>
                  </div>
                  <div>
                    <div className="display-flex d-flex-c" >
                      <div className="fader">
                        <div className="fader-line"></div>
                        <img className="fader-handle" src={faderIcon} style={{bottom: scale(earlyVolume, 0.7, -0.1, 10, 90)+"%"}}/>
                        <input min="0" max="0.5" value={volume} onChange={(e) => setEarlyVolume(scale(e.target.value, 0, 0.5, 0.7, 0))} className="fader-slider" type="range" step="0.1" orient="vertical" />
                      </div>
                      {/* <sp>{earlyVolume}</sp> */}
                    </div>
                    <h6>volume</h6>
                  </div>
                </div>
              </div>
            </div>
            <div className="reverb-half-block">
              <div className="plugin-border reverb-screen" style={{position: "relative"}}>
                {/* <svg className="tail-rect" style={{transform: "rotate(" + reverbDecay*20 + "deg) translateX(10%) translateY(20%)"}} width="100%" height="200" xmlns="http://www.w3.org/2000/svg"> */}
                <svg className="tail-rect" width="100%" height="200" xmlns="http://www.w3.org/2000/svg">
                  <polygon stroke-width="3px" stroke="black" fill="transparent" points={"30,30 0,190 " + scale(reverbDecay, 0.1, 1, 250, 1000) + ",190"}/>
                  {/* <rect stroke="black" width={ (100) + "%"} height="100%" x="10" y="10" stroke-width="2px" fill="transparent" /> */}
                </svg>
                <div className="reverb-screen-text-wrapper">
                  <span>tail</span>
                </div>
              </div>
              <div className="reverb-control-panel">
                <div className="display-flex d-flex-sa reverb-section" style={{width: "50%", paddingTop: "20px"}}>
                  <div>
                    <div className="display-flex d-flex-c" >
                      <div className="fader">
                        <div className="fader-line"></div>
                        <img className="fader-handle" src={faderIcon} style={{bottom: scale(reverbDecay, 0, 1, 10, 90)+"%"}}/>
                        <input min="0" max="10" value={timing} onChange={(e) => setReverbDecay(e.target.value/10)} className="fader-slider" type="range" orient="vertical" />
                      </div>
                      {/* <span>{reverbDecay}</span> */}
                    </div>
                    <h6>timing</h6>
                  </div>
                  <div>
                    <div className="display-flex d-flex-c" >
                      <div className="fader">
                        <div className="fader-line"></div>
                        <img className="fader-handle" src={faderIcon} style={{bottom: scale(reverbWetGain, 0, 5, 10, 90)+"%"}}/>
                        <input min="0" max="5" value={volume} onChange={(e) => setReverbWetGain(e.target.value)} className="fader-slider" type="range" step="0.1" orient="vertical" />
                      </div>
                      {/* <span>{reverbWetGain}</span> */}
                    </div>
                    <h6>volume</h6>
                  </div>
                </div>
                <div className="display-flex d-flex-col d-flex-c" style={{width: "33%", paddingTop: "20px"}}>
                  {/* <span>dry wet: {dryWet}</span> */}
                  <div className="knob-single">
                    <div className="knob-wrap">
                      <Knob
                        clampMin={0}
                        clampMax={360}
                        // value={bandData.gain}
                        style={{width: knobSize, height: knobSize}} 
                        preciseMode={false} 
                        skin={s6cus} 
                        // defaultValue={controlFreq} 
                        min={0} 
                        max={100} 
                        onChange={value => { setDryWet(Math.round(value)) }}
                      />
                    </div>
                  </div>
                  <div className="display-flex d-flex-c">
                    <div className="dry-wet-tag">
                      <span>dry</span>
                      <span>wet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          </div>
        </div>
      </div>
    </>
  );
};
export default Reverb;


var knobSize = '90px';
const ControlPanel = ({ bandNumber, bandData, setData }) => {
  console.log("bandData", bandData);
  // const [controlGain, setControlGain] = useState(bandData.gain);
  // const [controlFreq, setControlFreq] = useState(bandData.freq);
  // const [controlQ, setControlQ] = useState(bandData.q);
  var controlGain = bandData.gain;
  var controlFreq = bandData.freq;
  var controlQ = bandData.q;
  var controlID = bandData.id;
  
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
              onChange={value => { setData({ gain: Math.round(value), freq: bandData.freq,  q: bandData.q, id: bandData.id, minF: bandData.minF, maxF: bandData.maxF}) }}
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
              onChange={value => { setData({ gain: bandData.gain, freq: Math.round(value),  q: bandData.q, id: bandData.id, minF: bandData.minF, maxF: bandData.maxF}) }}
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
              onChange={value => { setData({ gain: bandData.gain, freq: bandData.freq,  q: Math.round(value * 100) / 100, id: bandData.id, minF: bandData.minF, maxF: bandData.maxF}) }}
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










// ===========


class SimpleReverb extends Effect {
	constructor (context) {
		super(context);
		this.name = "SimpleReverb";
	}

	setup (reverbTime=1) {
		this.effect = this.context.createConvolver();

		this.reverbTime = reverbTime;

		this.attack = 0.0001;
		this.decay = 0.1;
		this.release = reverbTime;

		this.wet = this.context.createGain();
    this.input.connect(this.wet);
    this.wet.connect(this.effect);
		this.effect.connect(this.output);    
	}

	renderTail () {

    const tailContext = new OfflineAudioContext( 2, this.context.sampleRate * this.reverbTime, this.context.sampleRate );
					tailContext.oncomplete = (buffer) => {
						this.effect.buffer = buffer.renderedBuffer;
					}
		
    const tailOsc = new Noise(tailContext, 1);
          tailOsc.init();
          tailOsc.connect(tailContext.destination);
          tailOsc.attack = this.attack;
          tailOsc.decay = this.decay;
          tailOsc.release = this.release;
		
      
      tailOsc.on({frequency: 500, velocity: 1});
			tailContext.startRendering();
		setTimeout(()=>{
			tailOsc.off(); 
		},20)
			
     
	}

	set decayTime(value) {
		let dc = value/3;
		this.reverbTime = value;
		this.attack = 0;
		this.decay = 0;
		this.release = dc;
    return this.renderTail();
	}

}

class AdvancedReverb extends SimpleReverb {
	constructor (context) {
		super(context);
		this.name = "AdvancedReverb";
	}

	setup (reverbTime=1, preDelay = 0.03) {
		this.effect = this.context.createConvolver();

		this.reverbTime = reverbTime;

		this.attack = 0.001;
		this.decay = 0.1;
		this.release = reverbTime;

    this.preDelay = this.context.createDelay(reverbTime);
    this.preDelay.delayTime.setValueAtTime(preDelay, this.context.currentTime);
    
    this.multitap = [];
    
    for(let i = 5; i > 0; i--) {
      this.multitap.push(this.context.createDelay(reverbTime));
    }
    this.multitap.map((t,i)=>{
      if(this.multitap[i+1]) {
        t.connect(this.multitap[i+1])
      }
      t.delayTime.setValueAtTime(0.001+(i*(preDelay/2)), this.context.currentTime);
    })
    
    this.multitapGain = this.context.createGain();
    this.multitap[this.multitap.length-1].connect(this.multitapGain);
    
    this.multitapGain.gain.value = 0.2;
    
    this.multitapGain.connect(this.output);
    
		this.wet = this.context.createGain();
     
    this.input.connect(this.wet);
    this.wet.connect(this.preDelay);
    this.wet.connect(this.multitap[0]);
    this.preDelay.connect(this.effect);
		this.effect.connect(this.output);
   
	}
	renderTail () {

    const tailContext = new OfflineAudioContext( 2, this.context.sampleRate * this.reverbTime, this.context.sampleRate );
					tailContext.oncomplete = (buffer) => {
						this.effect.buffer = buffer.renderedBuffer;
					}
    const tailOsc = new Noise(tailContext, 1);
    const tailLPFilter = new Filter(tailContext, "lowpass", 2000, 0.2);
    const tailHPFilter = new Filter(tailContext, "highpass", 500, 0.1);
    
    tailOsc.init();
		tailOsc.connect(tailHPFilter.input);
    tailHPFilter.connect(tailLPFilter.input);
    tailLPFilter.connect(tailContext.destination);
		tailOsc.attack = this.attack;
		tailOsc.decay = this.decay;
		tailOsc.release = this.release;
    
		tailContext.startRendering()

		tailOsc.on({frequency: 500, velocity: 1});
		setTimeout(()=>{
					tailOsc.off();
		},20)
	}

	set decayTime(value) {
		let dc = value/3;
		this.reverbTime = value;
		this.attack = 0;
		this.decay = 0;
		this.release = dc;
    return this.renderTail();
	}
}
