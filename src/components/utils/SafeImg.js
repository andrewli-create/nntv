import React from "react";
import Img from "gatsby-image"

const SafeImg = ({inputObj, alt, imageHeight, imagePosition, imageFit, classNames}) => {
  // console.log("SafeImg Received: ", inputObj);
  // console.log("imagePosition: ", imagePosition);
  if (!imagePosition) {
    imagePosition = "center"
  }
  return (
    <>
        {inputObj ? 
            <>
                {typeof inputObj === 'object' ? 
                    <>
                      {
                        inputObj.childImageSharp ?
                        <>
                          {
                            imageHeight ?
                              <Img className={`safe-img-obj ${classNames}`} fluid={inputObj.childImageSharp.fluid ? inputObj.childImageSharp.fluid : ""} style={{height: imageHeight}}
                                imgStyle={{
                                  objectPosition: imagePosition,
                                  objectFit: imageFit,
                                }}
                                alt={alt ? alt : ""}
                              />
                            :
                              <Img className={`safe-img-obj ${classNames}`} fluid={inputObj.childImageSharp.fluid ? inputObj.childImageSharp.fluid : ""}
                                imgStyle={{
                                  objectPosition: imagePosition,
                                  objectFit: imageFit,
                                }}
                                alt={alt ? alt : ""}
                              />
                          }
                        </>
                        :
                        <>
                          {
                            imageHeight ?
                              <img className={`safe-img-obj ${classNames}`} style={{height: imageHeight, objectPosition: imagePosition, objectFit: imageFit}} src={inputObj.publicURL} alt={alt ? alt : ""}/>
                            :
                              <img className={`safe-img-obj ${classNames}`} style={{objectPosition: imagePosition, objectFit: imageFit}} src={inputObj.publicURL} alt={alt ? alt : ""}/>
                          }
                        </>
                        
                      }
                      
                    </>
                    : 
                    <>
                      {
                        imageHeight ?
                          <img className={`safe-img ${classNames}`} src={inputObj} style={{height: imageHeight, objectPosition: imagePosition, objectFit: imageFit}} alt={alt ? alt : ""}/>
                        :
                          <img className={`safe-img ${classNames}`} src={inputObj} style={{objectPosition: imagePosition, objectFit: imageFit}} alt={alt ? alt : ""}/>
                      }
                    </>
                    
                }
            </>
            :
            <></>
        }
    </> 
  );
};

export default SafeImg;