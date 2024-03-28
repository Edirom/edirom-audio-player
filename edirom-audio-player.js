class EdiromAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        audio {
          width: 100%;
        }
        button {
          display: block;
          margin: 10px 0;
        }
      </style>
      <audio controls>
        <source src="" type="">
        Your browser does not support the audio element.
      </audio>
      ${this.getTrackButtons()}
    `;
  }

  getTrackButtons() {
    const tracks = JSON.parse(this.getAttribute('tracks'));
    return tracks.map(track => `<button data-src="${track.src}" data-type="${track.type}">${track.name}</button>`).join('');
  }

  addEventListeners() {
    this.shadowRoot.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (event) => {
        const audio = this.shadowRoot.querySelector('audio');
        const source = this.shadowRoot.querySelector('source');
        source.src = event.target.dataset.src;
        source.type = event.target.dataset.type;
        audio.load();
        audio.play();
      });
    });
  }
}

customElements.define('edirom-audio-player', EdiromAudioPlayer);
