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

// Create x and y scales:
var xPositionScale = d3.scaleLinear().range([0, width])
var yPositionScale = d3.scaleBand().range([height, 0]).padding(0.2)

// Reading in the data
d3.csv(require('./data/Four_countries_cleaned.csv'))
  .then(ready)
  .catch(err => console.log('Failed with', err))

// Ready function go!
function ready(datapoints) {
  console.log('data is', datapoints)

  // Sort by reverse size:  
  datapoints.sort((a, b) => a['Palm area'] - b['Palm area'])


  // setting the domains for our scalars:
  var PalmAreaList = datapoints.map(d => +d['Palm area'])
  xPositionScale.domain([0, d3.max(PalmAreaList)])

  var names = datapoints.map(d => d['Country Name'])
  yPositionScale.domain(names)

  // Adding title
  svg
    .append('text')
    .classed('title-text', true)
    .attr('x', width / 2)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')

  // Building the bars
  svg
    .selectAll('.bars')
    .data(datapoints)
    .enter()
    .append('rect')
    .classed('bars', true)
    .attr('x', 0)
    .attr('y', d => yPositionScale(d['Country Name']))
    .attr('width', 0)
    //.attr('width', d => xPositionScale(+d['Palm area']))
    .attr('height', yPositionScale.bandwidth())
    .attr('fill', 'lightgrey')

  // Axes
  const xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d => {
      if(d === 140000) {
        return '140,000 sq km'
      } else if(d === 50) {
        return '50%'
      } else {
        return d
      }
    })

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

  d3.select('#intro-graph').on('stepin', () => {

    // Adding title
    svg
      .selectAll('.title-text')
      .transition()
      .duration(200)
      .text('Area of palm oil concessions')

    svg
      .selectAll('.bars')
      .data(datapoints)
      .enter()
      .append('rect')
      .classed('bars', true)
      .attr('x', 0)
      .attr('y', d => yPositionScale(d['Country Name']))
      .attr('width', 0)
      .attr('width', 0)
      .attr('height', yPositionScale.bandwidth())
      .attr('fill', 'lightgrey')
  })

  d3.select('#area-palm-oil').on('stepin', () => {
    datapoints.sort((a, b) => a['Palm area'] - b['Palm area'])

    var names = datapoints.map(d => d['Country Name'])
    yPositionScale.domain(names)

    xPositionScale.domain([0, d3.max(PalmAreaList)])

    d3.select('.x-axis')
      .call(xAxis)
      .transition()
      .duration(200)

    d3.select('.y-axis')
      .call(yAxis)
      .transition()
      .duration(500)

    svg
      .selectAll('.title-text')
      .transition()
      .duration(200)
      .text('Area of palm oil concessions')

    svg
      .selectAll('.bars')
      .data(datapoints)
      .transition()
      .duration(500)
      .attr('y', d => yPositionScale(d['Country Name']))
      .attr('width', d => xPositionScale(+d['Palm area']))
  })

  d3.select('#percent-farm-land').on('stepin', () => {
    datapoints.sort((a, b) => a['Percent palm'] - b['Percent palm'])

    var names = datapoints.map(d => d['Country Name'])
    yPositionScale.domain(names)
    
    xPositionScale.domain([0, 50])

    d3.select('.x-axis')
      .call(xAxis)
      .transition()
      .duration(200)

    d3.select('.y-axis')
      .call(yAxis)
      .transition()
      .duration(500)

    svg
      .selectAll('.title-text')
      .transition()
      .duration(500)
      .text('Percent palm oil')

    svg
      .selectAll('.bars')
      .data(datapoints)
      .transition()
      .duration(500)
      .attr('y', d => yPositionScale(d['Country Name']))
      .attr('width', d => xPositionScale(+d['Percent palm']))

  })
}
