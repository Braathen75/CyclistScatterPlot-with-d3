const requestURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json',
w = 1200,
h = 500,
padding = 60;

// Let's retrieve the dataset

var req = new XMLHttpRequest();
req.open('GET', requestURL, true);
req.send();
req.onload = function () {
  var dataset = JSON.parse(req.response);

  // Build the svg object

  const svg = d3.select('.SVGChart').
  append('svg').
  attr('width', w).
  attr('height', h);

  // Draw and display the bar chart in the svg object 

  // i) Prepare the scales

  const xScale = d3.scaleTime().
  domain([new Date(d3.min(dataset, d => d.Year), 1, 1), new Date(d3.max(dataset, d => d.Year), 1, 1)]).
  range([padding, w - padding]);

  var specifier = "%M:%S";
  var parsedTime = dataset.map(function (d) {
    return d3.timeParse(specifier)(d.Time);
  });

  const yScale =
  d3.scaleTime().
  domain(d3.extent(parsedTime)).
  range([h - padding, padding]);

  // ii) Declare the tooltip and its id

  const tooltip = d3.select(".SVGChart").
  append("div").
  attr("id", "tooltip").
  style("opacity", 0);

  // iii) We define here two variables which are important for both the filling of the dots and the legend

  var keys = ["Allegedly or officially convinced of doping", "Non officially convinced of doping"],
  color = d3.scaleOrdinal().
  domain(keys).
  range(["#eb4034", "#33bdc4"]);

  // iv) And let's build our chart !  


  svg.selectAll("circle").
  data(dataset).
  enter().
  append("circle").
  attr("class", "dot").
  attr("cx", (d, i) => xScale(new Date(d.Year, 1, 1))).
  attr("cy", (d, i) => yScale(parsedTime[i])).
  attr("r", 5).
  style("fill", d => {return color(d.Doping == "");}).
  attr("data-xvalue", d => d.Year).
  attr("data-yvalue", (d, i) => {
    const splittedTime = d.Time.split(':');
    return new Date(1970, 0, 1, 0, splittedTime[0], splittedTime[1]);
  }).
  on("mouseover", handleMouseOver).
  on("mouseout", handleMouseOut);

  // Let's build the two functions to manage hover and tooltips

  function handleMouseOver(d, i) {
    d3.select(this).
    attr("r", 8);
    tooltip.style("opacity", 1).
    attr("id", "tooltip").
    style("fill", "#0e4d44").
    attr("data-year", d.Year).
    html('<b>' + d.Name + '</b> (' + d.Nationality + ')' +
    '<br>Time: ' + d.Time +
    '<br><br><em> Year: ' + d.Year + '<em>').
    style("left", d3.event.pageX + 15 + "px").
    style("top", d3.event.pageY - 30 + "px");
  };

  function handleMouseOut(d, i) {
    d3.select(this).
    attr("r", 5).
    transition().
    duration(50);
    tooltip.style("opacity", 0);
  };

  // v) Let's now add a legend !

  var legend = svg.selectAll(".legend").
  data(keys).
  enter().
  append("g").
  attr("id", "legend").
  attr("transform", function (d, i) {return "translate(0," + i * 20 + ')';});

  legend.append("rect").
  attr("x", w - padding).
  attr("y", (h - padding) / 2).
  attr("width", 10).
  attr("height", 10).
  style("fill", color);

  legend.append("text").
  attr("x", w - padding - 5).
  attr("y", (h - padding) / 2 + 4).
  attr("dy", ".35em").
  style("text-anchor", "end").
  text(function (d) {return d;});

  // And finally, the axes and we're done !

  var xAxis = d3.axisBottom().
  scale(xScale);
  var yAxis = d3.axisLeft().
  scale(yScale).
  tickFormat(function (d) {
    return d3.timeFormat(specifier)(d);
  });

  svg.append("g").
  attr("id", "x-axis").
  attr("transform", "translate(0," + (h - padding) + ")").
  call(xAxis);

  svg.append("g").
  attr("id", "y-axis").
  attr("transform", "translate(" + padding + ",0)").
  call(yAxis);
};