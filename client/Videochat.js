'use strict';

import React, {Component} from 'react';
import io from 'socket.io-client';
import {UserMedia, VideoRecorder, AudioRecorder} from 'usermedia'

var serverURL = location.protocol + '//' + location.host;
const socket = io(serverURL);

class Videochat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {videoSrc: '', videoWidth: 320, videoHeight: 240};
  }

  componentDidMount() {
    let userMediaOnSuccess = (stream) => {
      let audioRecordInterval = 500;
      let videoFrameInterval = 100;
      this.setState({videoSrc: window.URL.createObjectURL(stream)});

      // setup video frames recorder
      let videorecorder = VideoRecorder(this.localVideo, this.state.videoWidth, this.state.videoHeight, 0.1);
      videorecorder.start(videoFrameInterval, (blob) => {
        socket.emit('video', blob);
      });

      // setup audio recorder
      let audiorecorder = AudioRecorder(stream);
      audiorecorder.start(audioRecordInterval, (blob) => {
        socket.emit('audio', blob);
      });
    };

    let userMediaOnError = function (e) {
      console.log("Error ", e);
    };

    let usermedia = UserMedia(this.state.videoWidth, this.state.videoHeight);
    usermedia.connect(userMediaOnSuccess, userMediaOnError);

    // receive video frame
    socket.on("video", (image) => {
      this.setState({remoteVideoFrame: image});
    });

    // receive audio
    socket.on('audio', function (arrayBuffer) {
      let blob = new Blob([arrayBuffer], {'type': 'audio/ogg; codecs=opus'});
      let audio = document.createElement('audio');
      audio.src = window.URL.createObjectURL(blob);
      var playPromise = audio.play();

      // catch Google Chrome play error
      if (playPromise !== undefined) {
        playPromise.catch(function () {
        });
      }
    });
  }

  render() {
    return (
      <div id="videochat">
        <div id="localvideo">
          <label>Local:</label>
          <video autoPlay="true" src={this.state.videoSrc} width={this.state.videoWidth}
                 height={this.state.videoHeight} ref={(video) => {
            this.localVideo = video;
          }}/>
        </div>
        <div id="remotevideo">
          <label>Remote:</label>
          <img src={this.state.remoteVideoFrame} width={this.state.videoWidth}
               height={this.state.videoHeight}/>
        </div>
        <p>Source code: <a href="https://github.com/orlv/videochat">github.com/orlv/videochat</a></p>
      </div>
    );
  }
}

export default Videochat;
