const express = require('express')
var bodyParser = require('body-parser')
const fs = require('fs');
const app = express()

const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/livelocation', (req, res) => {
  const lat = req.body.lat
  const lng = req.body.lng

  var data = `${lat},${lng}`

  const stat = fs.statSync('location.txt');
  if (stat.size !== 0) {
    data = `:${data}`;
  }

  fs.appendFile('location.txt', data, function (err) {
    if (err) throw err;
  });

  res.send('Tracking!')
})

app.get('/travelledDistance', (req, res) => {

  fs.readFile('location.txt', { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
      const locations = data.split(':');
      var distance = 0;

      for (var i = 0; i < locations.length - 1; i++) {
        const start = locations[i].split(',');
        const end = locations[i + 1].split(',')
        distance = distBetween(start[0], start[1], end[0], end[1])
      }

      res.send(`Travelled distance: ${distance}`);
    } else {
      console.log(err);
    }
  });
})

app.get('/clearAll', (req, res) => {
  fs.truncate('location.txt', 0, function(){
    res.send(`Done!`);
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

//12.971599,77.594563:13.052414,80.250825