![GitHub License](https://img.shields.io/github/license/Edirom/edirom-audio-player)
[![GitHub release](https://img.shields.io/github/v/release/Edirom/edirom-audio-player.svg)](https://github.com/Edirom/edirom-audio-player/releases)
[![fair-software.eu](https://img.shields.io/badge/fair--software.eu-%E2%97%8F%20%20%E2%97%8F%20%20%E2%97%8B%20%20%E2%97%8F%20%20%E2%97%8B-orange)](https://fair-software.eu)


# Edirom Audio Player Web Component

This web component implements an audio player based on the HTML5 audio facility. It is intended to be used in tbe Edirom Online, but can also be (re-)used in other web applications. No compilation or building is necessary to use the web component. There are no dependencies as it is based on plain JavaScript.

As this repository only contains the bare JavaScript-based component, there is a separate [demo suite](https://github.com/Edirom/edirom-web-components-demonstrator) for web components developed in the Edirom Online Reloaded project, where the component can be seen and tested.


## How to use this web component

1. Clone the repository into a directory of your choice
2. Include the path to the web component's JavaScript file into the `<head>` an HTML page
```html
<script src="path/to/edirom-audio-player.js"></script>
```
3. Include a custom element (this is specified and can be processed by the component) into the `<body>` of the HTML page. The attributes of the custom element are used as parameters at initialization of the component and changing them (manually or programmatically) can control the components state and behaviour during runtime. The state changes of the web component are communicated outwards via custom events (called 'communicate-{change-type}-update'). The component/document that instantiates the web component (its parent) can listen (via event listeners which have to be implemented individually) and react to the communicated state changes if necessary. The separation of inward communication (via custom element's attributes) and outward communication (via custom events) is esp. necessary to handle frequently populated information like currentTime of the audio player and avoid interference between reading and writing info about the component's state.
```html
['track', 'tracks', 'height', 'width', 'state', 'start', 'end', 'playbackrate', 'playbackmode', 'displaymode'];
<edirom-audio-player
  track="0"
  tracks='[{"title": "Title 1", "composer": "Composer 1", "work": "Work 1", "src": "https://example.com/sound.mp3", "type": "audio/mpeg"}, ... more tracks ... ]'
  height="500px"
  width="500px"
  state="pause"
  start="0.0""
  end="10.0"
  playbackrate="1.0"
  playbackmode="all"
  display-mode="controls-md">
</edirom-audio-player>
```
**N.B.: end and playbackmode are not yet implemented**  

### Parameters

_Note: All attribute values are strings internally, the data type information below indicates the necessary format of the attribute value._

| Parameter | Data type | Description | default |
|---------------|---|---|---|
| tracks       | json | array of tracks: `[{"title": "Track 1", "composer": "Composer 1", "work": "Work 1", "src": "path_to_audio_file_1.mp3", "type": "audio/mpeg"}, ... ]` | |
|---------------|---|---|---|
| track        | integer | pointer to current track (also used on startup to play track with supplied index number in json array) | 0 |
| state        | string | state of audio player (play, pause)  | pause |
| time         | double | pointer to current timepoint in player (also used for initial startup position)  | 0.0 |
| end          | integer  | pointer to time when the playback should be stopped automatically  |   |
| playbackrate | double | speed of playback | 1.0 |
| playbackmode | string | mode of playback (repeat-one, repeat-all, shuffle) | repeat-all |
| --- | --- | ---  | --- |
| height                 | string | height of player in pixels (px) or percent (%) | 500px |
| width                  | string | width of player in pixels (px) or percent (%) | 500px |
| display-mode | string | preference for displaying "controls-(sm\|md\|lg)" and/or "tracks-(sm\|md\|lg)" | controls-md |
