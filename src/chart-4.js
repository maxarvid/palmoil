import * as d3 from 'd3'

var margin = { top: 30, left: 100, right: 30, bottom: 30 }
var height = 400 - margin.top - margin.bottom
var width = 780 - margin.left - margin.right

// Grab & create SVG
var svg = d3
  .select('#chart-4')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)


var xPositionScale = d3.scaleBand().range([0, width]).padding(1)

var yPositionScale = d3.scaleLinear().range([height, 0]).domain([0, 700])

// var colorScale = d3.scaleOrdinal().range(['pink', 'cyan', 'magenta', 'mauve'])

// Reading in the data
d3.csv(require('./data/equator_distance.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

// Ready function go!
function ready(datapoints) {
  console.log('data is', datapoints)


  var names = datapoints.map(d => d['country'])
  xPositionScale.domain(names)

  console.log(names)


  // Adding circles
  svg
    .selectAll('circle')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('cx', d => xPositionScale(d.country))
    .attr('cy', d => {
      // console.log(+d.equator_distance.slice(0,-3))
      return yPositionScale(+d.equator_distance.slice(0, -3))
    })
    .attr('r', 5)

  svg
    .selectAll('rect')
    .data(datapoints)
    .enter()
    .append('rect')
    .attr('x', d => xPositionScale(d.country) - 2.5)
    .attr('y', d => yPositionScale(+d.equator_distance.slice(0, -3)))
    .attr('width', 5)
    .attr('height', d => height - yPositionScale(+d.equator_distance.slice(0, -3)))
    .attr('fill', 'black')

  // axes
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
