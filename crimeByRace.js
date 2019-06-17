var page_title = document.getElementById("page_title");

function drawLineGraph(dataset, xName, yValues, axisLables) {

    var graphBox = {};
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    graphBox.xAxisLable = axisLables.xAxis;
    graphBox.yAxisLable = axisLables.yAxis;

    graphBox.data = dataset;
    graphBox.margin = {top: 15, right: 60, bottom: 30, left: 50};
    graphBox.width = 650 - graphBox.margin.left - graphBox.margin.right;
    graphBox.height = 480 - graphBox.margin.top - graphBox.margin.bottom;

    // So we can pass the x and y as strings when creating the function
    graphBox.xFunct = function(d){return d[xName]};

    // For each yValues argument, create a yFunction
    function getYFn(column) {
        return function (d) {
            return d[column];
        };
    }

    // Object instead of array
    graphBox.yFuncts = [];
    for (var y  in yValues) {
        yValues[y].name = y;
        yValues[y].yFunct = getYFn(yValues[y].column); //Need this  list for the ymax function
        graphBox.yFuncts.push(yValues[y].yFunct);
    }

    //Formatter functions for the axes
    graphBox.formatAsNumber = d3.format(".0f");
    graphBox.formatAsDecimal = d3.format(".2f");
    graphBox.formatAsCurrency = d3.format("$.2f");
    graphBox.formatAsFloat = function (d) {
        if (d % 1 !== 0) {
            return d3.format(".2f")(d);
        } else {
            return d3.format(".0f")(d);
        }

    };
    graphBox.formatAsMil = d3.format(".2s");
    graphBox.xFormatter = graphBox.formatAsNumber;
    graphBox.yFormatter = graphBox.formatAsMil;

    graphBox.bisectYear = d3.bisector(graphBox.xFunct).left; //< Can be overridden in definition

    //Create scale functions
    graphBox.xScale = d3.scaleLinear()
        .range([0, graphBox.width])
        .domain(d3.extent(graphBox.data, graphBox.xFunct)); //< Can be overridden in definition

    // Get the max of every yFunct
    graphBox.max = function (fn) {
        return d3.max(graphBox.data, fn);
    };
    graphBox.yScale = d3.scaleLinear()
        .range([graphBox.height, 0])
        .domain([0, d3.max(graphBox.yFuncts.map(graphBox.max))]);

    graphBox.formatAsYear = d3.format("");

    //Create axis
    graphBox.xAxis = d3.axisBottom(graphBox.xScale)
        .tickFormat(graphBox.xFormatter); //< Can be overridden in definition

    graphBox.yAxis = d3.axisLeft(graphBox.yScale)
        .tickFormat(graphBox.yFormatter); //< Can be overridden in definition


    // Build line building functions
    function getYScaleFn(yObj) {
        return function (d) {
            return graphBox.yScale(yValues[yObj].yFunct(d));
        };
    }
    for (var yObj in yValues) {
        yValues[yObj].line = d3.line().curve(d3.curveCardinal).x(function (d) {
            return graphBox.xScale(graphBox.xFunct(d));
        }).y(getYScaleFn(yObj));
    }


    graphBox.svg;

    // Change chart size according to window size
    graphBox.update_svg_size = function () {
        graphBox.width = parseInt(graphBox.chartDiv.style("width"), 10) - (graphBox.margin.left + graphBox.margin.right);
        graphBox.height = parseInt(graphBox.chartDiv.style("height"), 10) - (graphBox.margin.top + graphBox.margin.bottom);

        /* Update the range of the scale with new width/height */
        graphBox.xScale.range([0, graphBox.width]);
        graphBox.yScale.range([graphBox.height, 0]);

        if (!graphBox.svg) {return false;}

        /* Else Update the axis with the new scale */
        graphBox.svg.select('.x.axis')
            .attr("transform", "translate(0," + graphBox.height + ")")
            .call(graphBox.xAxis);
        graphBox.svg.select('.x.axis .label')
            .attr("x", graphBox.width / 2);

        graphBox.svg.select('.y.axis')
            .call(graphBox.yAxis);
        graphBox.svg.select('.y.axis .label')
            .attr("x", -graphBox.height / 2);

        /* Force D3 to recalculate and update the line */
        for (var y  in yValues) {
            yValues[y].path.attr("d", yValues[y].line);
        }


        d3.selectAll(".focus.line").attr("y2", graphBox.height);

        graphBox.chartDiv.select('svg')
            .attr("width", graphBox.width + (graphBox.margin.left + graphBox.margin.right))
            .attr("height", graphBox.height + (graphBox.margin.top + graphBox.margin.bottom));

        graphBox.svg.select(".overlay").attr("width", graphBox.width).attr("height", graphBox.height);
        return graphBox;
    };

    graphBox.bind = function (selector) {
        graphBox.mainDiv = d3.select(selector);
        // Add all the divs to make it centered and responsive
        graphBox.mainDiv.append("div")
            .attr("class", "inner-wrapper")
            .append("div")
            .attr("class", "outer-box")
            .append("div")
            .attr("class", "inner-box");
        chartSelector = selector + " .inner-box";
        graphBox.chartDiv = d3.select(chartSelector);
        d3.select(window).on('resize.' + chartSelector, graphBox.update_svg_size);
        graphBox.update_svg_size();
        return graphBox;
    };

    // Render the chart
    graphBox.render = function () {
        //Create SVG element
        graphBox.svg = graphBox.chartDiv.append("svg")
            .attr("class", "chart-area")
            .attr("width", graphBox.width + (graphBox.margin.left + graphBox.margin.right))
            .attr("height", graphBox.height + (graphBox.margin.top + graphBox.margin.bottom))
            .append("g").attr("transform", "translate(" + graphBox.margin.left + "," + graphBox.margin.top + ")");

        // Draw Lines
        for (var y  in yValues) {
            yValues[y].path = graphBox.svg.append("path")
                .datum(graphBox.data)
                .attr("class", "line")
                .attr("d", yValues[y].line)
                .style("stroke", color(y))
                .attr("data-series", y)
                .on("mouseover", function () {
                    focus.style("display", null);
                }).on("mouseout", function () {
                    focus.transition().delay(700).style("display", "none");
                }).on("mousemove", mousemove);
        }


        // Draw Axis
        graphBox.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + graphBox.height + ")")
            .call(graphBox.xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", graphBox.width / 2)
            .attr("y", 30)
            .style("text-anchor", "middle")
            .text(graphBox.xAxisLable);

        graphBox.svg.append("g")
            .attr("class", "y axis")
            .call(graphBox.yAxis)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -42)
            .attr("x", -graphBox.height / 2)
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .text(graphBox.yAxisLable);

        //Draw tooltips
        var focus = graphBox.svg
            .append("g")
            .attr("class", "focus")
            .style("display", "none");

        for (var y  in yValues) {
            yValues[y].tooltip = focus.append("g");
            yValues[y].tooltip.append("circle").attr("r", 2);
            yValues[y].tooltip.append("rect").attr("x", 8).attr("y","-5").attr("width",21).attr("height",'0.75em');
            yValues[y].tooltip.append("text").attr("x", 9).attr("dy", ".5em");
        }

        // Year label
        // focus.append("text").attr("class", "focus year").attr("x", 9).attr("y", 7);
        focus.append("line").attr("class", "focus line").attr("y1", 0).attr("y2", graphBox.height);

        //Draw legend
        var legend = graphBox.mainDiv.append('div').attr("class", "legend");
        for (var y  in yValues) {
            series = legend.append('div');
            series.append('div').attr("class", "series-marker").style("background-color", color(y));
            series.append('p').text(y);
            yValues[y].legend = series;
        }

        // Overlay to capture hover
        graphBox.svg.append("rect").attr("class", "overlay").attr("width", graphBox.width).attr("height", graphBox.height).on("mouseover", function () {
            focus.style("display", null);
        }).on("mouseout", function () {
            focus.style("display", "none");
            page_title.textContent = "Crime Trends Across Races";
        }).on("mousemove", mousemove);

        return graphBox;
        function mousemove() {
            var x0 = graphBox.xScale.invert(d3.mouse(this)[0]), i = graphBox.bisectYear(dataset, x0, 1), d0 = graphBox.data[i - 1], d1 = graphBox.data[i];
            try {
                var d = x0 - graphBox.xFunct(d0) > graphBox.xFunct(d1) - x0 ? d1 : d0;
            } catch (e) { return;}
            minY = graphBox.height;
            for (var y  in yValues) {
                yValues[y].tooltip.attr("transform", "translate(" + graphBox.xScale(graphBox.xFunct(d)) + "," + graphBox.yScale(yValues[y].yFunct(d)) + ")");
                yValues[y].tooltip.select("text").text(graphBox.yFormatter(yValues[y].yFunct(d)));
                minY = Math.min(minY, graphBox.yScale(yValues[y].yFunct(d)));
            }

            focus.select(".focus.line").attr("transform", "translate(" + graphBox.xScale(graphBox.xFunct(d)) + ")").attr("y1", minY);
            // focus.select(".focus.year").text("Year: " + graphBox.xFormatter(graphBox.xFunct(d)));
            page_title.textContent = "Crime Trends Across Races (Year - " + graphBox.xFunct(d) + ")";

        }

    };
    return graphBox;
}


d3.csv('data/CrimeByRace.csv', function(error, data) {
    data.forEach(function (d) {
        d.year = +d.year;
        d.White = +d.White;
        d.AsianPacificIslander = +d.AsianPacificIslander;
        d.Black = +d.Black;
        d.NativeAmericanAlaskaNative = +d.NativeAmericanAlaskaNative;
        d.Unknown = +d.Unknown;;
    });

    var chart = drawLineGraph(data, 'year', {
        'White': {column: 'White'},
        'Asian/Pacific Islander': {column: 'AsianPacificIslander'},
        'Black': {column: 'Black'},
        'Native American/Alaska Native': {column: 'NativeAmericanAlaskaNative'},
        'Race Unknown': {column: 'Unknown'}
    }, {xAxis: 'Years', yAxis: '% Of Victim Count'});
    chart.bind("#graphLine");
    chart.render();

});