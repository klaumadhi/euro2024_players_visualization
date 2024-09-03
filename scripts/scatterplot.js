// Load data and initialize the scatter plot
d3.csv("data/euro2024_players.csv").then(function (data) {
  const scatterplot = d3.select("#scatterplot");
  const zoomedScatterplot = d3.select("#zoomedScatterplot");
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const width =
    scatterplot.node().getBoundingClientRect().width -
    margin.left -
    margin.right;
  const height = 500 - margin.top - margin.bottom;

  let xAttr = "Age"; // Default X-axis
  let yAttr = "MarketValue"; // Default Y-axis

  // Set up scales for scatter plot
  const x = d3.scaleLinear().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Set up axes
  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  // Append SVG for scatter plot
  const svg = scatterplot
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Append SVG for zoomed scatter plot
  const svgZoomed = zoomedScatterplot
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Function to update the scatter plot based on selected attributes
  function updateScatterplot() {
    // Update the axis labels in the title
    d3.select("#xAxisLabel").text(xAttr);
    d3.select("#yAxisLabel").text(yAttr);

    // Set domains for scales based on data
    x.domain(d3.extent(data, (d) => +d[xAttr])).nice();
    y.domain(d3.extent(data, (d) => +d[yAttr])).nice();

    // Clear previous plot
    svg.selectAll("*").remove();

    // Add x-axis to the main plot
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .append("text")
      .attr("class", "axis-label")
      .attr("x", width)
      .attr("y", 40)
      .style("text-anchor", "end")
      .text(xAttr);

    // Add y-axis to the main plot
    svg
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -margin.top)
      .attr("y", -50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yAttr);

    // Add scatter plot points to the main plot
    const dots = svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", (d) => x(d[xAttr]))
      .attr("cy", (d) => y(d[yAttr]))
      .style("fill", (d) => color(d.Country))
      .style("opacity", 0.75)
      .style("cursor", "pointer") // Ensure circles are interactive
      .on("mouseover", function (event, d) {
        showTooltip(event, d);
        d3.select(this).attr("r", 7).style("opacity", 1);
      })
      .on("mouseout", function (event, d) {
        hideTooltip();
        d3.select(this).attr("r", 5).style("opacity", 0.75);
      })
      .on("click", function (event, d) {
        goToPlayerDetails(d);
      });

    // Define the brush for the scatter plot
    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("brush end", brushed);

    // Append the brush to the scatter plot
    svg.append("g").attr("class", "brush").call(brush);

    function brushed({ selection }) {
      if (!selection) return;

      const [[x0, y0], [x1, y1]] = selection;

      // Filter data based on brush selection
      const brushedData = data.filter(
        (d) =>
          x0 <= x(d[xAttr]) &&
          x(d[xAttr]) <= x1 &&
          y0 <= y(d[yAttr]) &&
          y(d[yAttr]) <= y1
      );

      // Highlight selected dots
      dots.style("opacity", (d) => (brushedData.includes(d) ? 1 : 0.2));

      // Update the zoomed scatter plot with brushed data
      updateZoomedScatterplot(brushedData, x0, x1, y0, y1);
    }

    function updateZoomedScatterplot(brushedData, x0, x1, y0, y1) {
      // Set new domains for the zoomed plot
      const xZoomed = d3
        .scaleLinear()
        .range([0, width])
        .domain([x.invert(x0), x.invert(x1)])
        .nice();

      const yZoomed = d3
        .scaleLinear()
        .range([height, 0]) // Ensure yZoomed has the correct range (height to 0)
        .domain([y.invert(y1), y.invert(y0)]) // Correct the domain to ensure the right orientation
        .nice();

      // Clear previous plot
      svgZoomed.selectAll("*").remove();

      // Add x-axis to zoomed plot
      svgZoomed
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xZoomed))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width)
        .attr("y", 40)
        .style("text-anchor", "end")
        .text(xAttr);

      // Add y-axis to zoomed plot
      svgZoomed
        .append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yZoomed))
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -margin.top)
        .attr("y", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yAttr);

      // Add scatter plot points to the zoomed plot
      svgZoomed
        .selectAll(".dot")
        .data(brushedData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", (d) => xZoomed(d[xAttr]))
        .attr("cy", (d) => yZoomed(d[yAttr]))
        .style("fill", (d) => color(d.Country))
        .style("opacity", 0.75)
        .style("cursor", "pointer")
        .on("mouseover", function (event, d) {
          showTooltip(event, d);
          d3.select(this).attr("r", 7).style("opacity", 1);
        })
        .on("mouseout", function (event, d) {
          hideTooltip();
          d3.select(this).attr("r", 5).style("opacity", 0.75);
        })
        .on("click", function (event, d) {
          goToPlayerDetails(d);
        });
    }
  }

  // Initial plot
  updateScatterplot();

  // Update the scatter plot when dropdown selections change
  d3.select("#xAxisSelect").on("change", function () {
    xAttr = this.value;
    updateScatterplot();
  });

  d3.select("#yAxisSelect").on("change", function () {
    yAttr = this.value;
    updateScatterplot();
  });

  function showTooltip(event, d) {
    const tooltip = d3.select("#tooltip");
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip
      .html(
        `
            <strong>Name:</strong> ${d.Name}<br>
            <strong>Country:</strong> ${d.Country}<br>
            <strong>Age:</strong> ${d.Age}<br>
            <strong>Market Value:</strong> €${d.MarketValue}<br>
            <strong>Height:</strong> ${d.Height}<br>
            <strong>Goals:</strong> ${d.Goals}
        `
      )
      .style("left", event.pageX + 5 + "px")
      .style("top", event.pageY - 28 + "px")
      .style("z-index", 10);
  }

  function hideTooltip() {
    d3.select("#tooltip").transition().duration(500).style("opacity", 0);
  }

  function goToPlayerDetails(d) {
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
    };

    localStorage.setItem("selectedPlayer", JSON.stringify(playerDetails));
    window.location.href = `player-details.html?name=${encodeURIComponent(
      d.Name
    )}`;
  }

  // Create the legend
  const legend = d3.select("#legend");
  const uniqueCountries = Array.from(new Set(data.map((d) => d.Country)));

  uniqueCountries.forEach((country) => {
    const legendItem = legend.append("div").attr("class", "legend-item");

    legendItem
      .append("div")
      .attr("class", "legend-color")
      .style("background-color", color(country));

    legendItem.append("div").text(country);
  });
});
