var express = require('express');
var fs = require('fs'); // Used to write to the data.json file which will be used to store user favorites.
var path = require('path');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars'); // Used to display data in our front-end.
var request = require('request'); // Used to handle OMDB api requests.

var app = express();

app.set("port", process.env.PORT || 3000);
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true })); // Allows express to handle our POST requests.
app.use(bodyParser.json()); // Allows express to handle json data from our api request correctly.
// The following two method calls configure our app to use our handlebar enabled views and define our default layout.
app.set("view engine", "hbs");
app.engine(".hbs", hbs({
  extname:        ".hbs",
  partialsDir:    "views/",
  layoutsDir:     "views/",
  defaultLayout:  "layout-main"
}));

// Displays our default layout with the search box.
app.get("/", function(req, res){
  res.render("search");
});

// Handles displaying a list of movies returned from an OMDB api search.
app.post('/s/', function(req, res){
  var url = "http://www.omdbapi.com/?s="+req.body.search+"&r=json"; // Take the title provided by our search box and passed via our post request and build a proper URL for searching using the OMDB api.
  var results;
  request.get(url, function(err, response, body){
    results = JSON.parse(body); // Convert the body of our response to a JSON object.
    res.render("results",{results:results}); // Render results view with the results retrieved from the OMDB api.
  });
});

//  Handles displaying an individual movie title.
app.get('/s/:imdbID', function(req, res){
  var url = "http://www.omdbapi.com/?i="+req.params.imdbID+"&r=json"; // Take our imdbID parameter and build a proper url for accessing data on a specific movie with the OMDB api.
  var info;
  // Use request to pull data from the OMDB api using the url defined above.
  request.get(url, function(err, response, body){
    info = JSON.parse(body); // Convert the body of our response to a JSON object.
    res.render("show",{info:info}); // Render show view with the data retrieved from the OMDB api.
  });
});

app.get('/favorites', function(req, res){
  var data = fs.readFileSync('./data.json'); // Read favorite data from data.json
  data = JSON.parse(data); // Converts the string we read in to a JSON object.
  res.render("favorites", {favorites:data}); // Render favorites view with our favorites data.
});


//TODO: Need to add a promise to prevent the user from seeing an connection refused error while data is written to our file.  The post will still function, but the user needs to wait for it to happen while potentially seeing an error screen.
app.post('/favorites', function(req, res){
  // If we aren't provided with a title and id, throw an error.
  if(!req.body.title || !req.body.imdbID){
    res.send("Error");
    return
  }
  var data = JSON.parse(fs.readFileSync('./data.json')); // Read in favorite data from data.json
  data.push({title: req.body.title,imdbID: req.body.imdbID}); // Add the newly favorited movie to our data file.
  fs.writeFile('./data.json', JSON.stringify(data),function(){});// Requires a function as third argument.  Error handling can be put here.
  res.redirect("/favorites"); // Reidrect to favorites.
});

// Sets our server to listen for requests.
app.listen(app.get("port"), function(){
  console.log("Listening on port 3000");
});
