import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

let width = 960 - margin.left - margin.right
let height = 500 - margin.top - margin.bottom
let speed = 1e-2
let clipMode = false
let ortho = true

// add the canvas
let canvas = d3
  .select('#chart-map')
  .append('canvas')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)

// get the context
var context = canvas.node().getContext('2d')
context.translate(margin.left, margin.top)

let projectionGlobe = d3.geoOrthographic()
  .scale(height / 2)
  .translate([(width / 2), height / 2])
  .clipAngle(90)
  .precision(0.3)

let projectionMap = d3.geoEquirectangular()
  .scale(145)
  .center([0,0])
  .translate([width / 2, height / 2])

var projection = projectionGlobe

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
  projection.fitSize([width, height], countries)
  // console.log(countries.features)

  // math functions
  function animation(interProj) {
      d3.transition()
      .duration(7500)
      .tween("projection", function() {
        return function(_) {
          interProj.alpha(_);
          
          context.clearRect(0, 0, width, height);
          
          countries.features.forEach(country => {
            context.beginPath()
            path(country)
            context.fillStyle = '#999'
            context.strokeStyle = 'lightgrey'
            context.lineWidth = 1
            context.fill()  
            context.stroke()
          })
        };
      })
    }

  function interpolatedProjection(a, b) {
      var projection = d3.geoProjection(raw).scale(1),
      center = projection.center,
      translate = projection.translate,
      clip = projection.clipAngle,
      α;
      
      function raw(λ, φ) {
        var pa = a([λ *= 180 / Math.PI, φ *= 180 / Math.PI]), pb = b([λ, φ]);
        return [(1 - α) * pa[0] + α * pb[0], (α - 1) * pa[1] - α * pb[1]];
      }
      
      projection.alpha = function(_) {
        if (!arguments.length) return α;
        α = +_;
        var ca = a.center(), cb = b.center(),
        ta = a.translate(), tb = b.translate();
        center([(1 - α) * ca[0] + α * cb[0], (1 - α) * ca[1] + α * cb[1]]);
        translate([(1 - α) * ta[0] + α * tb[0], (1 - α) * ta[1] + α * tb[1]]);
        if (clipMode === true) {clip(180 - α * 90);}
        return projection;
      };
      
      delete projection.scale;
      delete projection.translate;
      delete projection.center;
      return projection.alpha(0);
    }

  function defaultRotate() {
      d3.transition()
      .duration(1500)
      .tween("rotate", function() {
        var r = d3.interpolate(projection.rotate(), [0, 0]);
        return function(t) {
          projection.rotate(r(t));
          context.clearRect(0, 0, width, height);
          
          countries.features.forEach(country => {
            context.beginPath()
            path(country)
            context.fillStyle = '#999'
            context.strokeStyle = 'lightgrey'
            context.lineWidth = 1
            context.fill()  
            context.stroke()
          })

        };
      })
    };



  var globe2map = interpolatedProjection(projectionGlobe, projectionMap)
  var map2globe = interpolatedProjection(projectionMap, projectionGlobe)

  // var land = topojson.feature(json, json.objects.land)
  // var borders = topojson.mesh(json, json.objects.countries, function(a, b) { return a !== b; })

  // background oceans
  context.fillStyle = '#e4eff5'
  context.fillRect(0, 0, width, height)

  var equatorHighlight = false

  var t = d3.timer(function(elapsed) {

    if (ortho === true) {
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
        // console.log(country.properties.name)
        if (['Liberia', 'Indonesia', 'Cameroon', 'Malaysia', 'Congo'].includes(country.properties.name)) {
          context.beginPath()
          path(country)
          context.fillStyle = 'red'
          context.strokeStyle = 'lightgrey'
          context.lineWidth = 1
          context.fill()  
          context.stroke()
        } else {
          context.beginPath()
          path(country)
          context.fillStyle = '#999'
          context.strokeStyle = 'lightgrey'
          context.lineWidth = 1
          context.fill()  
          context.stroke()
        }

      })

      // listen for equator step
      if (equatorHighlight === true) {
        context.beginPath()
        path({type: 'Feature', geometry: {type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]}})
        context.strokeStyle = 'red'
        context.stroke()
      }
    }
  })

  d3.select('#intro-map').on('stepin', () => {
  })

  d3.select('#equator-map').on('stepin', () => {
    equatorHighlight = true 
  })

  d3.select('#expand-map').on('stepin', () => {

    if (ortho === true) {
      ortho = false;
      defaultRotate();

      setTimeout(function() {
        projection = globe2map;
        path.projection(projection);
        clipMode = false;
        animation(projection);
      }
      , 1600);    
    } else {
      reset();
    }
  })
}
