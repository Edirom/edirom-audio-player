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
3. Include a custom element (this is specified and can be processed by the component) into the `<body>` of the HTML page. The values of attributes prefixed with `set-*` are used as parameters to at initialization of the component and changing them (programmatically) can control the components state and behaviour during runtime. The values of attributes prefixed with `get-*` represent the current state of the component and changes to them have no effect on the behaviour or state of the component. The separation is esp. necessary to handle frequently populated information like currentTime of the audio player and avoid interference between reading and writing info about the component's state.
```html
<edirom-audio-player
  set-tracks='[{"title": "Title 1", "composer": "Composer 1", "work": "Work 1", "src": "https://example.com/sound.mp3", "type": "audio/mpeg"}, ... more tracks ... ]' get-tracks=""
  set-height="500px" get-height=""
  set-width="500px" get-width=""
  set-state="pause" get-state=""
  set-track="0" get-track=""
  set-time="0.0" get-time=""
  set-end="" get-end=""
  set-playbackrate="1.0" get-playbackrate=""
  set-mode="controls-md" get-mode="">
</edirom-audio-player>
```
### Parameters

_Note: Apparently all attribute values are strings internally, the data type information below indicates the necessary format of the attribute value. The names of the parameters do not contain the `set-` prefix here, which is mandatory in the custom HTML element._

| Parameter | Data type | Description | default |
|---------------|---|---|---|
| **tracks**                 | json | array of tracks: `[{"title": "Track 1", "composer": "Composer 1", "work": "Work 1", "src": "path_to_audio_file_1.mp3", "type": "audio/mpeg"}, ... ]` | |
| --- | --- | ---  | --- |
| state | string | state of audio player (play, pause)  | pause |
| track       | integer | pointer to current track (also used on startup to play track with supplied index number in json array) | 0 |
| time        | double | pointer to current timepoint in player (also used for initial startup position)  | 0.0 |
| end       | integer  | pointer to time when the playback should be stopped automatically  |   |
| playbackrate | double | speed of playback | 1.0 |
| --- | --- | ---  | --- |
| height                 | string | height of player in pixels (px) or percent (%) | 500px |
| width                  | string | width of player in pixels (px) or percent (%) | 500px |
| mode | string | preference for displaying "controls-(sm\|md\|lg)" and/or "tracks-(sm\|md\|lg)" | controls-md |
