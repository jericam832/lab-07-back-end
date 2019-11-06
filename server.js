'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

let locations = {};
// Route Definitions
app.get('/weather', weatherHandler);

app.get('/location', locationHandler);
function locationHandler(request, response){
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;

  if (locations[url]){
    response.send(locations[url]);
  }
  else{
    superagent.get(url)
      .then( data => {
        const rawData = data.body;
        const location = new Location(request.query.data, rawData);
        response.status(200).json(location);
      })
      .catch( () => {
        errorHandler('So sorry, something went wrong.', request, response);
      });
  }
}
// app.get('/location', (request, response) => {
// const geoData = require('./data/geo.json');
// // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
// superagent.get( url )
//   .then( data => {
//     const rawData = data.body;
//     const location = new Location(request.query.data, rawData);
//     response.status(200).json(location);
//   })
//   .catch( () => {
//     errorHandler('So sorry, something went wrong.', request, response);
//   });

// const city = request.query.data;
// if (geoData.results[0].address_components[0].long_name === city){
//   const locationData = new Location(city,geoData);
//   response.send(locationData);
// } else{
//   response.send('Josh is amazeballs. ERROR 500!!!!!!!')
// }

// });

function weatherHandler(request, response){
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  superagent.get(url)
    .then(data =>{
      const weatherSummaries = data.body.daily.data.map(day =>{
        return new Weather(day);
      });
      response.status(200).json(weatherSummaries);
    })
    .catch( () => {
      errorHandler('Sorry, somthing went wrong. ', Request, response);
    });
}

// app.get('/weather', (req,res) =>{
//   const darkSky = require('./data/darksky.json');
//   const	city = req.query.data;
//   //Get weather data from darksky
//   let arrayOfDays = darkSky.map( d => {
//     const summary = d.daily.data.summary;
//     const time = d.daily.data.time;
//     const weatherData = new Weather(city,summary,time);
//     arrayOfDays.push(weatherData);
//   })
//   res.send(arrayOfDays);
// })

function Location(city,geoData){
  this.request_query = city;
  this.formatted_query = geoData.results[0].formatted_address;
  this.latitude = geoData.results[0].geometry.location.lat;
  this.longtitude = geoData.results[0].geometry.location.lng;
}

function Weather(day){
  // this.request_query = city;
  this.forecast = day.summary;
  // this.summary = summary;
  this.time = new Date(day.time * 1000).toGMTString().slice(0, 15);
}

function errorHandler(error, request,response) {
  response.status(500).send(error);
}


//Make sure port is open
app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}.`);
});
