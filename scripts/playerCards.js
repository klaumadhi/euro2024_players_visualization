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

document.addEventListener("DOMContentLoaded", () => {
  // Load CSV data using D3
  d3.csv("data/euro2024_players.csv").then((players) => {
    const cardContainer = document.getElementById("card-container");

    // Get maximum values dynamically for comparison
    const maxAge = d3.max(players, (d) => +d.Age);
    const maxHeight = d3.max(players, (d) => +d.Height);
    const maxCaps = d3.max(players, (d) => +d.Caps);
    const maxMarketValue = d3.max(players, (d) => +d.MarketValue);

    players.forEach((player) => {
      // Sanitize player name to be a valid ID
      const sanitizedName = player.Name.replace(/\s/g, "").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );

      // Get the player's flag based on their country
      const flagUrl = flags[player.Country];

      // Create a card for each player
      const card = document.createElement("div");
      card.className = "card";

      // Add player info to the card with flag as a background
      card.innerHTML = `
        <div class="player-info" style="background-image: url(${flagUrl});">
          <h2>${player.Name}</h2>
          <h4>Position: ${player.Position}</h4>
          <p>${player.Country}</p>
        </div>
        <div class="gauge-container">
          <div class="gauge" id="${sanitizedName}-age-gauge"><p>Age</p></div>
          <div class="gauge" id="${sanitizedName}-height-gauge"><p>Height</p></div>
          <div class="gauge" id="${sanitizedName}-caps-gauge"><p>Caps</p></div>
          <div class="gauge" id="${sanitizedName}-marketvalue-gauge"><p>Market Value</p></div>
        </div>
      `;

      // Append the card to the container
      cardContainer.appendChild(card);

      // Create gauges for age, height, caps, and market value
      createLinearBarChart(
        `#${sanitizedName}-age-gauge`,
        player.Age,
        maxAge,
        "Age",
        `${player.Age} years old`
      );
      createLinearBarChart(
        `#${sanitizedName}-height-gauge`,
        player.Height,
        maxHeight,
        "Height",
        `${player.Height} cm`
      );
      createLinearBarChart(
        `#${sanitizedName}-caps-gauge`,
        player.Caps,
        maxCaps,
        "Caps",
        `${player.Caps} caps`
      );
      createLinearBarChart(
        `#${sanitizedName}-marketvalue-gauge`,
        player.MarketValue,
        maxMarketValue,
        "Market Value",
        formatMarketValue(player.MarketValue)
      );
    });

    // Function to create a linear bar chart for each stat
    function createLinearBarChart(
      container,
      value,
      maxValue,
      label,
      displayText
    ) {
      const width = 250, // Set the width of the bar
        height = 20, // Set the height of the bar
        barHeight = 20; // Set the height for the filled portion

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Create background bar
      svg
        .append("rect")
        .attr("width", width)
        .attr("height", barHeight)
        .attr("y", (height - barHeight) / 2)
        .attr("fill", "#ddd");

      // Create filled bar based on player's value relative to max value
      svg
        .append("rect")
        .attr("width", (value / maxValue) * width)
        .attr("height", barHeight)
        .attr("y", (height - barHeight) / 2)
        .attr("fill", "#4682B4"); // SteelBlue color

      // Display the player's value as text in the center
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("fill", "#333")
        .style("font-size", "10px")
        .text(displayText);

      // Display minimum value on the left
      svg
        .append("text")
        .attr("x", 0)
        .attr("y", height - 5)
        .attr("text-anchor", "start")
        .style("fill", "#333")
        .style("font-size", "10px")
        .text("Min: 0");

      // Display maximum value on the right
      const formattedMaxValue =
        label === "Market Value" ? formatMarketValue(maxValue) : maxValue;

      svg
        .append("text")
        .attr("x", width)
        .attr("y", height - 5)
        .attr("text-anchor", "end")
        .style("fill", "#333")
        .style("font-size", "10px")
        .text(`Max: ${formattedMaxValue}`);
    }

    // Implement search functionality to filter cards
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", function () {
      const filter = searchInput.value.toLowerCase().trim();
      const cards = document.querySelectorAll(".card");

      cards.forEach((card) => {
        const name = card.querySelector("h2").textContent.toLowerCase().trim();
        if (name.includes(filter)) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
});

// Format market value to be displayed in a user-friendly way
function formatMarketValue(value) {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
  } else if (value >= 1000) {
    return `€${(value / 1000).toLocaleString()}K`;
  } else {
    return `€${value.toLocaleString()}`;
  }
}
