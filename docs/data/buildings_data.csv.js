import polylabel from "polylabel";
import { csvFormat, csvParse } from "d3-dsv";
import * as fs from "fs";
import * as pfs from "node:fs/promises";
import JSZip from "jszip";

async function getData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
  return response.text();
}

async function loadCSV(path) {
  try {
    const csvContent = await pfs.readFile(path, "utf-8");
    const data = csvParse(csvContent);
    return data;
  } catch (error) {
    console.error("Error loading CSV file:", error);
  }
}

// Load parcel data - in loader
// const parcelData = await getData(
//   "https://bostonopendata-boston.opendata.arcgis.com/api/download/v1/items/0ed0ba03cbf849819f18ef4d931acb71/geojson?layers=0"
// );

// Load building inventory
// const buildingData = csvParse(
//   await getData(
//     "https://data.boston.gov/dataset/f2a82340-1f9c-49fb-a60b-b5655c9a7931/resource/391a32e6-d4bb-48d3-a990-cb35a5768a40/download/building_inventory_021020.csv"
//   )
// );

const parcelData = JSON.parse(
  fs.readFileSync("./docs/data/Parcels_2022.geojson", "utf-8")
);

const buildingData = await loadCSV("./docs/data/building_inventory_021020.csv");

// Filter relevant parcels (only select those in inventory)
const relevantParcels = new Set(
  buildingData.map((building) => building.pid_long).filter((id) => id !== "")
);

const buildingDataMap = Object.fromEntries(
  buildingData.map((building) => [building.pid_long, { ...building }])
);

// Get relevant shape data
const parcelShapes = parcelData.features.filter((feature) =>
  relevantParcels.has(feature.properties.MAP_PAR_ID)
);

// get polylabel location of parcel shape and attach to building info
const newBuildingsData = parcelShapes.map((parcel) => {
  const {
    id,
    pid_long,
    building_typology,
    building_subtypology,
    st_name,
    st_num,
    st_name_suf,
    use_class,
    yr_built,
    gross_area,
    living_area,
    assessor_description,
    insulate_attic,
    insulate_attic_converted,
    ext_roof_insulation,
    insulate_exposed_ducts,
    insulate_exposed_pipes,
    interior_wall_insulation_blow_in,
    exterior_wall_insulation_at_replacement,
    exterior_wall_insulation,
    interior_wall_insulation_board,
    insulate_spandrel,
    asbestos,
    seal_elevator_vent_shafts,
    ...buildingData
  } = buildingDataMap[parcel.properties.MAP_PAR_ID];
  const address = [st_num, st_name, st_name_suf].join(" ") ?? "Not Provided";
  return {
    id,
    pid_long,
    building_typology,
    building_subtypology,
    use_class,
    address,
    yr_built,
    gross_area,
    living_area,
    assessor_description,
    insulate_attic,
    insulate_attic_converted,
    ext_roof_insulation,
    insulate_exposed_ducts,
    insulate_exposed_pipes,
    interior_wall_insulation_blow_in,
    exterior_wall_insulation_at_replacement,
    exterior_wall_insulation,
    interior_wall_insulation_board,
    insulate_spandrel,
    asbestos,
    seal_elevator_vent_shafts,
    point: polylabel(parcel.geometry.coordinates) ?? null,
  };
});

// rewrite to csv (smaller storage)
const zip = new JSZip();
zip.file("buildings_data.csv", csvFormat(newBuildingsData));
zip.generateNodeStream().pipe(process.stdout);
