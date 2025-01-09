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

    /** set global properties */
    this.track = this.getAttribute('track') || 0;
    this.tracks = this.getAttribute('tracks') || '[]';
    this.height = this.getAttribute('height') || '100%';
    this.width = this.getAttribute('width') || '100%';
    this.state = this.getAttribute('state') || 'pause';
    this.start = this.getAttribute('start') || 0;
    this.end = this.getAttribute('end');
    this.playbackrate = this.getAttribute('playbackrate') || 1;
    this.playbackmode = this.getAttribute('playbackmode') || 'all';
    this.progressbar = this.getAttribute('progressbar') || 'false';
    this.playlist = this.getAttribute('playlist') || 'false';

    //Define a FontFace
    const font = new FontFace("Material Symbols Outlined", "url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v192/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHOej.woff2)", {
      style: "normal",
      weight: "100 700"
    });

    // wait for font 
    font.load().then((loaded_face) => {
      document.fonts.add(loaded_face)

      // append content
      this.shadowRoot.innerHTML += `
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

        ${this.getCSS()}

        `;

      // add content div
      const contentDiv = document.createElement('div');
      contentDiv.id = 'content';
      this.shadowRoot.appendChild(contentDiv);

      // attach player html
      contentDiv.innerHTML = this.getPlayerHTML();

      // add event listeners
      this.addEventListeners();

    }).catch((error) => { });

  }

  
  /**
   * Returns the list of observed attributes for the EdiromAudioPlayer custom element.
   * @static
   * @returns {Array<string>} The list of observed attributes.
   */
  static get observedAttributes() {
    return ['track', 'tracks', 'height', 'width', 'state', 'start', 'end', 'playbackrate', 'playbackmode', 'playlist', 'progressbar'];
  }


  /**
   * Invoked when the custom element is connected from the document's DOM.
   */
  connectedCallback() {

    // get necessary objects
    const contentDiv = this.shadowRoot.querySelector('#content');
    const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');

    // overwrite content if content div is ready
    if (!contentDiv === null) {
      contentDiv.innerHTML = this.getPlayerHTML();
    }

    // set event listeners again
    this.addEventListeners();

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
   * Sets the value of a global property and triggers property update events.
   * @param {string} property - The name of the property to set.
   * @param {*} newPropertyValue - The new value to set for the property.
   */
  set(property, newPropertyValue) {

    // set internal and html properties  
    this[property] = newPropertyValue;

    // custom event for property update
    const event = new CustomEvent('communicate-' + property + '-update', {
      detail: { 
        element: this.tagName.toLowerCase(),
        property: property,
        value: newPropertyValue
      },
      bubbles: true
    });
    this.dispatchEvent(event);

    // further handling of property change
    this.handlePropertyChange(property, newPropertyValue);

  }

  /**
   * Returns the HTML content for the player.
   * @returns {string} The HTML content for the player.
   */
  getPlayerHTML() {

    let playerInnerHTML;
    playerInnerHTML = this.getControlsHTML(['skip_previous', 'play_arrow', 'skip_next', 'tune']);
    playerInnerHTML += this.getTimeHTML();
    playerInnerHTML += this.getTracksHTML();
    playerInnerHTML += this.getOverlayHTML();

    return '<div id="player" class="' + this.displaymode + '">' + playerInnerHTML + '</div>';

  }

  /**
   * Returns the HTML content for the control buttons.
   * @param {Array<string>} buttons - The list of button names.
   * @returns {string} The HTML content for the control buttons.
   */
  getControlsHTML(buttons) {

    const tracks = JSON.parse(this.tracks);
    const currentTrack = tracks[this.track];
    const trackSteps = [{ "replay": "0" }, { "skip_previous": "-1" }, { "skip_next": "+1" }];

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
      buttonElem.id = button + 'Button';
      buttonElem.title = button;

      // add class and data-trackstep attribute to buttons to indicate how many tracks should be forwarded or rewinded
      if (trackSteps.find(step => step[button])) {
        buttonElem.classList.add('track-toggler');
        buttonElem.dataset.trackstep = trackSteps.find(step => step[button])[button];
      }

      // Add icon to button
      buttonElem.innerHTML = '<span class="mso">' + button + '</span>';

      // Add additional classes to buttons
      switch (button) {
        case 'play_arrow':
          buttonElem.title = 'play';
          break;
        case 'skip_previous':
          buttonElem.title = 'previous';
          break;
        case 'skip_next':
          buttonElem.title = 'next';
          break;
        case 'tune':
          buttonElem.classList.add('toggleSettings');
          buttonElem.title = 'settings';
          break;
        default:  
          break;
      }

      // Append button to controlsDiv
      controlsDiv.appendChild(buttonElem);
    });


    return controlsDiv.outerHTML;
  }

  /**
   * Returns the HTML content for the time information.
   * @returns {string} The HTML content for the time information.
   */
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

  /**
   * Returns the HTML content for the tracks.
   * @returns {string} The HTML content for the tracks.
   */
  getTracksHTML() {
    const tracks = JSON.parse(this.tracks);

    const tracksHTML = tracks.map((track, idx) => `<div class="track-button track-toggler${idx == this.track ? ' current' : ''}" data-trackidx="${idx}">
      <div class="track-title">${track.title}</div>
      <div class="track-subtitle">${track.composer} - ${track.work}</div>
    </div>
    `).join('');

    return '<div id="tracks">' + tracksHTML + '</div>';
  }

  /**
   * Returns the HTML content for an overlay box that contains settings for changing the audio appearance.
   * @returns {string} The HTML content for the overlay box.
   */
  getOverlayHTML() {
    let overlayHTML = `
      <div id="settingsOverlay" class="overlay">
        <div class="overlay-content">
          <span class="toggleSettings close-button">&times;</span>
          <div class="setting">
            <label for="playlist">Playlist</label>
            <input type="checkbox" id="playlistCheckbox" name="playlistCheckbox" value="showPlaylist">
          </div>
          <div class="setting">
            <label for="progress">Progress bar</label>
            <input type="checkbox" id="progressCheckbox" name="progressCheckbox" value="showProgress">
          </div>              
          <div class="setting">
            <label for="speed">Playback rate <span id="currentPlaybackrate">1.0</span></label><br/>
            <input type="range" id="playbackrate-slider" name="playbackrate-slider" min="0.5" max="2" step="0.025" value="1">
          </div>            
          <div class="setting">
            <label for="repeatMode">Playback mode</label><br/>
            <input type="radio" id="repeatModeOff" name="repeatMode" value="off">
            <label for="repeatModeOff">Off</label>
            <input type="radio" id="repeatModeOne" name="repeatMode" value="one">
            <label for="repeatModeOne">Repeat One</label>
            <br/>
            <input type="radio" id="repeatModeAll" name="repeatMode" value="all" checked>
            <label for="repeatModeAll">Repeat All</label>
            <input type="radio" id="repeatModeShuffle" name="repeatMode" value="shuffle">
            <label for="repeatModeAll">Shuffle</label>
          </div>
        </div>
      </div>
    `;
    return overlayHTML;
  }

  /**
   * Returns the CSS styles for the player.
   * @returns {string} The CSS styles for the player.
   */
  getCSS() {
    return `
    <style>
        #player {
          height: 100%;
          width: 100%;
          container: player / inline-size;
        }
        #player.hidden{
          display: none;
        }
        #controls {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
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
          display: none;
          margin-top: 10px;
          padding: 0 10px;
        }
        #timeInfo input {
          min-width: 70%;
          top: 7px;
          position: relative;
        }
        #timeInfo span {
          font-size: 0.875rem;
          font-family: 'Roboto', sans-serif;
          text-align: center;
        }
        #tracks{
          display: none;
          font-family: 'Helvetica', sans-serif;
        }
        .track-button {
          display: block;
          margin: 10px 0;
          padding: 6px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.75;
          letter-spacing: 0.02857em;
          color: #444;
          position: relative;
        }
        .track-button:hover {
          color: #111;
          background-color: #f7f7f7;
        }
        .track-button.current {
          color: #000;
          background-color: #f5f5f5;
        }
        .track-button:active {
          color: #222;
        }
        .track-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.12);
        }
        .track-title {
          font-size: 1rem;
        }
        #settingsOverlay {
          display: none;
          position: fixed;
          width: 220px;
          padding-bottom: 20px;
          z-index: 1;
          background-color: #fff;
          border: 1px solid #ccc;
          font-size: .85em;
          font-family: Helvetica;
          color: #555;
          font-weight: bold;
        }

        #settingsOverlay .close-button {  
          position: absolute;
          top: 5px;
          right: 5px;
          font-size: 24px;
          cursor: pointer;
        }

        #settingsOverlay .setting {
          margin: 20px 0px 0px 10px;
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
    `;
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
    const playButton = this.shadowRoot.querySelector('#play_arrowButton');
  
  
    const source = this.shadowRoot.querySelector('source');
    //if(audioPlayer === null || playerDiv === null || playButton === null || source === null )
    //  return;

    // handle property change
    switch(property) {
      
      // handle track setting
      case 'track':

        // set info at source element
        const tracks =JSON.parse(this.tracks);
        const nextTrack = tracks[newPropertyValue];
        if(source != null){
          source.src = nextTrack.src;
          source.type = nextTrack.type;
        }
    

        // mark active track, if exists in DOM, therefore querySelectorAll() is used
        this.shadowRoot.querySelectorAll(".track-button").forEach((e) => { e.classList.remove('current'); });
        this.shadowRoot.querySelectorAll('.track-button[data-trackidx="'+this.track+'"]').forEach((e) => { e.classList.add('current') });

        // handle audio player state

        (audioPlayer != null) ? audioPlayer.load() : console.log("Audio player not available");

        this.set('start', this.start);
        this.set('state', 'play');
        break;


      // handle state setting
      case 'state':

        // handle audio player state
        if (audioPlayer != null && playButton != null) {
          if (newPropertyValue === 'play' && audioPlayer != null && playButton != null) {
            audioPlayer.play();
            playButton.innerHTML = '<span class="mso">pause</span>';
            playButton.setAttribute('title', 'pause');
          } else if(newPropertyValue === 'pause' && audioPlayer != null && playButton != null) {
            (audioPlayer != null) ? audioPlayer.pause() : console.log("Audio player not available");
            playButton.innerHTML = '<span class="mso">play_arrow</span>';
            playButton.setAttribute('title', 'play');
          } else {
            console.log("Invalid audio player state property: '"+newPropertyValue+"'");
          }
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
        this.shadowRoot.querySelector('#currentPlaybackrate').textContent = newPropertyValue;
        this.shadowRoot.querySelector('#playbackrate-slider').value = newPropertyValue;
        break;

      // handle progressbar setting
      case 'progressbar':
        if(this.shadowRoot.querySelector('#timeInfo') != null){
          if(newPropertyValue == 'true'){
            this.shadowRoot.querySelector('#timeInfo').style.display = 'block';
            this.shadowRoot.querySelector('#progressCheckbox').checked = true;
          } else {
            this.shadowRoot.querySelector('#timeInfo').style.display = 'none';
            this.shadowRoot.querySelector('#progressCheckbox').checked = false;
          }
        }
        break;

      // handle playlist setting
      case 'playlist':
        if(this.shadowRoot.querySelector('#tracks') != null){
          if(newPropertyValue == 'true'){
            this.shadowRoot.querySelector('#tracks').style.display = 'block';
            this.shadowRoot.querySelector('#playlistCheckbox').checked = true;
          } else {
            this.shadowRoot.querySelector('#tracks').style.display = 'none';
            this.shadowRoot.querySelector('#playlistCheckbox').checked = false;
          }
        }

      // handle height setting
      case 'height':
        playerDiv.style.height = newPropertyValue;
        break;

      // handle width setting
      case 'width':
        playerDiv.style.width = newPropertyValue;
        break;  

      // handle tracks setting
      case 'tracks':
        // if content div is ready, update it
        if(!this.shadowRoot.querySelector('#content') === null){
          this.shadowRoot.querySelector('#content').innerHTML = this.getPlayerHTML();
        }        
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
      el.addEventListener('click', () => {
        return audioPlayer.paused ? this.set('state', 'play') : this.set('state', 'pause');      
      });
    });
    

    /** 
     * Event listener for prev/next buttons.
     * It listens to all elements with class .track-toggler and reads the data-trackstep attribute to get an info how many tracks
     * should be forwarded or rewinded. This allows for buttons to forward or rewind any number of tracks -> +/-n steps 
     */
    this.shadowRoot.querySelectorAll('.track-toggler').forEach(el => {
      el.addEventListener('click', (evt) => {

        const tracksJSON = JSON.parse(this.tracks);
        const trackStep = evt.currentTarget.dataset.trackstep;
        const trackIdx = evt.currentTarget.dataset.trackidx;
  
        var nextTrackIndex = !!trackIdx ? trackIdx : (parseInt(this.track) + parseInt(trackStep));

        if(nextTrackIndex < 0) { nextTrackIndex = tracksJSON.length - 1 }
        if(nextTrackIndex >= tracksJSON.length) { nextTrackIndex = 0 }
        
        this.set('track', nextTrackIndex);
      });

    });

    /** 
     * Event listener for settings overlay 
     * Listens to all elements with class .toggleSettings and toggles the display of the settings overlay
    */
    this.shadowRoot.querySelectorAll('.toggleSettings').forEach(el => {
      el.addEventListener('click', (evt) => {
        const overlay = this.shadowRoot.querySelector('#settingsOverlay');

        // position overlay at lower right corner of tune button
        const tuneButton = this.shadowRoot.querySelector('#tuneButton');
        overlay.style.top = tuneButton.offsetTop + tuneButton.offsetHeight + 'px';
        overlay.style.left = tuneButton.offsetLeft + 'px';
        
        // toggle display
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
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
            detail: { 
              element: this.tagName.toLowerCase(),
              property: 'time',
              value: audioPlayer.currentTime
            },
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
        const end = Number(this.end);

        if(this.state === 'play' && !isNaN(Number(end)) && end > 0 ) {
          if (audioPlayer.currentTime >= end || audioPlayer.currentTime >= audioPlayer.duration) {

            this.set('state', 'pause');

            // and now decide how to proceed
            switch(this.playbackmode) {
              case 'off':
                // do nothing
                break;
              case 'repeat':
                // go to next track and play from start to end
                let nextButton = this.shadowRoot.querySelector('#skip_nextButton');
                nextButton.click();
                break;
              case 'repeatOne':
                audioPlayer.currentTime = this.start;
                audioPlayer.play();
                break;
              case 'shuffle':
                // shuffle tracks
                let randomTrackIndex = Math.floor(Math.random() * JSON.parse(this.tracks).length);
                this.set('track', randomTrackIndex);
                break;
              default:
                console.log("Invalid playbackmode: '"+this.playbackmode+"'");
            }
          }
        }

        // handle playbackmodes (shuffle, repeat, repeatOne)
        

      });
    });


    /** Event listeners for tracking progress slider */
    this.shadowRoot.querySelectorAll('#progressSlider').forEach(el => {
      el.addEventListener('input', (evt) => {
        audioPlayer.currentTime = (evt.target.value / 100) * audioPlayer.duration;
      });
    });

    /** Event listener for playbackrate slider */
    this.shadowRoot.querySelectorAll('#playbackrate-slider').forEach(el => {
      el.addEventListener('input', (evt) => {
        this.set('playbackrate', evt.target.value);
      });
    });

    /** Event listener for playlist checkbox */
    this.shadowRoot.querySelectorAll('#playlistCheckbox').forEach(el => {
      el.addEventListener('change', (evt) => {
        this.set('playlist', evt.target.checked ? 'true' : 'false');
      });
    });

    /** Event listener for progress checkbox */
    this.shadowRoot.querySelectorAll('#progressCheckbox').forEach(el => {
      el.addEventListener('change', (evt) => {
        
        this.set('progressbar', evt.target.checked ? 'true' : 'false');
      });
    });
    
    

  }
}

/** Define the custom element */
customElements.define('edirom-audio-player', EdiromAudioPlayer);
