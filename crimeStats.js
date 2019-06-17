var current = "TotalCrimes"; // default view
var totalcounts, property, violent, robbery, murder, burglary, larceny, rape, aggravatedassault, motorvehicletheft;
// use a d3 map to make a lookup table for the string in the chart title
var chartLabels = d3.map();
chartLabels.set("TotalCrimes", "Total Crimes");
chartLabels.set("PropertyCrimes", "Property Crimes");
chartLabels.set("ViolentCrimes", "Violent Crimes");
// chartLabels.set("Robbery", "Robbery");
chartLabels.set("Murder", "Murder");
chartLabels.set("Burglary", "Burglary");
chartLabels.set("Larceny", "Larceny");
chartLabels.set("Rape", "Rape");
chartLabels.set("AggravatedAssault", "Aggravated Assault");
chartLabels.set("MotorVehicleTheft", "Motor Vehicle Theft");

var lowColor = '#ffeda0';       //'#deebf7';
var highColor = '#f03b20';      //'#08306b';
var w = 100, h = 240;
var selectedYear = 1994;
var page_title = document.getElementById("page_title");
var barchart_title = document.getElementById("barchart_tile");
var radarchart_title = document.getElementById('radarchart_title');
var crime_type = document.getElementById("crime_type");
var crime_count = document.getElementById("crime_count");
var reset_button = document.getElementById("reset_button");
var crime_count_val = 0;
var headline = "US Crime Statistics ";


var key = d3.select("#metrics")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("class", "legend");

var legend = key.append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad")
    .attr("labelFormat", (d3.format("s")));

var yAxis = d3.axisRight();

var config = {
    "color1": lowColor, "color2": highColor, "stateDataColumn": "State",
    "defaultValue": "1994", "state": "State"
};
var WIDTH = 960, HEIGHT = 600;
var COLOR_COUNTS = 50;
var SCALE = 0.6;
var locationHash = "";

window.onload = function () {
    locationHash = window.location.hash;
};


function Interpolate(start, end, steps, count) {
    var s = start,
        e = end,
        final = s + (((e - s) / steps) * count);
    return Math.floor(final);
}

function Color(_r, _g, _b) {
    var r, g, b;
    var setColors = function (_r, _g, _b) {
        r = _r;
        g = _g;
        b = _b;
    };

    setColors(_r, _g, _b);
    this.getColors = function () {
        var colors = {
            r: r,
            g: g,
            b: b
        };
        return colors;
    };
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function valueFormat(d) {
    if (d > 1000000000) {
        return Math.round(d / 1000000000 * 10) / 10 + "B";
    } else if (d > 1000000) {
        return Math.round(d / 1000000 * 10) / 10 + "M";
    } else if (d > 1000) {
        return Math.round(d / 1000 * 10) / 10 + "K";
    } else {
        return d;
    }
}

function getColumn(buttonlabel) {

    var res = "total";
    switch (buttonlabel) {
        case "Total Crimes":
            res = "total";
            break;
        case "Property Crimes":
            res = "property";
            break;
        case "Violent Crimes":
            res = "violent";
            break;
        case "Murder":
            res = "murder";
            break;
        case "Burglary":
            res = "burglary";
            break;
        case "Larceny":
            res = "larceny";
            break;
        case "Rape":
            res = "rape";
            break;
        case "Aggravated Assault":
            res = "aggravatedassault";
            break;
        case "Motor Vehicle Theft":
            res = "motorvehicletheft";
            break;
        default:
            res = "total";
    }

    return res;
}

var COLOR_FIRST = config.color1, COLOR_LAST = config.color2;
var rgb = hexToRgb(COLOR_FIRST);
var COLOR_START = new Color(rgb.r, rgb.g, rgb.b);

rgb = hexToRgb(COLOR_LAST);
var COLOR_END = new Color(rgb.r, rgb.g, rgb.b);

var width = WIDTH,
    height = HEIGHT;


var startColors = COLOR_START.getColors(),
    endColors = COLOR_END.getColors();

var colors = [];

for (var i = 0; i < COLOR_COUNTS; i++) {
    var r = Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
    var g = Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
    var b = Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
    colors.push(new Color(r, g, b));
}

var quantize = d3.scaleQuantize()
    .domain([0, 1.0])
    .range(d3.range(COLOR_COUNTS).map(function (i) {
        return i
    }));

var path = d3.geoPath();

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);


d3.queue()
    .defer(d3.csv, "data/property.csv")
    .defer(d3.csv, "data/violent.csv")
    // .defer(d3.csv, "data/robbery.csv")
    .defer(d3.csv, "data/murder.csv")
    .defer(d3.csv, "data/burglary.csv")
    .defer(d3.csv, "data/larceny.csv")
    .defer(d3.csv, "data/rape.csv")
    .defer(d3.csv, "data/aggravatedassault.csv")
    .defer(d3.csv, "data/motorvehicletheft.csv")
    .defer(d3.csv, "data/TotalCounts.csv")
    .awaitAll(loadButtons);

function loadButtons(error, results) {
    property = results[0];
    violent = results[1];
    // robbery = results[2];
    murder = results[2];
    burglary = results[3];
    larceny = results[4];
    rape = results[5];
    aggravatedassault = results[6];
    motorvehicletheft = results[7];
    totalcounts = results[8];
}


d3.csv("data/TotalCounts.csv", function (err, data) {


    d3.tsv("data/us-state-names.tsv", function (error, names) {
        d3.json("https://unpkg.com/us-atlas@1/us/10m.json", function (error, us) {

            var name_id_map = {};
            var id_name_map = {};

            for (var i = 0; i < names.length; i++) {
                name_id_map[names[i].name] = names[i].id;
                id_name_map[names[i].id] = names[i].name;
            }

            var dataMap = {};
            data.forEach(function (d) {
                if (!dataMap[d[config.state]]) {
                    dataMap[d[config.state]] = {};
                }

                for (var i = 0; i < Object.keys(data[0]).length; i++) {
                    if ((Object.keys(data[0])[i] !== config.state)) {
                        dataMap[d[config.state]][Object.keys(data[0])[i]] = +d[Object.keys(data[0])[i]];
                    }
                }

            });

            function drawMap(selectedYear) {
                var valueById = d3.map();

                console.log("inside drawmap", selectedYear);

                crime_count_val = 0;
                data.forEach(function (d) {
                    var id = name_id_map[d[config.state]];
                    valueById.set(id, +d[selectedYear]);
                    crime_count_val += parseInt(d[selectedYear]);
                });

                quantize.domain([
                    d3.min(data, function (d) {
                        return +d[selectedYear]
                    }),
                    d3.max(data, function (d) {
                        return +d[selectedYear]
                    })]);

                d3.select("svg.legend").remove();
                key = d3.select("#metrics")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h)
                    .attr("class", "legend");

                legend = key.append("defs")
                    .append("svg:linearGradient")
                    .attr("id", "gradient")
                    .attr("x1", "100%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad")
                    .attr("labelFormat", (d3.format("s")));
                yAxis = d3.axisRight();
                svg.append("g")
                    .attr("class", "states-choropleth")
                    .selectAll("path")
                    .data(topojson.feature(us, us.objects.states).features)
                    .enter().append("path")
                    .attr("transform", "scale(" + SCALE + ")")
                    .style("fill", function (d) {
                        if (valueById.get(d.id)) {
                            var i = quantize(valueById.get(d.id));
                            var color = colors[i].getColors();
                            return "rgb(" + color.r + "," + color.g + "," + color.b + ")";
                        } else {
                            return "";
                        }
                    })
                    .attr("d", path)
                    .on("click", function (d) {

                        d3.select(".states-choropleth").selectAll("path").attr("fill-opacity", "1.0");
                        $("#tooltip-container").hide();

                        var html = "";
                        html += "<div class=\"tooltip_kv\">";
                        html += "<span class=\"tooltip_key\">";
                        html += id_name_map[d.id];
                        html += "</span>";
                        html += "</div>";

                        /*
                        var years = {}, yvalues = {};
                        for (var i = 0; i < Object.keys(data[0]).length - 1; i++) {
                            if (Object.keys(data[0])[i] === selectedYear.toString()) {
                                html += "<div class=\"tooltip_kv\">";
                                html += "<span class='tooltip_key'>";
                                html += chartLabels.get(current);
                                html += ' in ';
                                html += Object.keys(data[0])[i];
                                html += "</span>";
                                html += "<span class=\"tooltip_value\">";
                                html += valueFormat(dataMap[id_name_map[d.id]][Object.keys(data[0])[i]]);
                                html += "";
                                html += "</span>";
                                html += "</div>";
                                years[i] = Object.keys(data[0])[i];
                                yvalues[i] = dataMap[id_name_map[d.id]][Object.keys(data[0])[i]];
                            }
                        }

                        $("#tooltip-container").html(html);
                        $(this).attr("fill-opacity", "0.7");
                        $("#tooltip-container").show();

                        var coordinates = d3.mouse(this);

                        var map_width = $('.states-choropleth')[0].getBoundingClientRect().width;

                        if (d3.event.layerX < map_width / 2) {
                            d3.select("#tooltip-container")
                                .style("top", (d3.event.layerY + 15) + "px")
                                .style("left", (d3.event.layerX + 15) + "px");
                        } else {
                            var tooltip_width = $("#tooltip-container").width();
                            d3.select("#tooltip-container")
                                .style("top", (d3.event.layerY + 15) + "px")
                                .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
                        }
*/

                        $("#tooltip-container").html(html);
                        $(this).attr("fill-opacity", "0.5");
                        $("#tooltip-container").show();

                        var coordinates = d3.mouse(this);

                        var map_width = $('.states-choropleth')[0].getBoundingClientRect().width;

                        if (d3.event.layerX < map_width / 2) {
                            d3.select("#tooltip-container")
                                .style("top", (d3.event.layerY + 15) + "px")
                                .style("left", (d3.event.layerX + 15) + "px");
                        } else {
                            var tooltip_width = $("#tooltip-container").width();
                            d3.select("#tooltip-container")
                                .style("top", (d3.event.layerY + 15) + "px")
                                .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
                        }

                        /* update bar chart for selected state */
                        drawBarChart(id_name_map[d.id]);
                        /* update radar chart for selected state */
                        drawRadarChart(id_name_map[d.id]);
                    })
                    /*.on("mouseout", function () {
                        console.log(this);
                        $(this).attr("fill-opacity", "1.0");
                        $("#tooltip-container").hide();
                    });*/

                svg.append("path")
                    .datum(topojson.mesh(us, us.objects.states, function (a, b) {
                        return a !== b;
                    }))
                    .attr("class", "states")
                    .attr("transform", "scale(" + SCALE + ")")
                    .attr("d", path);


                page_title.textContent = headline + " (" + chartLabels.get(current) + " - " + selectedYear + ")";
/*
                crime_type.textContent = chartLabels.get(current) + ' - ' + selectedYear;
                crime_count.textContent = valueFormat(crime_count_val);
*/

                var dataArray = [];
                for (var d = 0; d < data.length; d++) {
                    dataArray.push(parseFloat(data[d][selectedYear]))
                }
                var minVal = d3.min(dataArray)
                var maxVal = d3.max(dataArray)
                var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor])

                legend.append("stop")
                    .attr("offset", "0%")
                    .attr("stop-color", highColor)
                    .attr("stop-opacity", 1);

                legend.append("stop")
                    .attr("offset", "100%")
                    .attr("stop-color", lowColor)
                    .attr("stop-opacity", 1);

                key.append("rect")
                    .attr("width", w - 80)
                    .attr("height", h)
                    .style("fill", "url(#gradient)")
                    .attr("transform", "translate(0,10)");

                var y = d3.scaleLinear()
                    .range([h, 0])
                    .domain([minVal, maxVal]);

                var yAxis = d3.axisRight(y).tickFormat(function (d) {
                    return valueFormat(d)
                });

                key.append("g")
                    .attr("class", "yaxis")
                    .attr("transform", "translate(18,10)")
                    .call(yAxis);

                function updateFill() {
                    svg.selectAll(".countries path")
                        .attr("fill", function (d) {
                            return "#ccc";
                        });
                }

            }

            /* default rendering */
            drawMap(selectedYear);
            drawBarChart('United States');
            drawRadarChart('United States');


            reset_button.onclick = function() {

                /* reset bar selection to reset year */
                d3.selectAll(".bar").select("rect").style("fill","cornflowerblue");
                selectedYear = 1994;

                /* reset chloropleth selection to reset state */
                d3.select(".states-choropleth").selectAll("path").attr("fill-opacity", "1.0");
                $("#tooltip-container").hide();

                drawMap(selectedYear);
                drawBarChart('United States');
                drawRadarChart('United States');

            };

            var colorScale = d3.scaleLinear().range([lowColor, highColor]);
            d3.selectAll("#crimetypes a")
                .on("click", function () {

                    /* reset bar selection to reset year */
                    d3.selectAll(".bar").select("rect").style("fill","cornflowerblue");
                    selectedYear = 1994;

                    /* reset chloropleth selection to reset state */
                    d3.select(".states-choropleth").selectAll("path").attr("fill-opacity", "1.0");
                    $("#tooltip-container").hide();


                    var item = d3.select(this);
                    d3.selectAll(".crimetypes a").classed("selected", false);
                    current = item.attr("data-metric");
                    colorScale.domain(d3.extent(data, function (d) {
                        return +d[current];
                    }));

                    var buttonlabel = chartLabels.get(current);
                    item.classed("selected", true);
                    item.classed(item.attr("data-metric"), true);
                    console.log(buttonlabel);
                    console.log("inside onclick", selectedYear);
                    switch (buttonlabel) {
                        case "Total Crimes":
                            data = totalcounts;
                            break;
                        case "Property Crimes":
                            data = property;
                            break;
                        case "Violent Crimes":
                            data = violent;
                            break;
                        // case "Robbery":
                        //     data = robbery;
                        //     break;
                        case "Murder":
                            data = murder;
                            break;
                        case "Burglary":
                            data = burglary;
                            break;
                        case "Larceny":
                            data = larceny;
                            break;
                        case "Rape":
                            data = rape;
                            break;
                        case "Aggravated Assault":
                            data = aggravatedassault;
                            break;
                        case "Motor Vehicle Theft":
                            data = motorvehicletheft;
                            break;
                        default:
                            data = TotalCounts;
                    }
                    config = {
                        "color1": "#ffeda0", "color2": "#800026", "stateDataColumn": "State",
                        "defaultValue": "1994", "state": "State"
                    };
                    data.forEach(function (d) {
                        if (!dataMap[d[config.state]]) {
                            dataMap[d[config.state]] = {};
                        }

                        for (var i = 0; i < Object.keys(data[0]).length; i++) {
                            if ((Object.keys(data[0])[i] !== config.state)) {
                                dataMap[d[config.state]][Object.keys(data[0])[i]] = +d[Object.keys(data[0])[i]];
                            }
                        }


                    });
                    // selectedYear=1994;
                    // d3.select("#year").attr("value", selectedYear);
                    drawMap(selectedYear);
                    /* update bar chart for selected crime type */
                    drawBarChart('United States');
                    /* update radar chart for selected crime type */
                    drawRadarChart('United States');
                });


            function drawRadarChart(state) {

                var wradar = 350,
                    hradar = 300;

                var colorscale = d3.scaleOrdinal().range(["#6F257F", "#CA0D59"])

                //Legend titles
                var LegendOptions = ['Total Crime Count'];

                var filename_radar = "None";


                filename_radar = 'data/radar_data/' + state + 'CrimeStats.csv';
                radarchart_title.textContent = 'Crime Distribution in ' + state + ' - ' + selectedYear;

                console.log(filename_radar);

                d3.csv(filename_radar, function (error, dataradar) {
                    // data.forEach(function (d) {
                    //     d.year = +d.year;
                    //     d.rape_per = +d.rape_per;
                    //     d.murder_per = +d.murder_per;
                    //     d.assault_per = +d.assault_per;
                    //     d.burglary_per = +d.burglary_per;
                    //     d.violent_per = +d.violent_per;
                    //     d.motor_vehicle_per = +d.motor_vehicle_per;
                    //     d.larceny_per = +d.larceny_per;
                    // });

                    // console.log(data[0]);
                    // console.log(data[0].year);

                    // var selectedYear = "2000";

                    var i;
                    for (i = 0; i < dataradar.length; i++) {
                        if (dataradar[i].year === selectedYear.toString()) {
                            console.log(i);
                            break;
                        }
                    }
                    console.log("Outside loop year val: ", i);

                    d = [
                        [
                            {axis: "rape", value: parseFloat(dataradar[i].rape_per)},
                            {axis: "murder", value: parseFloat(dataradar[i].murder_per)},
                            {axis: "assault", value: parseFloat(dataradar[i].assault_per)},
                            {axis: "burglary", value: parseFloat(dataradar[i].burglary_per)},
                            {axis: "violent", value: parseFloat(dataradar[i].violent_per)},
                            {axis: "motorvehicle", value: parseFloat(dataradar[i].motor_vehicle_per)},
                            {axis: "larceny", value: parseFloat(dataradar[i].larceny_per)}
                        ]
                    ];

                    var mycfg = {
                        w: wradar,
                        h: hradar,
                        maxValue: 0.6,
                        levels: 6,
                        ExtraWidthX: 300
                    };

                    RadarChart.draw("#radarchart", d, mycfg);


                });

                //Call function to draw the Radar chart
                //Will expect that data is in %'s
                //RadarChart.draw("#chart", d, mycfg);

                ////////////////////////////////////////////
                /////////// Initiate legend ////////////////
                ////////////////////////////////////////////

                var svg = d3.select('#body')
                    .selectAll('svg')
                    .append('svg')
                    .attr("width", wradar + 300)
                    .attr("height", hradar);


                //Initiate Legend
                var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr('transform', 'translate(90,20)')
                ;
                //Create colour squares
                legend.selectAll('rect')
                    .data(LegendOptions)
                    .enter()
                    .append("rect")
                    .attr("x", w - 65)
                    .attr("y", function (d, i) {
                        return i * 20;
                    })
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", function (d, i) {
                        return colorscale(i);
                    })
                ;
                //Create text next to squares
                legend.selectAll('text')
                    .data(LegendOptions)
                    .enter()
                    .append("text")
                    .attr("x", w - 52)
                    .attr("y", function (d, i) {
                        return i * 20 + 9;
                    })
                    .attr("font-size", "11px")
                    .attr("fill", "#737373")
                    .text(function (d) {
                        return d;
                    })
                ;

            }


            function drawBarChart(state) {

                d3.select("#barchart").select("svg").remove();

                let filename = 'data/bar_data/';
                filename = filename.concat(state);
                filename = filename.concat('CrimeStats.csv');
                console.log(filename);

                var margin = {top: 20, right: 20, bottom: 30, left: 40},
                    width = 700 - margin.left - margin.right,
                    height = 280 - margin.top - margin.bottom;


                var svg1 = d3.select("#barchart").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


                var yScale = d3.scaleLinear()
                    .range([height, 0]);


                var xScale = d3.scaleBand()
                    .rangeRound([0, width]).padding(.2);


                var xAxis = d3.axisBottom(xScale);

                var yAxis = d3.axisLeft(yScale)
                    .ticks(10)
                    .tickFormat(function(d){
                        var val = String(valueFormat(d));
                        return val;
                    });


                d3.csv(filename, function(error, bardata) {
                    if (error) throw error;

                    var buttonlabel = chartLabels.get(current);
                    var dataColumn = getColumn(buttonlabel);
                    var crime_count_val = 0;
                    var max_count = 0;

                    bardata.forEach(function (d1) {
                        if (parseInt(d1[dataColumn]) > max_count)
                            max_count = parseInt(d1[dataColumn]);

                        if (d1.State === selectedYear.toString())
                            crime_count_val = parseInt(d1[dataColumn]);
                    });

                    crime_type.textContent = chartLabels.get(current) + ' in ' + state + ' - ' + selectedYear;
                    crime_count.textContent = valueFormat(crime_count_val);

                    //Total Crimes in United States
                    barchart_title.textContent = chartLabels.get(current) + " in " + state;

                    xScale.domain(bardata.map(function(d) { return d.State; }));

                    // var str = valueFormat(d3.max(bardata, function(d) { return d[dataColumn]; }));

                    // yScale.domain([0, str.substring(0,str.length-1)]);
                    console.log(max_count);
                    yScale.domain([0, max_count]);
                    //yScale.domain([0, d3.max(bardata, function(d) { return d[dataColumn]; })]);

                    var xaxis=  svg1.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    var xLaebl = xaxis
                        .append("text")
                        .attr("y", 20)
                        .attr("font-size", "1.2em")
                        .attr("text-anchor", "start")
                        .attr("fill", "red")
                        .attr("dy", ".71em")
                        .text("Year");


                    var yaxis =  svg1.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);



                    // ---- add label to y-axis
                    var ylabel = yaxis
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 1)
                        .attr("font-size", "1.2em")
                        .attr("fill", "red")
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Count");


                    // ----  select all existing g placeholders for holding rects and texts ----
                    //   1. as placeholders for x-axis and y-axis and inner canvas are all g
                    //   2. therefore, we can't selectAll("g") for making rects and text
                    //   3. so, selectAll only g with className "bar"
                    //   4. if not exist, then create g placeholders and name them "bar"

                    var bars = svg1.selectAll(".bar").data(bardata)
                        .enter().append("g")
                        .attr("class", "bar")
                        .attr("transform", function(d) { return "translate(" + xScale(d.State) + ", " + yScale(d[dataColumn]) + ")"; })
                        .on("click", barOnMouseClick);
                        //.on("mouseout", barOnMouseOut);

                    var rects = bars.append("rect")
                    // ---- add a className for easy selecting
                        .attr("class", "bar")
                        .attr("width", xScale.bandwidth())
                        .attr("height", function(d){return height-yScale(d[dataColumn]);})
                        .each(function (d, i) {
                            if (i === (selectedYear-1994)) {
                                d3.select(this)
                                    .style("fill", "midnightblue");
                            }
                        });


                    function barOnMouseClick(d,i) {

                        d3.selectAll(".bar").select("rect").style("fill","cornflowerblue");

                        console.log(d3.select(".bar").select("rect"));

                        console.log("mouse click year : " + (1994+i).toString());

                        selectedYear = 1994+i;

                        crime_count_val = 0;
                        bardata.forEach(function (d1) {
                            if (d1.State === selectedYear.toString())
                                crime_count_val = parseInt(d1[dataColumn]);
                        });

                        /* update count text based on year */
                        crime_type.textContent = chartLabels.get(current) + ' in ' + state + ' - ' + selectedYear;
                        crime_count.textContent = valueFormat(crime_count_val);

                        d3.select(this)
                            .select("rect")
                            .style("fill", "midnightblue");

                        //rgb(240, 62, 34);
                        drawMap(selectedYear);
                        drawRadarChart(state);
                    }

                    /*function barOnMouseOut() {
                        d3.select(this)
                            .select("rect")
                            .style("fill", "rgb(248, 155, 101)");
                        //fill: rgb(248, 155, 101);

                    }*/

                });

            }

        });
    });
});
