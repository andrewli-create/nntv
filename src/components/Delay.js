import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import Footer from "./Footer.js";
import NavBar from "./Navbar.js";
import "../style/bulma-style.sass";
import "../style/custom-style.sass";
import useSiteMetadata from "./SiteMetadata.js";
import { withPrefix, graphql, useStaticQuery } from "gatsby";
import "../style/override-style.css";
import "../style/custom-style-css.css";
import "../style/al-style.css";
import "../style/plugin-style.css";
// import audioFile from "../../static/audio/Simple_Groove.mp3"
import audioFile from "../../static/audio/Simple_Dance.mp3"
// import { Knob, Pointer, Value, Arc } from 'rc-knob'
import { Donut, Basic } from 'react-dial-knob'
import { Knob } from 'react-rotary-knob'
import s6 from './knobskins/s6.js';
import s6cus from './knobskins/s6cus.js';
import { BasisCurve, BundleCurve } from 'react-svg-curve';
import playIcon from '../img/play_icon_white.svg'
import pauseIcon from '../img/pause_icon_yellow.svg'
import bandIcon from '../img/band_icon.svg'
import faderIcon from '../img/fader.svg'
import {Noise, Effect, Filter} from './WebAudio.js'
import note1 from '../img/note_1.png'
import note2 from '../img/note_2.png'
import note3 from '../img/note_3.png'
import note4 from '../img/note_4.png'
import note5 from '../img/note_5.png'
import note6 from '../img/note_6.png'
import note7 from '../img/note_7.png'
import note8 from '../img/note_8.png'
import note9 from '../img/note_9.png'

// import {KnobHeadless} from 'react-knob-headless';
 
function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}


// const context = new AudioContext();
// window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context;
// const context = window.AudioContext = window.AudioContext || window.webkitAudioContext;
// = window.AudioContext = window.AudioContext || window.webkitAudioContext;
var source;
// var isPlaying = false;

var inputGainNode;
var verb;
var multiDelay;
var wetGain;
var dryGain;
var combinedGain;
var splitter;
var merger;
var delayNodesL = [];
var gainNodesL = [];
var delayNodesR = [];
var gainNodesR = [];
var numOfDelay = 12;
var taps = [
  { delay: 0.1, gain: 0.8 }, // 100ms delay, 80% volume
  { delay: 0.3, gain: 0.6 }, // 300ms delay, 60% volume
  { delay: 0.5, gain: 0.4 }, // 500ms delay, 40% volume
];

const audioPlayFunc = async (url, isPlaying) => {
  if (!isPlaying) {
    if (!source) {
      source = context.createBufferSource();
      // verb = new AdvancedReverb(context);
      // source.connect(lowPass);
      
      // source.connect(band3);
      // band3.connect(context.destination);
      // verb.connect(source);


      // source.loop = true;
      // source.connect(inputGainNode);
      // inputGainNode.connect(verb.input);
      // inputGainNode.connect(dryGain);
      // verb.connect(wetGain);
      // wetGain.connect(combinedGain);
      // dryGain.connect(combinedGain);
      // combinedGain.connect(context.destination);

      source.loop = true;
      source.connect(splitter);
      // source.connect(context.destination);
      source.connect(dryGain);
      
      // source.connect(multiDelay.input);
      // multiDelay.connect(context.destination);

      delayNodesL.forEach((delayNodeL, i) => {
        // source.connect(delayNode);
        splitter.connect(delayNodeL);
        delayNodeL.connect(gainNodesL[i]);
        // gainNodes[i].connect(context.destination);
        gainNodesL[i].connect(merger, 0, 0);
      });

      delayNodesR.forEach((delayNodeR, i) => {
        // source.connect(delayNode);
        splitter.connect(delayNodeR);
        delayNodeR.connect(gainNodesR[i]);
        // gainNodes[i].connect(context.destination);
        gainNodesR[i].connect(merger, 0, 1);
      });

      merger.connect(wetGain);
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
      // source.disconnect(inputGainNode);
      // delayNodes.forEach((delayNode, i) => {
      //   gainNodes[i].disconnect(context.destination);
      // });
      // source.disconnect(context.destination);
      combinedGain.disconnect(context.destination);
      source = null;
      isPlaying = false;
      // EQ.setPlayingState(isPlaying);
    }
  }
};

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

const Delay = ({ children }) => {

  const [inputGain, setInputGain] = useState(0);
  const [timing, setTiming] = useState(0);
  const [volume, setVolume] = useState(0);
  const [beta, setBeta] = useState(false);
  

  const [playingState, setPlayingState] = useState(false);
  const [reverbDecay, setReverbDecay] = useState(0.1);
  const [reverbTimeState, setReverbTimeState] = useState(0.1);
  const [earlyVolume, setEarlyVolume] = useState(0.2);
  const [dryWet, setDryWet] = useState(50);
  const [delayTime, setDelayTime] = useState(150);
  const [delayTimeByMetric, setDelayTimeByMetric] = useState(1);
  
  const [delayFeedback, setDelayFeedback] = useState(20);
  const [delayPingPong, setDelayPingPong] = useState(false);
  const [delayMetric, setDelayMetric] = useState(false);
  const [diskSpin, setDiskSpin] = useState(0);

  
  
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
  const metricTable = [2000, 1000, 500, 250, 167, 125, 63, 31, 16];

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

  useInterval(() => {
    if (playingState) {
      setDiskSpin(diskSpin + 1);
    }
  }, 50);

  useEffect(() => {
    context = new AudioContext();
    inputGainNode = context.createGain();
    wetGain = context.createGain();
    dryGain = context.createGain();
    combinedGain = context.createGain();
    splitter = context.createChannelSplitter(2);
    merger = context.createChannelMerger(2);
    verb = new AdvancedReverb(context);
    multiDelay = new MultitapDelay(context)
    verb.reverbTime = 0.1;
    // console.log("verb Initiated!", verb);
    

    for (var i = 0; i < numOfDelay; i++) {
      const delayNode = context.createDelay(2); // Max delay time of 1 second
      delayNode.delayTime.value = (delayTime/1000) * (i + 1);
      delayNodesL.push(delayNode);

      const gainNode = context.createGain();
      // gainNode.gain.value = 0.8 - (0.05 * (i + 1));
      // gainNode.gain.value = scale(delayFeedback, 0, 100, 0, 0.95) - (i + 1);
      // console.log("gainValue", scale(delayFeedback, 0, 100, 0, 0.95) * (1 - ((0.1) * (i + 1))));
      gainNode.gain.value = scale(delayFeedback, 0, 100, 0, 0.95) * (1 - ((0.1) * (i + 1)));
      gainNodesL.push(gainNode);
    }

    for (var i = 0; i < numOfDelay; i++) {
      const delayNode = context.createDelay(2); // Max delay time of 1 second
      delayNode.delayTime.value = (delayTime/1000) * (i + 1);
      delayNodesR.push(delayNode);

      const gainNode = context.createGain();
      // gainNode.gain.value = 0.8 - (0.05 * (i + 1));
      // gainNode.gain.value = scale(delayFeedback, 0, 100, 0, 0.95) - (i + 1);
      // console.log("gainValue", scale(delayFeedback, 0, 100, 0, 0.95) * (1 - ((0.1) * (i + 1))));
      gainNode.gain.value = scale(delayFeedback, 0, 100, 0, 0.95) * (1 - ((0.1) * (i + 1)));
      gainNodesR.push(gainNode);
    }

    // taps.forEach(tap => {
    //   const delayNode = context.createDelay(1); // Max delay time of 1 second
    //   delayNode.delayTime.value = tap.delay;
    //   delayNodes.push(delayNode);

    //   const gainNode = context.createGain();
    //   gainNode.gain.value = tap.gain;
    //   gainNodes.push(gainNode);
    // });
    // console.log("delayNodes", delayNodesL);
    // console.log("gainNodes", gainNodesL);
    console.log(`${delayNodesL.length} delay nodes successfully loaded!`);
    console.log(`${gainNodesL.length} gain nodes successfully loaded!`);
    console.log("Multitap Delay initialized!");
  }, [])
  useEffect(() => {
    // verb.decay = reverbDecay;
    // verb.reverbTime = reverbTimeState/1;
    // verb.renderTail();
    // verb.wet.gain.value = reverbWetGain;
    // verb.multitapGain.gain.value = earlyVolume;
    // console.log("verb", verb);
    // console.log("source-node", inputGainNode);
    // if (source) {
    //   // source.gain.value = inputGain;
    // }
    inputGainNode.gain.value = inputGain;
    wetGain.gain.value = scale(dryWet, 0, 100, 0, 1);
    dryGain.gain.value = scale(dryWet, 0, 100, 1, 0);
  }, [dryWet])

  useEffect(() => {
    // console.log("delayMetric", delayMetric);
    if (delayMetric) {
      console.log("delayMetricInside", delayMetric);
      setDelayTimeByMetric(3);
      setDelayTime(500);
    }
  }, [delayMetric])

  useEffect(() => {
    // console.log("delayTime changed", delayTime);
    for (var i = 0; i < delayNodesL.length; i++) {
      // console.log("delayNodes[i] each", delayNodesL[i]);
      delayNodesL[i].delayTime.setTargetAtTime((delayTime/1000) * (i + 1), context.currentTime, 0.5);
      if (!delayPingPong) {
        gainNodesL[i].gain.setTargetAtTime(scale(delayFeedback, 0, 100, 0, 0.95) * (1 - ((0.1) * (i + 1))), context.currentTime, 0.5);
      } else {
        if (i % 2 == 0) {
          gainNodesL[i].gain.setTargetAtTime(scale(delayFeedback, 0, 100, 0, 0.95) * (1 - ((0.1) * (i + 1))), context.currentTime, 0.5);
        } else {
          gainNodesL[i].gain.setTargetAtTime(0, context.currentTime, 0.5);
        }
      }
    }


    for (var i = 0; i < delayNodesR.length; i++) {
      delayNodesR[i].delayTime.setTargetAtTime((delayTime/1000) * (i + 1), context.currentTime, 0.5);
      if (!delayPingPong) {
        gainNodesR[i].gain.setTargetAtTime(scale(delayFeedback, 0, 100, 0, 0.95) * (1 - ((0.1) * (i + 1))), context.currentTime, 0.5);
      } else {
        if (i % 2 != 0) {
          gainNodesR[i].gain.setTargetAtTime(scale(delayFeedback, 0, 100, 0, 0.95) * (1 - ((0.1) * (i + 1))), context.currentTime, 0.5);
        } else {
          gainNodesR[i].gain.setTargetAtTime(0, context.currentTime, 0.5);
        }
      }
      
    }

  }, [delayTime, delayFeedback, delayPingPong])


  const updateDryWet = (value, current) => {
    console.log("value", value);
    console.log("current", current);
    var currentDryWet = current;
    console.log("currentDryWet", currentDryWet);
    var difference = Math.abs(value - current);
    console.log("difference", difference);
    if (difference < 20) {
        setDryWet(value);
    }
  }

  const updateDelayTime = (value, current) => {
    var difference = Math.abs(value - current);
    if (difference < 250) {
      setDelayTime(value);
    }
  }
  const updateDelayFeedback = (value, current) => {
    var difference = Math.abs(value - current);
    if (difference < 20) {
      setDelayFeedback(value);
    }
  }

  const updateDelayTimeByMetric = (value, current) => {
    var difference = Math.abs(value - current);
    if (difference < 2) {
      setDelayTimeByMetric(value);
      setDelayTime(metricTable[value - 1]);
    }
  }
  

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
        <h3 style={{textAlign: "center", fontSize: 30, marginTop: 10}}>Delay</h3>
        <hr className="plugin-top-bar"/>
        {/* <h2>{EQGW}</h2> */}
        <div className="plugin-content-wrapper">
          <div id="delay-screen" ref={divRef}>
            <div className="display-flex d-flex-c" style={{position: "relative"}}>
              <div className="track-display">
                <div style={{transform: `rotate(${diskSpin % 360}deg)`}} className={`tape-disk`}></div>
                <div style={{transform: `rotate(${diskSpin % 360}deg)`}} className={`tape-disk disk-2`}></div>
                <h5 className="position-relative">TRACK - NIGHT GROOVE | <span style={{display: "inline-block", transform: "translateY(2px)", fontSize: 35}}>120</span> BPM </h5>
              </div>
              <button className={!playingState ? "play-button-reverb" : "play-button-reverb play-button-active"} onClick={() => {audioPlayFunc(audioFile, playingState); setPlayingState(!playingState)}}>{playingState ? <img className="play-icon" src={pauseIcon} /> : <img className="play-icon" src={playIcon} />}</button>
            </div>
            <div className="display-flex d-flex-sb" style={{marginTop: 20}}>
              <div className="display-flex d-flex-row d-flex-c" style={{width: "100%", paddingTop: "20px"}}>
                <div className="delay-left-block">
                  <div>
                    <div className="delay-metric-type-switch">
                      <button className="delay-metric-type-trigger" onClick={() => {setDelayMetric(!delayMetric)}}>On/OFF</button>
                      <div className={`delay-metric-type-knob ${delayMetric ? "delay-metric-type-knob-on" : ""}`}></div>
                    </div>
                    <div className="display-flex d-flex-row d-flex-sb" style={{width: "80%", margin: "auto", marginBottom: 20}}>
                      <span>time</span>
                      <span>by note value</span>
                    </div>
                  </div>
                  <div className="knob-single">
                    { !delayMetric ?
                      <>
                        <div className="knob-wrap" style={{marginBottom: 10}}>
                          <Knob
                            clampMin={0}
                            clampMax={360}
                            // value={bandData.gain}
                            value={delayTime}
                            style={{width: knobSizeLarge, height: knobSizeLarge}} 
                            preciseMode={false} 
                            skin={s6cus} 
                            // defaultValue={controlFreq} 
                            min={5} 
                            max={1900} 
                            onChange={value => { updateDelayTime(Math.round(value), delayTime) }}
                          />
                        </div>
                        <span >{mFormatter(delayTime)}</span>
                      </> : <></>
                    }
                    { delayMetric ?
                      <>
                        <div className="knob-wrap" style={{marginBottom: 10}}>
                          <Knob
                            clampMin={0}
                            clampMax={360}
                            // value={bandData.gain}
                            value={delayTimeByMetric}
                            style={{width: knobSizeLarge, height: knobSizeLarge}} 
                            preciseMode={false} 
                            skin={s6cus} 
                            // defaultValue={controlFreq} 
                            min={1} 
                            max={metricTable.length} 
                            onChange={value => { updateDelayTimeByMetric(Math.round(value), delayTimeByMetric) }}
                          />
                        </div>
                        <div className="metric-wrapper">
                          <span style={{fontSize: 30}}>
                            {
                              {
                                  1: "1",
                                  2: "1/2",
                                  3: "1/4",
                                  4: "1/8",
                                  5: "1/8t",
                                  6: "1/16",
                                  7: "1/32",
                                  8: "1/64",
                                  9: "1/128",
                              }[delayTimeByMetric || <>This Component doesn't exsit</>]
                            }
                          </span>
                          {
                            {
                                1: <img src={note1}/>,
                                2: <img src={note2}/>,
                                3: <img src={note3}/>,
                                4: <img src={note4}/>,
                                5: <img src={note5}/>,
                                6: <img src={note6}/>,
                                7: <img src={note7}/>,
                                8: <img src={note8}/>,
                                9: <img src={note9}/>,
                            }[delayTimeByMetric || <>This Component doesn't exsit</>]
                          }
                        </div>
                      </> : <></>
                    }
                  </div>
                  
                </div>
                <div className="delay-right-block">
                  <div className="delay-display" style={{marginBottom: 20}}>
                    <div className="delay-bar-display" style={{width: `${100 + scale(delayTime, 5, 1900, 0, 50)}%`}}>
                      {[...Array(numOfDelay)].map((x, i) =>
                        (
                          <div className={`delay-bar-each ${i % 2 == 0 ? "delay-bar-alt" : ""}`} style={{width: `${(100/numOfDelay)}%`}}>
                            {/* <div className="delay-bar-needle" style={{height: `${(100/numOfDelay*(numOfDelay-i))}%`}}></div> */}
                            { i > 0 ?
                              <div className="delay-bar-needle" style={{opacity: scale(dryWet, 0, 100, 0.2, 1), height: `${delayPingPong ? (i % 2 == 0 ? scale(delayFeedback, 0, 100, 0.5, 45)*(numOfDelay-i) : 0) : scale(delayFeedback, 0, 100, 0.5, 45)*(numOfDelay-i)}%`}}></div>
                              // <div className="delay-bar-needle" style={{transform: `translate(${-50 + scale(delayTime, 5, 1900, 0, 1000)}%, 0)`, height: `${scale(delayFeedback, 0, 100, 0.5, 45)*(12-i)}%`}}></div>                  
                              :
                              <div className="delay-bar-needle" style={{opacity: scale(dryWet, 0, 100, 0.2, 1), height: `100%`}}></div>
                            }
                          </div>
                        )
                      )}
                    </div>
                    <div className="delay-bar-display delay-bar-display-bottom" style={{width: `${100 + scale(delayTime, 5, 1900, 0, 50)}%`}}>
                      {[...Array(numOfDelay)].map((x, i) =>
                        (
                          <div className={`delay-bar-each ${i % 2 != 0 ? "delay-bar-alt" : ""}`} style={{width: `${(100/numOfDelay)}%`}}>
                            {/* <div className="delay-bar-needle" style={{height: `${(100/numOfDelay*(numOfDelay-i))}%`}}></div> */}
                            { i > 0 ?
                              <div className="delay-bar-needle" style={{opacity: scale(dryWet, 0, 100, 0.2, 1), height: `${delayPingPong ? (i % 2 != 0 ? scale(delayFeedback, 0, 100, 0.5, 45)*(numOfDelay-i) : 0) : scale(delayFeedback, 0, 100, 0.5, 45)*(numOfDelay-i)}%`}}></div>
                              // <div className="delay-bar-needle" style={{transform: `translate(${-50 + scale(delayTime, 5, 1900, 0, 1000)}%, 0)`, height: `${scale(delayFeedback, 0, 100, 0.5, 45)*(12-i)}%`}}></div>                  
                              :
                              <div className="delay-bar-needle" style={{opacity: scale(dryWet, 0, 100, 0.2, 1), height: `${delayPingPong ? 0 : 100}%`}}></div>
                            }
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div className="delay-controls display-flex d-flex-row d-flex-sb">
                      <div>
                        <div className="knob-single">
                          <div className="knob-wrap">
                            <Knob
                              clampMin={0}
                              clampMax={360}
                              // value={bandData.gain}
                              value={delayFeedback}
                              style={{width: knobSize, height: knobSize}} 
                              preciseMode={false} 
                              skin={s6cus} 
                              // defaultValue={controlFreq} 
                              min={0} 
                              max={100} 
                              onChange={value => { updateDelayFeedback(Math.round(value), delayFeedback) }}
                            />
                          </div>
                        </div>
                        <span>feedback &#40;{delayFeedback}&#41;</span>
                      </div>
                      <div className="display-flex d-flex-col d-flex-sb" style={{width: "30%"}}>
                        <div className="display-flex d-flex-row d-flex-sb" style={{height: "90%"}}>
                          <div className="display-flex d-flex-col d-flex-c" style={{height: "100%", width: "50%"}}>
                            <p>ON</p>
                            <p>OFF</p>
                          </div>
                          <div className="display-flex d-flex-col d-flex-c position-relative" style={{width: "50%"}}>
                            <div className="delay-on-off-switch">
                              <button className="delay-on-off-trigger" onClick={() => {setDelayPingPong(!delayPingPong)}}>On/OFF</button>
                              <div className={`delay-on-off-knob ${delayPingPong ? "delay-on-off-knob-on" : ""}`}></div>
                            </div>
                          </div>
                        </div>
                        <span className="delay-ping-pong-tag" >ping-pong</span>
                      </div>
                      <div>
                        <div className="knob-single">
                          <div className="knob-wrap">
                            <Knob
                              clampMin={0}
                              clampMax={360}
                              // value={bandData.gain}
                              value={dryWet}
                              style={{width: knobSize, height: knobSize}} 
                              preciseMode={false} 
                              skin={s6cus} 
                              // defaultValue={controlFreq} 
                              min={0} 
                              max={100} 
                              onChange={value => { updateDryWet(Math.round(value), dryWet) }}
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
                {/* <span>dry wet: {dryWet}</span> */}
                {/* <div className="knob-single">
                  <div className="knob-wrap">
                    <Knob
                      clampMin={0}
                      clampMax={360}
                      // value={bandData.gain}
                      value={dryWet}
                      style={{width: knobSize, height: knobSize}} 
                      preciseMode={false} 
                      skin={s6cus} 
                      // defaultValue={controlFreq} 
                      min={0} 
                      max={100} 
                      onChange={value => { updateDryWet(Math.round(value), dryWet) }}
                    />
                  </div>
                </div>
                <div className="display-flex d-flex-c">
                  <div className="dry-wet-tag">
                    <span>dry</span>
                    <span>wet</span>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
          <div>
            <h4 style={{textAlign: "left", marginBottom: 20}}>Design, developed by <a href="/our-vision#our-team">Andrew Li</a></h4>
          </div>
        </div>
      </div>
    </>
  );
};
export default Delay;


var knobSize = '90px';
var knobSizeLarge = '150px';
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

function mFormatter(num) {
  return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + ' S' : Math.sign(num)*Math.abs(num) + 'ms'
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



function useInterval(callback, delay) {
  const savedCallback = useRef();
 
  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
 
  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
// class MultitapDelay extends Effect {
// 	constructor (context) {
// 		super(context);
// 		this.name = "MultitapDelay";
// 	}

// 	setup (delayTime=5, preDelay = 0.03) {
// 		this.effect = this.context.createConvolver();

// 		this.delayTime = delayTime;

// 		this.attack = 0.001;
// 		this.decay = 0.1;
// 		this.release = delayTime;

//     this.preDelay = this.context.createDelay(delayTime);
//     this.preDelay.delayTime.setValueAtTime(preDelay, this.context.currentTime);
    
//     this.multitap = [];
    
//     for(let i = 5; i > 0; i--) {
//       this.multitap.push(this.context.createDelay(delayTime));
//     }
//     this.multitap.map((t,i)=>{
//       if(this.multitap[i+1]) {
//         t.connect(this.multitap[i+1])
//       }
//       // t.delayTime.setValueAtTime(0.001+(i*(preDelay/2)), this.context.currentTime);
//       // console.log("conTime", (0.001+(i*(preDelay/2))));
//       // t.delayTime.setValueAtTime(i, this.context.currentTime);
//       console.log("conTime", i);
//     })
    
//     this.multitapGain = this.context.createGain();
//     this.multitap[this.multitap.length-1].connect(this.multitapGain);
    
//     this.multitapGain.gain.value = 0.2;
    
//     this.multitapGain.connect(this.output);
    
// 		this.wet = this.context.createGain();
     
//     this.input.connect(this.wet);
//     this.wet.connect(this.preDelay);
//     this.wet.connect(this.multitap[0]);
//     this.preDelay.connect(this.effect);
// 		this.effect.connect(this.output);
   
// 	}
// }


class MultitapDelay extends Effect {
	constructor (context) {
		super(context);
		this.name = "MultitapDelay";
	}

	setup (delayTime=1, preDelay = 0.03) {
    // console.log("delayTimeHere", delayTime);
		this.effect = this.context.createDelay(delayTime);
    this.effect.delayTime.setValueAtTime(delayTime, this.context.currentTime);
    // console.log("this.effect", this.effect);
    
    this.multitap = [];
    this.multitapGain = this.context.createGain();
    this.multitapGain.gain.value = 0.2;
    
    for (var i = 0; i < 5; i++) {
      var tempDelay = this.context.createDelay((i+1));
      // tempDelay.delayTime.setValueAtTime((i+1), this.context.currentTime);
      tempDelay.delayTime.value = (i + 1) * 0.01;

      // console.log("tempDelay", tempDelay, i);

      // if (i > 0 && this.multitap.length > 0) {
      //   tempDelay.connect(this.multitap[i - 1]);
      // }
      // if (i >= 4 ) {
      //   tempDelay.connect(this.multitapGain);
      // }
      // tempDelay.connect(this.multitapGain);
      this.multitap.push(tempDelay);
      // this.multitap.push(this.context.createDelay(delayTime));
    }
    // console.log("this.multitap", this.multitap);
    // for (var i = 0; i < this.multitap.length; i++) {
    //   if (i > 0) {
    //     this.multitap[i].connect(this.multitap[i-1]);
    //   }
    //   if (i >= this.multitap.length-1) {
    //     this.multitap[i].connect(this.multitapGain);
    //   }
    // }
    // console.log("multitap[0]", this.multitap[0]);
    this.multitap[0].connect(this.multitapGain);
    this.multitapGain.connect(this.output);
    // this.effect.connect(this.multitapGain);

    // this.multitap[this.multitap.length-1].connect(this.multitapGain);
    
	}
}