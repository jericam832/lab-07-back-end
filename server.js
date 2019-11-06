'use strict';

require('dotenv').config()
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Route Definitions

app.get('/location', (request, response) => {
  // const geoData = require('./data/geo.json');
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get( url )
    .then( data => {
      const rawData = data.body;
      const location = new Location(request.query.data, rawData);
      response.status(200).json(location);
    })
    .catch( () => {
      errorHandler('So sorry, something went wrong.', request, response);
    });

  // const city = request.query.data;
  // if (geoData.results[0].address_components[0].long_name === city){
  //   const locationData = new Location(city,geoData);
  //   response.send(locationData);
  // } else{
  //   response.send('Josh is amazeballs. ERROR 500!!!!!!!')
  // }

});

app.get('/weather', (req,res) =>{
  const darkSky = require('./data/darksky.json');
  const	city = req.query.data;
  //Get weather data from darksky
  let arrayOfDays = darkSky.map( d => {
    const summary = d.daily.data.summary;
    const time = d.daily.data.time;
    const weatherData = new Weather(city,summary,time);
    arrayOfDays.push(weatherData);
  })
  res.send(arrayOfDays);
})

function Location(city,geoData){
  this.request_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longtitude = geoData.results[0].geometry.location.lng;
}

function Weather(city,summary,time){
  this.request_query = city;
  this.summary = summary;
  this.time = new Date(time*1000).toGMTString();
}

function errorHandler(error, request,response) {
  response.status(500).send(error);
}

//Make sure port is open
app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}.`)
});
