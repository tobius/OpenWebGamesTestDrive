// emtimer.js
// This script contains the harness content that is embedded on each executed page.

// If an error occurs on the page, fast-quit execution and return to harness with an error.
window.onerror = function(msg, url, line, column, e) {
  // window.opener points to the test harness window if one exists. If a test page is opened outside the harness, window.opener
  // does not exist and as a result we don't auto-close on error (but show the error to user).
  // Also ignore InvalidStateError errors because those can occur in IndexedDB operations from file:// URLs, which we don't really care about.
  if (window.opener) {
    var testResults = null;
    if (msg == 'uncaught exception: exit') { // Normal exit from test
      var timeEnd = performance.realNow();
      var duration = timeEnd - Module['timeStart'];
      var cpuIdle = (duration - accumulatedCpuTime) / duration;
      var fps = numFramesToRender * 1000.0 / duration;
      testResults = {
        result: 'PASS',
        totalTime: Math.round(duration),
        wrongPixels: 0,
        cpuTime: Math.round(accumulatedCpuTime),
        cpuIdle: 0,
        fps: 0,
        pageLoadTime: pageLoadTime,
        numStutterEvents: 0
      };
    } else if (msg.indexOf('InvalidStateError') == -1) {
      testResults = {
        result: 'ERROR',
        error: msg
      };
    }
    window.opener.postMessage(testResults, "*");
    window.onbeforeunload = null; // Don't call any application onbeforeunload handlers as a response to window.close() below.
    window.close();
  }
}

// If true, the page is run in a record mode where user interactively runs the page, and input stream is captured. Use this in
// when authoring new tests to the suite.
var recordingInputStream = location.search.indexOf('record') != -1;

// If true, we are autoplaybacking a recorded input stream. If false, input is not injected (we are likely running in an interactive examination mode of a test)
var injectingInputStream = location.search.indexOf('playback') != -1;

// In test mode (injectingInputStream == true), we always render this many fixed frames, after which the test is considered finished.
// ?numframes=number GET parameter can override custom test length.
var numFramesToRender = 2000;
if (location.search.indexOf('numframes=') != -1) {
  numFramesToRender = parseInt(location.search.substring(location.search.indexOf('numframes=') + 'numframes='.length));
}

// Currently executing frame.
var referenceTestFrameNumber = 0;

// Wallclock time denoting when the page has finished loading.
var pageLoadTime = null;

// Tallies up the amount of CPU time spent in the test.
var accumulatedCpuTime = 0;

// Some tests need to receive a monotonously increasing time counter, but can't pass real wallclock time, which would make the test timing-dependent, so instead
// craft an arbitrary increasing counter.
var fakedTime = 0;

// Keeps track of performance stutter events. A stutter event occurs when there is a hiccup in subsequent per-frame times. (fast followed by slow)
var numStutterEvents = 0;

// Mock performance.now() and Date.now() to be deterministic.
performance.realNow = performance.now;
if (injectingInputStream || recordingInputStream) {
  if (window.location.href.indexOf('MathGeoLib') == -1) {
    // TODO: Make this a parameter of the test that is passed in, instead of hardcoding names here.
    var needsFakeMonotonouslyIncreasingTimer = window.location.href.indexOf('ShooterGame') != -1 || window.location.href.indexOf('StrategyGame') != -1 || window.location.href.indexOf('osmos') != -1 || window.location.href.indexOf('Soul-live') != -1;

    if (needsFakeMonotonouslyIncreasingTimer) {
      Date.now = function() { return fakedTime++; }
      performance.now = function() { return fakedTime++; }
    } else {
      Date.now = function() { return referenceTestFrameNumber * 1000.0 / 60.0; }
      performance.now = function() { return referenceTestFrameNumber * 1000.0 / 60.0; }
    }
    // This is an unattended run, don't allow window.alert()s to intrude.
    window.alert = function(msg) { console.error('window.alert(' + msg + ')'); }
    window.confirm = function(msg) { console.error('window.confirm(' + msg + ')'); return true; }
  }
}

// XHRs in the expected render output image, always 'reference.png' in the root directory of the test.
function loadReferenceImage() {
  var img = new Image();
  img.src = 'reference.png';
  img.onload = function() {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    Module['referenceImageData'] = ctx.getImageData(0, 0, img.width, img.height).data;
  }
  Module['referenceImage'] = img;
}

// Performs the per-pixel rendering comparison test.
function doReferenceTest() {
  var ctx;
  // Find Emscripten-specific location of the GL context that the page has been rendering to.
  if (typeof GLctx !== 'undefined') ctx = GLctx;
  else if (Module.ctx) ctx = Module.ctx;
  else ctx = Module['canvas'].getContext('webgl');

  // Grab rendered WebGL front buffer image to a JS-side image object.
  var actualImage = new Image();
  actualImage.src = ctx.canvas.toDataURL();
  actualImage.onload = function() {
    var img = Module['referenceImage'];
    var div = document.createElement('div');
    
    var actualCanvas = document.createElement('canvas');
    actualCanvas.width = actualImage.width;
    actualCanvas.height = actualImage.height;
    var actualCtx = actualCanvas.getContext('2d');
    actualCtx.drawImage(actualImage, 0, 0);
    var actual = actualCtx.getImageData(0, 0, actualImage.width, actualImage.height).data;
    
    var total = 0;
    var width = img.width;
    var height = img.height;
    var expected = Module['referenceImageData'];
    // Compute per-pixel error diff.
    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        total += Math.abs(expected[y*width*4 + x*4 + 0] - actual[y*width*4 + x*4 + 0]);
        total += Math.abs(expected[y*width*4 + x*4 + 1] - actual[y*width*4 + x*4 + 1]);
        total += Math.abs(expected[y*width*4 + x*4 + 2] - actual[y*width*4 + x*4 + 2]);
      }
    }
    var wrong = Math.floor(total / (img.width*img.height*3)); // floor, to allow some margin of error for antialiasing

    // Hide all other elements on the page, only show the expected and observed rendered images.
    var cn = document.body.childNodes;
    for(var i = 0; i < cn.length; ++i) {
      if (cn[i] && cn[i].style) cn[i].style.display = 'none';
    }
    
    var timeEnd = performance.realNow();
    var duration = timeEnd - Module['timeStart'];
    var cpuIdle = (duration - accumulatedCpuTime) / duration;
    var fps = numFramesToRender * 1000.0 / duration;

    var testResults = {
      totalTime: Math.round(duration),
      wrongPixels: wrong,
      cpuTime: Math.round(accumulatedCpuTime),
      cpuIdle: cpuIdle,
      fps: fps,
      pageLoadTime: pageLoadTime,
      numStutterEvents: numStutterEvents
    };

    if (wrong < 10) { // Allow a bit of leeway.
      testResults.result = 'PASS';
      div.innerHTML = 'TEST PASSED. Timescore: ' + duration.toFixed(2) + '. (lower is better)';
      div.style.color = 'green';
      document.body.appendChild(div);
      document.body.appendChild(actualImage); // to grab it for creating the test reference
    } else {
      testResults.result = 'FAIL';
      document.body.appendChild(img); // for comparisons
      div.innerHTML = 'TEST FAILED! The expected and actual images differ on average by ' + wrong + ' units/pixel. ^=expected, v=actual. Timescore: ' + duration.toFixed(3) + '. (lower is better)';
      div.style.color = 'red';
      document.body.appendChild(div);
      document.body.appendChild(actualImage); // to grab it for creating the test reference
    }

    if (window.opener) {
      // Post out test results.
      window.opener.postMessage(testResults, "*");
      window.onbeforeunload = null; // Don't call any application onbeforeunload handlers as a response to window.close() below.
      window.close();
    }
  }

  // Emscripten-specific: stop rendering the page further.  
  Browser.mainLoop.pause();
  Browser.mainLoop.func = null;
}

// eventType: "mousemove", "mousedown" or "mouseup".
// x and y: Normalized coordinate in the range [0,1] where to inject the event.
// button: which button was clicked. 0 = mouse left button. If eventType="mousemove", pass 0.
function simulateMouseEvent(eventType, x, y, button) {
  // Remap from [0,1] to canvas CSS pixel size.
  x *= Module['canvas'].clientWidth;
  y *= Module['canvas'].clientHeight;
  var rect = Module['canvas'].getBoundingClientRect();
  // Offset the injected coordinate from top-left of the client area to the top-left of the canvas.
  x = Math.round(rect.left + x);
  y = Math.round(rect.top + y);
  var e = document.createEvent("MouseEvents");
  e.initMouseEvent(eventType, true, true, window,
                   eventType == 'mousemove' ? 0 : 1, x, y, x, y,
                   0, 0, 0, 0,
                   button, null);

  // TODO: Don't hardcode this, but make it a parameter of the test, or find a way to autodetect.
  var testUsesEmscriptenHTML5API = window.location.href.indexOf('PrimeWorldDefenders') == -1 && window.location.href.indexOf('StrategyGame') == -1 && window.location.href.indexOf('JackLumber') == -1 && window.location.href.indexOf('DeadTrigger') == -1;

  // Dispatch to Emscripten's html5.h API:
  if (testUsesEmscriptenHTML5API && typeof JSEvents !== 'undefined' && JSEvents.eventHandlers && JSEvents.eventHandlers.length > 0) {
    for(var i = 0; i < JSEvents.eventHandlers.length; ++i) {
      if ((JSEvents.eventHandlers[i].target == Module['canvas'] || JSEvents.eventHandlers[i].target == window)
       && JSEvents.eventHandlers[i].eventTypeString == eventType) {
         JSEvents.eventHandlers[i].handlerFunc(e);
      }
    }
  } else {
    // Dispatch directly to browser
    Module['canvas'].dispatchEvent(e);
  }
}

function simulateKeyEvent(eventType, keyCode, charCode) {
  // Don't use the KeyboardEvent object because of http://stackoverflow.com/questions/8942678/keyboardevent-in-chrome-keycode-is-0/12522752#12522752
  // See also http://output.jsbin.com/awenaq/3
  //    var e = document.createEvent('KeyboardEvent');
  //    if (e.initKeyEvent) {
  //      e.initKeyEvent(eventType, true, true, window, false, false, false, false, keyCode, charCode);
  //  } else {

  var e = document.createEventObject ? document.createEventObject() : document.createEvent("Events");
    if (e.initEvent) {
      e.initEvent(eventType, true, true);
    }

  e.keyCode = keyCode;
  e.which = keyCode;
  e.charCode = charCode;
  //  }


  // TODO: Don't hardcode this, but make it a parameter of the test, or find a way to autodetect.
  var testUsesEmscriptenHTML5API = window.location.href.indexOf('DeadTrigger') == -1;

  // Dispatch directly to Emscripten's html5.h API:
  if (testUsesEmscriptenHTML5API && typeof JSEvents !== 'undefined' && JSEvents.eventHandlers && JSEvents.eventHandlers.length > 0) {
    for(var i = 0; i < JSEvents.eventHandlers.length; ++i) {
      if ((JSEvents.eventHandlers[i].target == Module['canvas'] || JSEvents.eventHandlers[i].target == window)
       && JSEvents.eventHandlers[i].eventTypeString == eventType) {
         JSEvents.eventHandlers[i].handlerFunc(e);
      }
    }
  } else {
    // Dispatch to browser for real
    Module['canvas'].dispatchEvent ? Module['canvas'].dispatchEvent(e) : Module['canvas'].fireEvent("on" + eventType, e); 
  }
}

// Wallclock time for when we started CPU execution of the current frame.
var referenceTestT0 = 0;

function referenceTestPreTick() {
  referenceTestT0 = performance.realNow();
  if (pageLoadTime === null) pageLoadTime = performance.realNow() - pageStartupT0;
}
Module['referenceTestPreTick'] = referenceTestPreTick;

// Captures the whole input stream as a JavaScript formatted code.
var recordedInputStream = 'function injectInputStream(referenceTestFrameNumber) { <br>';

function dumpRecordedInputStream() {  
  recordedInputStream += '}<br>';

  var div = document.createElement('div');
  div.innerHTML = '<pre>'+recordedInputStream+'</pre>';
  document.body.appendChild(div);
}

// Perform a nice fade-in and fade-out of audio volume.
function manageOpenALAudioMasterVolumeForTimedemo() {
  var fadeTime = 90;
  var silenceTime = 90;
  // Only fade out for now.
  if (referenceTestFrameNumber < numFramesToRender-fadeTime-silenceTime) return;

  function ramp(x0, y0, x1, y1, val) {
    return (val <= x0) ? y0 : (val >= x1 ? y1 : ((val-x0)/(x1-x0)*(y1-y0) + y0));
  }
  var desiredAudioVolume = Math.min(ramp(0, 0.0, fadeTime, 1.0, referenceTestFrameNumber), ramp(numFramesToRender-fadeTime-silenceTime, 1.0, numFramesToRender-silenceTime, 0.0, referenceTestFrameNumber));

  function applyGain(inst, value) {
    if (inst && inst.gain && inst.gain.gain) {
      if (inst.gain.gain.originalValue === undefined) inst.gain.gain.originalValue = inst.gain.gain.value;
      inst.gain.gain.value = desiredAudioVolume * inst.gain.gain.originalValue;
    }
  }

  var pageBGAudio = document.getElementById('AudioElement');
  if (pageBGAudio) pageBGAudio.volume = desiredAudioVolume;

  if (typeof AL !== 'undefined' && AL.currentContext && AL.currentContext.gain) {
    AL.currentContext.gain.value = desiredAudioVolume;
  } else {
    if (typeof AL !== 'undefined' && AL.src) {
      for(var i = 0; i < AL.src.length; ++i) {
        var src = AL.src[i];
        applyGain(src, desiredAudioVolume);
      }
    }
  }
  if (typeof WEBAudio !== 'undefined' && WEBAudio.audioInstances) {
    for (var i in WEBAudio.audioInstances) {
      var inst = WEBAudio.audioInstances[i];
      applyGain(inst, desiredAudioVolume);
    }
  }
}

// Holds the amount of time in msecs that the previously rendered frame took. Used to estimate when a stutter event occurs (fast frame followed by a slow frame)
var lastFrameDuration = -1;

// Wallclock time for when the previous frame finished.
var lastFrameTick = -1;

function referenceTestTick() {
  var t1 = performance.realNow();
  accumulatedCpuTime += t1 - referenceTestT0;

  var frameDuration = t1 - lastFrameTick;
  lastFrameTick = t1;
  if (referenceTestFrameNumber > 5 && lastFrameDuration > 0) {
    if (frameDuration > 20.0 && frameDuration > lastFrameDuration * 1.35) {
      ++numStutterEvents;
    }
  }
  lastFrameDuration = frameDuration;

  ++referenceTestFrameNumber;
  if (referenceTestFrameNumber == 1) {
    Module['timeStart'] = t1;
    loadReferenceImage();
  }
  if (injectingInputStream) {
    if (typeof injectInputStream !== 'undefined') {
      injectInputStream(referenceTestFrameNumber);
    }
    manageOpenALAudioMasterVolumeForTimedemo();
  }
  if (referenceTestFrameNumber == numFramesToRender) {
    if (recordingInputStream) {
      dumpRecordedInputStream();
    } else if (injectingInputStream) {
      doReferenceTest();
    }
  }
}
Module['referenceTestTick'] = referenceTestTick;

// Maps mouse coordinate from canvas CSS pixels to normalized [0,1] range. In y coordinate y grows downwards.
function computeNormalizedCanvasPos(e) {
  var rect = Module['canvas'].getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  var clientWidth = Module['canvas'].clientWidth;
  var clientHeight = Module['canvas'].clientHeight;
  x /= clientWidth;
  y /= clientHeight;
  return [x, y];
}

// Inject mouse and keyboard capture event handlers to record input stream.
if (recordingInputStream) {
  Module['canvas'].addEventListener("mousedown", function(e) {
    var pos = computeNormalizedCanvasPos(e);
    recordedInputStream += 'if (referenceTestFrameNumber == ' + referenceTestFrameNumber + ') simulateMouseEvent("mousedown", '+ pos[0] + ', ' + pos[1] + ', 0);<br>';
    });

  Module['canvas'].addEventListener("mouseup", function(e) {
    var pos = computeNormalizedCanvasPos(e);
    recordedInputStream += 'if (referenceTestFrameNumber == ' + referenceTestFrameNumber + ') simulateMouseEvent("mouseup", '+ pos[0] + ', ' + pos[1] + ', 0);<br>';
    });

  Module['canvas'].addEventListener("mousemove", function(e) {
    var pos = computeNormalizedCanvasPos(e);
    recordedInputStream += 'if (referenceTestFrameNumber == ' + referenceTestFrameNumber + ') simulateMouseEvent("mousemove", '+ pos[0] + ', ' + pos[1] + ', 0);<br>';
    });

  window.addEventListener("keydown", function(e) {
    recordedInputStream += 'if (referenceTestFrameNumber == ' + referenceTestFrameNumber + ') simulateKeyEvent("keydown", ' + e.keyCode + ', ' + e.charCode + ');<br>';
    });

  window.addEventListener("keyup", function(e) {
    recordedInputStream += 'if (referenceTestFrameNumber == ' + referenceTestFrameNumber + ') simulateKeyEvent("keyup", ' + e.keyCode + ', ' + e.charCode + ');<br>';
    });

}

// Hide a few Emscripten-specific page elements from the default shell to remove unwanted interactivity options.
if (injectingInputStream || recordingInputStream) {
  var elems = document.getElementsByClassName('fullscreen');
  for(var i in elems) {
    var e = elems[i];
    e.style = 'display:none';
  }
  var output = document.getElementById('output');
  if (output)
    output.style = 'display:none';
}

// Page load starts now.
var pageStartupT0 = performance.realNow();
