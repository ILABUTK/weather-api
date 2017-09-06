const express = require('express')
const RateLimit = require('express-rate-limit')
const cors = require('cors')
const app = express()
const keys = require('./.keys')
const DarkSky = require('dark-sky')
const NodeGeocoder = require('node-geocoder')

// const https = require('https'); // for https
// const http = require('http'); // for http
// const fs = require('fs'); // for https fs

// var options = {
//   // key: fs.readFileSync('/etc/letsencrypt/live/jasmin.engr.utk.edu/privkey.pem'),
//   // cert: fs.readFileSync('/etc/letsencrypt/live/jasmin.engr.utk.edu/fullchain.pem')
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem')
// };

const limiter = new RateLimit({
  // 15 minutes
  windowMs: 15 * 60 * 1000,
  // limit each IP to 100 requests per windowMs
  max: 100,
  // disable delaying - full speed until the max limit is reached
  delayMs: 0
})

app.use(limiter)
app.use(cors())

// Home
app.get('/', function (req, res) {
  res.send('Jasmin')
})

// DarkSky API
const forecast = new DarkSky(keys.darksky)

app.get('/weather/v1/json', function (req, res) {
  let lat = req.param('lat')
  let lon = req.param('lon')
  let units = req.param('units')

  forecast
    .latitude(lat)
    .longitude(lon)
    .units(units)
    .language('en')
    .exclude('minutely,hourly,flags')
    .get()
    .then(function (response) {
      res.send(response)
    })
    .catch(function (error) {
      res.send(error)
    })

  // console.log(req.method + ': /weather/v1/' + lat + '/' + lon + '/' + units)
})

// Google Maps Geocoding API
const geocoder = NodeGeocoder(geocoderOptions)
var geocoderOptions = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: keys.google,
  formatter: null
}

app.get('/geocode/v1/json', function (req, res) {
  let latlng = req.param('latlng')
  let address = req.param('address')

  if (latlng) {
    let lat = latlng.split(',')[0]
    let lon = latlng.split(',')[1]

    geocoder.reverse({lat: lat, lon: lon})
      .then(function (response) {
        res.send(response)
      })
      .catch(function (error) {
        res.send(error)
      })

    // console.log(req.method + ': /geocode/v1/' + latlng)
  }

  if (address) {
    geocoder.geocode(address)
      .then(function (response) {
        res.send(response)
      })
      .catch(function (error) {
        res.send(error)
      })

    // console.log(req.method + ': /geocode/v1/' + address)
  }
})

app.listen(3000)

// https.createServer(options, app).listen(3000) // https
// http.createServer(options, app).listen(3000) // http

console.log('API ready.')
