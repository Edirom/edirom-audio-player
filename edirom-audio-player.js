/**
 * Represents the EdiromAudioPlayer custom element.
 * @class
 * @extends HTMLElement
 */
class EdiromAudioPlayer extends HTMLElement {

  /**
   * Creates an instance of EdiromAudioPlayer.
   * @constructor
   */
  constructor() {

    super();

    /** attach shadow root with mode "open" */
    this.attachShadow({ mode: 'open' });

    //Define a FontFace
    const font = new FontFace("Material Symbols Outlined", "url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v192/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHOej.woff2)", {
      style: "normal",
      weight: "100 700"
    });

    // wait for font 
    font.load().then((loaded_face) => {
      document.fonts.add(loaded_face)
    }).catch((error) => { });

  }

  
  /**
   * Returns the list of observed attributes for the EdiromAudioPlayer custom element.
   * @static
   * @returns {Array<string>} The list of observed attributes.
   */
  static get observedAttributes() {
    return ['track', 'tracks', 'height', 'width', 'state', 'start', 'end', 'playbackrate', 'progressbar', 'playlist'];
  }


  /**
   * Invoked when the custom element is connected from the document's DOM.
   */
  connectedCallback() {

    // set properties from attributes
    this.props = Object.fromEntries(
      Array.from(this.attributes).map(a => [a.name, a.value])
    );

    // initial rendering
    if(!this.props.tracks) {
      this.render();
    } else {
      const tracks = JSON.parse(this.props.tracks);
      const track = this.props.track;
      this.render();
    }
  

  }


  /**
   * Invoked when the custom element is disconnected from the document's DOM.
   */
  disconnectedCallback() { }


  /**
   * Invoked when the custom element is moved to a new document.
   */
  adoptedCallback() { }


  /**
   * Invoked when one of the custom element's attributes is added, removed, or changed.
   * @param {string} property - The name of the attribute that was changed.
   * @param {*} oldValue - The previous value of the attribute.
   * @param {*} newValue - The new value of the attribute.
   */
  attributeChangedCallback(property, oldValue, newValue) {

    // handle property change
    this.set(property, newValue);

  }


  /**
   * Renders the EdiromAudioPlayer custom element with tracks content.
   */
  render() {
    
    // get properties and prepare content
    const tracks = this.props.tracks ? JSON.parse(this.props.tracks) : [];
    const { track, height, width } = this.props;

    // prepare tracks content
    const tracksHTML = tracks.map((thisTrack, idx) => `<div class="track-button track-toggler${idx == track ? ' current' : ''}" data-trackidx="${idx}">
        <div class="track-title">${thisTrack.title}</div>
        <div class="track-subtitle">${thisTrack.composer} - ${thisTrack.work}</div>
      </div>
      `).join('');

    // append content
    this.shadowRoot.innerHTML = `
      <style>
        .mso {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -moz-font-feature-settings: 'liga';
          -moz-osx-font-smoothing: grayscale;
        }
      </style>
      <style>
        #player {
          height: ${height ?? '100%'};
          width: ${width ?? '100%'};
          container: player / inline-size;
        }
        #player.hidden{
          display: none;
        }
        #controls {
          display: inline-block;
          align-items: center;
          gap: 10px;
        }
        #controls button {
          display: inline-block;
          border: none;
          background: none;
        }
        #controls #replayButton, 
        #controls #fast_forwardButton, 
        #controls #fast_rewindButton {
          display: none;
        }
        #timeInfo {
          display: inline-block;
          margin-top: 10px;
        }
        #timeInfo input {
          width: 100px;
        }
        #timeInfo span {
          font-size: 0.85rem;
          font-family: 'Roboto', sans-serif;
          text-align: center;
        }
        #timer {
          display: inline-block;
          margin-top: 4px;
          position: absolute;
          margin-left: 5px; 
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
          background-color: #e6e6e6;
          transition: background-color 0.3s;
          position: relative;
          cursor: pointer;
        }
        .track-button:hover, .track-button.current {
          background-color: #d5d5d5;
        }
        .track-button.current {
          font-weight: 700;
        }
        .track-button:active {
          background-color:rgb(153, 153, 153);
        }
        .track-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.12);
        }

        
        /* height-dependent rules */

        
        /* width-dependent rules */

        @container player (width > 380px){ 
          #controls #replayButton, 
          #controls #fast_forwardButton, 
          #controls #fast_rewindButton {
            display: inline-block;
          }
        }
      </style>

      <div id="player" class="" style="">
        <div id="controls">
          <audio id="audioPlayer" controls style="display: none;">
            <source src="${tracks[track].src}" type="${tracks[track].type}">
              Your browser does not support the audio element.
            </source>
          </audio>
          <button id="skip_previousButton" title="skip_previous" class="track-toggler" data-trackstep="-1"><span class="mso">skip_previous</span></button>
          <button id="play_arrowButton" title="play"><span class="mso">play_arrow</span></button>
          <button id="skip_nextButton" title="skip_next" class="track-toggler" data-trackstep="+1"><span class="mso">skip_next</span></button>
          <button id="playlist_removeButton" title="playlist_remove"><span class="mso">playlist_remove</span></button>
        </div>

        <div id="timeInfo">
          <input type="range" id="progressSlider" min="0" max="100" value="0">
          <div id="timer"><span id="currentTime">0:00</span> / <span id="totalTime">0:00</span></div>
        </div>

      </div>


      <div id="tracks">
        `+tracksHTML+`
      </div>
      `;
  

      // add event listeners again after rendering
      this.addEventListeners();
  }


  /**
   * Sets the value of a global property and triggers property update events.
   * @param {string} property - The name of the property to set.
   * @param {*} newPropertyValue - The new value to set for the property.
   */
  set(property, newPropertyValue) {

    // set properties from attributes (if not yet done)
    if (this.props === undefined) {
      this.props = Object.fromEntries(
        Array.from(this.attributes).map(a => [a.name, a.value])
      );
    } else {
      this.props[property] = newPropertyValue;
    }
    

    // custom event for property update
    const event = new CustomEvent('communicate-' + property + '-update', {
      detail: { [property]: newPropertyValue },
      bubbles: true
    });
    this.dispatchEvent(event);

    // further handling of property change
    this.handlePropertyChange(property, newPropertyValue);

  }


  /**
   * Handles property changes for the audio player.
   * @param {string} property - The name of the property being changed.
   * @param {any} newPropertyValue - The new value of the property.
   */
  handlePropertyChange(property, newPropertyValue) {

    // get necessary objects and check if available
    const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
    const playerDiv = this.shadowRoot.querySelector('#player');
  
  

    // handle property change
    switch(property) {
      
      // handle track setting
      case 'track':

        try {

          const source = this.shadowRoot.querySelector('source');

          // set info at source element
          const tracks = JSON.parse(this.props.tracks);
          const nextTrack = tracks[newPropertyValue];
          if(source != null){
            source.src = nextTrack.src;
            source.type = nextTrack.type;
          }
      

          // mark active track, if exists in DOM, therefore querySelectorAll() is used
          this.shadowRoot.querySelectorAll(".track-button").forEach((e) => { e.classList.remove('current'); });
          this.shadowRoot.querySelectorAll('.track-button[data-trackidx="'+newPropertyValue+'"]').forEach((e) => { e.classList.add('current') });

          // handle audio player state

          (audioPlayer != null) ? audioPlayer.load() : console.log("Audio player not available");

          this.set('start', this.props.start);
          this.set('state', 'play');

        } catch (error) {
          console.log("Error setting track: ", error);
        }

        break;


      // handle state setting
      case 'state':

        const playButton = this.shadowRoot.querySelector('#play_arrowButton');
        
        if (newPropertyValue === 'play') {
          // if audio player is currently paused, play it
          this.shadowRoot.querySelector('#audioPlayer').play();

          // set play button to pause
          playButton.setAttribute('title', 'pause');
          playButton.innerHTML = '<span class="mso">pause</span>';

        }
        
        if(newPropertyValue === 'pause') {
          // if audio player is currently playing, pause it
          this.shadowRoot.querySelector('#audioPlayer').pause();

          // set play button to play
          playButton.setAttribute('title', 'play');
          playButton.innerHTML = '<span class="mso">play_arrow</span>';  
        } 
              
        break;  

      // handle time setting
      case 'start':  
        (audioPlayer != null) ? audioPlayer.currentTime = parseFloat(newPropertyValue) : console.log("Audio player not available"); 
        break;

      // handle end setting 
      case 'end':

        break;

      // handle playbackrate setting
      case 'playbackrate':
        (audioPlayer != null) ? audioPlayer.playbackRate = newPropertyValue : console.log("Audio player not available"); 
        break;

      // handle progressbar setting
      case 'progressbar':
        const timeInfo = this.shadowRoot.querySelector('#timeInfo');
        if(timeInfo) timeInfo.style.display = newPropertyValue === 'true' ? 'block' : 'none';
        break;

      // handle playlist setting
      case 'playlist':
        const tracksDiv = this.shadowRoot.querySelector('#tracks');
        const tracksButton = this.shadowRoot.querySelector('#playlist_removeButton');
        if(tracksDiv && tracksButton) {
          tracksDiv.style.display = newPropertyValue === 'true' ? 'block' : 'none';
          tracksButton.style.display = newPropertyValue === 'true' ? 'inline-block' : 'none';
        }

      // handle height setting
      case 'height':
        try {
          playerDiv.style.height = newPropertyValue;
        } catch (error) {
          console.log("Warning: playerDiv.style.height could not be set ", error);
        }
        break;

      // handle width setting
      case 'width':
        try {
          playerDiv.style.width = newPropertyValue;
        } catch (error) {
          console.log("Warning: playerDiv.style.width could not be set ", error);
        }
        break;  

      // handle tracks setting
      case 'tracks':

        // get the tracks from custom element property and parse it to JSON
        const tracks = JSON.parse(this.props.tracks);
        const track = this.props.track;

        this.render();

        break;

      // handle default
      default:  
        console.log("Invalid property: '"+property+"'");

    }

  }


  /**
   * Adds event listeners to various elements in the audio player component.
   * These event listeners handle play/pause button clicks, track toggler clicks,
   * audio player events (duration change, time update), progress slider input,
   * and playlist remove button clicks.
   */
  addEventListeners() {

    const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
    const progressSlider = this.shadowRoot.querySelector('#progressSlider');
    const currentTimeDisplay = this.shadowRoot.querySelector('#currentTime');
    const totalTimeDisplay = this.shadowRoot.querySelector('#totalTime');
    

    /** Event listener for play/pause button */
    this.shadowRoot.querySelectorAll('#play_arrowButton').forEach(el => {
      el.addEventListener('click', (evt) => {
        this.set("state", evt.currentTarget.getAttribute('title'));
      });
    });
    

    /** 
     * Event listener for prev/next buttons.
     * It listens to all elements with class .track-toggler and reads the data-trackstep attribute to get an info how many tracks
     * should be forwarded or rewinded. This allows for buttons to forward or rewind any number of tracks -> +/-n steps 
     */
    this.shadowRoot.querySelectorAll('.track-toggler').forEach(el => {
      el.addEventListener('click', (evt) => {

        const tracksJSON = JSON.parse(this.props.tracks);
        const trackStep = evt.currentTarget.dataset.trackstep;
        const trackIdx = evt.currentTarget.dataset.trackidx;

        // if trackIdx is available, it will be used as next track index
        if(trackIdx !== undefined) {
          console.log("Using track index from dataset: ", trackIdx);
          this.set('track', trackIdx);
        }
        // if trackIdx is not available, the next track index will be calculated by adding the track step to the current track index
        else {
          var nextTrackIndex = (parseInt(this.props.track) + parseInt(trackStep));
          if(nextTrackIndex < 0) { nextTrackIndex = tracksJSON.length - 1 }
          if(nextTrackIndex >= tracksJSON.length) { nextTrackIndex = 0 }
          this.set('track', nextTrackIndex);
        }
      });

    });

    /** Event listeners for audio player */

    this.shadowRoot.querySelectorAll('#audioPlayer').forEach(el => {

      // Event listener for duration change to update total time display
      el.addEventListener('durationchange', (evt) => {
        const totalMinutes = Math.floor(audioPlayer.duration / 60);
        const totalSeconds = Math.floor(audioPlayer.duration % 60);
        if(totalTimeDisplay) totalTimeDisplay.textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
      });


      el.addEventListener('timeupdate', (evt) => {

        // Send update event to host
        const event = new CustomEvent('communicate-time-update', {
            detail: { time: audioPlayer.currentTime },
            bubbles: true
        });
        this.dispatchEvent(event);


        // update current time display
        if(currentTimeDisplay){
          const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
          const currentSeconds = Math.floor(audioPlayer.currentTime % 60);
          currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
        }
        

        // update progress slider
        if(progressSlider){
          const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
          progressSlider.value = progress;
        }    
    

        // if audioPlayer is currently playing and end is reached, pause there
        const end = Number(this.props.end);

        if(this.props.state === 'play' && !isNaN(Number(end)) && end > 0 ) {
          if (audioPlayer.currentTime >= end || audioPlayer.currentTime >= audioPlayer.duration) {

            this.set('state', 'pause');

          }
        }

      });
    });


    /** Event listeners for tracking progress slider */
    this.shadowRoot.querySelectorAll('#progressSlider').forEach(el => {
      el.addEventListener('input', (evt) => {
        audioPlayer.currentTime = (evt.target.value / 100) * audioPlayer.duration;
      });
    });

    this.shadowRoot.querySelectorAll('#playlist_removeButton').forEach(el => {
      el.addEventListener('click', (evt) => {
        const tracksDiv = this.shadowRoot.querySelector('#tracks');
        const tracksButton = this.shadowRoot.querySelector('#playlist_removeButton');
        tracksButton.innerHTML = tracksDiv.style.display === 'none' ? '<span class="mso">playlist_remove</span>' : '<span class="mso">playlist_add</span>';      
        tracksDiv.style.display = tracksDiv.style.display === 'none' ? 'block' : 'none';
      });
    });

  }

  
}

/** Define the custom element */
customElements.define('edirom-audio-player', EdiromAudioPlayer);
