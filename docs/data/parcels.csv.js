import polylabel from "polylabel";
import { csvFormat, csvParse } from "d3-dsv";
import * as fs from "fs";
import * as pfs from "node:fs/promises";

async function getData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

// Load parcel data
// const parcelData = await getData(
//   "https://bostonopendata-boston.opendata.arcgis.com/api/download/v1/items/0ed0ba03cbf849819f18ef4d931acb71/geojson?layers=0"
// );
const parcelData = JSON.parse(
  fs.readFileSync("./Parcels_2022.geojson", "utf-8")
);

// Load building inventory
// const buildingData = csvParse(
//   await getData(
//     "https://data.boston.gov/dataset/f2a82340-1f9c-49fb-a60b-b5655c9a7931/resource/391a32e6-d4bb-48d3-a990-cb35a5768a40/download/building_inventory_021020.csv"
//   )
// );
//
async function loadCSV(path) {
  try {
    const csvContent = await pfs.readFile(path, "utf-8");
    const buildingData = csvParse(csvContent);
    return buildingData;
  } catch (error) {
    console.error("Error loading CSV file:", error);
  }
}
const buildingData = await loadCSV("./building_inventory_021020.csv");

// Filter relevant parcels (only select those in inventory)
const relevantParcels = new Set(
  buildingData.map((building) => building.pid_long).filter((id) => id !== "")
);

// Get relevant shape data
const parcelShapes = parcelData.features.filter((feature) =>
  relevantParcels.has(feature.properties.MAP_PAR_ID)
);

// get polylabel location of parcel shape
const newShapes = parcelShapes.map((parcel) => ({
  polylabel: polylabel(parcel.geometry.coordinates),
}));
