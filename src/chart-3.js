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

let svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

let projection = d3.geoNaturalEarth1()
let path = d3.geoPath().projection(projection)
let graticule = d3.geoGraticule()

// read in map data
d3.json(require('./data/world.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

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
    .attr('d', path)
    .attr('stroke', 'lightgrey')
    .attr('stroke-width', 0.5)
    .attr('fill', 'none')
    .lower()

  // draw the equator
  svg
    .append("path")
    .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
    .attr("class", "equator")
    .attr('stroke', 'red')
    .attr("d", path);
}
