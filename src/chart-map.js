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
let speed = 1e-2

// add the canvas
let canvas = d3
  .select('#chart-map')
  .append('canvas')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)

// get the context
var context = canvas.node().getContext('2d')
context.translate(margin.left, margin.top)

let projection = d3.geoOrthographic()
  .scale(height / 2)
  .translate([(width / 2), height / 2])
  .clipAngle(90)
  .precision(0.3)
let path = d3
  .geoPath()
  .projection(projection)
  .context(context)

let graticule = d3.geoGraticule()

// read in map data
d3.json(require('./data/world.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  var countries = topojson.feature(json, json.objects.countries)
  // projection.fitSize([width, height], countries)
  // console.log(countries.features)

  // background oceans
  context.fillStyle = '#e4eff5'
  context.fillRect(0, 0, width, height)

  var equatorHighlight = false

  var t = d3.timer(function(elapsed) {

    projection.rotate([speed * elapsed, 10, 0])

    context.clearRect(0, 0, width, height)

    // Sphere
    context.beginPath()
    path({type: 'Sphere'})
    context.strokeStyle = "#666"
    context.stroke()
    context.fillStyle = '#e4eff5'
    context.fill()

    // Graticule
    context.beginPath()
    path(graticule())
    context.strokeStyle = "#666"
    context.stroke()

    // Countries
    countries.features.forEach(country => {
      context.beginPath()
      path(country)
      context.fillStyle = "#999"
      context.strokeStyle = 'lightgrey'
      context.lineWidth = 1
      context.fill()  
      context.stroke()
    })

    // listen for equator step
    if (equatorHighlight === true) {
      context.beginPath()
      path({type: 'Feature', geometry: {type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]}})
      context.strokeStyle = 'red'
      context.stroke()
    }
    
  })

  // draw the equator
  // svg
  //   .append("path")
  //   .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
  //   .attr("class", "equator")
  //   .attr('stroke', 'red')
  //   .attr('d', path)
  //   .attr('opacity', 0)

  d3.select('#intro-map').on('stepin', () => {
    console.log('intro step triggered')

    
  })

  d3.select('#equator-map').on('stepin', () => {
    console.log('equator step triggered')
    equatorHighlight = true 
    // t.stop()

    
    
  })
  d3.select('#equator-map').on('stepout', () => {

    
  })
}
