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
  const id = req.body.deviceId
  const fileName = `${id}_location.txt`;

  var data = `${lat},${lng}`

  fs.open(fileName, 'wx', (err, fd) => {
    if (err) {
      if (err.code === 'EEXIST') {
        fs.appendFile(fileName, `:${data}`, function (err) {
          if (err) throw err;
          console.log('Saved!');
        });

        res.status(200)
        res.send({ message: 'Tracking!',  "deviceId": deviceId});
        return;        
      } 
    }

    fs.writeFile(fileName, data, function (err) {
      if (err) throw err;
      console.log('File is created successfully.');
    });
  });

  res.status(200)
  res.send({ message: 'Tracking!',  "deviceId": deviceId});
})

app.post('/travelledDistance', (req, res) => {
  const id = req.body.deviceId
  fs.readFile(`${id}_location.txt`, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
      const locations = data.split(':');
      var distance = 0;

      for (var i = 0; i < locations.length - 1; i++) {
        const start = locations[i].split(',');
        const end = locations[i + 1].split(',')
        distance += distBetween(start[0], start[1], end[0], end[1])
      }

      res.send({ "distance" : distance,  "deviceId" : deviceId});
    } else {
      console.log(err);
    }
  });
})

app.post('/clearAll', (req, res) => {
  const id = req.body.deviceId
  fs.truncate(`${id}_location.txt`, 0, function () {
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