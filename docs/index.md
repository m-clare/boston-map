---
toc: false
---

<style>

 #observablehq-center, .observablehq, #observablehq-main {
   margin: 0px !important;
 }

 p {
   max-width: 800px;
 }

 ul {
   padding-top: 0;
   margin-top: 0;
 }

 #observablehq-center {
   display:flex;
   flex-direction:column;
   align-items: center;
   justify-content: center;
 }

 #observablehq-main {
   display: flex;
   flex-direction: column;
   justify-content: center;
 }

 #observablehq-footer {
   margin: 1rem;
 }

 #mapContainer canvas {
   cursor: crosshair;
 }


 #features {
   position: absolute;
   top: 0;
   right: 0;
   bottom: 0;
   width: 35%;
   height: 40%;
   overflow: auto;
   background: rgba(255, 255, 255, 0.8);
   padding: 1rem;

</style>

# [Boston Buildings Inventory](https://data.boston.gov/dataset/boston-buildings-inventory)

## Retrofit envelope solutions for carbon emission reduction

This visual combines data from the Boston Buildings Inventory with 2022 parcel data for mapping purposes. Color coding is based on the building type (e.g. Single Family Home).

Hover over a property to display its information and potential envelope retrofit solutions (e.g. "insulate attic"). On mobile, you will need to touch a marker with your finger directly, and pinch to zoom in.

```js
import { hud } from "./components/hud.js";
```

```js
import maplibregl from "npm:maplibre-gl@4.0.2";
import { PMTiles, Protocol } from "npm:pmtiles@3.0.3";
```

```js
const bostonMap = FileAttachment("data/boston.pmtiles");
const mapStyle = FileAttachment("data/maptiler-3d-gl-style.json").json();
const mapFile = new PMTiles(bostonMap._url);
const buildingData = FileAttachment("data/buildings_data.csv").zip();
```

<link rel="stylesheet" type="text/css" href="npm:maplibre-gl@4.0.2/dist/maplibre-gl.css">

```js
const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
protocol.add(mapFile);

// Process Building Data
const geoBuildingData = {
  type: "FeatureCollection",
  name: "geoBuildings",
  crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  features: [],
};

const bldData = await buildingData.file("buildings_data.csv").csv();

const buildingTypologies = new Set(
  bldData.map((feature) => feature.building_typology)
);

bldData.map((feature) => {
  const { point: rawPoint, ...rest } = feature;
  const point = rawPoint.split(",").map((value) => parseFloat(value));
  geoBuildingData.features.push({
    type: "Feature",
    properties: { ...rest },
    geometry: { type: "Point", coordinates: point },
  });
});

const numberOfColors = Array.from(buildingTypologies).length;

// Define the Magma color scale
const colorScale = d3.scaleSequential(d3.interpolateRainbow);

// Generate a discrete set of colors
const colors = d3.quantize(colorScale, numberOfColors);

const colorMap = Array.from(buildingTypologies)
  .map((typology, i) => [typology, colors[i]])
  .flat();

buildingTypologies.add("All");
```

<div id="mapContainer" style="position: relative; height: calc(100vh - 360px); width: 100%;">
  <div id="features" style="z-index: 100;"></div>
</div>

```js
const map = new maplibregl.Map({
  container: "mapContainer",
  zoom: 12,
  maxZoom: 14,
  minZoom: 10,
  maxBounds: [
    [-71.191247, 42.227911],
    [-70.648072, 42.450118],
  ],
  center: [-71.08936258403622, 42.3181973483706],
  style: {
    version: 8,
    sources: {
      openmaptiles: {
        type: "vector",
        tiles: ["pmtiles://" + mapFile.source.getKey() + "/{z}/{x}/{y}"],
      },
    },
    layers: mapStyle.layers,
    glyphs:
      "https://m-clare.github.io/map-glyphs/fonts/{fontstack}/{range}.pbf",
  },
});

map.addControl(
  new maplibregl.AttributionControl({
    compact: true,
    customAttribution: `<a href="https://protomaps.com">Protomaps</a> | <a href="https://openmaptiles.org">© OpenMapTiles</a> | <a href="http://www.openstreetmap.org/copyright"> © OpenStreetMap contributors</a>`,
  }),
  "bottom-left"
);

map.addControl(new maplibregl.NavigationControl({}), "bottom-right");

map.on("load", () => {
  map.addSource("bld-data", {
    type: "geojson",
    data: geoBuildingData,
  });

  map.addLayer({
    id: "bldg",
    source: "bld-data",
    type: "circle",
    paint: {
      "circle-radius": {
        stops: [
          [12, 1], // Radius at zoom level 10
          [15, 5], // Radius at zoom level 15
        ],
        base: 2,
      },
      "circle-color": [
        "match",
        ["get", "building_typology"],
        ...colorMap,
        "#000000",
      ],
    },
  });
});

map.on("mousemove", (e) => {
  const locFeatures = map.queryRenderedFeatures(e.point);
  if (locFeatures[0]?.properties["pid_long"]) {
    document.getElementById("features").innerHTML = hud(
      locFeatures[0].properties
    );
  } else {
    document.getElementById("features").innerHTML = null;
  }
});
```
