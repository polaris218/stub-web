var express = require('express');
var app = express();
var path = require('path');

// Enable HTML template middleware
app.engine('html', require('ejs').renderFile);

// Enable static CSS styles
app.use(express.static('styles'));

app.use('/images', express.static(path.join(__dirname, 'static/dist/images/')))
app.use('/css', express.static(path.join(__dirname, 'static/dist/css/')))
app.use('/js', express.static(path.join(__dirname, 'static/dist/js/')))
app.use('/docs', express.static(path.join(__dirname, 'static/dist/docs/')))
app.use('/api_reference_docs', express.static(path.join(__dirname, 'static/dist/api_reference_docs/')))
app.use('/fonts', express.static(path.join(__dirname, 'static/dist/fonts/')))
app.use('/external-content', express.static(path.join(__dirname, 'static/dist/external-content/')))
app.use('/components', express.static(path.join(__dirname, 'static/dist/component_libs/')))

// reply to request with "Hello World!"
app.get('/', function (req, res) {
  res.render('index.html');
});

// reply to request with "Hello World!"
app.get('/*', function (req, res) {
  res.sendStatus(200);
});

//start a server on port 80 and log its start to our console
var server = app.listen(80, function () {

  var port = server.address().port;
  console.log('Example app listening on port ', port);

});
