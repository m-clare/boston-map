const fields = [
  "insulate_attic",
  "insulate_attic_converted",
  "ext_roof_insulation",
  "insulate_exposed_ducts",
  "insulate_exposed_pipes",
  "interior_wall_insulation_blow_in",
  "exterior_wall_insulation_at_replacement",
  "exterior_wall_insulation",
  "interior_wall_insulation_board",
  "insulate_spandrel",
  "asbestos",
  "seal_elevator_vent_shafts",
];

const fieldSet = new Set(fields);

const formatWords = (str) => {
  let words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }
  return words.join(" ");
};

export function hud(fieldsOfInterest) {
  let htmlString = `<h3>Property Information</h3>`;
  let unorderedList = `<ul>`;
  Object.entries(fieldsOfInterest).forEach(([field, value]) => {
    if (fieldSet.has(field) && value === "t") {
      const stringValue = field.split("_").join(" ");
      unorderedList += `<li>${stringValue}</li>`;
    } else if (!fieldSet.has(field)) {
      const stringValue = field.split("_").join(" ");
      htmlString += `<h4>${formatWords(stringValue)}: ${value}</h4>`;
    }
  });
  if (unorderedList !== `<ul>`) {
    htmlString += `<h4>Potential Envelope Retrofit Opportunities:</h4>`;
    unorderedList += `</ul >`;
    return htmlString + unorderedList;
  } else {
    return htmlString;
  }
}
