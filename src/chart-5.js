import * as d3 from 'd3'
import * as topojson from 'topojson'
import { legendColor } from 'd3-svg-legend'

var margin = { top: 0, left: 0, right: 0, bottom: 0 }
var height = 500 - margin.top - margin.bottom
var width = 700 - margin.left - margin.right

// Grab & create SVG
var svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

// Map and projection
var projection = d3.geoEquirectangular()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])
var path = d3.geoPath()
    .projection(projection)

// data and colorScale
var importData = d3.map()
var exportData = d3.map()
var colorScheme = d3.schemeReds[6]
colorScheme.unshift('#eee')
var colorScale = d3.scaleThreshold()
  .domain([1, 500000, 1e+9, 5e+9, 2e+10, 4e+10])
  .range(colorScheme)

// legend
var g = svg.append('g')
  .attr('class', 'legendThreshold')
  .attr('transform', 'translate(0, 170)')

g.append('text')
  //.attr('class', 'caption')
  .attr('x', 0)
  .attr('y', -6)
  .text('Imports in USD')
var labels = ['data not available', '> 500,000', '500,000-1M', '1m-5M', '5M-20M', '20M-40M', '> 40M']
var legend = legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);
svg.select('.legendThreshold')
    .call(legend)

Promise.all([
  d3.csv(require('./data/importsSummed.csv'), d => { importData.set(d.country, +d.tradeUSD) }),
  d3.csv(require('./data/exportsSummed.csv'), d => { exportData.set(d.country, +d.tradeUSD) }),
  d3.json(require('./data/world.topojson'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

// Ready function go!
function ready(datapoints) {
  // console.log('data is: ', datapoints)
  var importDatapoints = datapoints[0],
      exportDatapoints = datapoints[1],
      json = datapoints[2]

  let countries = topojson.feature(json, json.objects.countries)
  projection.fitSize([width, height], countries)
  // console.log(countries.features)

  // draw the countries
  svg
    .append('g')
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', d => {
      var tradeUSD = importData.get(d.properties.name)
      if (tradeUSD) return colorScale(tradeUSD)
      else return 'lightgrey'
    })
    .attr('stroke', 'white')
    .attr('stroke-width', 0.1)
    .lower()
}
