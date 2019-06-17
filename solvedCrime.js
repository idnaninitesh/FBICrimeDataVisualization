var margin = {top: 20, right: 160, bottom: 45, left: 60};

var width = 1040 - margin.left - margin.right,
    height = 640 - margin.top - margin.bottom;

var svg = d3.select("#map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", "20%")
    .style("margin-top", "3%")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


/* Data in strings like it would be if imported from a csv */
var data = [
    { Agency: "Municipal Police", No: "22.15", Yes: "42.98" },
    { Agency: "Sheriff", No: "4.80", Yes: "21.69" },
    { Agency: "Special Police", No: "2.1", Yes: "6.2" },
    { Agency: "County Police", No: "3.26", Yes: "4.70" },
    { Agency: "State Police", No: ".1", Yes: "0.25" },
    { Agency: "Tribal Police", No: "1.04", Yes: "1.15" },
    { Agency: "Regional Police", No: "0", Yes: "0" },
];

// Transpose the data into layers
var dataset = d3.layout.stack()(["No", "Yes"].map(function(fruit) {
    return data.map(function(d) {
        return {x: d.Agency, y: +d[fruit]};
    });
}));


// Set x, y and colors
var x = d3.scale.ordinal()
    .domain(dataset[0].map(function(d) { return d.x; }))
    .rangeRoundBands([10, width-10], 0.02);

var y = d3.scale.linear()
    .domain([0, d3.max(dataset, function(d) {  return d3.max(d, function(d) { return d.y0 + d.y; });  })])
    .range([height, 0]);

// var colors = ["#3690c0", "#fe9929"];
var colors = ["rgb(31, 119, 180)","rgb(214, 39, 40)"];
// rgb(44, 160, 44)

// Define and draw axes
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5)
    .tickSize(-width, 0, 0)
    .tickFormat( function(d) { return d +"%"} );

svg.append("text").attr("transform",
    "translate(" + (width/2) + " ," +
    (height + 40) + ")")
    .style("text-anchor", "middle")
    .text("Agency");

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left-2)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("% of Cases Solved or Not")

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);


// Create groups for each series, rects for each segment
var groups = svg.selectAll("g.cost")
    .data(dataset)
    .enter().append("g")
    .attr("class", "cost")
    .style("fill", function(d, i) { return colors[i]; });

var rect = groups.selectAll("rect")
    .data(function(d) { return d; })
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.x); })
    .attr("y", function(d) { return y(d.y0 + d.y); })
    .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
    .attr("width", x.rangeBand())
    .on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
        var xPosition = d3.mouse(this)[0] - 15;
        var yPosition = d3.mouse(this)[1] - 25;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select("text").text(d.y +"%");
    });


// Draw legend
var legend = svg.selectAll(".legend")
    .data(colors)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });

legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d, i) {return colors.slice().reverse()[i];});

legend.append("text")
    .attr("x", width + 5)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d, i) {
        switch (i) {
            case 0: return "Unsolved Crimes";
            case 1: return "Solved Crimes";
        }
    });


// Prep the tooltip bits, initial display is hidden
var tooltip = svg.append("g")
    .attr("class", "tooltip1")
    .style("display", "none");

tooltip.append("rect")
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

tooltip.append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");
