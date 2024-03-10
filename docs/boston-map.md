---
title: Boston map
---

```js
import maplibregl from "npm:maplibre-gl@4.0.2";
import { PMTiles, Protocol } from "npm:pmtiles@3.0.3";
```

```js
const bostonMap = FileAttachment("data/boston.pmtiles")
const mapStyle = FileAttachment("data/dark-matter-style.json").json()
const mapFile = new PMTiles(bostonMap._url)
```

```js
const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
protocol.add(mapFile)
```

<link rel="stylesheet" type="text/css" href="https://unpkg.com/maplibre-gl@4.0.2/dist/maplibre-gl.css">

```js
const div = display(document.createElement("div"));
div.style="height: 400px";
const map = new maplibregl.Map({
container: div,
zoom: 10,
center: [-71.057083, 42.3503293],
style: {
version: 8,
sources: {
 bostontiles: {
 type: "vector",
 tiles: ["pmtiles://" + mapFile.source.getKey() + "/{z}/{x}/{y}"],
 },
},
layers: mapStyle.layers,
glyphs: 'https://m-clare.github.io/map-glyphs/fonts/{fontstack}/{range}.pbf'
}
})

map.on("move", () => {
console.log(map.getZoom())
console.log(map.getCenter())
})

```
