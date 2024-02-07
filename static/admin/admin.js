// $("aside").on( "click", alert("S") );
setTimeout(() => {
    // $( "html" ).on( "click", "aside", function() {
    //     alert("S");
    // });

    $( "<div class='widget-wrapper'><div class='clock-panel'><h2><div id='txt'></div></h2></div></div>" ).insertAfter( "header" );
    startTime();
}, "100");


// (function() {
//     alert("Hello world");
//  })();

// setInterval(function () {element.innerHTML += "Hello"}, 1000);
setInterval(function () {console.log("admin")}, 1000);

function startTime() {
  const today = new Date();
  let h = "0" + today.getHours();
  let m = "0" + today.getMinutes();
  let s = "0" + today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  if (s % 2 == 0) {
    document.getElementById('txt').innerHTML =  h.slice(-2) + ":" + m.slice(-2);
  } else {
    document.getElementById('txt').innerHTML =  h.slice(-2) + " " + m.slice(-2);
  }
  
  setTimeout(startTime, 1000);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}