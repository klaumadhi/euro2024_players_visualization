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
    const maxAge = 40;
    const maxHeight = 210;
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

      // Create the Age Gauge
      createGauge(
        `#${sanitizedName}-age-gauge`,
        player.Age,
        maxAge,
        "Age",
        `${player.Age} years old`
      );

      // Create the Height Gauge
      createGauge(
        `#${sanitizedName}-height-gauge`,
        player.Height,
        maxHeight,
        "Height",
        `${player.Height} cm`
      );

      // Create the Caps Gauge
      createGauge(
        `#${sanitizedName}-caps-gauge`,
        player.Caps,
        maxCaps,
        "Caps",
        `${player.Caps} caps`
      );

      // Create the Market Value Gauge
      createGauge(
        `#${sanitizedName}-marketvalue-gauge`,
        player.MarketValue,
        maxMarketValue,
        "Market Value",
        formatMarketValue(player.MarketValue)
      );
    });

    function createGauge(container, value, maxValue, label, displayText) {
      const width = 100,
        height = 100,
        twoPi = 2 * Math.PI;
      const arc = d3.arc().startAngle(0).innerRadius(40).outerRadius(50);

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

      const background = svg
        .append("path")
        .datum({ endAngle: twoPi })
        .style("fill", "#ddd")
        .attr("d", arc);

      const foreground = svg
        .append("path")
        .datum({ endAngle: 0 })
        .attr("d", arc);

      const text = svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "14px")
        .style("fill", "#333")
        .text(displayText);

      const percentComplete = value / maxValue;

      // Determine color based on percentComplete
      const color = d3
        .scaleLinear()
        .domain([0, 0.5, 1])
        .range(["#00ff00", "#ffff00", "#ff0000"]); // Green to yellow to red

      foreground
        .style("fill", color(percentComplete))
        .transition()
        .duration(750)
        .attrTween("d", function (d) {
          const interpolate = d3.interpolate(
            d.endAngle,
            percentComplete * twoPi
          );
          return function (t) {
            d.endAngle = interpolate(t);
            return arc(d);
          };
        });
    }

    // Implement search functionality
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", function () {
      console.log("Search event triggered");

      const filter = searchInput.value.toLowerCase().trim();

      console.log("Filter:", filter);

      const cards = document.querySelectorAll(".card");

      cards.forEach((card) => {
        const name = card.querySelector("h2").textContent.toLowerCase().trim();
        console.log("Card name:", name);
        if (name.includes(filter)) {
          card.style.display = "";
          console.log(`Match found: ${name}`);
        } else {
          card.style.display = "none";
          console.log(`No match: ${name}`);
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
