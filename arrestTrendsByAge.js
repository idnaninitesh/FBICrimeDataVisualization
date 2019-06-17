$(function() {

    var donutData = genData();

    console.log(donutData);
    var donuts = new DonutCharts();
    donuts.create(donutData);
});

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

function DonutCharts() {

    var charts = d3.select('.main');

    var chart_m,
        chart_r,
        color = d3.scale.category20();

    var getCatNames = function(dataset) {
        var catNames = new Array();

        for (var i = 0; i < dataset[0].data.length; i++) {
            catNames.push(dataset[0].data[i].cat);
        }

        return catNames;
    }

    var createLegend = function(catNames) {
        var legends = charts.select('.legend')
            .selectAll('g')
            .data(catNames)
            .enter().append('g')
            .attr('transform', function(d, i) {
                return 'translate(' + (i * 150 + 50) + ', 40)';
            });

        legends.append('circle')
            .attr('class', 'legend-icon')
            .attr('r', 10)
            .style('fill', function(d, i) {
                return color(i);
            });

        legends.append('text')
            .attr('dx', '1em')
            .attr('dy', '.3em')
            .text(function(d) {
                return d;
            });
    }

    var createCenter = function(pie) {

        var eventObj = {
            'mouseover': function(d, i) {
                d3.select(this)
                    .transition()
                    .attr("r", chart_r * 0.35);
            },

            'mouseout': function(d, i) {
                d3.select(this)
                    .transition()
                    .duration(500)
                    .ease('bounce')
                    .attr("r", chart_r * 0.35);
            },

            'click': function(d, i) {
                var paths = charts.selectAll('.clicked');
                pathAnim(paths, 0);
                paths.classed('clicked', false);
                resetAllCenterText();
            }
        }

        var donuts = d3.selectAll('.donut');

        // The circle displaying total data.
        donuts.append("svg:circle")
            .attr("r", chart_r * 0.35)
            .style("fill", "#E7E7E7")
            .on(eventObj);

        donuts.append('text')
            .attr('class', 'center-txt type')
            .attr('y', chart_r * -0.16)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .text(function(d, i) {
                return d.type;
            });
        donuts.append('text')
            .attr('class', 'center-txt value')
            .attr('text-anchor', 'middle')
            .attr('font-size', '3em');

        donuts.append('text')
            .attr('class', 'center-txt percentage')
            .attr('x', chart_r * 0.01)
            .attr('y', chart_r * 0.08)
            .attr('text-anchor', 'middle')
            .attr('font-size', '2em')
            .style('fill', '#7F7F7F');
    }

    var setCenterText = function(thisDonut) {
        var sum = d3.sum(thisDonut.selectAll('.clicked').data(), function(d) {
            return d.data.val;
        });

        thisDonut.select('.value')
            .text(function(d) {
                return (sum)? valueFormat(sum)//sum.toFixed(1) + d.unit
                    : valueFormat(d.total);//d.total.toFixed(1) + d.unit;
            });
        thisDonut.select('.percentage')
            .text(function(d) {
                return (sum)? (sum/d.total*100).toFixed(2) + '%'
                    : '';
            });
    }

    var resetAllCenterText = function() {
        charts.selectAll('.value')
            .text(function(d) {
                return valueFormat(d.total);//d.total.toFixed(1) + d.unit;
            });
        charts.selectAll('.percentage')
            .text('');
    }

    var pathAnim = function(path, dir) {
        switch(dir) {
            case 0:
                path.transition()
                    .duration(500)
                    .ease('bounce')
                    .attr('d', d3.svg.arc()
                        .innerRadius(chart_r * 0.4)
                        .outerRadius(chart_r * 0.55)
                    );
                break;

            case 1:
                path.transition()
                    .attr('d', d3.svg.arc()
                        .innerRadius(chart_r * 0.4)
                        .outerRadius(chart_r * 0.6)
                    );
                break;
        }
    }

    var updateDonut = function() {

        var eventObj = {

            'mouseover': function(d, i, j) {
                pathAnim(d3.select(this), 1);

                var thisDonut = charts.select('.type' + j);
                thisDonut.select('.value').text(function(donut_d) {
                    return valueFormat(d.data.val);//d.data.val.toFixed(1) + donut_d.unit;
                });
                thisDonut.select('.percentage').text(function(donut_d) {
                    return (d.data.val/donut_d.total*100).toFixed(2) + '%';
                });
            },

            'mouseout': function(d, i, j) {
                var thisPath = d3.select(this);
                if (!thisPath.classed('clicked')) {
                    pathAnim(thisPath, 0);
                }
                var thisDonut = charts.select('.type' + j);
                setCenterText(thisDonut);
            },

            'click': function(d, i, j) {
                var thisDonut = charts.select('.type' + j);

                if (0 === thisDonut.selectAll('.clicked')[0].length) {
                    thisDonut.select('circle').on('click')();
                }

                var thisPath = d3.select(this);
                var clicked = thisPath.classed('clicked');
                pathAnim(thisPath, ~~(!clicked));
                thisPath.classed('clicked', !clicked);

                setCenterText(thisDonut);
            }
        };

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.val;
            });

        var arc = d3.svg.arc()
            .innerRadius(chart_r * 0.4)
            .outerRadius(function() {
                return (d3.select(this).classed('clicked'))? chart_r * 0.6
                    : chart_r * 0.55;
            });

        // Start joining data with paths
        var paths = charts.selectAll('.donut')
            .selectAll('path')
            .data(function(d, i) {
                return pie(d.data);
            });

        paths
            .transition()
            .duration(1000)
            .attr('d', arc);

        paths.enter()
            .append('svg:path')
            .attr('d', arc)
            .style('fill', function(d, i) {
                return color(i);
            })
            .style('stroke', '#FFFFFF')
            .on(eventObj)

        paths.exit().remove();

        resetAllCenterText();
    }

    this.create = function(dataset) {
        var $charts = $('.main');
        chart_m = $charts.innerWidth() / dataset.length / 2 * 0.14;
        chart_r = $charts.innerWidth() / dataset.length / 2 * 0.85;

        charts.append('svg')
            .attr('class', 'legend')
            .attr('width', '100%')
            .attr('height', 50)
            .attr('transform', 'translate(0, 30)')
            .style('margin-left', '10%')
            .style('margin-top', '2%');

        var donut = charts.selectAll('.donut')
            .data(dataset)
            .enter().append('svg:svg')
            .attr('width', 1200)//(chart_r + chart_m) * 2)
            .attr('height', 800)//(chart_r + chart_m) * 2)
            .style('margin-top', '3%')
            .style('margin-left', '4%')
            .append('svg:g')
            .attr('class', function(d, i) {
                return 'donut type' + i;
            })
            .attr('transform', 'translate(' + (chart_r+chart_m) * 0.8 + ',' + (chart_r+chart_m) * 0.55 + ')');

        createLegend(getCatNames(dataset));
        createCenter();

        updateDonut();
    }

    this.update = function(dataset) {
        // Assume no new categ of data enter
        var donut = charts.selectAll(".donut")
            .data(dataset);

        updateDonut();
    }
}


/*
 * Returns a json-like object.
 */
function genData() {

    var cat = ['Under 18', '18-29', '30-39', '40-49', '50-59', '60 and above'];
    var val = [634535, 3334635, 2122755, 1174979, 736383, 244304]

    var dataset = new Array();

    var data = new Array();
    var total = 0;

    for (var j = 0; j < cat.length; j++) {
        total += val[j];
        data.push({
            "cat": cat[j],
            "val": val[j]
        });
    }

    dataset.push({
        "data": data,
        "total": total
    });

    return dataset;
}