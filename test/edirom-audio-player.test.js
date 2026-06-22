import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import '../edirom-audio-player.js';

const TRACKS = [
  { title: 'Track 1', composer: 'Comp A', work: 'Work A', src: 'a.mp3', type: 'audio/mpeg' },
  { title: 'Track 2', composer: 'Comp B', work: 'Work B', src: 'b.mp3', type: 'audio/mpeg' }
];

function createEl() {
  return fixture(html`
    <edirom-audio-player
      track="0"
      tracks='${JSON.stringify(TRACKS)}'
      progressbar="true"
      playlist="true"
      start="0"
      end="0"
      state="pause"
      height="200px"
      width="300px"
    ></edirom-audio-player>
  `);
}

describe('<edirom-audio-player>', () => {
  it('is defined', () => {
    expect(customElements.get('edirom-audio-player')).to.exist;
  });

  it('renders player, controls and track list', async () => {
    const el = await createEl();
    const sr = el.shadowRoot;

    expect(sr.querySelector('#player')).to.exist;
    expect(sr.querySelector('#audioPlayer')).to.exist;
    expect(sr.querySelectorAll('.track-button').length).to.equal(2);
    expect(sr.querySelector('.track-button.current')?.dataset.trackidx).to.equal('0');
  });

  it('applies width/height attributes to #player style', async () => {
    const el = await createEl();
    const playerDiv = el.shadowRoot.querySelector('#player');

    expect(playerDiv.style.height).to.equal('200px');
    expect(playerDiv.style.width).to.equal('300px');
  });

  it('changes source + current track class when track attribute changes', async () => {
    const el = await createEl();
    const source = el.shadowRoot.querySelector('source');
    const audio = el.shadowRoot.querySelector('#audioPlayer');

    // stub load() because jsdom/browser test env may not implement media behavior fully
    audio.load = () => {};

    el.setAttribute('track', '1');

    expect(source.getAttribute('src') || source.src).to.contain('b.mp3');
    expect(source.getAttribute('type') || source.type).to.equal('audio/mpeg');

    const current = el.shadowRoot.querySelector('.track-button.current');
    expect(current).to.exist;
    expect(current.dataset.trackidx).to.equal('1');
  });

  it('toggles play/pause button title and icon when state changes', async () => {
    const el = await createEl();
    const audio = el.shadowRoot.querySelector('#audioPlayer');
    const playBtn = el.shadowRoot.querySelector('#play_arrowButton');

    let played = false;
    let paused = false;
    audio.play = async () => { played = true; };
    audio.pause = () => { paused = true; };

    el.setAttribute('state', 'play');
    expect(played).to.equal(true);
    expect(playBtn.getAttribute('title')).to.equal('pause');
    expect(playBtn.innerHTML).to.contain('pause');

    el.setAttribute('state', 'pause');
    expect(paused).to.equal(true);
    expect(playBtn.getAttribute('title')).to.equal('play');
    expect(playBtn.innerHTML).to.contain('play_arrow');
  });

  it('emits communicate-state-update custom event on state change', async () => {
    const el = await createEl();
    const waitEvent = oneEvent(el, 'communicate-state-update');

    el.setAttribute('state', 'play');

    const ev = await waitEvent;
    expect(ev.detail).to.deep.equal({ state: 'play' });
  });

  it('shows/hides progressbar via progressbar attribute', async () => {
    const el = await createEl();
    const timeInfo = el.shadowRoot.querySelector('#timeInfo');

    el.setAttribute('progressbar', 'false');
    expect(timeInfo.style.display).to.equal('none');

    el.setAttribute('progressbar', 'true');
    expect(timeInfo.style.display).to.equal('block');
  });

  it('shows/hides playlist and playlist button via playlist attribute', async () => {
    const el = await createEl();
    const tracksDiv = el.shadowRoot.querySelector('#tracks');
    const playlistBtn = el.shadowRoot.querySelector('#playlist_removeButton');

    el.setAttribute('playlist', 'false');
    expect(tracksDiv.style.display).to.equal('none');
    expect(playlistBtn.style.display).to.equal('none');

    el.setAttribute('playlist', 'true');
    expect(tracksDiv.style.display).to.equal('block');
    expect(playlistBtn.style.display).to.equal('inline-block');
  });

  it('updates current time display and emits communicate-time-update on timeupdate', async () => {
    const el = await createEl();
    const audio = el.shadowRoot.querySelector('#audioPlayer');
    const currentTimeDisplay = el.shadowRoot.querySelector('#currentTime');

    // define duration/currentTime for test
    Object.defineProperty(audio, 'duration', { configurable: true, value: 120 });
    Object.defineProperty(audio, 'currentTime', { configurable: true, writable: true, value: 65 });

    const waitEvent = oneEvent(el, 'communicate-time-update');
    audio.dispatchEvent(new Event('timeupdate'));

    const ev = await waitEvent;
    expect(ev.detail.time).to.equal(65);
    expect(currentTimeDisplay.textContent).to.equal('1:05');
  });

  it('clicking playlist button toggles tracks visibility', async () => {
    const el = await createEl();
    const tracksDiv = el.shadowRoot.querySelector('#tracks');
    const btn = el.shadowRoot.querySelector('#playlist_removeButton');

    // initial display may be empty string -> first click hides
    btn.click();
    expect(tracksDiv.style.display).to.equal('none');

    btn.click();
    expect(tracksDiv.style.display).to.equal('block');
  });
});