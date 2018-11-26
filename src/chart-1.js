import * as d3 from 'd3'

var margin = { top: 30, left: 100, right: 30, bottom: 30 }
var height = 400 - margin.top - margin.bottom
var width = 780 - margin.left - margin.right

// Grab & create SVG
var svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)


var xPositionScale = d3.scaleLinear().range([0, width])
var yPositionScale = d3.scaleBand().range([height, 0]).padding(0.2)

// var colorScale = d3.scaleOrdinal().range(['pink', 'cyan', 'magenta', 'mauve'])

// Reading in the data
d3.csv(require('./data/Four_countries_cleaned.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

// Ready function go!
function ready(datapoints) {
  console.log('data is', datapoints)
  
  var PalmAreaList = datapoints.map(d => +d['Palm area'])
  console.log(d3.max(PalmAreaList))
  xPositionScale.domain([0, d3.max(PalmAreaList)])
  var names = datapoints.map(d => d['Country Name'])
  yPositionScale.domain(names)

  // Building the bars
  svg
    .selectAll('.bars')
    .data(datapoints)
    .enter()
    .append('rect')
    .classed('bars', true)
    .attr('x', 0)
    .attr('y', d => yPositionScale(d['Country Name']))
    .attr('width', d => xPositionScale(+d['Palm area']))
    .attr('height', yPositionScale.bandwidth())
    .attr('fill', 'red')

  const xAxis = d3.axisBottom(xPositionScale)
    svg
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)

  const yAxis = d3.axisLeft(yPositionScale)
    svg
      .append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis)



}
