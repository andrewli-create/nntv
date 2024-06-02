// $("aside").on( "click", alert("S") );
setTimeout(() => {
    // $( "html" ).on( "click", "aside", function() {
    //     alert("S");
    // });

    $( "<div class='widget-wrapper'><div class='clock-panel'><h2><div id='txt'></div></h2></div></div>" ).insertAfter( "header" );
    $('button:contains("Login with Netlify Identity")').text('Login to NNTV');
    
    // console.log($('*[class*="ToolbarContainer"]'));
    
    // $( "html" ).on( "click", "*[class*='ListCardLink']", function() {
    //   console.log("Hi");
    //   setTimeout(() => {
    //     $('*[class*="ToolbarContainer"]').css("background-color", "var(--cms-glossy-color-darker)");
    //   }, "1000");
    // });

    startTime();
}, "100");

$( "html" ).on( "click", "*[role='menuitem']", function() {
  alert("Logged out.");
  setTimeout(() => {
    window.location.reload();
  }, "500");
});

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
  if (document.getElementById('txt')) {
    if (s % 2 == 0) {
      document.getElementById('txt').innerHTML =  h.slice(-2) + ":" + m.slice(-2);
    } else {
      document.getElementById('txt').innerHTML =  h.slice(-2) + " " + m.slice(-2);
    }
  }
  
  setTimeout(startTime, 1000);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}