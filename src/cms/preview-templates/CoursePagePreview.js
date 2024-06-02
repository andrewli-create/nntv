import React from 'react'
import PropTypes from 'prop-types'
import { CoursePageTemplate } from '../../templates/index-page'
import SafeImg from "../../components/utils/SafeImg"

const CoursePagePreview = ({ entry, getAsset }) => {
  
  const data = entry.getIn(['data']).toJS()
  const frontmatter = structuredClone(data);
  const dataReform = {
    markdownRemark:{
      frontmatter
  }};
  console.log("RAW Datareform", data);
  console.log("Course Datareform", dataReform);
  var dataPack = dataReform.markdownRemark.frontmatter;
  var lessonsPack = dataPack.modules;
  console.log("lessonsPack", lessonsPack);
  if (dataReform) {
    return (
      // <CoursePageTemplate data={dataReform}/>
      <div className="container">
        <div className="row al-mt-20">
          <div className="col-md-7">
            <div className="course-block display-flex d-flex-c d-flex-col" style={{height: "100%"}}>
                <div className="intro-course-block-content">
                  <h2 style={{fontSize: "20px", fontWeight: "bold"}}>
                    {dataPack.title}
                  </h2>
                  <p>
                    {dataPack.introduction}
                  </p>
                  <a href="javascript: void(0)">
                    <button className="button-generic">Start Now →</button>
                  </a>
                </div>
            </div>
          </div>
          <div className="col-md-5">
            <div className="course-block mobile-top-spacing" style={{padding: 0, overflow: "hidden"}}>
              <SafeImg inputObj={dataPack.coursethumbnail}/>
            </div>
          </div>
        </div>
        <div className="row al-mt-20">
          <div className="col-md-12">
            <div className="course-block element-block display-flex d-flex-c">
              <div className="display-flex d-flex-sb" style={{width: "90%"}}>
                {/* <LessonElement logo={alarmClock} header={"Duration"} input={dataPack.duration} additionalText={" min"}/>
                <LessonElement logo={createChart} header={"Level"} input={dataPack.level} additionalText={""}/>
                <LessonElement logo={videoPlayerMovie} header={"Lessons"} input={dataPack.numberofmodules} additionalText={" Modules"}/>
                <LessonElement logo={bookOpen} header={"Resources"} input={dataPack.resources} additionalText={""}/>
                <LessonElement logo={wifi} header={"Access"} input={dataPack.Requireaccessto} additionalText={""}/> */}
              </div>
            </div>
          </div>
        </div>
        <div className="row al-mt-20">
          <div className="col-md-6">
            <div className="course-block block-min-300">
              {/* <img src={lightbulb}/> */}
              <h5>About</h5>
              <p>{dataPack.about}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="course-block mobile-top-spacing block-min-300">
              {/* <img src={checkmarks}/> */}
              <h5>Outcomes</h5>
              <p>{dataPack.outcomes}</p>
            </div>
          </div>
        </div>
        <div id="modules" className="row al-mt-20">
          <div className="col-md-12">
            <div className="course-block">
              {/* <img src={modules}/> */}
              <h5>Modules</h5>
              <hr/>
              <section>
                <div className="row">
                  {lessonsPack
                    ? (lessonsPack.map((lesson, index) => (
                      <div className="col-md-4 col-sm-6">
                        {/* <a href={"/module/" + lesson.lessons.replace(/ /g,"-").toLowerCase()}> */}
                        <a href="javascript: void(0)">
                          <div className="video-block" style={{height: "150px"}}>
                            {/* <SafeImg inputObj={lesson.frontmatter.videothumbnail}/> */}
                            <div className="video-overlay"></div>
                            <h6 className="module-title">{("0" + (index + 1)).slice(-2) + " - "}{lesson.lessons}</h6>
                          </div>
                        </a>
                      </div>
                    )))
                    : <h5>No modules are currently available.</h5>
                  }
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return <div>Loading...</div>
  }
}

// IndexPagePreview.propTypes = {
//   entry: PropTypes.shape({
//     getIn: PropTypes.func,
//   }),
//   getAsset: PropTypes.func,
// }

export default CoursePagePreview
