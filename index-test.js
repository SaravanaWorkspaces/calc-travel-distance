var http = require('http');

const listOfLatLng = [
  [13.082680, 80.270721],
  [12.619720, 80.182953],
  [16.679110, 79.958588],
  [12.728030, 77.827057]
];

function performanceTesting() {
  listOfLatLng.forEach(e=> {
    const postData = JSON.stringify({
      "lat" : ""+e[0],
      "lng" : ""+e[1],
      "deviceId" : "1234"
    });
    saveTracking(postData)
  });
} 

function saveTracking(postData) {
  var options = {
    host: 'localhost',
    port: 3000,
    path: '/livelocation',
    method: 'POST',
    headers : {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
     console.log(`STATUS: ${res.statusCode}`);
     console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
     res.setEncoding('utf8');
     res.on('data', (chunk) => {
       console.log(`BODY: ${chunk}`);
     });
     res.on('end', () => {
       console.log('No more data in response.');
     });
   });
  
   req.on('error', (e) => {
     console.error(`problem with request: ${e.message}`);
   });
  req.write(postData);
  req.end();
}

performanceTesting()