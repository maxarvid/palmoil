import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

let width = 700 - margin.left - margin.right
let height = 400 - margin.top - margin.bottom

// Configuration for the spinning effect
var time = Date.now();
var rotate = [0, 0];
var velocity = [.015, -0];

let svg = d3
  .select('#chart-map')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

let projection = d3.geoOrthographic()
  .scale(300)
  .translate([(width / 2) + 100, height / 2])
  .clipAngle(90)
  .precision(0.3)
let path = d3.geoPath().projection(projection)
let graticule = d3.geoGraticule()

// read in map data
d3.json(require('./data/world.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

// spin function
function spinning_globe() {
  d3.timer(function() {
    // current time
    var dt = Date.now() - time

    // new position from modified projection function
    projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt])


    //grab all paths
    var feature = svg.selectAll('path')

    // update location of path
    feature.attr('d', path)
  })
}

function ready(json) {
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
      if(['Liberia', 'Indonesia', 'Cameroon', 'Malaysia', 'Congo'].includes(d.properties.name)) {
        return 'red'
      } else {
     return '#F5ECCE'
     }
  })
    .attr('stroke', 'black')
    .attr('stroke-width', 0.1)
  // draw the graticules
  svg
    .append('path')
    .datum(graticule())
    .attr('class', 'graticule')
    .attr('d', path)
    .attr('stroke', 'lightgrey')
    .attr('stroke-width', 0.5)
    .attr('fill', 'none')
    .lower()

  spinning_globe()

  // draw the equator
  svg
    .append("path")
    .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
    .attr("class", "equator")
    .attr('stroke', 'red')
    .attr('d', path)
    .attr('opacity', 0)

  d3.select('#intro-map').on('stepin', () => {
    console.log('intro step triggered')
    
  })

  d3.select('#equator-map').on('stepin', () => {
    // console.log('equator step triggered')
    svg
      .select('.equator')
      .transition()
      .duration(400)
      .attr('opacity', 1)
    
  })
  d3.select('#equator-map').on('stepout', () => {
    svg
      .select('.equator')
      .transition()
      .duration(400)
      .attr('opacity', 0)
    
  })
}
