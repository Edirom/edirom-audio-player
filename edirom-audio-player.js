class EdiromAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /* Icon source: https://fonts.google.com/icons?icon.query=play */
    this.PLAY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M320-203v-560l440 280-440 280Zm60-280Zm0 171 269-171-269-171v342Z"/></svg>';
    this.PAUSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M525-200v-560h235v560H525Zm-325 0v-560h235v560H200Zm385-60h115v-440H585v440Zm-325 0h115v-440H260v440Zm0-440v440-440Zm325 0v440-440Z"/></svg>';
    this.NEXT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M680-240v-480h60v480h-60Zm-460 0v-480l346 240-346 240Zm60-240Zm0 125 181-125-181-125v250Z"/></svg>';
    this.PREV_SVG = '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M220-240v-480h60v480h-60Zm520 0L394-480l346-240v480Zm-60-240Zm0 125v-250L499-480l181 125Z"/></svg>';
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        #player {
          width: ${this.getWidth()};
          height: ${this.getHeight()};
        }
        #controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        #controls button {
          display: inline-block;
          margin: 10px 0;
        }
        #volumeControl {
          width: 100px; /* adjust as needed */
        }
        .track-button {
          display: block;
          margin: 10px 0;
          padding: 6px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.75;
          letter-spacing: 0.02857em;
          text-transform: uppercase;
          color: rgba(0, 0, 0, 0.87);
          border: none;
          border-radius: 4px;
          background-color: #e0e0e0;
          transition: background-color 0.3s;
          position: relative;
          padding-left: 30px;
        }
        .track-button::before {
          content: "";
          position: absolute;
          left: 10px; 
          top: 50%;
          transform: translateY(-50%);
          width: 10px; 
          height: 10px; 
          background-image: url('path-to-your-icon.svg');
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
      </style>
      ${this.getPlayerHTML()}
    `;
  }

  getPlayerHTML() {

    var playerInnerHTML;
    const displayMode = this.getDisplayMode();

    switch(displayMode) { 
      case 'player-simple':
        playerInnerHTML = this.getControlsHTML();
        break;
      case 'tracks-single':
        playerInnerHTML = this.getTracksHTML();
        break;
      case 'full':
        playerInnerHTML = this.getControlsHTML() + this.getTracksHTML();
        break;
      default:
        playerInnerHTML = this.getControlsHTML() + this.getTracksHTML();
        console.log("Invalid display mode: '"+displayMode+"'");
    }

    return '<div id="player" class="'+displayMode+'">'+playerInnerHTML+'</div>';

  }

  getControlsHTML() {

    const tracks = JSON.parse(this.getAttribute('tracks'));
    const currentTrack = tracks[this.getCurrentTrack()];

    var controlsHTML;
    controlsHTML = `
      <div id="controls">
        <audio id="audioPlayer" controls style="display:none;">
          <source src="${currentTrack.src}" type="${currentTrack.type}">
          Your browser does not support the audio element.
        </audio>
        <button id="prevButton" data-tracksteps="-1" class="track-toggler" title="previous">
          ${this.PREV_SVG}
        </button>
        <button id="playButton" title="play">
          ${this.PLAY_SVG}
        </button>
        <button id="nextButton" data-tracksteps="+1" class="track-toggler" title="next">
          ${this.NEXT_SVG}
        </button>
        `;

    if(this.getDisplayMode() == 'full'){
      controlsHTML += `
        <input type="range" id="volumeControl" min="0" max="1" step="0.1">
      `;
    }

    controlsHTML += `        
      </div>
    `;

    return controlsHTML
  }

  getTracksHTML() {
    const tracks = JSON.parse(this.getAttribute('tracks'));

    const tracksHTML = tracks.map(track => `<div class="track-button" data-src="${track.src}" data-type="${track.type}">
      <div class="track-title">${track.title}</div>
      <div class="track-subtitle">${track.composer} - ${track.work}</div>
    </div>
    `).join('');

    return '<div id="tracks">'+tracksHTML+'</div>';
  }

  /**
   * Get the width of the audio player from configuration
   */
  getWidth(){
    return this.getAttribute('width');
  }

  /**
   * Get the height of the audio player from configuration
   */
  getHeight(){
    return this.getAttribute('height');
  }

  /**
   * Get the mode for the audio player from configuration
   */
  getDisplayMode(){
    return this.getAttribute('displayMode');
  }

  /**
   * Get the current track for the audio player from configuration
   */
  getCurrentTrack(){
    return this.getAttribute('currentTrack');
  }

  /**
   * Set the current track for the audio player
   */
  setCurrentTrack(n){
    return this.setAttribute('currentTrack', n);
  }

  /**
   * Add event listeners to the buttons
   */
  addEventListeners() {
    
    /** Event listener for play/pause button */
    this.shadowRoot.querySelector('#playButton').addEventListener('click', () => {
      const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
      const playButton = this.shadowRoot.querySelector('#playButton');

      if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.innerHTML = this.PAUSE_SVG;
        playButton.setAttribute('title', 'pause');
      } else {
        audioPlayer.pause();
        playButton.innerHTML = this.PLAY_SVG;
        playButton.setAttribute('title', 'play');
      }
    });
    
    /** 
     * Event listener for prev/next buttons.
     * It listens to all elements with class .track-toggler and reads the data-tracksteps attribute to get an info how many tracks
     * should be forwarded or rewinded. This allows for buttons to forward or rewind any number of tracks -> +/-n steps 
     */
    this.shadowRoot.querySelectorAll('.track-toggler').forEach(button => {
      button.addEventListener('click', (evt) => {

        const trackStep = evt.currentTarget.dataset.tracksteps;
        const tracks = JSON.parse(this.getAttribute('tracks'));
  
        var nextTrackIndex = (parseInt(this.getCurrentTrack()) + parseInt(trackStep));
        if(nextTrackIndex < 0) { nextTrackIndex = tracks.length - 1 }
        if(nextTrackIndex >= tracks.length) { nextTrackIndex = 0 }
        
        this.setCurrentTrack(nextTrackIndex);
        
        const nextTrack = tracks[nextTrackIndex];
        const source = this.shadowRoot.querySelector('source');
        source.src = nextTrack.src;
        source.type = nextTrack.type;
  
        const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
        if (audioPlayer.paused) {
          const playButton = this.shadowRoot.querySelector('#playButton');
          playButton.innerHTML = this.PAUSE_SVG;
          playButton.setAttribute('title', 'pause');
        }
  
        audioPlayer.load();
        audioPlayer.play();
      
      });

    });

        
    if(this.getDisplayMode() == 'full'){
      this.shadowRoot.querySelector('#volumeControl').addEventListener('input', () => {
        this.shadowRoot.querySelector('#audioPlayer').volume = this.value;
      });
    }
  }
}

customElements.define('edirom-audio-player', EdiromAudioPlayer);
