class EdiromAudioPlayer extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
  }

  // connect component
  connectedCallback() {
    this.render();    
    this.addEventListeners();

    const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
    
    (audioPlayer != null) ? audioPlayer.load() : console.log("Audio player not available");
  }

  // component attributes
  static get observedAttributes() {
    return ['tracks', 'height', 'width', 'state', 'track', 'start', 'end', 'playbackrate', 'playbackmode', 'displaymode'];
  }

  // attribute change
  attributeChangedCallback(property, oldValue, newValue) {

    // handle property change
    this.set(property, newValue);

  }

  // render component
  render() {
    this.shadowRoot.innerHTML = `
      ${this.getCSS()}
      ${this.getPlayerHTML()}
    `;
  }


   /**
   * Add methods for HTML generation
   */

  getPlayerHTML() {

    let playerInnerHTML;
    playerInnerHTML = this.getControlsHTML(['prev', 'play', 'next', 'tracksRemove']);
    playerInnerHTML += this.getTimeHTML();
    playerInnerHTML += this.getTracksHTML();

    return '<div id="player" class="'+this.displaymode+'">'+playerInnerHTML+'</div>';

  }

  getControlsHTML(buttons) {

    const tracks = JSON.parse(this.getAttribute('tracks'));
    const currentTrack = tracks[this.getAttribute('track')];
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
      buttonElem.innerHTML = this.svg(button);

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
    const tracks = JSON.parse(this.tracks);

    const tracksHTML = tracks.map((track, idx) => `<div class="track-button track-toggler${idx == this.track ? ' current' : ''}" data-trackidx="${idx}">
      <div class="track-title">${track.title}</div>
      <div class="track-subtitle">${track.composer} - ${track.work}</div>
    </div>
    `).join('');

    return '<div id="tracks">'+tracksHTML+'</div>';
  }

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
          background-color: #e6e6e6;
          transition: background-color 0.3s;
          position: relative;
        }
        .track-button:hover, .track-button.current {
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
    `;
  }



  svg(iconName){

    /* Icon source: https://fonts.google.com/icons?icon.query=play */
    const icons = {
      "play" : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M320-203v-560l440 280-440 280Zm60-280Zm0 171 269-171-269-171v342Z"/></svg>',
      "pause" : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M525-200v-560h235v560H525Zm-325 0v-560h235v560H200Zm385-60h115v-440H585v440Zm-325 0h115v-440H260v440Zm0-440v440-440Zm325 0v440-440Z"/></svg>',
      "next" : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M680-240v-480h60v480h-60Zm-460 0v-480l346 240-346 240Zm60-240Zm0 125 181-125-181-125v250Z"/></svg>',
      "prev" : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M220-240v-480h60v480h-60Zm520 0L394-480l346-240v480Zm-60-240Zm0 125v-250L499-480l181 125Z"/></svg>',
      "rewind" : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M854-240 508-480l346-240v480Zm-402 0L106-480l346-240v480Zm-60-240Zm402 0ZM392-355v-250L211-480l181 125Zm402 0v-250L613-480l181 125Z"/></svg>',
      "forward" : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M104-240v-480l346 240-346 240Zm407 0v-480l346 240-346 240ZM164-480Zm407 0ZM164-355l181-125-181-125v250Zm407 0 181-125-181-125v250Z"/></svg>',
      "replay" : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M480-80q-75 0-140.5-28T225-185q-49-49-77-114.5T120-440h60q0 125 87.5 212.5T480-140q125 0 212.5-87.5T780-440q0-125-85-212.5T485-740h-23l73 73-41 42-147-147 147-147 41 41-78 78h23q75 0 140.5 28T735-695q49 49 77 114.5T840-440q0 75-28 140.5T735-185q-49 49-114.5 77T480-80Z"/></svg>',
      "tracksAdd" : '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="M120-330v-60h300v60H120Zm0-165v-60h470v60H120Zm0-165v-60h470v60H120Zm530 500v-170H480v-60h170v-170h60v170h170v60H710v170h-60Z"/></svg>',
      "tracksRemove" : '<svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48"><path d="m571-80-43-43 114-113-114-113 43-43 113 114 113-114 43 43-114 113 114 113-43 43-113-114L571-80ZM120-330v-60h300v60H120Zm0-165v-60h470v60H120Zm0-165v-60h470v60H120Z"/></svg>',
      "shuffle" : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M576-160v-60h120L522-393l42-43 176 174v-121h60v223H576Zm-374 0-42-43 538-537H576v-60h224v223h-60v-120L202-160Zm193-363L160-757l43-43 235 234-43 43Z"/></svg>',
      "repeat" : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M280-80 120-240l160-160 42 44-86 86h464v-160h60v220H236l86 86-42 44Zm-80-450v-220h524l-86-86 42-44 160 160-160 160-42-44 86-86H260v160h-60Z"/></svg>',
      "repeatOne" : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M460-360v-180h-60v-60h120v240h-60ZM280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z"/></svg>',
      "endless" : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M220-260q-92 0-156-64T0-480q0-92 64-156t156-64q37 0 71 13t61 37l68 62-60 54-62-56q-16-14-36-22t-42-8q-58 0-99 41t-41 99q0 58 41 99t99 41q22 0 42-8t36-22l310-280q27-24 61-37t71-13q92 0 156 64t64 156q0 92-64 156t-156 64q-37 0-71-13t-61-37l-68-62 60-54 62 56q16 14 36 22t42 8q58 0 99-41t41-99q0-58-41-99t-99-41q-22 0-42 8t-36 22L352-310q-27 24-61 37t-71 13Z"/></svg>'
    }

    return icons[iconName];
    
  }

   /**
   * Add methods for handling interaction with the audio player
   */
  
  set(property, newPropertyValue){

    // set internal and html properties  
    this[property] = newPropertyValue;


    // custom event for property update
    const event = new CustomEvent('communicate-'+property+'-update', {
        detail: { [property]: newPropertyValue },
        bubbles: true
    });
    this.dispatchEvent(event);
    

    // get necessary objects and check if available
    const audioPlayer = this.shadowRoot.querySelector('#audioPlayer');
    const playerDiv = this.shadowRoot.querySelector('#player');
    const playButton = this.shadowRoot.querySelector('#playButton');
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
            playButton.innerHTML = this.svg('pause');
            playButton.setAttribute('title', 'pause');
          } else if(newPropertyValue === 'pause' && audioPlayer != null && playButton != null) {
            (audioPlayer != null) ? audioPlayer.pause() : console.log("Audio player not available");
            playButton.innerHTML = this.svg('play');
            playButton.setAttribute('title', 'play');
          } else {
            console.log("Invalid audio player state property: '"+newPropertyValue+"'");
          }
        }        
        break;  

      // handle time setting
      case 'start':  
        (audioPlayer != null) ? audioPlayer.currentTime = newPropertyValue : console.log("Audio player not available"); 
        break;

      // handle end setting 
      case 'end':

        break;

      // handle playbackrate setting
      case 'playbackrate':
        (audioPlayer != null) ? audioPlayer.playbackRate = newPropertyValue : console.log("Audio player not available"); 
        break;

      // handle playbackmode setting
      case 'playbackmode':
        
        break;

      // handle displaymode setting
      case 'displaymode':

        const tracksDiv = this.shadowRoot.querySelector('#tracks');
        const sliderDiv = this.shadowRoot.querySelector('#timeInfo');
        const tracksButton = this.shadowRoot.querySelector('#tracksRemoveButton');
        
        
        switch(this.displaymode) { 
          case 'hidden':
            
            break;
          case 'controls-sm':
            tracksDiv.style.display = 'none';
            sliderDiv.style.display = 'none';
            tracksButton.innerHTML = this.svg('tracksAdd');    
        
            break;
          case 'controls-md':
            tracksDiv.style.display = 'none';
            sliderDiv.style.display = 'block';
            tracksButton.innerHTML = this.svg('tracksAdd');           
            break;
          case 'controls-lg':
            tracksDiv.style.display = 'block';
            sliderDiv.style.display = 'block'; 
            tracksButton.innerHTML = this.svg('tracksRemove');  
            break;
          case 'tracks-sm':
            
            break;
          case 'tracks-md':
            
            break;
          case 'tracks-lg':
            
            break;
          default:
            
            console.log("Invalid displaymode: '"+this.displaymode+"'");
        }
        
        break;

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
        this.connectedCallback();
        break;

      // handle default
      default:  
        console.log("Invalid property: '"+property+"'");

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
    this.shadowRoot.querySelectorAll('#playButton').forEach(el => {
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
        const end = Number(this.end);

        if(this.state === 'play' && !isNaN(Number(end)) && end > 0 ) {
          if (audioPlayer.currentTime >= end || audioPlayer.currentTime >= audioPlayer.duration) {

            console.log("End reached; currentTime="+audioPlayer.currentTime+" this.end="+this.end);

            this.set('state', 'pause');

            // and now decide how to proceed
            switch(this.playbackmode) {
              case 'off':
                // do nothing
                break;
              case 'repeat':
                // go to next track and play from start to end
                let nextButton = this.shadowRoot.querySelector('#nextButton');
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

    this.shadowRoot.querySelectorAll('#tracksRemoveButton').forEach(el => {
      el.addEventListener('click', (evt) => {
        const tracksDiv = this.shadowRoot.querySelector('#tracks');
        const tracksButton = this.shadowRoot.querySelector('#tracksRemoveButton');
        tracksButton.innerHTML = tracksDiv.style.display === 'none' ? this.svg('tracksRemove') : this.svg('tracksAdd');      
        tracksDiv.style.display = tracksDiv.style.display === 'none' ? 'block' : 'none';
      });
    });

  }
}

customElements.define('edirom-audio-player', EdiromAudioPlayer);
