/*
Copyright 2012 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Eric Bidelman (ericbidelman@chromium.org)
*/

/**
 * Grabs the camera feed from the browser, requesting
 * both video and audio. Requires the permissions
 * for audio and video to be set in the manifest.
 *
 * @see http://developer.chrome.com/apps/manifest.html#permissions
 */

var curStream = null; // keep track of current stream

function getCamera() {
  var cameraSrcId = document.querySelector('select').value;

  // constraints allow us to select a specific video source 
  var constraints = {
    video: {
      optional: [{
        sourceId: cameraSrcId
      }]
    },
    audio:true
  }

  // stop any previous stream (eg. while switching between cameras)
  if(curStream) {
    curStream.stop();
  }

  navigator.webkitGetUserMedia(constraints, function(stream) {
    var videoElm = document.querySelector('video');

    videoElm.src = URL.createObjectURL(stream);
    curStream = stream;

    curStream.onended = function() {
      updateButtonState();
      videoElm.src = "";
    }

    videoElm.onplay = function() {
      updateButtonState();  
    }

    videoElm.play();

  }, function(e) {
    curStream = null;
    console.error(e);
  });
}

/**
 * Click handler to init the camera grab
 */
document.querySelector('button').addEventListener('click', function(e) {
  // camera is active, stop stream
  if(curStream && curStream.active) {
    curStream.stop();
  }
  else {
    getCamera();
  }

});

/**
 * Change stream source according to dropdown selection
 */
document.querySelector('select').onchange = function() {
  if(curStream && curStream.active) {
    getCamera();
  }
}

/**
 * Updates button state according to Camera stream status
 */

function updateButtonState() {
  var btn = document.querySelector('button');
  btn.disabled = false;

  if((!curStream) || (!curStream.active)) {
    btn.innerHTML = "Enable Camera";
  }
  else {
    btn.innerHTML = "Disable Camera"; 
  }
}

/**
 * Populate camera sources drop down
 */

getVideoSources(function(cameras){
  var ddl = document.querySelector('select');
  if(cameras.length == 1) {
    // if only 1 camera is found drop down can be disabled
    ddl.disabled = true;
  }

  cameras.forEach(function(camera){
    var opt = document.createElement('option');
    opt.value = camera.id;
    opt.appendChild(document.createTextNode(camera.label));

    ddl.appendChild(opt);
  });   
}); 

/**
 * This retrieves video sources and passes them to callback parameter
 */

function getVideoSources(callback) {
  var videoSources = [];
  callback = callback || function(){};

  MediaStreamTrack.getSources(function(sources){
    sources.forEach(function(source,index){
      if(source.kind === 'video') {
        // we only need to enlist video sources
        videoSources.push({
          id: source.id,
          label: source.label || 'Camera '+(videoSources.length+1)
        });  
      }
    });

    callback(videoSources);
  });
}