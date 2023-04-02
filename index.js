const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs');
const defaultContent = require('./location-tracker.json')
const app = express()
const Path = require('path')

const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/livelocation', (req, res) => {
  console.log(`livelocation-Params: ${JSON.stringify(req.body)}`)

  const lat = req.body.lat,
        lng = req.body.lng,
        id = req.body.deviceId,
        fileName = `${id}_location.json`,
        path = Path.join('./', fileName)

  var travelledKM = 0;
  var response = { travelledKM, "message": "Tracking.." }

  if (fs.existsSync(path)) {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
        console.error(err)
      } else {
        const existingData = JSON.parse(data)
        existingData.latlng.push({
          lat,
          lng
        })

        if(existingData.length> 1) {
          const lastIndex = existingData.latlng.length -1
          const lastDistance = distBetween(existingData.latlng[lastIndex - 1].lat, existingData.latlng[lastIndex - 1].lng, 
            existingData.latlng[lastIndex].lat, existingData.latlng[lastIndex].lng)
          existingData.distanceTravelled += lastDistance
          response.travelledKM = existingData.distanceTravelled
        }

        fs.writeFile(fileName, JSON.stringify(existingData), 'utf8', (err)=>{
          if (err) {
            console.error(err)
          } else {
            console.log(`Tracking updated`)
          }
        });
      }

     
      
      console.log(response)
      res.status(200)
      res.send(response)
    });
  } else {
    console.log(`File not exists`)
    console.log(`..... Creating file ${fileName}`)

    defaultContent.latlng.push({
      lat,
      lng
    });
    fs.writeFile(fileName, JSON.stringify(defaultContent), 'utf8', (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log(`File created successfully ${fileName}`)
      }
    });

    console.log(response)
    res.status(200)
    res.send(response)
  }
})

app.post('/travelledDistance', (req, res) => {
  const id = req.body.deviceId
  console.log(`travelledDistance-Params: ${JSON.stringify(req.body)}`)
  const fileName = `${id}_location.json`
  fs.readFile(fileName, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
      const existingData = JSON.parse(data)
      const travelledKM = existingData.distanceTravelled
      console.log(`travelledDistance-response: ${travelledKM}`)
      res.send({ travelledKM });
    } else {
      console.log(err);
    }
  });
})

app.post('/clearAll', (req, res) => {
  const id = req.body.deviceId
  console.log(`clearAll-Params: ${JSON.stringify(req.body)}`);
  fs.truncate(`${id}_location.txt`, 0, function () {
    res.send({ "message": "Truncated complete location data", "deviceId": id });
  })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function distBetween(lat1, lon1, lat2, lon2) {
  //Radius of the earth in:  1.609344 miles,  6371 km  | var R = (6371 / 1.609344);
  //var R = 3958.7558657440545; // Radius of earth in Miles 
  //var R = (6371 / 1.609344);
  var R = 6371; // Radius of the earth in km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function toRad(Value) {
  /** Converts numeric degrees to radians */
  return Value * Math.PI / 180;
}



