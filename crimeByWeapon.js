var margin = {top: 10,
        right: 30,
        bottom: 20,
        left: 30
    },
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("margin-top", "20px")
    .style("margin-left", "300px");

var format = d3.format(",d");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var pack = d3.pack()
    .size([width, height])
    .padding(20);

d3.csv("data/CrimeByWeapon.csv", function(d) {
    d.Deaths = +d.Deaths;
    if (d.Deaths) return d;
}, function(error, classes) {
    if (error) throw error;

    var root = d3.hierarchy({children: classes})
        .sum(function(d) { return d.Deaths; })
        .each(function(d) {
            if (id = d.data.Weapon) {
                var id, i = id.lastIndexOf(".");
                d.id = id;
                d.package = id.slice(0, i);
                d.class = id.slice(i + 1);
            }
        });

    var node = svg.selectAll(".node")
        .data(pack(root).leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    d3.select("svg.legend").remove();
    var svgLegend = d3.select("#metrics")
        .append("svg")
        .attr("width", 300).attr("height", 400)
        .style("margin-top", "40px");

    var legend = svgLegend.selectAll('.legend')
        .data(pack(root).leaves())
        .enter().append('g')
        .attr("class", "legends")
        .attr("transform", function (d, i) {
                return "translate(0," + i * 20 + ")"
        });

    node.append("circle")
        .attr("id", function(d) { return d.Weapon; })
        .attr("r", function(d) { return d.r + 3; })
        .style("fill", function(d) { return color(d.id); });

    node.append("clipPath")
        .attr("id", function(d) { return "clip-" + d.Deaths; })
        .append("use")
        .attr("xlink:href", function(d) { return "#" + d.Deaths; });

    node.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.Weapon + ")"; })
        .selectAll("tspan")
        .data(function(d) { return d; })
        .enter().append("tspan")
        .attr("x", 0)
        .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
        .text(function(d) { return d.id; });

    node.append("title")
        .text(function(d) { return d.id + "\nTotal Deaths: " + format(d.value); });

    /*
    node.append("text")
        .text(function(d) { return d.id; });
    */

    legend.append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function (d) {
            //console.log(d.id);
            return color(d.id);
        });

    legend.append('text')
        .attr("x", 20)
        .attr("y", 10)
        .text(function (d) {
            return d.id;
        })
        .attr("class", "textselected")
        .style("text-anchor", "start")
        .style("font-size", 15);

});


