
var express = require('express');
var http = require('http');
var https = require("https")
var bodyParser = require('body-parser');
var serveIndex = require('serve-index');

var path = require('path');
var fs = require('fs');
const fsp = fs.promises;

var colorCode = require('./colorCode.js');

// Determine the port that the server is listening on
var port = parseInt(process.argv[2] || '80', 10);
if (port < 1000)
   console.log('Operating on Port ' + port + ' requires priviledge');

// The directory assigned to this server
var home = path.join(__dirname, 'public');

var options = {};

if (port == 443) {
    options = {
      key: fs.readFileSync("ssl/localhost.key"),
      cert: fs.readFileSync("ssl/localhost.crt"),
   // ca: fs.readFileSync("ssl/CA.pem"),
      requestCert: true,
      rejectUnauthorized: false
    };
}

function onlyValidUsers(req, res, next) {

  var subject = req.connection.getPeerCertificate().subject;

  if (req.originalUrl != '/') {
    // console.log(`url: '${req.originalUrl}' pass`);  uncomment if you want to see every request
    next();
    return;
  }

  if (subject.UID.includes('CN=Martin A. Jackson -A')) {
     console.log('subject:', subject.UID, 'url:', req.originalUrl);
     next();
  } else {
      if (!req.client.authorized) {
        res.status(405).send("Access Denied");
        return res.end();
        // res.set('Content-Type', 'text/html');
        // res.send(new Buffer(fs.readFile(__dirname + 'accessdenied.html'));

        console.log('Subject NOT Authorized: ', subject.UID);
      } else {
        console.log('Subject Authorized: ', subject.UID);
        next();
      }
  }
}

var app = express();

// app.use(helmet());              // https://expressjs.com/en/advanced/best-practice-security.html
app.use(onlyValidUsers);      // BLOCK not allowed, dont check /styles.css  /background.jpg  /favicon.ico
app.use(express.static(home));     // serve up static content
app.use(serveIndex(home));         // serve a directory view

app.get('/code/:file', function (req, res) {
  const fname = req.params.file
  fsp.readFile(path.join(__dirname, fname))
    .then(function(val) {
        res.send( colorCode(fname, val) );
    })
    .catch((e) => {
      res.writeHead(404);
      return res.end('Error with file '+fname+'\n'+e.stack)
    });
});

// Needed for when a form posts a JSON encoded body
// app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Set up the server and start it listening
var server = (port === 443) ?  https.createServer(options, app) : http.createServer(app);
server.listen(port, function() {
  console.log("Express server listening on port " + port + " serving "+home);
});


