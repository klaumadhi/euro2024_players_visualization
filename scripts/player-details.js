const flags = {
  Albania: "https://www.worldometers.info/img/flags/al-flag.gif",
  Austria: "https://www.worldometers.info/img/flags/au-flag.gif",
  Belgium: "https://www.worldometers.info/img/flags/be-flag.gif",
  Croatia: "https://www.worldometers.info/img/flags/hr-flag.gif",
  "Czech Republic": "https://www.worldometers.info/img/flags/ez-flag.gif",
  Denmark: "https://www.worldometers.info/img/flags/da-flag.gif",
  England: "https://www.worldometers.info/img/flags/uk-flag.gif",
  France: "https://www.worldometers.info/img/flags/fr-flag.gif",
  Georgia: "https://www.worldometers.info/img/flags/gg-flag.gif",
  Germany: "https://www.worldometers.info/img/flags/gm-flag.gif",
  Hungary: "https://www.worldometers.info/img/flags/hu-flag.gif",
  Italy: "https://www.worldometers.info/img/flags/it-flag.gif",
  Netherlands: "https://www.worldometers.info/img/flags/nl-flag.gif",
  Poland: "https://www.worldometers.info/img/flags/pl-flag.gif",
  Portugal: "https://www.worldometers.info/img/flags/po-flag.gif",
  Romania: "https://www.worldometers.info/img/flags/ro-flag.gif",
  Scotland:
    "https://cdn.britannica.com/40/3940-004-2CDD60DB/flag-Scotland-cross-Saint-Andrew.jpg",
  Serbia: "https://www.worldometers.info/img/flags/ri-flag.gif",
  Slovakia: "https://www.worldometers.info/img/flags/lo-flag.gif",
  Slovenia: "https://www.worldometers.info/img/flags/si-flag.gif",
  Spain: "https://www.worldometers.info/img/flags/sp-flag.gif",
  Switzerland: "https://www.worldometers.info/img/flags/sz-flag.gif",
  Turkiye: "https://www.worldometers.info/img/flags/tu-flag.gif",
  Ukraine: "https://www.worldometers.info/img/flags/up-flag.gif",
};

document.addEventListener("DOMContentLoaded", function () {
  const playerDetails = JSON.parse(localStorage.getItem("selectedPlayer"));

  // Display player details if found
  if (playerDetails) {
    document.getElementById("player-name").textContent = playerDetails.Name;
    document.getElementById("player-flag").src = flags[playerDetails.Country];
    document.getElementById("player-info").innerHTML = `
      <div class="info"><strong>Position:</strong> ${
        playerDetails.Position
      }</div>
      <div class="info"><strong>Age:</strong> ${playerDetails.Age}</div>
      <div class="info"><strong>Club:</strong> ${playerDetails.Club}</div>
      <div class="info"><strong>Height:</strong> ${
        playerDetails.Height
      } cm</div>
      <div class="info"><strong>Foot:</strong> ${playerDetails.Foot}</div>
      <div class="info"><strong>Caps:</strong> ${playerDetails.Caps}</div>
      <div class="info"><strong>Goals:</strong> ${playerDetails.Goals}</div>
      <div class="info"><strong>Market Value:</strong> ${formatMarketValue(
        playerDetails.MarketValue
      )}</div>
      <div class="info"><strong>Country:</strong> ${playerDetails.Country}</div>
    `;
  }
});

// Convert large numbers into formatted strings for readability
function formatMarketValue(value) {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
  } else if (value >= 1000) {
    return `€${(value / 1000).toLocaleString()}K`;
  } else {
    return `€${value.toLocaleString()}`;
  }
}
