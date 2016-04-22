var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var request = require('request'); //used to handle OMDB api requests.

var app = express();

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "hbs");
app.engine(".hbs", hbs({
  extname:        ".hbs",
  partialsDir:    "views/",
  layoutsDir:     "views/",
  defaultLayout:  "layout-main"
}));

app.get("/", function(req, res){
  res.render("search");
});

//
app.post('/s/', function(req, res){
  var url = "http://www.omdbapi.com/?s="+req.body.search+"&r=json";
  var results;
  request.get(url, function(err, response, body){
    results = JSON.parse(body);
    res.render("results",{results:results});
  });
});

app.get('/favorites', function(req, res){
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});
//
// app.get('favorites', function(req, res){
//   if(!req.body.name || !req.body.oid){
//     res.send("Error");
//     return
//   }
//
//   var data = JSON.parse(fs.readFileSync('./data.json'));
//   data.push(req.body);
//   fs.writeFile('./data.json', JSON.stringify(data));
//   res.setHeader('Content-Type', 'application/json');
//   res.send(data);
// });

app.listen(3000, function(){
  console.log("Listening on port 3000");
});
