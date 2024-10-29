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
import audioFile from "../../static/audio/test-audio.mp3"

// let newAtcx = new AudioContext();
// let newSource = newAtcx.createBufferSource();
// const mainContext = new AudioContext();
// const context = new AudioContext();

// const audioPlayFunc = async url => {
//   const context = new AudioContext();
//   const source = context.createBufferSource();
//   const audioBuffer = await fetch(url)
//     .then(res => res.arrayBuffer())
//     .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer));

//   source.buffer = audioBuffer;
//   source.connect(context.destination);
//   source.start();
// };

const context = new AudioContext();
var source;
var isPlaying = false;
var lowPass = context.createBiquadFilter();
lowPass.type = "lowpass";
lowPass.frequency.value = 880;
lowPass.Q.value = 0.7;

const audioPlayFunc = async (url) => {
  if (!isPlaying) {
    if (!source) {
      source = context.createBufferSource();
      source.connect(lowPass);
      lowPass.connect(context.destination);
      // source.connect(context.destination);
      const audioBuffer = await fetch(url)
        .then(res => res.arrayBuffer())
        .then(ArrayBuffer => context.decodeAudioData(ArrayBuffer))
        .then(source.start());
      console.log("Audio Buffer Loaded!", audioBuffer);
      source.buffer = audioBuffer;
      isPlaying = true;
    } else {
      source.start();
      isPlaying = true;
    }
  } else {
    if (source) {
      source.stop();
      source.disconnect(lowPass);
      source = null;
      isPlaying = false;
    }
  }
};

const eqAdjust = (value) => {
  lowPass.frequency.value = value;
}

const togglePlay = (toggler) => {
  console.log("source.buffer", source.buffer);
  if (!isPlaying) {
    source.start();
    isPlaying = true;
  } else {
    source.stop();
    isPlaying = false;
  }
  
  // console.log("source", source);
  // console.log("toggler", toggler);
  if (toggler == true) {
    // source.start();
  } else {
    // source.stop();
  }
  // if (source.buffer != null) {
  //   if (toggler == true) {
  //     source.start();
  //   } else {
  //     source.stop();
  //   }
  // } else {
  //   console.log("Audio Buffer not loaded");
  // }
}


// let newOut = newAtcx.destination;
// let newAudio = new Audio(audioFile);
// let newSource = newAtcx.createMediaElementSource(newAudio);
// newSource.connect(newOut);

const EQ = ({ children }) => {

  const [activeFreqTag, setActiveFreqTag] = useState(1);
  const [activeFreqClassName, setActiveFreqClassName] = useState("eq-knob-wrapper eq-knob-wrapper-1");
  const [audioPlay, setAudioPlay] = useState(false);
  const [audioHolder, setAudioHolder] = useState(new Audio(audioFile));
  // const [audioContext, setAudioContext] = useState(new AudioContext());
  const audioRef = useRef(new Audio(audioFile));
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const lowPassRef = useRef(null);

  // const [lowPass, setLowPass] = useState();

  // const audioPlayFunc = async url => {
  //   const source = newAtcx.createBufferSource();
  //   const audioBuffer = await fetch(url)
  //     .then(res => res.arrayBuffer())
  //     .then(ArrayBuffer => newAtcx.decodeAudioData(ArrayBuffer));

  //   source.buffer = audioBuffer;
  //   source.connect(newAtcx.destination);
  //   source.start();
  // };
  useEffect(() => {
    // audioRef.current = new Audio(audioFile);
    // audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    // audioSourceRef.current = audioContextRef.current.createMediaElementSource(audioHolder);
    // audioPlayFunc(audioFile);
    // audioSourceRef.current.connect(audioContextRef.current.destination);
    // lowPassRef.current = audioContextRef.current.createBiquadFilter();

    // audioSourceRef.current.connect(lowPassRef.current);
    

    // lowPassRef.current.type = "lowpass";
    // lowPassRef.current.frequency.value = 880;
    // lowPassRef.current.Q.value = 0.7;

    console.log("audioContextRef", audioContextRef);
    console.log("audioRef", audioRef);
    console.log("audioSourceRef", audioSourceRef);
    console.log("lowPassRef", lowPassRef);
    // audioContextRef = new AudioContext();
    // audioSourceRef = audioContextRef.createMediaElementSource(audioHolder);
    // const audio = new Audio(audioFile);
    // audioContext = new AudioContext();
    // audio = new Audio(audioFile);
    // source = audioContext.createMediaElementSource(audio);
    // lowPass = audioContext.createBiquadFilter();
    // setAudioSource(audioContext.createMediaElementSource(audioHolder));
    // setLowPass(audioContext.createBiquadFilter());
    // lowPass.connect(audioContext.destination);
    // lowPass.type = "lowpass";
    // lowPass.frequency.value = 880;
    // lowPass.Q.value = 0.7;
    // audioSource.connect(audioContext.destination);
    // source.connect(audioContext.destination);
    // console.log("audio file", audioFile);
    // console.log("audio", audio);
    // audio = new Audio(audioFile);
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
  
  return (
    <>
      <div className="plugin-wrapper">
        <hr className="plugin-top-bar"/>
        <div className="plugin-content-wrapper">
          <div className="plugin-screen eq-line"></div>
          <div className="plugin-frequency-wrapper">
            <span>40Hz</span>
            <span>125Hz</span>
            <span>500Hz</span>
            <span>2KHz</span>
            <span>8KHz</span>
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
              <button onClick={() => {audioPlayFunc(audioFile); setAudioPlay(!audioPlay);}}>Play</button>
              {/* <audio id="audio_tag" src={mySound} /> */}
              {/* <audio id="audio_tag" src={audioFile} /> */}
              <input type="range" min={100} max={880} onChange={(e) => eqAdjust(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default EQ;
