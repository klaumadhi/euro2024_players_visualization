// Country flags
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
  d3.csv("data/euro2024_players.csv").then(function (data) {
    const heatmap = d3.select("#heatmap");

    const countrySelect = d3.select("#country-select");
    const footSelect = d3.select("#foot-select");
    const positionSelect = d3.select("#position-select");
    const resetButton = d3.select("#reset-button");

    // Extract unique filter options and remove invalid entries
    const countries = Array.from(new Set(data.map((d) => d.Country)))
      .filter(Boolean)
      .sort();
    const feet = Array.from(
      new Set(data.map((d) => d.Foot).filter((d) => d && d !== "-"))
    ).sort();
    const positions = Array.from(new Set(data.map((d) => d.Position)))
      .filter(Boolean)
      .sort();

    // Populate filter options
    countries.forEach((country) => {
      countrySelect.append("option").text(country).attr("value", country);
    });

    feet.forEach((foot) => {
      footSelect.append("option").text(foot).attr("value", foot);
    });

    positions.forEach((position) => {
      positionSelect.append("option").text(position).attr("value", position);
    });

    // Function to create the heatmap
    function createHeatmap(players, sizeScale) {
      heatmap.selectAll(".square").remove();

      heatmap
        .selectAll(".square")
        .data(players)
        .enter()
        .append("div")
        .attr("class", "square")
        .style("width", (d) => `${sizeScale ? sizeScale(d) : 50}px`)
        .style("height", (d) => `${sizeScale ? sizeScale(d) : 50}px`)
        .style("margin", "5px") // Add margin to prevent overlap
        .attr(
          "data-info",
          (d) => `
              Name: ${d.Name}
              Position: ${d.Position}
              Age: ${d.Age}
              Club: ${d.Club}
              Height: ${d.Height} cm
              Foot: ${d.Foot}
              Caps: ${d.Caps}
              Goals: ${d.Goals}
              Market Value: €${d.MarketValue}
              Country: ${d.Country}
          `
        )
        .each(function (d) {
          console.log("Adding tooltip for:", d.Name); // Debug log
          d3.select(this)
            .append("div")
            .attr("class", "bg-image")
            .style("background-image", `url(${flags[d.Country]})`);

          d3.select(this)
            .append("div")
            .attr("class", "initials-circle")
            .text((d) =>
              d.Name.split(" ")
                .map((n) => n[0])
                .join("")
            );

          d3.select(this)
            .append("div")
            .attr("class", "info-tooltip")
            .html(
              (d) => `
                      <strong>Name:</strong> ${d.Name}<br>
                      <strong>Position:</strong> ${d.Position}<br>
                      <strong>Age:</strong> ${d.Age}<br>
                      <strong>Club:</strong> ${d.Club}<br>
                      <strong>Height:</strong> ${d.Height} cm<br>
                      <strong>Foot:</strong> ${d.Foot}<br>
                      <strong>Caps:</strong> ${d.Caps}<br>
                      <strong>Goals:</strong> ${d.Goals}<br>
                      <strong>Market Value:</strong> €${d.MarketValue}<br>
                      <strong>Country:</strong> ${d.Country}
                  `
            );

          d3.select(this).on("click", function () {
            const playerDetails = {
              Name: d.Name,
              Position: d.Position,
              Age: d.Age,
              Club: d.Club,
              Height: d.Height,
              Foot: d.Foot,
              Caps: d.Caps,
              Goals: d.Goals,
              MarketValue: d.MarketValue,
              Country: d.Country,
              flag: flags[d.Country],
            };

            localStorage.setItem(
              "selectedPlayer",
              JSON.stringify(playerDetails)
            );
            window.location.href = `player-details.html?name=${encodeURIComponent(
              d.Name
            )}`;
          });
        });
    }

    // Function to apply both filters and sorting
    function applyFiltersAndSorting() {
      const selectedCountry = countrySelect.empty()
        ? "All"
        : countrySelect.property("value");
      const selectedFoot = footSelect.empty()
        ? "All"
        : footSelect.property("value");
      const selectedPosition = positionSelect.empty()
        ? "All"
        : positionSelect.property("value");

      const sortByElement = d3.select("input[name='sort-option']:checked");
      const sortBy = sortByElement.empty()
        ? null
        : sortByElement.property("value");

      const filteredData = data.filter(
        (d) =>
          (selectedCountry === "All" || d.Country === selectedCountry) &&
          (selectedFoot === "All" || d.Foot === selectedFoot) &&
          (selectedPosition === "All" || d.Position === selectedPosition)
      );

      let sizeScale = null; // Default size function

      if (sortBy) {
        const maxValue = d3.max(filteredData, (d) => +d[sortBy]);
        const minValue = d3.min(filteredData, (d) => +d[sortBy]);
        sizeScale = d3
          .scaleLinear()
          .domain([minValue, maxValue])
          .range([30, 100]); // Adjust size range as needed
      }

      createHeatmap(filteredData, (d) =>
        sizeScale ? sizeScale(d[sortBy]) : 50
      );
    }

    // Initial heatmap render with all players at default size
    createHeatmap(data, null);

    // Attach filters and sorting logic
    countrySelect.on("change", applyFiltersAndSorting);
    footSelect.on("change", applyFiltersAndSorting);
    positionSelect.on("change", applyFiltersAndSorting);
    d3.selectAll("input[name='sort-option']").on(
      "change",
      applyFiltersAndSorting
    );
    resetButton.on("click", () => {
      countrySelect.property("value", "All");
      footSelect.property("value", "All");
      positionSelect.property("value", "All");
      d3.select("input[name='sort-option']:checked").property("checked", false);
      createHeatmap(data, null); // Reset to default
    });
  });
});
