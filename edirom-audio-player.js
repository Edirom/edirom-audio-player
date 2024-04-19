class EdiromAudioPlayer extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
  }

  // connect component
  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  // component attributes
  static get observedAttributes() {
    return ['set-tracks', 'set-height', 'set-width', 'set-state', 'set-track', 'set-time', 'set-end', 'set-playbackrate', 'set-mode'];
  }

  // attribute change
  attributeChangedCallback(property, oldValue, newValue) {

    this[ property.substring(4) ] = newValue;   


    // set new value to get-* attribute 
    this.setAttribute("get-"+property.substring(4), newValue);

     

    const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');


    switch(property) {
      case 'set-tracks':

        break;
      case 'set-height':
        
        break;
      case 'set-width':
        
        break;
      case 'set-state':
        this.setState(newValue);
        break;
      case 'set-track':
        this.playTrack(newValue);
        break;
      case 'set-time':
        //audioPlayer.currentTime = newValue;
        break;
      case 'set-end':
        
        break;
      case 'set-playbackrate':
        
        break;
      case 'set-mode':
        
        break;
      default:
        console.log("Invalid attribute: '"+property+"'");
    }
  }

  // render component
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        #player {
          height: 100%;
          width: 100%;
          container: player / inline-size;
        }
        #controls {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 2px solid #aaa;
        }
        #controls button {
          display: inline-block;
          border: none;
          background: none;
        }
        #controls button svg {
          height: 24px;
          width: 24px;
          margin: 5px;
        }
        #controls #replayButton, 
        #controls #forwardButton, 
        #controls #rewindButton {
          display: none;
        }
        #timeInfo {
          margin-top: 10px;
        }
        #timeInfo input {
          min-width: 70%;
        }
        #timeInfo span {
          font-size: 0.875rem;
          font-family: 'Roboto', sans-serif;
          text-align: center;
        }
        .track-button {
          display: block;
          margin: 10px 0;
          padding: 6px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.75;
          letter-spacing: 0.02857em;
          color: rgba(0, 0, 0, 0.87);
          border: none;
          border-radius: 4px;
          background-color: #e0e0e0;
          transition: background-color 0.3s;
          position: relative;
          padding-left: 40px;
        }
        .track-button::before {
          content: url("data:image/svg+xml,${encodeURIComponent(this.getSVG('play'))}");
          position: absolute;
          left: 10px; 
          top: 20px;
          transform: translateY(-50%);
          width: 24px; 
          height: 24px; 
          background-image: url('');
          background-size: contain;
          background-repeat: no-repeat;
        }
        .track-button:hover {
          background-color: #d5d5d5;
        }
        .track-button:active {
          background-color: #aaaaaa;
        }
        .track-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.12);
        }

        
        /* height-dependent rules */

        
        /* width-dependent rules */

        @container player (width > 380px){          
          #controls #replayButton, 
          #controls #forwardButton, 
          #controls #rewindButton {
            display: inline-block;
          }
        }
      </style>
      ${this.getPlayerHTML()}
    `;
  }

  getSVG(iconName){

    /* Icon source: https://fonts.google.com/icons?icon.query=play */

    switch(iconName) {
      case 'play':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M320-203v-560l440 280-440 280Zm60-280Zm0 171 269-171-269-171v342Z"/></svg>';
        break
      case 'pause':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M525-200v-560h235v560H525Zm-325 0v-560h235v560H200Zm385-60h115v-440H585v440Zm-325 0h115v-440H260v440Zm0-440v440-440Zm325 0v440-440Z"/></svg>';
        break
      case 'next':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M680-240v-480h60v480h-60Zm-460 0v-480l346 240-346 240Zm60-240Zm0 125 181-125-181-125v250Z"/></svg>';
        break
      case 'prev':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M220-240v-480h60v480h-60Zm520 0L394-480l346-240v480Zm-60-240Zm0 125v-250L499-480l181 125Z"/></svg>';
        break;
      case 'rewind':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M854-240 508-480l346-240v480Zm-402 0L106-480l346-240v480Zm-60-240Zm402 0ZM392-355v-250L211-480l181 125Zm402 0v-250L613-480l181 125Z"/></svg>';
        break
      case 'forward':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M104-240v-480l346 240-346 240Zm407 0v-480l346 240-346 240ZM164-480Zm407 0ZM164-355l181-125-181-125v250Zm407 0 181-125-181-125v250Z"/></svg>';
        break
      case 'replay':
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-75 0-140.5-28T225-185q-49-49-77-114.5T120-440h60q0 125 87.5 212.5T480-140q125 0 212.5-87.5T780-440q0-125-85-212.5T485-740h-23l73 73-41 42-147-147 147-147 41 41-78 78h23q75 0 140.5 28T735-695q49 49 77 114.5T840-440q0 75-28 140.5T735-185q-49 49-114.5 77T480-80Z"/></svg>';
        break
      case 'tracksAdd':
        return '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M120-330v-60h300v60H120Zm0-165v-60h470v60H120Zm0-165v-60h470v60H120Zm530 500v-170H480v-60h170v-170h60v170h170v60H710v170h-60Z"/></svg>';
        break
      case 'tracksRemove':
        return '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m571-80-43-43 114-113-114-113 43-43 113 114 113-114 43 43-114 113 114 113-43 43-113-114L571-80ZM120-330v-60h300v60H120Zm0-165v-60h470v60H120Zm0-165v-60h470v60H120Z"/></svg>';
        break
      default:
        console.log("Invalid icon name: '"+iconName+"'");
        return 'ERR';
    }
    
  }


  getPlayerHTML() {

    let playerInnerHTML;
    const displayMode = this.getAttribute('set-mode');


    switch(displayMode) { 
      case 'controls-sm':
        playerInnerHTML = this.getControlsHTML(['replay', 'prev', 'rewind', 'play', 'forward', 'next', 'tracksAdd']);
        break;
      case 'controls-md':
        playerInnerHTML = this.getControlsHTML(['replay', 'prev', 'rewind', 'play', 'forward', 'next', 'tracksAdd']);
        playerInnerHTML += this.getTimeHTML();
        break;
      case 'controls-lg':
        playerInnerHTML = this.getControlsHTML(['replay', 'prev', 'rewind', 'play', 'forward', 'next', 'tracksAdd']);
        playerInnerHTML += this.getTimeHTML();
        break;
      case 'tracks-sm':
        playerInnerHTML = this.getTracksHTML();
        break;
      case 'tracks-md':
        playerInnerHTML = this.getTracksHTML();
        break;
      case 'tracks-lg':
        playerInnerHTML = this.getTracksHTML();
        break;
      default:
        playerInnerHTML = '<p>Error: Invalid display mode</p>';
        console.log("Invalid display mode: '"+displayMode+"'");
    }

    return '<div id="player" class="'+displayMode+'">'+playerInnerHTML+'</div>';

  }

  getControlsHTML(buttons) {

    const tracks = JSON.parse(this.getAttribute('set-tracks'));
    const currentTrack = tracks[this.getAttribute('set-track')];
    const trackSteps = [ { "replay": "0" }, { "prev": "-1" }, { "next": "+1" } ];

    let controlsDiv = document.createElement('div');
    controlsDiv.id = 'controls';
        
    // Create and fill audio element
    let audioElem = document.createElement('audio');
    audioElem.id = 'audioPlayer';
    audioElem.controls = true;
    audioElem.style.display = 'none';

    // Create and fill source element
    let sourceElem = document.createElement('source');
    sourceElem.src = currentTrack.src;
    sourceElem.type = currentTrack.type;
    sourceElem.innerHTML = 'Your browser does not support the audio element.';

    // Append elements
    audioElem.appendChild(sourceElem);
    controlsDiv.appendChild(audioElem);

    // Create and fill button elements
    buttons.forEach(button => {
      let buttonElem = document.createElement('button');
      buttonElem.id = button+'Button';
      buttonElem.title = button;

      // add class and data-trackstep attribute to buttons to indicate how many tracks should be forwarded or rewinded
      if(trackSteps.find(step => step[button])){
        buttonElem.classList.add('track-toggler');
        buttonElem.dataset.trackstep = trackSteps.find(step => step[button])[button];
      }

      // Add SVG to button
      buttonElem.innerHTML = this.getSVG(button);

      // Append button to controlsDiv
      controlsDiv.appendChild(buttonElem);
    });


    return controlsDiv.outerHTML;
  }

  getTimeHTML() {

    var timeHTML;
    timeHTML = `
      <div id="timeInfo">
        <input type="range" id="progressSlider" min="0" max="100" value="0">
        <span id="currentTime">0:00</span> / <span id="totalTime">0:00</span>
      </div>
    `;
    return timeHTML;
  }


  getTracksHTML() {
    const tracks = JSON.parse(this.getAttribute('set-tracks'));

    const tracksHTML = tracks.map((track, idx) => `<div class="track-button track-toggler" data-trackidx="${idx}">
      <div class="track-title">${track.title}</div>
      <div class="track-subtitle">${track.composer} - ${track.work}</div>
    </div>
    `).join('');

    return '<div id="tracks">'+tracksHTML+'</div>';
  }

  playTrack(i){
    const tracks =JSON.parse(this.tracks);
    const nextTrack = tracks[i];
    const source = this.shadowRoot.querySelector('source');
    source.src = nextTrack.src;
    source.type = nextTrack.type;

    const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
    audioPlayer.load();
    this.setState('play');
  }


  setState(state) {
    const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
    const playButton = this.shadowRoot.querySelector('#playButton');

    this.state = state;
    this.setAttribute('get-state', state);

    if (state === 'play') {
      audioPlayer.play();
      playButton.innerHTML = this.getSVG('pause');
      playButton.setAttribute('title', 'pause');
    } else if(state === 'pause') {
      audioPlayer.pause();
      playButton.innerHTML = this.getSVG('play');
      playButton.setAttribute('title', 'play');
    } else {
      console.log("Invalid state: '"+state+"'");
    }
  }


  /**
   * Add event listeners to the buttons
   */
  addEventListeners() {

    const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
    const progressSlider = this.shadowRoot.querySelector('#progressSlider');
    const currentTimeDisplay = this.shadowRoot.querySelector('#currentTime');
    const totalTimeDisplay = this.shadowRoot.querySelector('#totalTime');

    

    /** Event listener for play/pause button */
    this.shadowRoot.querySelector('#playButton').addEventListener('click', () => {
      const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
      return audioPlayer.paused ? this.setState('play') : this.setState('pause');
    });
    
    /** 
     * Event listener for prev/next buttons.
     * It listens to all elements with class .track-toggler and reads the data-trackstep attribute to get an info how many tracks
     * should be forwarded or rewinded. This allows for buttons to forward or rewind any number of tracks -> +/-n steps 
     */
    this.shadowRoot.querySelectorAll('.track-toggler').forEach(button => {
      button.addEventListener('click', (evt) => {

        const trackStep = evt.currentTarget.dataset.trackstep;
        const trackIdx = evt.currentTarget.dataset.trackidx;
        const tracks = JSON.parse(this.getAttribute('tracks'));
  
        var nextTrackIndex = !!trackIdx ? trackIdx : (parseInt(this.getAttribute('set-track')) + parseInt(trackStep));

        if(nextTrackIndex < 0) { nextTrackIndex = tracks.length - 1 }
        if(nextTrackIndex >= tracks.length) { nextTrackIndex = 0 }
        
        this.setAttribute('get-track', nextTrackIndex);
        this.playTrack(nextTrackIndex);
      
      });

    });

    /** Event listener for tracking time update of audio player */
    audioPlayer.addEventListener("timeupdate", () => {
      this.setAttribute("get-time", this.shadowRoot.querySelector('#audioPlayer').currentTime);

      const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressSlider.value = progress;
  
      const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
      const currentSeconds = Math.floor(audioPlayer.currentTime % 60);
      currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
  
      const totalMinutes = Math.floor(audioPlayer.duration / 60);
      const totalSeconds = Math.floor(audioPlayer.duration % 60);
      totalTimeDisplay.textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
    });

    /** Event listener for tracking progress slider */
    progressSlider.addEventListener('input', (event) => {
      audioPlayer.currentTime = (event.target.value / 100) * audioPlayer.duration;
    });

    this.shadowRoot.querySelector('#tracksButton').addEventListener('click', () => {
      const tracksDiv = this.shadowRoot.querySelector('#tracks');
      const tracksButton = this.shadowRoot.querySelector('#tracksButton');
      tracksButton.innerHTML = tracksDiv.style.display === 'none' ? this.PLAYLISTRMV_SVG : this.PLAYLISTADD_SVG;      
      tracksDiv.style.display = tracksDiv.style.display === 'none' ? 'block' : 'none';
    });

  }
}

customElements.define('edirom-audio-player', EdiromAudioPlayer);
