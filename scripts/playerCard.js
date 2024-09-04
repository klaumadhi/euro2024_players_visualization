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
  // Load the CSV file
  d3.csv("data/euro2024_players.csv").then((players) => {
    const cardContainer = document.getElementById("card-container");

    // Calculate the maximum values dynamically
    const maxAge = d3.max(players, (d) => +d.Age);
    const maxHeight = d3.max(players, (d) => +d.Height);
    const maxCaps = d3.max(players, (d) => +d.Caps);
    const maxMarketValue = d3.max(players, (d) => +d.MarketValue);

    players.forEach((player) => {
      // Sanitize the player name to create a valid ID
      const sanitizedName = player.Name.replace(/\s/g, "").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      );

      // Get the flag URL based on the country
      const flagUrl = flags[player.Country];

      // Create card
      const card = document.createElement("div");
      card.className = "card";

      // Add player name, country, and placeholders for gauges
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

      // Append card to container
      cardContainer.appendChild(card);

      // Create the Age Gauge (Linear Bar Chart)
      createLinearBarChart(
        `#${sanitizedName}-age-gauge`,
        player.Age,
        maxAge,
        "Age",
        `${player.Age} years old`
      );

      // Create the Height Gauge (Linear Bar Chart)
      createLinearBarChart(
        `#${sanitizedName}-height-gauge`,
        player.Height,
        maxHeight,
        "Height",
        `${player.Height} cm`
      );

      // Create the Caps Gauge (Linear Bar Chart)
      createLinearBarChart(
        `#${sanitizedName}-caps-gauge`,
        player.Caps,
        maxCaps,
        "Caps",
        `${player.Caps} caps`
      );

      // Create the Market Value Gauge (Linear Bar Chart)
      createLinearBarChart(
        `#${sanitizedName}-marketvalue-gauge`,
        player.MarketValue,
        maxMarketValue,
        "Market Value",
        formatMarketValue(player.MarketValue)
      );
    });

    function createLinearBarChart(
      container,
      value,
      maxValue,
      label,
      displayText
    ) {
      const width = 250, // Bar chart width
        height = 20, // Bar chart height
        barHeight = 20; // Height of the filled part of the bar

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Background bar
      svg
        .append("rect")
        .attr("width", width)
        .attr("height", barHeight)
        .attr("y", (height - barHeight) / 2)
        .attr("fill", "#ddd");

      // Filled bar
      svg
        .append("rect")
        .attr("width", (value / maxValue) * width)
        .attr("height", barHeight)
        .attr("y", (height - barHeight) / 2)
        .attr("fill", "#4682B4"); // SteelBlue

      // Text displaying the current value
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("fill", "#333")
        .style("font-size", "10px")
        .text(displayText);

      // Display the minimum and maximum values
      svg
        .append("text")
        .attr("x", 0)
        .attr("y", height - 5)
        .attr("text-anchor", "start")
        .style("fill", "#333")
        .style("font-size", "10px")
        .text("Min: 0");

      // Format the max value if the label is "Market Value"
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

    // Implement search functionality
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

function formatMarketValue(value) {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
  } else if (value >= 1000) {
    return `€${(value / 1000).toLocaleString()}K`;
  } else {
    return `€${value.toLocaleString()}`;
  }
}
